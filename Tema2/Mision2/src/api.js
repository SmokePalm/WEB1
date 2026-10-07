// Único módulo que habla con TheMealDB. No sabe nada del DOM ni de la nevera.

const BASE = "https://www.themealdb.com/api/json/v1/1";
const TIEMPO_MAXIMO = 10_000;

async function pedir(ruta, parametros, signal) {
  const url = new URL(`${BASE}/${ruta}`);
  url.search = new URLSearchParams(parametros);

  // Se cancela si lo pide quien llama (signal) o si la API tarda demasiado
  const limites = [signal, AbortSignal.timeout(TIEMPO_MAXIMO)].filter(Boolean);
  const respuesta = await fetch(url, { signal: AbortSignal.any(limites) });

  // fetch no rechaza con un 404 o un 500: hay que mirarlo a mano
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

  const datos = await respuesta.json();

  // "meals" llega como null si no hay resultados y como texto ("Invalid ID") si el id no existe
  return Array.isArray(datos?.meals) ? datos.meals : [];
}

export const buscarPorIngrediente = (ingrediente, signal) =>
  pedir("filter.php", { i: ingrediente }, signal);

export async function obtenerReceta(id, signal) {
  const [receta] = await pedir("lookup.php", { i: id }, signal);
  return receta ?? null;
}

export const listarIngredientes = (signal) => pedir("list.php", { i: "list" }, signal);

// Traduce los errores de fetch a algo que pueda leer una persona
export function explicarError(error) {
  if (error?.name === "TimeoutError") return "La API está tardando demasiado en responder.";
  if (error?.name === "TypeError") return "No hay conexión con la API. Revisa tu red.";
  if (error?.name === "SyntaxError") return "La API ha devuelto una respuesta que no se entiende.";
  if (error?.message?.startsWith("HTTP")) return `La API ha respondido con un error (${error.message}).`;
  return "Ha ocurrido un error inesperado.";
}
