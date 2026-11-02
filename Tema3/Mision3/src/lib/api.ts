// Único módulo que habla con TheMealDB. No sabe nada de React ni de la nevera.

import type { Fila } from "./tipos.ts";

const BASE = "https://www.themealdb.com/api/json/v1/1";
const TIEMPO_MAXIMO = 10_000;

const esFila = (valor: unknown): valor is Fila => typeof valor === "object" && valor !== null;

async function pedir(ruta: string, parametros: Record<string, string>, signal?: AbortSignal) {
  const url = new URL(`${BASE}/${ruta}`);
  url.search = new URLSearchParams(parametros).toString();

  // Se cancela si lo pide quien llama (signal) o si la API tarda demasiado
  const limites = [AbortSignal.timeout(TIEMPO_MAXIMO)];
  if (signal) limites.push(signal);
  const respuesta = await fetch(url, { signal: AbortSignal.any(limites) });

  // fetch no rechaza con un 404 o un 500: hay que mirarlo a mano
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

  const datos: unknown = await respuesta.json();
  const meals = esFila(datos) ? datos.meals : null;

  // "meals" llega como null si no hay resultados y como texto ("Invalid ID") si el id no existe
  return Array.isArray(meals) ? meals.filter(esFila) : [];
}

export const buscarPorIngrediente = (ingrediente: string, signal?: AbortSignal) =>
  pedir("filter.php", { i: ingrediente }, signal);

export async function obtenerReceta(id: string, signal?: AbortSignal) {
  const [receta] = await pedir("lookup.php", { i: id }, signal);
  return receta ?? null;
}

export const listarIngredientes = (signal?: AbortSignal) =>
  pedir("list.php", { i: "list" }, signal);

// Traduce los errores de fetch a algo que pueda leer una persona
export function explicarError(error: unknown) {
  const nombre = error instanceof Error ? error.name : "";
  const mensaje = error instanceof Error ? error.message : "";

  if (nombre === "TimeoutError") return "La API está tardando demasiado en responder.";
  if (nombre === "TypeError") return "No hay conexión con la API. Revisa tu red.";
  if (nombre === "SyntaxError") return "La API ha devuelto una respuesta que no se entiende.";
  if (mensaje.startsWith("HTTP")) return `La API ha respondido con un error (${mensaje}).`;
  return "Ha ocurrido un error inesperado.";
}
