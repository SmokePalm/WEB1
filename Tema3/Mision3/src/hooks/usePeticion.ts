import { useEffect, useState } from "react";

// Una tarea asíncrona que se puede cancelar. Quien llama debe pasar siempre la misma
// función (de módulo o memorizada con useMemo/useCallback): cambiarla lanza otra petición.
export type Tarea<T> = (signal: AbortSignal) => Promise<T>;

export type Peticion<T> =
  | { estado: "inactiva" }
  | { estado: "cargando" }
  | { estado: "error"; error: unknown }
  | { estado: "lista"; datos: T };

// Cada respuesta recuerda a qué tarea e intento pertenece
type Respuesta<T> = { tarea: Tarea<T>; intento: number } & (
  | { ok: true; datos: T }
  | { ok: false; error: unknown }
);

export function usePeticion<T>(tarea: Tarea<T> | null) {
  const [intento, setIntento] = useState(0);
  const [respuesta, setRespuesta] = useState<Respuesta<T> | null>(null);

  useEffect(() => {
    if (!tarea) return;

    const control = new AbortController();
    tarea(control.signal).then(
      (datos) => {
        if (!control.signal.aborted) setRespuesta({ tarea, intento, ok: true, datos });
      },
      (error: unknown) => {
        // Una petición cancelada no es un error que haya que enseñar
        if (!control.signal.aborted) setRespuesta({ tarea, intento, ok: false, error });
      },
    );

    // Si cambia la tarea (o se desmonta el componente) la petición vieja ya no interesa:
    // su respuesta llegaría tarde y pisaría a la nueva
    return () => control.abort();
  }, [tarea, intento]);

  const reintentar = () => setIntento((anterior) => anterior + 1);

  // "cargando" no se guarda: se deduce de que la última respuesta no es de esta tarea
  const peticion: Peticion<T> =
    tarea === null
      ? { estado: "inactiva" }
      : respuesta?.tarea !== tarea || respuesta.intento !== intento
        ? { estado: "cargando" }
        : respuesta.ok
          ? { estado: "lista", datos: respuesta.datos }
          : { estado: "error", error: respuesta.error };

  return { ...peticion, reintentar };
}
