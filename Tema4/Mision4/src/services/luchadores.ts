import {
  errorApiSchema,
  luchadorSchema,
  respuestaListaSchema,
  type Categoria,
  type ErrorApiCuerpo,
  type Inscripcion,
  type Luchador,
} from "../schemas/luchador.ts";

/*
 * Capa de servicios: todos los fetch de la app viven aquí.
 * Los componentes no saben de URLs, ni de response.ok, ni de JSON.
 */

const URL_API = import.meta.env.VITE_API_URL ?? "/api";

/** Error HTTP del API (4xx / 5xx), con los errores por campo si el servidor los manda. */
export class ErrorApi extends Error {
  readonly estado: number;
  readonly campos: ErrorApiCuerpo["campos"];

  constructor(estado: number, cuerpo: ErrorApiCuerpo) {
    super(cuerpo.mensaje);
    this.name = "ErrorApi";
    this.estado = estado;
    this.campos = cuerpo.campos;
  }
}

/** La respuesta llegó con 200, pero no tiene la forma que esperamos. No tiene sentido reintentar. */
export class ErrorRespuestaCorrupta extends Error {
  constructor(detalle: string) {
    super(`El servidor ha mandado datos con un formato inesperado (${detalle}).`);
    this.name = "ErrorRespuestaCorrupta";
  }
}

async function pedir(ruta: string, opciones: RequestInit = {}): Promise<unknown> {
  const respuesta = await fetch(`${URL_API}${ruta}`, {
    ...opciones,
    headers: { "Content-Type": "application/json", ...opciones.headers },
  });

  // fetch solo rechaza si falla la red: un 404 o un 500 hay que convertirlos en error a mano.
  if (!respuesta.ok) {
    const cuerpo = errorApiSchema.safeParse(await respuesta.json().catch(() => null));
    throw new ErrorApi(
      respuesta.status,
      cuerpo.success ? cuerpo.data : { mensaje: `El servidor respondió ${respuesta.status} ${respuesta.statusText}.` },
    );
  }

  return respuesta.status === 204 ? null : respuesta.json();
}

export type Descartado = {
  /** Posición del registro dentro de la respuesta. */
  posicion: number;
  /** Lo que llegó, tal cual, para poder enseñarlo. */
  recibido: unknown;
  /** Un motivo por cada problema que encontró Zod. */
  motivos: string[];
};

export type ListaLuchadores = {
  luchadores: Luchador[];
  descartados: Descartado[];
};

export type FiltroLuchadores = {
  categoria: Categoria | "todas";
  /** Laboratorio: pide al servidor que cuele registros corruptos. */
  sabotaje: boolean;
  /** Laboratorio: pide al servidor que responda 503. */
  caida: boolean;
};

/**
 * ★ Bonus: cada luchador del API se valida con safeParse.
 * Los buenos se pintan; los corruptos se apartan con el motivo, en vez de romper la pantalla
 * o colarse en ella con un peso «ochenta» o una categoría que no existe.
 */
export function separarLuchadores(lista: unknown[]): ListaLuchadores {
  const resultado: ListaLuchadores = { luchadores: [], descartados: [] };

  lista.forEach((recibido, posicion) => {
    const validacion = luchadorSchema.safeParse(recibido);
    if (validacion.success) {
      resultado.luchadores.push(validacion.data);
    } else {
      resultado.descartados.push({
        posicion,
        recibido,
        motivos: validacion.error.issues.map((issue) =>
          issue.path.length > 0 ? `${issue.path.join(".")}: ${issue.message}` : issue.message,
        ),
      });
    }
  });

  return resultado;
}

export async function obtenerLuchadores(filtro: FiltroLuchadores, signal?: AbortSignal): Promise<ListaLuchadores> {
  const parametros = new URLSearchParams();
  if (filtro.categoria !== "todas") parametros.set("categoria", filtro.categoria);
  if (filtro.sabotaje) parametros.set("sabotaje", "1");
  if (filtro.caida) parametros.set("caida", "1");
  const consulta = parametros.size > 0 ? `?${parametros}` : "";

  const json = await pedir(`/luchadores${consulta}`, { signal });

  // Primero el sobre: si ni siquiera hay un array, la query entera pasa a error.
  const sobre = respuestaListaSchema.safeParse(json);
  if (!sobre.success) throw new ErrorRespuestaCorrupta("se esperaba { luchadores: [...] }");

  return separarLuchadores(sobre.data.luchadores);
}

export async function inscribirLuchador(datos: Inscripcion): Promise<Luchador> {
  const json = await pedir("/luchadores", { method: "POST", body: JSON.stringify(datos) });

  // La respuesta del POST también se valida: si el servidor devuelve basura, mejor saberlo aquí.
  const validacion = luchadorSchema.safeParse(json);
  if (!validacion.success) throw new ErrorRespuestaCorrupta("el luchador creado no es válido");
  return validacion.data;
}

export async function retirarLuchador(id: string): Promise<void> {
  await pedir(`/luchadores/${encodeURIComponent(id)}`, { method: "DELETE" });
}
