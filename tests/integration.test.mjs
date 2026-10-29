import { test, describe } from "node:test";
import assert from "node:assert/strict";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

describe("Pruebas de Integración con el Backend en Vivo (NestJS + PostgreSQL)", () => {
  // 1. Healthcheck
  test("1. Backend Health Check: GET /health responde 200 y status ok", async () => {
    const res = await fetch(`${BACKEND_URL}/health`);
    assert.equal(res.status, 200, "El servicio de salud debe responder 200 OK");
    const data = await res.json();
    assert.equal(data.status, "ok");
    assert.equal(data.service, "luminaul-backend");
  });

  // 2. Swagger / Documentación
  test("2. Especificación OpenAPI: GET /docs-json responde 200 con rutas válidas", async () => {
    const res = await fetch(`${BACKEND_URL}/docs-json`);
    assert.equal(res.status, 200);
    const doc = await res.json();
    assert.ok(doc.openapi || doc.swagger, "Debe contener especificación Swagger/OpenAPI");
    assert.ok(doc.paths["/posts"], "Debe documentar ruta /posts");
    assert.ok(doc.paths["/courses"], "Debe documentar ruta /courses");
    assert.ok(doc.paths["/join-requests/me"], "Debe documentar ruta /join-requests/me");
  });

  // 3. Catálogo de Cursos (features/posts)
  test("3. Catálogo de Cursos: GET /courses retorna lista de cursos reales con ciclo", async () => {
    const res = await fetch(`${BACKEND_URL}/courses`);
    assert.equal(res.status, 200);
    const courses = await res.json();
    assert.ok(Array.isArray(courses), "Debe retornar un array");
    assert.ok(courses.length > 0, "Debe tener cursos semilla en base de datos");

    const firstCourse = courses[0];
    assert.ok(firstCourse.id, "Cada curso debe tener id UUID");
    assert.ok(firstCourse.name, "Cada curso debe tener nombre");
    assert.ok(typeof firstCourse.cycle === "number", "Cada curso debe tener ciclo numérico");
  });

  // 4. Feed de Publicaciones (H.U. 1.3 y 1.5)
  describe("4. Integración Feed de Publicaciones: GET /posts y Filtros", () => {
    test("GET /posts responde 200 con array de publicaciones", async () => {
      const res = await fetch(`${BACKEND_URL}/posts`);
      assert.equal(res.status, 200);
      const posts = await res.json();
      assert.ok(Array.isArray(posts), "El feed debe responder un array");
    });

    test("GET /posts con paginación (limit y offset) valida parámetros en backend", async () => {
      const res = await fetch(`${BACKEND_URL}/posts?limit=5&offset=0`);
      assert.equal(res.status, 200);
      const posts = await res.json();
      assert.ok(Array.isArray(posts));
      assert.ok(posts.length <= 5, "No debe exceder el límite solicitado");
    });

    test("GET /posts filtrando por tipo 'study_group'", async () => {
      const res = await fetch(`${BACKEND_URL}/posts?type=study_group`);
      assert.equal(res.status, 200);
      const posts = await res.json();
      assert.ok(Array.isArray(posts));
      for (const p of posts) {
        assert.equal(p.type, "study_group", "Solo debe retornar posts de tipo study_group");
      }
    });

    test("GET /posts filtrando por ciclo académico", async () => {
      const res = await fetch(`${BACKEND_URL}/posts?cycle=2`);
      assert.equal(res.status, 200);
      const posts = await res.json();
      assert.ok(Array.isArray(posts));
    });

    test("GET /posts/me responde 200 para historial de publicaciones del usuario", async () => {
      const res = await fetch(`${BACKEND_URL}/posts/me`);
      assert.equal(res.status, 200);
      const myPosts = await res.json();
      assert.ok(Array.isArray(myPosts));
    });
  });

  // 5. Grupos de Estudio (features/chat)
  describe("5. Integración Grupos de Estudio: GET /groups/{id}", () => {
    test("Consultar grupo inexistente responde 404 estructurado", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";
      const res = await fetch(`${BACKEND_URL}/groups/${nonExistentId}`);
      assert.equal(res.status, 404);
      const body = await res.json();
      assert.equal(body.statusCode, 404);
      assert.match(body.message, /Grupo no encontrado/);
    });
  });

  // 6. Solicitudes de Ingreso (H.U. 2.1 & 2.2)
  describe("6. Integración Solicitudes de Ingreso: /join-requests", () => {
    test("GET /join-requests/me responde 200 con estructura de lista y total", async () => {
      const res = await fetch(`${BACKEND_URL}/join-requests/me`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.ok(Array.isArray(body.requests), "La propiedad requests debe ser un array");
      assert.ok(typeof body.total === "number", "La propiedad total debe ser un número");
      if (body.requests.length === 0) {
        assert.ok(body.message, "Si está vacío debe incluir mensaje descriptivo");
      }
    });

    test("POST /groups/{group_id}/join-requests rechaza grupo no existente con 404", async () => {
      const nonExistentGroup = "00000000-0000-0000-0000-000000000000";
      const res = await fetch(`${BACKEND_URL}/groups/${nonExistentGroup}/join-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Hola, me gustaría unirme" }),
      });
      assert.equal(res.status, 404);
    });

    test("PATCH /join-requests/{id} con ID inválido responde 404", async () => {
      const nonExistentReq = "00000000-0000-0000-0000-000000000000";
      const res = await fetch(`${BACKEND_URL}/join-requests/${nonExistentReq}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accepted" }),
      });
      assert.equal(res.status, 404);
    });
  });

  // 7. Seguridad y Sesión (features/auth)
  describe("7. Integración Seguridad y Sesión: /auth/logout", () => {
    test("POST /auth/logout sin token rechaza con 401 'Falta el token de autenticación'", async () => {
      const res = await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
      });
      assert.equal(res.status, 401);
      const body = await res.json();
      assert.match(body.message, /token/i);
    });
  });
});
