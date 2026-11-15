import { QueryClient } from "@tanstack/react-query";
import { ErrorApi, ErrorRespuestaCorrupta } from "../services/luchadores.ts";

/** Solo merece la pena reintentar si la culpa puede ser pasajera: red caída o error 5xx. */
export function merecePenaReintentar(intentosFallidos: number, error: Error): boolean {
  if (intentosFallidos >= 2) return false;
  if (error instanceof ErrorRespuestaCorrupta) return false; // los datos van a seguir rotos
  if (error instanceof ErrorApi) return error.estado >= 500; // un 404 no se arregla solo
  return true; // fallo de red
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 s frescos: volver a la pestaña no dispara peticiones de más
      retry: merecePenaReintentar,
    },
    mutations: {
      retry: false, // un POST no se repite solo: podría inscribir dos veces
    },
  },
});
