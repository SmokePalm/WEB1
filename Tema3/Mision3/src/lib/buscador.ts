// Une la API con la lógica: de una nevera a una lista de recetas listas para pintar.

import { buscarPorIngrediente, obtenerReceta } from "./api.ts";
import { combinarResultados, completarReceta, ordenarPorCoincidencias } from "./recetas.ts";
import type { Fila, ResultadoBusqueda } from "./tipos.ts";

const MAX_RECETAS = 12;

export async function buscarRecetas(
  nevera: string[],
  signal: AbortSignal,
): Promise<ResultadoBusqueda> {
  // 1. Una petición por ingrediente. Son independientes, así que salen todas a la vez.
  //    allSettled en vez de all: si falla un ingrediente, los demás siguen valiendo.
  const respuestas = await Promise.allSettled(
    nevera.map((ingrediente) => buscarPorIngrediente(ingrediente, signal)),
  );

  const fallidos = nevera.filter((_, i) => respuestas[i].status === "rejected");
  if (fallidos.length === nevera.length && respuestas[0].status === "rejected") {
    throw respuestas[0].reason;
  }

  const porIngrediente = respuestas.flatMap((respuesta, i): [string, Fila[]][] =>
    respuesta.status === "fulfilled" ? [[nevera[i], respuesta.value]] : [],
  );
  const sinRecetas = porIngrediente
    .filter(([, platos]) => platos.length === 0)
    .map(([ingrediente]) => ingrediente);

  const mejores = ordenarPorCoincidencias(combinarResultados(porIngrediente)).slice(0, MAX_RECETAS);

  // 2. El detalle de cada receta. Esto sí depende del paso 1 (hacen falta los id),
  //    pero entre ellas vuelven a ser independientes.
  const detalles = await Promise.allSettled(mejores.map(({ id }) => obtenerReceta(id, signal)));
  signal.throwIfAborted();

  const recetas = mejores.map((candidata, i) => {
    const detalle = detalles[i];
    return completarReceta(candidata, detalle.status === "fulfilled" ? detalle.value : null, nevera);
  });

  return { recetas, fallidos, sinRecetas };
}
