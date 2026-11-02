import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { io } from "socket.io-client";

const frontend = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const backend = resolve(
  process.env.SPEC04_BACKEND_DIR || resolve(frontend, "../backend"),
);
const requireBackend = createRequire(resolve(backend, "package.json"));
const { prepare } = requireBackend(
  "./src/modules/group-messaging/tools/local.cjs",
);
const { Client } = requireBackend("pg");
const output = resolve(frontend, "analysis/spec04");
await mkdir(output, { recursive: true });
const databaseUrl = await prepare(true);
assert.equal(new URL(databaseUrl).pathname, "/luminaul_spec04_test");
const api = "http://127.0.0.1:8005",
  web = "http://localhost:5176";
const password = "LuminaSpec04!2026";
const registrationEmail = `spec04.registro.${randomUUID()}@aloe.ulima.edu.pe`;
const checks = [],
  clients = [],
  createdGroups = [],
  createdReviews = [],
  children = [];
const db = new Client({ connectionString: databaseUrl });
await db.connect();
const env = {
  ...process.env,
  NODE_ENV: "test",
  PORT: "8005",
  DATABASE_URL: databaseUrl,
  JWT_SECRET: randomBytes(48).toString("hex"),
  WEB_ORIGIN: web,
  BACKEND_URL: api,
};

/** Inicia servicios reales conservando sus logs fuera de los archivos que se publican. */
function start(cwd, args, label, extra = {}) {
  const child = spawn(process.execPath, args, {
    cwd,
    env: { ...env, ...extra },
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe", "ipc"],
  });
  let log = "";
  child.stdout.on("data", (bytes) => {
    log += bytes.toString();
  });
  child.stderr.on("data", (bytes) => {
    log += bytes.toString();
  });
  children.push({ child, label, log: () => log });
  return child;
}
/** Espera salud real, no un tiempo fijo que podría dar por listo un servicio caído. */
async function ready(url, child) {
  for (let attempt = 0; attempt < 120; attempt++) {
    if (child.exitCode !== null)
      throw new Error(`El servicio terminó antes de iniciar: ${url}`);
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 150));
  }
  throw new Error(`El servicio no inició: ${url}`);
}
/** Ejecuta una petición contra la aplicación completa con la misma sesión JWT que usan los sockets. */
async function request(path, method = "GET", body, token) {
  const response = await fetch(api + path, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, data: await response.json() };
}
/** Obtiene credenciales reales por SPEC-01 sin crear una autenticación de prueba alternativa. */
async function login(email) {
  const response = await request("/auth/login", "POST", { email, password });
  assert.equal(response.status, 200);
  return { ...response.data.user, token: response.data.accessToken, email };
}
/** Registra cada comprobación terminada; un fallo posterior conserva cuáles llegaron a ejecutarse. */
function pass(label) {
  checks.push(label);
  console.log(`PASS ${label}`);
}
/** Crea grupos a través de REST y conserva sus IDs para limpiar solo fixtures de esta ejecución. */
async function createGroup(user, name, maxCapacity = 4) {
  const result = await request(
    "/groups",
    "POST",
    {
      name,
      courseCode: "SPEC04",
      meetingMode: "virtual",
      meetingShift: "tarde",
      maxCapacity,
    },
    user.token,
  );
  assert.equal(result.status, 201, JSON.stringify(result.data));
  createdGroups.push(result.data.id);
  return result.data;
}
/** Solicita y aprueba mediante los endpoints públicos que la interfaz consume. */
async function addMember(group, leader, user) {
  const joined = await request(
    `/groups/${group.id}/join-requests`,
    "POST",
    { message: "Me gustaría estudiar con el grupo." },
    user.token,
  );
  assert.equal(joined.status, 201);
  assert.equal(
    (
      await request(
        `/groups/${group.id}/join-requests/${joined.data.id}`,
        "PATCH",
        { status: "approved" },
        leader.token,
      )
    ).status,
    200,
  );
}
/** Crea una conexión independiente para representar otra persona o pestaña. */
async function connect(user) {
  const socket = io(api, {
    auth: { token: user.token },
    transports: ["websocket"],
    reconnection: false,
    forceNew: true,
  });
  clients.push(socket);
  await new Promise((resolveConnect, reject) => {
    const timer = setTimeout(
      () => reject(new Error("La conexión socket no abrió.")),
      5000,
    );
    socket.once("connect", () => {
      clearTimeout(timer);
      resolveConnect();
    });
    socket.once("connect_error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
  return socket;
}
/** Solicita un ACK real; ningún mensaje se da por enviado solo por ejecutar emit(). */
async function command(socket, event, data) {
  try {
    return await socket.timeout(5000).emitWithAck(event, data);
  } catch (error) {
    throw new Error(`${event}: ${error.message}`);
  }
}
/** Espera una condición observable y acota los fallos para que no queden pruebas bloqueadas. */
async function until(condition, description, timeout = 4000) {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeout) throw new Error(description);
    await new Promise((resolveWait) => setTimeout(resolveWait, 25));
  }
}
/** El canal IPC simula al módulo de moderación sin añadir endpoints especiales a la aplicación. */
async function moderate(server, groupId, messageId) {
  const requestId = randomUUID();
  await new Promise((resolveMessage, reject) => {
    const timer = setTimeout(() => {
      server.off("message", response);
      reject(new Error("Moderación no confirmó el evento."));
    }, 5000);
    function response(value) {
      if (value.requestId !== requestId) return;
      clearTimeout(timer);
      server.off("message", response);
      value.success
        ? resolveMessage()
        : reject(new Error("No se pudo simular moderación."));
    }
    server.on("message", response);
    server.send({ kind: "moderate", requestId, groupId, messageId });
  });
}

let server;
try {
  server = start(
    backend,
    [
      "-r",
      "ts-node/register",
      "src/modules/group-messaging/tools/test-server.ts",
    ],
    "backend",
  );
  const vite = start(
    frontend,
    [
      "node_modules/vite/bin/vite.js",
      ...(process.env.SPEC04_PREVIEW === "1" ? ["preview"] : []),
      "--configLoader",
      "runner",
      "--host",
      "127.0.0.1",
      "--port",
      "5176",
      "--strictPort",
    ],
    "frontend",
    {
      NODE_ENV:
        process.env.SPEC04_PREVIEW === "1" ? "production" : "development",
    },
  );
  await Promise.all([
    ready(api + "/health", server),
    ready(web + "/login", vite),
  ]);
  const [leader, student, outsider] = await Promise.all(
    [
      "spec04.lider@aloe.ulima.edu.pe",
      "spec04.usuario@aloe.ulima.edu.pe",
      "spec04.otro@aloe.ulima.edu.pe",
    ].map(login),
  );
  assert.equal((await request("/groups")).status, 200);
  assert.equal((await request("/groups/me")).status, 401);
  assert.equal((await request("/groups?limit=-1")).status, 400);
  const chatGroup = await createGroup(
    leader,
    "Chat de integración " + Date.now(),
    4,
  );
  await addMember(chatGroup, leader, student);
  assert.equal(chatGroup.myRole, "leader");
  assert.equal(
    (
      await request(
        `/groups/${chatGroup.id}/members`,
        "GET",
        undefined,
        outsider.token,
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await request(
        `/groups/${chatGroup.id}/messages`,
        "GET",
        undefined,
        outsider.token,
      )
    ).status,
    403,
  );
  pass(
    "REST real: grupos, líder, directorio público y protección del historial e integrantes",
  );

  if (!process.argv.includes("--browser-only")) {
    const full = await createGroup(leader, "Último cupo " + Date.now(), 2);
    const applications = await Promise.all(
      [student, outsider].map((user) =>
        request(`/groups/${full.id}/join-requests`, "POST", {}, user.token),
      ),
    );
    assert.deepEqual(
      applications.map((value) => value.status),
      [201, 201],
    );
    assert.equal(
      (
        await request(
          `/groups/${full.id}/join-requests`,
          "POST",
          {},
          student.token,
        )
      ).status,
      409,
    );
    assert.equal(
      (
        await request(
          `/groups/${full.id}/join-requests`,
          "GET",
          undefined,
          student.token,
        )
      ).status,
      403,
    );
    const decisions = await Promise.all(
      applications.map((value) =>
        request(
          `/groups/${full.id}/join-requests/${value.data.id}`,
          "PATCH",
          { status: "approved" },
          leader.token,
        ),
      ),
    );
    assert.deepEqual(decisions.map((value) => value.status).sort(), [200, 409]);
    assert.equal(
      (await request(`/groups/${full.id}`, "GET", undefined, leader.token)).data
        .currentMembers,
      2,
    );
    assert.equal(
      (
        await request(
          `/groups/${full.id}/members/me`,
          "DELETE",
          undefined,
          leader.token,
        )
      ).status,
      409,
    );
    assert.equal(
      (
        await request(
          `/groups/${chatGroup.id}/join-requests`,
          "POST",
          { message: "x".repeat(256) },
          outsider.token,
        )
      ).status,
      400,
    );
    pass(
      "Solicitudes: duplicados, permisos, límite de texto y carrera por el último cupo",
    );

    const denied = io(api, { transports: ["websocket"], reconnection: false });
    clients.push(denied);
    await new Promise((resolveDenied, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Se admitió una conexión sin sesión.")),
        4000,
      );
      denied.once("connect_error", () => {
        clearTimeout(timer);
        resolveDenied();
      });
    });
    const [a, b, c, anotherTab] = await Promise.all(
      [leader, student, outsider, leader].map(connect),
    );
    let presence = [];
    b.on("chat:presence", (event) => {
      if (event.groupId === chatGroup.id) presence = event.userIds;
    });
    assert.equal(
      (await command(a, "chat:join_room", { groupId: chatGroup.id })).success,
      true,
    );
    assert.equal(
      (await command(b, "chat:join_room", { groupId: chatGroup.id })).success,
      true,
    );
    assert.equal(
      (await command(anotherTab, "chat:join_room", { groupId: chatGroup.id }))
        .success,
      true,
    );
    await until(
      () => presence.length === 2,
      "La presencia debe contar usuarios y no pestañas.",
    );
    anotherTab.disconnect();
    await new Promise((resolveWait) => setTimeout(resolveWait, 80));
    assert.deepEqual(presence.sort(), [leader.id, student.id].sort());
    assert.equal(
      (await command(c, "chat:join_room", { groupId: chatGroup.id })).error
        .code,
      "FORBIDDEN",
    );
    assert.equal(
      (
        await command(c, "chat:send_message", {
          groupId: chatGroup.id,
          content: "No autorizado",
        })
      ).success,
      false,
    );
    pass(
      "Sockets: autenticación, sala privada y presencia correcta con dos pestañas del mismo usuario",
    );

    const incoming = [],
      selfEvents = [];
    b.on("chat:new_message", (message) => incoming.push(message));
    a.on("chat:new_message", (message) => selfEvents.push(message));
    const payload = {
      groupId: chatGroup.id,
      content: "Primer mensaje confirmado.",
      clientMessageId: randomUUID(),
    };
    const retry = await Promise.all([
      command(a, "chat:send_message", payload),
      command(a, "chat:send_message", payload),
    ]);
    assert.equal(retry[0].success, true);
    assert.equal(retry[0].message.id, retry[1].message.id);
    await until(
      () => incoming.length === 1,
      "El destinatario debe recibir una única copia.",
    );
    assert.equal(selfEvents.length, 0);
    const first = retry[0].message;
    const persisted = await db.query(
      "SELECT COUNT(*)::int AS total FROM group_messages WHERE group_id=$1 AND client_message_id=$2",
      [chatGroup.id, payload.clientMessageId],
    );
    assert.equal(persisted.rows[0].total, 1);
    assert.equal(
      (
        await command(a, "chat:send_message", {
          ...payload,
          content: "Otro contenido",
        })
      ).error.code,
      "CONFLICT",
    );
    assert.equal(
      (
        await command(a, "chat:send_message", {
          groupId: chatGroup.id,
          content: "  ",
        })
      ).error.code,
      "VALIDATION",
    );
    assert.equal(
      (
        await command(a, "chat:send_message", {
          groupId: chatGroup.id,
          content: "Suplantar",
          senderId: student.id,
        })
      ).error.code,
      "VALIDATION",
    );
    pass(
      "Mensajes: persistencia antes de ACK, identidad de sesión y reintentos sin duplicar emisor ni destinatarios",
    );

    // Fallo de almacenamiento real, limitado al fixture: nunca debe difundirse un mensaje no guardado.
    await db.query(`CREATE OR REPLACE FUNCTION spec04_test_reject_message() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
      IF NEW.content='__SPEC04_INTEGRATION_REJECT__' THEN RAISE EXCEPTION 'Fallo controlado de persistencia'; END IF; RETURN NEW; END $$;
      CREATE TRIGGER spec04_test_reject_message BEFORE INSERT ON group_messages FOR EACH ROW EXECUTE FUNCTION spec04_test_reject_message()`);
    try {
      const rejected = await command(a, "chat:send_message", {
        groupId: chatGroup.id,
        content: "__SPEC04_INTEGRATION_REJECT__",
      });
      assert.equal(rejected.success, false);
      assert.equal(rejected.error.code, "INTERNAL");
      assert.equal(incoming.length, 1);
      assert.equal(selfEvents.length, 0);
      const failed = await db.query(
        "SELECT COUNT(*)::int AS total FROM group_messages WHERE group_id=$1 AND content=$2",
        [chatGroup.id, "__SPEC04_INTEGRATION_REJECT__"],
      );
      assert.equal(failed.rows[0].total, 0);
    } finally {
      await db.query(
        "DROP TRIGGER IF EXISTS spec04_test_reject_message ON group_messages; DROP FUNCTION IF EXISTS spec04_test_reject_message()",
      );
    }
    pass(
      "Un fallo real de PostgreSQL devuelve ACK de error sin emitir mensajes fantasma",
    );

    let typing = false;
    b.on("chat:typing", (event) => {
      if (event.groupId === chatGroup.id && event.userId === leader.id)
        typing = event.isTyping;
    });
    await command(a, "chat:typing", { groupId: chatGroup.id, isTyping: true });
    await until(() => typing, "No llegó el indicador de escritura.");
    await command(a, "chat:typing", { groupId: chatGroup.id, isTyping: false });
    await until(() => !typing, "No se retiró el indicador de escritura.");
    assert.equal(
      (
        await command(a, "chat:typing", {
          groupId: chatGroup.id,
          isTyping: "true",
        })
      ).error.code,
      "VALIDATION",
    );
    const reaction = {
      groupId: chatGroup.id,
      messageId: first.id,
      emoji: "👍",
    };
    await command(b, "reaction:add", reaction);
    const duplicateReaction = await command(b, "reaction:add", reaction);
    assert.deepEqual(duplicateReaction.message.reactions[0].userIds, [
      student.id,
    ]);
    await command(a, "reaction:remove", reaction);
    assert.equal(
      (
        await request(
          `/groups/${chatGroup.id}/messages`,
          "GET",
          undefined,
          leader.token,
        )
      ).data[0].reactions[0].userIds.length,
      1,
    );
    assert.equal(
      (await command(b, "reaction:remove", reaction)).message.reactions.length,
      0,
    );
    const reply = await command(b, "chat:send_message", {
      groupId: chatGroup.id,
      content: "Respuesta vinculada.",
      replyToId: first.id,
      clientMessageId: randomUUID(),
    });
    assert.equal(reply.message.replyTo.id, first.id);
    assert.equal(reply.message.replyTo.content, first.content);
    const otherGroup = await createGroup(leader, "Otro chat " + Date.now());
    await command(a, "chat:join_room", { groupId: otherGroup.id });
    const foreign = await command(a, "chat:send_message", {
      groupId: otherGroup.id,
      content: "Mensaje privado de otro grupo.",
    });
    assert.equal(
      (
        await command(b, "chat:send_message", {
          groupId: chatGroup.id,
          content: "Cita ajena",
          replyToId: foreign.message.id,
        })
      ).error.code,
      "NOT_FOUND",
    );
    const receipt = await command(b, "message:read", {
      groupId: chatGroup.id,
      messageId: reply.message.id,
    });
    assert.equal(receipt.receipt.messageId, reply.message.id);
    const oldReceipt = await command(b, "message:read", {
      groupId: chatGroup.id,
      messageId: first.id,
    });
    assert.equal(oldReceipt.receipt.messageId, reply.message.id);
    let hidden;
    b.on("chat:message_hidden", (event) => {
      hidden = event;
    });
    await moderate(server, chatGroup.id, first.id);
    await until(
      () => hidden?.messageId === first.id,
      "No llegó el evento de moderación.",
    );
    const moderated = (
      await request(
        `/groups/${chatGroup.id}/messages`,
        "GET",
        undefined,
        student.token,
      )
    ).data;
    assert.equal(
      moderated.find((message) => message.id === first.id).content,
      "",
    );
    assert.equal(
      moderated.find((message) => message.id === reply.message.id).replyTo
        .content,
      null,
    );
    assert.equal(
      (
        await request(
          `/groups/${chatGroup.id}`,
          "GET",
          undefined,
          outsider.token,
        )
      ).data.lastMessage,
      null,
    );
    pass(
      "Escritura efímera, reacciones propias persistidas, respuestas privadas, lectura monotónica y puente de moderación",
    );

    await db.query(
      `INSERT INTO group_messages(group_id,sender_id,content,created_at) SELECT $1,$2,'Histórico '||n,NOW()-INTERVAL '5 minutes'+n*INTERVAL '1 second' FROM generate_series(1,70) n`,
      [chatGroup.id, leader.id],
    );
    const pageOne = (
      await request(
        `/groups/${chatGroup.id}/messages?limit=50`,
        "GET",
        undefined,
        leader.token,
      )
    ).data;
    assert.equal(pageOne.length, 50);
    assert.ok(
      pageOne.every(
        (message, index) =>
          index === 0 || message.createdAt >= pageOne[index - 1].createdAt,
      ),
    );
    await command(a, "chat:send_message", {
      groupId: chatGroup.id,
      content: "Nuevo mientras paginamos.",
    });
    const pageTwo = (
      await request(
        `/groups/${chatGroup.id}/messages?limit=50&beforeId=${pageOne[0].id}`,
        "GET",
        undefined,
        leader.token,
      )
    ).data;
    assert.equal(
      pageTwo.some((message) =>
        pageOne.some((value) => value.id === message.id),
      ),
      false,
    );
    assert.equal(pageTwo.length + pageOne.length, 72);
    let kicked = false;
    b.on("chat:membership_revoked", (event) => {
      if (event.groupId === chatGroup.id) kicked = true;
    });
    assert.equal(
      (
        await request(
          `/groups/${chatGroup.id}/members/${student.id}`,
          "DELETE",
          undefined,
          leader.token,
        )
      ).status,
      200,
    );
    await until(
      () => kicked,
      "La expulsión debe retirar inmediatamente al usuario del chat.",
    );
    assert.equal(
      (
        await command(b, "chat:send_message", {
          groupId: chatGroup.id,
          content: "Después de expulsión",
        })
      ).success,
      false,
    );
    assert.equal(
      (
        await request(
          `/groups/${chatGroup.id}/messages`,
          "GET",
          undefined,
          student.token,
        )
      ).status,
      403,
    );
    const storedMember = await db.query(
      "SELECT status,left_at FROM group_members WHERE group_id=$1 AND user_id=$2",
      [chatGroup.id, student.id],
    );
    assert.equal(storedMember.rows[0].status, "kicked");
    assert.ok(storedMember.rows[0].left_at);
    pass(
      "Historial paginado estable y expulsión inmediata sin borrar el historial de membresía",
    );

    const transferGroup = await createGroup(
      leader,
      "Transferencia " + Date.now(),
    );
    await addMember(transferGroup, leader, student);
    assert.equal(
      (
        await request(
          `/groups/${transferGroup.id}/leader`,
          "PATCH",
          { userId: student.id },
          leader.token,
        )
      ).status,
      200,
    );
    assert.equal(
      (
        await request(
          `/groups/${transferGroup.id}/members/me`,
          "DELETE",
          undefined,
          leader.token,
        )
      ).status,
      200,
    );
    const left = await db.query(
      "SELECT role,status FROM group_members WHERE group_id=$1 AND user_id=$2",
      [transferGroup.id, leader.id],
    );
    assert.equal(left.rows[0].status, "left");
    assert.equal(left.rows[0].role, "member");
    assert.equal(
      (
        await request(
          `/groups/${transferGroup.id}`,
          "GET",
          undefined,
          student.token,
        )
      ).data.leaderId,
      student.id,
    );
    await request("/auth/logout", "POST", undefined, leader.token);
    assert.equal(
      (await command(a, "chat:join_room", { groupId: otherGroup.id })).error
        .code,
      "UNAUTHORIZED",
    );
    pass(
      "Transferencia coherente, salida histórica y token revocado rechazado también por WebSocket",
    );
  }

  if (!process.argv.includes("--network-only")) {
    const { runWelcomeBrowser } = await import(
      "../../welcome/tests/welcome.browser.mjs"
    );
    const welcomeResults = await runWelcomeBrowser({
      web,
      password,
      registrationEmail,
      output,
      verificationCode: async () => {
        const row = await db.query(
          "SELECT verification_token FROM users WHERE email=$1",
          [registrationEmail],
        );
        assert.equal(row.rows.length, 1);
        return row.rows[0].verification_token;
      },
    });
    for (const value of welcomeResults) pass(value);
    // SPEC-05 del main consume la membresía histórica que conserva SPEC-04 después de una expulsión.
    const registered = await login(registrationEmail);
    const reviewer = await login(leader.email);
    const reviewGroup = await createGroup(
      reviewer,
      "Integración grupos y reseñas " + Date.now(),
    );
    await addMember(reviewGroup, reviewer, registered);
    assert.equal(
      (
        await request(
          `/groups/${reviewGroup.id}/members/${registered.id}`,
          "DELETE",
          undefined,
          reviewer.token,
        )
      ).status,
      200,
    );
    const eligibility = await request(
      `/reviews/eligibility/${registered.id}`,
      "GET",
      undefined,
      reviewer.token,
    );
    assert.equal(eligibility.status, 200);
    assert.equal(eligibility.data.allowed, true);
    const review = await request(
      "/reviews",
      "POST",
      {
        reviewedUserId: registered.id,
        rating: 5,
        comment: "Compartimos una práctica en el grupo de integración.",
      },
      reviewer.token,
    );
    assert.equal(review.status, 201, JSON.stringify(review.data));
    createdReviews.push(review.data.id);
    const summary = await request(`/reviews/user/${registered.id}`);
    assert.equal(summary.status, 200);
    assert.equal(summary.data.averageRating, 5);
    assert.ok(summary.data.reviews.some((item) => item.id === review.data.id));
    assert.equal(
      (
        await request(
          `/reviews/${review.data.id}`,
          "DELETE",
          undefined,
          registered.token,
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await request(
          `/reviews/${review.data.id}`,
          "DELETE",
          undefined,
          reviewer.token,
        )
      ).status,
      200,
    );
    const remaining = await request(`/reviews/user/${registered.id}`);
    assert.equal(remaining.data.totalReviews, 0);
    const historicalReview = await db.query(
      "SELECT status,deleted_at FROM reviews WHERE id=$1",
      [review.data.id],
    );
    assert.equal(historicalReview.rows[0].status, "deleted");
    assert.ok(historicalReview.rows[0].deleted_at);
    pass(
      "Integración del main: SPEC05 reconoce la membresía histórica de SPEC04 y conserva permisos y borrado lógico de reseñas",
    );
    const { runBrowser } = await import("./spec04.browser.mjs");
    const freshLeader = await login(leader.email);
    const result = await runBrowser({
      web,
      api,
      password,
      leader: freshLeader,
      student,
      outsider,
      request,
      createGroup,
      addMember,
      moderate: (groupId, messageId) => moderate(server, groupId, messageId),
      output,
      trackGroup: (id) => createdGroups.push(id),
    });
    for (const value of result) pass(value);
  }
  await writeFile(
    resolve(output, "results.json"),
    JSON.stringify({ status: "PASS", checks }, null, 2),
  );
} catch (error) {
  await writeFile(
    resolve(output, "results.json"),
    JSON.stringify({ status: "FAIL", checks, error: error.message }, null, 2),
  );
  console.error(error);
  process.exitCode = 1;
} finally {
  for (const socket of clients) socket.disconnect();
  try {
    for (const id of createdReviews)
      await db.query("DELETE FROM reviews WHERE id=$1", [id]);
    for (const id of createdGroups)
      await db.query("DELETE FROM groups WHERE id=$1", [id]);
    await db.query("DELETE FROM users WHERE email=$1", [registrationEmail]);
  } finally {
    await db.end();
  }
  for (const { child, label, log } of children) {
    child.kill();
    await writeFile(resolve(output, `${label}.log`), log());
  }
}
