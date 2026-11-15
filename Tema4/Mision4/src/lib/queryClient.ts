import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 s frescos: volver a la pestaña no dispara peticiones de más
      retry: 1, // si falla, se intenta una vez más (por defecto serían 3, unos 7 s en «Cargando…»)
    },
    mutations: {
      retry: false, // un POST no se repite solo: podría inscribir dos veces
    },
  },
});
