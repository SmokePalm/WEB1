import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import type { Plugin } from "vite";
import { categoriaSchema, inscripcionSchema, type Luchador } from "../src/schemas/luchador.ts";
import { CORRUPTOS, SEMILLA } from "./semilla.ts";

/*
 * API REST de mentira para el torneo, montada dentro del propio servidor de Vite
 * (funciona con `npm run dev` y con `npm run preview`, sin arrancar nada más).
 *
 *   GET    /api/luchadores[?categoria=medio][&sabotaje=1][&caida=1]
 *   POST   /api/luchadores        → 201 | 409 correo repetido | 422 datos inválidos
 *   DELETE /api/luchadores/:id    → 204 | 404
 *
 * El servidor revalida con el MISMO esquema Zod que el formulario:
 * la validación del cliente es experiencia de usuario, no seguridad.
 */

const RETRASO_MS = 700; // para que se vea el «cargando»

let luchadores: Luchador[] = structuredClone(SEMILLA);
let siguienteDorsal = SEMILLA.length + 1;

const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

function responder(res: ServerResponse, estado: number, cuerpo?: unknown) {
  res.statusCode = estado;
  if (cuerpo === undefined) {
    res.end();
    return;
  }
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(cuerpo));
}

async function leerJson(req: IncomingMessage): Promise<unknown> {
  let texto = "";
  for await (const trozo of req) texto += trozo;
  try {
    return JSON.parse(texto);
  } catch {
    return undefined;
  }
}

async function manejar(req: IncomingMessage, res: ServerResponse) {
  // Connect quita el prefijo /api, así que aquí llega /luchadores…
  const url = new URL(req.url ?? "/", "http://localhost");
  const [, recurso, id] = url.pathname.split("/");

  if (recurso !== "luchadores") return responder(res, 404, { mensaje: "Ruta desconocida." });

  await esperar(RETRASO_MS);

  if (req.method === "GET" && !id) {
    if (url.searchParams.has("caida")) {
      return responder(res, 503, { mensaje: "El servidor del torneo está KO. Vuelve a intentarlo en un momento." });
    }
    const categoria = categoriaSchema.safeParse(url.searchParams.get("categoria"));
    const lista: unknown[] = categoria.success
      ? luchadores.filter((l) => l.categoria === categoria.data)
      : [...luchadores];
    if (url.searchParams.has("sabotaje")) lista.push(...CORRUPTOS);
    return responder(res, 200, { luchadores: lista });
  }

  if (req.method === "POST" && !id) {
    const validacion = inscripcionSchema.safeParse(await leerJson(req));
    if (!validacion.success) {
      const campos: Record<string, string> = {};
      for (const issue of validacion.error.issues) {
        const campo = String(issue.path[0] ?? "");
        if (campo && !campos[campo]) campos[campo] = issue.message;
      }
      return responder(res, 422, { mensaje: "Hay datos que no son válidos.", campos });
    }

    const { reglamento: _aceptado, ...datos } = validacion.data;
    void _aceptado;
    if (luchadores.some((l) => l.email.toLowerCase() === datos.email.toLowerCase())) {
      return responder(res, 409, {
        mensaje: "No se ha podido completar la inscripción.",
        campos: { email: "Ya hay un luchador inscrito con este correo." },
      });
    }

    const nuevo: Luchador = { ...datos, id: randomUUID(), dorsal: siguienteDorsal++, inscritoEn: new Date().toISOString() };
    luchadores = [...luchadores, nuevo];
    return responder(res, 201, nuevo);
  }

  if (req.method === "DELETE" && id) {
    const antes = luchadores.length;
    luchadores = luchadores.filter((l) => l.id !== decodeURIComponent(id));
    return luchadores.length < antes
      ? responder(res, 204)
      : responder(res, 404, { mensaje: "Ese luchador ya no está inscrito." });
  }

  return responder(res, 405, { mensaje: "Método no permitido." });
}

export function apiTorneo(): Plugin {
  // Ojo: estos hooks no devuelven nada a propósito (si devuelven una función, Vite la ejecuta después).
  const montar = (middlewares: { use: (ruta: string, fn: (req: IncomingMessage, res: ServerResponse) => void) => unknown }) => {
    middlewares.use("/api", (req, res) => {
      manejar(req, res).catch((error: unknown) => {
        console.error(error);
        responder(res, 500, { mensaje: "Error interno del servidor." });
      });
    });
  };

  return {
    name: "api-torneo",
    configureServer(server) {
      montar(server.middlewares);
    },
    configurePreviewServer(server) {
      montar(server.middlewares);
    },
  };
}
