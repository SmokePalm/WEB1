import type { FiltroLuchadores } from "../services/luchadores.ts";

/**
 * Las query keys salen siempre de aquí, nunca escritas a mano en un componente.
 * Todas empiezan por "luchadores", así que invalidar `todas` refresca cualquier filtro.
 */
export const clavesLuchadores = {
  todas: ["luchadores"] as const,
  lista: (filtro: FiltroLuchadores) => ["luchadores", "lista", filtro] as const,
};
