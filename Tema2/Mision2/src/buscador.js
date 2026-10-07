// Une la API con la lógica: de una nevera a una lista de recetas listas para pintar.

import { buscarPorIngrediente, obtenerReceta } from "./api.js";
import { combinarResultados, completarReceta, ordenarPorCoincidencias } from "./recetas.js";

const MAX_RECETAS = 12;

export async function buscarRecetas(nevera, signal) {
  // 1. Una petición por ingrediente. Son independientes, así que salen todas a la vez.
  //    allSettled en vez de all: si falla un ingrediente, los demás siguen valiendo.
  const respuestas = await Promise.allSettled(
    nevera.map((ingrediente) => buscarPorIngrediente(ingrediente, signal)),
  );

  const fallidos = nevera.filter((_, i) => respuestas[i].status === "rejected");
  if (fallidos.length === nevera.length) throw respuestas[0].reason;

  const porIngrediente = respuestas.flatMap((respuesta, i) =>
    respuesta.status === "fulfilled" ? [[nevera[i], respuesta.value]] : [],
  );
  const sinRecetas = porIngrediente
    .filter(([, platos]) => platos.length === 0)
    .map(([ingrediente]) => ingrediente);

  const mejores = ordenarPorCoincidencias(combinarResultados(porIngrediente)).slice(0, MAX_RECETAS);

  // 2. El detalle de cada receta. Esto sí depende del paso 1 (hacen falta los id),
  //    pero entre ellas vuelven a ser independientes.
  const detalles = await Promise.allSettled(
    mejores.map(({ id }) => obtenerReceta(id, signal)),
  );
  signal?.throwIfAborted();

  const recetas = mejores.map((candidata, i) =>
    completarReceta(candidata, detalles[i].status === "fulfilled" ? detalles[i].value : null, nevera),
  );

  return { recetas, fallidos, sinRecetas };
}
