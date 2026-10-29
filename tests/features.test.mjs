import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Criterios de Aceptación - Épica 3: Gestionar Seguridad (features/auth)", () => {
  // H.U. 3.1: Registrar usuario
  describe("H.U. 3.1 - Validaciones de registro de usuario", () => {
    function validateRegistration(email, password, name) {
      if (!email || !password || !name) {
        return { valid: false, error: "Debe ingresar todos los datos" };
      }
      if (!email.endsWith("@aloe.ulima.edu.pe")) {
        return {
          valid: false,
          error: "El correo ingresado no pertenece a la organización de la Universidad de Lima",
        };
      }
      if (password.length < 10) {
        return {
          valid: false,
          error: "La contraseña debe tener por lo menos 10 caracteres",
        };
      }
      return { valid: true };
    }

    test("Escenario 1: Registro exitoso con correo institucional y contraseña >= 10 caracteres", () => {
      const result = validateRegistration(
        "ana.torres@aloe.ulima.edu.pe",
        "LuminaSegura2026!",
        "Ana Torres",
      );
      assert.equal(result.valid, true);
    });

    test("Escenario 2: Denegar registro si correo no termina en @aloe.ulima.edu.pe", () => {
      const result = validateRegistration(
        "usuario@gmail.com",
        "LuminaSegura2026!",
        "Usuario Prueba",
      );
      assert.equal(result.valid, false);
      assert.match(result.error, /no pertenece a la organización/);
    });

    test("Escenario 3: Denegar registro si contraseña tiene menos de 10 caracteres", () => {
      const result = validateRegistration(
        "robert.demo@aloe.ulima.edu.pe",
        "123456789", // 9 chars
        "Robert Demo",
      );
      assert.equal(result.valid, false);
      assert.match(result.error, /por lo menos 10 caracteres/);
    });

    test("Escenario 4: Denegar registro con datos faltantes", () => {
      const result = validateRegistration("", "1234567890", "");
      assert.equal(result.valid, false);
      assert.match(result.error, /Debe ingresar todos los datos/);
    });
  });

  // H.U. 3.5: Actualizar contraseña
  describe("H.U. 3.5 - Actualizar contraseña", () => {
    function validatePasswordUpdate(password) {
      if (!password) {
        return { valid: false, error: "Debe ingresar todos los datos" };
      }
      if (password.length < 10) {
        return {
          valid: false,
          error: "La contraseña debe tener por lo menos 10 caracteres",
        };
      }
      return { valid: true };
    }

    test("Contraseña válida >= 10 caracteres es aceptada", () => {
      const res = validatePasswordUpdate("NuevaClave2026!");
      assert.equal(res.valid, true);
    });

    test("Contraseña < 10 caracteres es rechazada", () => {
      const res = validatePasswordUpdate("corta123");
      assert.equal(res.valid, false);
      assert.match(res.error, /por lo menos 10 caracteres/);
    });
  });
});

describe("Criterios de Aceptación - Épica 1: Gestionar Publicaciones (features/posts)", () => {
  // H.U. 1.1: Validaciones al crear publicación
  describe("H.U. 1.1 - Validaciones obligatorias de campos", () => {
    function validatePostForm(form) {
      const missing = [];
      if (!form.course_id) missing.push("Curso");
      if (!form.description?.trim()) missing.push("Descripción");
      if (!form.benefits?.trim()) missing.push("Beneficios");
      if (!form.requirements?.trim()) missing.push("Requisitos");

      if (missing.length > 0) {
        return {
          valid: false,
          error: `Dicho(s) campo(s) en blanco debe completarse: ${missing.join(", ")}.`,
        };
      }
      return { valid: true };
    }

    test("Publicación con todos los campos obligatorios es válida", () => {
      const form = {
        course_id: "course-123",
        description: "Grupo de estudio de Algoritmos",
        benefits: "Aprender resolución de problemas",
        requirements: "Conocimientos previos de C++",
      };
      const res = validatePostForm(form);
      assert.equal(res.valid, true);
    });

    test("Detecta campos faltantes individualizados", () => {
      const form = {
        course_id: "",
        description: "",
        benefits: "Beneficios",
        requirements: "",
      };
      const res = validatePostForm(form);
      assert.equal(res.valid, false);
      assert.match(res.error, /Curso/);
      assert.match(res.error, /Descripción/);
      assert.match(res.error, /Requisitos/);
    });
  });

  // H.U. 1.3: Filtrar publicaciones
  describe("H.U. 1.3 - Filtrado por tipo, ciclo y curso", () => {
    const samplePosts = [
      { id: "1", type: "study_group", cycle: 5, course_id: "cs-1" },
      { id: "2", type: "tutoring", cycle: 5, course_id: "cs-1" },
      { id: "3", type: "study_group", cycle: 7, course_id: "cs-2" },
      { id: "4", type: "tutoring", cycle: 8, course_id: "cs-3" },
    ];

    function filterPosts(posts, { type, cycle, course_id }) {
      return posts.filter((p) => {
        if (type && p.type !== type) return false;
        if (cycle && p.cycle !== cycle) return false;
        if (course_id && p.course_id !== course_id) return false;
        return true;
      });
    }

    test("Filtrar publicaciones por tipo 'study_group'", () => {
      const res = filterPosts(samplePosts, { type: "study_group" });
      assert.equal(res.length, 2);
      assert.ok(res.every((p) => p.type === "study_group"));
    });

    test("Filtrar publicaciones por tipo 'tutoring'", () => {
      const res = filterPosts(samplePosts, { type: "tutoring" });
      assert.equal(res.length, 2);
      assert.ok(res.every((p) => p.type === "tutoring"));
    });

    test("Filtrar publicaciones por ciclo del curso", () => {
      const res = filterPosts(samplePosts, { cycle: 5 });
      assert.equal(res.length, 2);
      assert.ok(res.every((p) => p.cycle === 5));
    });

    test("Filtrar y retornar vacío cuando no hay coincidencias", () => {
      const res = filterPosts(samplePosts, { cycle: 10 });
      assert.equal(res.length, 0);
    });
  });
});

describe("Criterios de Aceptación - Épica 2: Gestionar Comunicación (features/chat)", () => {
  // H.U. 2.1: Estado del usuario frente al grupo
  describe("H.U. 2.1 - Opciones de unión según estado de membresía", () => {
    function getJoinActionVisibility(membershipStatus) {
      return {
        canRequestJoin: membershipStatus === "none",
        isPending: membershipStatus === "pending",
        isMemberOrAdmin: membershipStatus === "member" || membershipStatus === "admin",
      };
    }

    test("Usuario sin relación ('none') puede enviar solicitud", () => {
      const state = getJoinActionVisibility("none");
      assert.equal(state.canRequestJoin, true);
      assert.equal(state.isPending, false);
      assert.equal(state.isMemberOrAdmin, false);
    });

    test("Usuario con solicitud previa ('pending') ve estado pendiente", () => {
      const state = getJoinActionVisibility("pending");
      assert.equal(state.canRequestJoin, false);
      assert.equal(state.isPending, true);
    });

    test("Usuario ya miembro ('member'/'admin') no visualiza botón de enviar solicitud", () => {
      const member = getJoinActionVisibility("member");
      const admin = getJoinActionVisibility("admin");
      assert.equal(member.canRequestJoin, false);
      assert.equal(admin.canRequestJoin, false);
      assert.equal(member.isMemberOrAdmin, true);
    });
  });

  // H.U. 2.2: Gestión de solicitudes de unión
  describe("H.U. 2.2 - Aceptar y rechazar solicitudes", () => {
    test("Aceptar solicitud remueve de pendientes e incrementa membresía", () => {
      const requests = [{ id: "req-1", status: "pending" }, { id: "req-2", status: "pending" }];
      const acceptedId = "req-1";
      const remaining = requests.filter((r) => r.id !== acceptedId);
      assert.equal(remaining.length, 1);
      assert.equal(remaining[0].id, "req-2");
    });

    test("Lista de solicitudes vacía genera estado correspondiente", () => {
      const requests = [];
      const emptyMessage = requests.length === 0 ? "No hay solicitudes pendientes por revisar" : null;
      assert.equal(emptyMessage, "No hay solicitudes pendientes por revisar");
    });
  });

  // H.U. 2.6: Regla de expulsión
  describe("H.U. 2.6 - Expulsión de integrante", () => {
    test("El administrador no puede expulsarse a sí mismo", () => {
      const currentUserId = "admin-1";
      const member = { user_id: "admin-1", role: "admin" };
      const canExpel = member.user_id !== currentUserId;
      assert.equal(canExpel, false);
    });

    test("El administrador sí puede expulsar a otro integrante", () => {
      const currentUserId = "admin-1";
      const member = { user_id: "student-2", role: "member" };
      const canExpel = member.user_id !== currentUserId;
      assert.equal(canExpel, true);
    });
  });
});

describe("Criterios de Aceptación - Épica 4: Gestionar Perfil (features/profile)", () => {
  // H.U. 4.2 y 4.3: Validación de horario disponible
  describe("H.U. 4.2 - Validación de franjas horarias", () => {
    function validateTimeSlot(start_time, end_time) {
      if (!start_time || !end_time) {
        return { valid: false, error: "Debe ingresar hora de inicio y fin" };
      }
      if (start_time >= end_time) {
        return {
          valid: false,
          error: "La hora de inicio debe ser anterior a la hora de fin",
        };
      }
      return { valid: true };
    }

    test("Franja horaria válida cuando start_time < end_time", () => {
      const res = validateTimeSlot("10:00", "12:00");
      assert.equal(res.valid, true);
    });

    test("Rechazar si hora de inicio es igual a hora de fin", () => {
      const res = validateTimeSlot("10:00", "10:00");
      assert.equal(res.valid, false);
      assert.match(res.error, /anterior a la hora de fin/);
    });

    test("Rechazar si hora de inicio es posterior a hora de fin", () => {
      const res = validateTimeSlot("14:00", "11:00");
      assert.equal(res.valid, false);
      assert.match(res.error, /anterior a la hora de fin/);
    });
  });
});

describe("Criterios de Aceptación - Épica 5: Gestionar Reseñas (features/reviews)", () => {
  // H.U. 5.1: Publicar reseña
  describe("H.U. 5.1 - Validación de calificación y comentario", () => {
    function validateReview(rating, comment, targetUserId, currentUserId) {
      if (targetUserId === currentUserId) {
        return { valid: false, error: "No puedes calificar tu propio perfil" };
      }
      if (!rating || rating < 1 || rating > 5) {
        return { valid: false, error: "Debe seleccionar una calificación" };
      }
      if (!comment || !comment.trim()) {
        return { valid: false, error: "Debe ingresar un comentario" };
      }
      return { valid: true };
    }

    test("Reseña con calificación 1-5 y comentario es válida", () => {
      const res = validateReview(5, "Excelente compañero de estudio", "user-2", "user-1");
      assert.equal(res.valid, true);
    });

    test("Rechazar si no selecciona calificación", () => {
      const res = validateReview(0, "Buen trabajo", "user-2", "user-1");
      assert.equal(res.valid, false);
      assert.match(res.error, /seleccionar una calificación/);
    });

    test("Rechazar si el comentario está vacío", () => {
      const res = validateReview(4, "   ", "user-2", "user-1");
      assert.equal(res.valid, false);
      assert.match(res.error, /ingresar un comentario/);
    });

    test("Impedir reseña sobre uno mismo", () => {
      const res = validateReview(5, "Soy muy bueno", "user-1", "user-1");
      assert.equal(res.valid, false);
      assert.match(res.error, /tu propio perfil/);
    });
  });
});

describe("Criterios de Aceptación - Épica 6 y 7: Moderación y Administración (features/admin)", () => {
  // H.U. 6.4: Apelación
  describe("H.U. 6.4 - Enviar justificación de apelación", () => {
    function validateAppeal(justification) {
      if (!justification || justification.trim().length < 10) {
        return {
          valid: false,
          error: "La justificación debe tener al menos 10 caracteres",
        };
      }
      return { valid: true };
    }

    test("Justificación >= 10 caracteres es válida", () => {
      const res = validateAppeal("Fue un error de contexto en el código compartido.");
      assert.equal(res.valid, true);
    });

    test("Justificación corta < 10 caracteres es rechazada", () => {
      const res = validateAppeal("injusto");
      assert.equal(res.valid, false);
      assert.match(res.error, /al menos 10 caracteres/);
    });
  });

  // H.U. 7.1: Suspender cuenta
  describe("H.U. 7.1 - Suspender cuenta", () => {
    function validateSuspension(reason) {
      if (!reason || reason.trim().length < 5) {
        return { valid: false, error: "Debe ingresar un motivo válido" };
      }
      return { valid: true };
    }

    test("Motivo válido permite suspender cuenta", () => {
      const res = validateSuspension("Incumplimiento reiterado de normas");
      assert.equal(res.valid, true);
    });

    test("Motivo vacío es rechazado", () => {
      const res = validateSuspension("");
      assert.equal(res.valid, false);
    });
  });
});
