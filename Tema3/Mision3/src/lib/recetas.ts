// Lógica pura: recibe datos y devuelve datos nuevos. Sin fetch y sin React.

import type { Candidata, Fila, IngredienteReceta, Receta } from "./tipos.ts";

export const MAX_INGREDIENTES = 6;
export const TODAS = "Todas";

const SIN_COCINA = "Sin clasificar";
const HUECOS_DE_INGREDIENTE = 20;

const limpiarTexto = (valor: unknown) => (typeof valor === "string" ? valor.trim() : "");

export const normalizarIngrediente = (texto: unknown) =>
  limpiarTexto(texto).toLowerCase().replace(/\s+/g, " ");

// --- La nevera ---

// Devuelve el motivo por el que no se puede añadir, o "" si se puede
export function comprobarIngrediente(nevera: string[], ingrediente: string) {
  if (!ingrediente) return "Escribe un ingrediente.";
  if (nevera.includes(ingrediente)) return `Ya tienes «${ingrediente}» en la nevera.`;
  if (nevera.length >= MAX_INGREDIENTES) {
    return `En la nevera solo caben ${MAX_INGREDIENTES} ingredientes.`;
  }
  return "";
}

// Lo guardado en localStorage puede haberlo tocado cualquiera: se limpia igual que lo que escribe el usuario
export function leerNevera(guardado: unknown): string[] {
  if (!Array.isArray(guardado)) return [];
  const ingredientes = guardado.map(normalizarIngrediente).filter(Boolean);
  return [...new Set(ingredientes)].slice(0, MAX_INGREDIENTES);
}

// --- De las respuestas de la API a recetas ---

// Recibe pares [ingrediente, platos] y los junta en una sola lista sin repetidos,
// apuntando en cada plato qué ingredientes de la nevera lo han encontrado.
export function combinarResultados(porIngrediente: [string, Fila[]][]) {
  const candidatas = porIngrediente
    .flatMap(([ingrediente, platos]) => platos.map((plato) => ({ ingrediente, plato })))
    .filter(({ plato }) => limpiarTexto(plato.idMeal))
    .reduce((mapa, { ingrediente, plato }) => {
      const id = limpiarTexto(plato.idMeal);
      const anterior = mapa.get(id) ?? {
        id,
        nombre: limpiarTexto(plato.strMeal) || "Receta sin nombre",
        foto: urlSegura(plato.strMealThumb),
        coincidencias: [],
      };
      // Set para que un plato repetido en la misma respuesta no cuente dos veces
      const coincidencias = [...new Set([...anterior.coincidencias, ingrediente])];
      return mapa.set(id, { ...anterior, coincidencias });
    }, new Map<string, Candidata>());

  return [...candidatas.values()];
}

// Primero las que aprovechan más ingredientes; en caso de empate, por orden alfabético
export const ordenarPorCoincidencias = (candidatas: Candidata[]) =>
  candidatas.toSorted(
    (a, b) =>
      b.coincidencias.length - a.coincidencias.length || a.nombre.localeCompare(b.nombre),
  );

// "detalle" es la receta completa de la API, o null si esa petición ha fallado
export function completarReceta(
  candidata: Candidata,
  detalle: Fila | null,
  nevera: string[],
): Receta {
  const ingredientes: IngredienteReceta[] = extraerIngredientes(detalle).map((ingrediente) => ({
    ...ingrediente,
    loTengo: nevera.some((mio) => esElMismo(mio, ingrediente.nombre)),
  }));

  return {
    ...candidata,
    sinDetalle: detalle === null,
    categoria: limpiarTexto(detalle?.strCategory),
    cocina: limpiarTexto(detalle?.strArea) || limpiarTexto(detalle?.strCountry) || SIN_COCINA,
    pasos: limpiarTexto(detalle?.strInstructions)
      .split(/\r?\n/)
      .map((paso) => paso.trim())
      .filter(Boolean)
      .map((texto, i) => ({ numero: i + 1, texto })),
    video: urlSegura(detalle?.strYoutube),
    ingredientes,
    faltan: ingredientes.filter(({ loTengo }) => !loTengo).map(({ nombre }) => nombre),
  };
}

// La API no devuelve un array: devuelve strIngredient1…20 y strMeasure1…20,
// con huecos que pueden ser "", " " o null.
function extraerIngredientes(detalle: Fila | null) {
  if (!detalle) return [];

  return Array.from({ length: HUECOS_DE_INGREDIENTE }, (_, i) => ({
    hueco: i + 1,
    nombre: limpiarTexto(detalle[`strIngredient${i + 1}`]).toLowerCase(),
    cantidad: limpiarTexto(detalle[`strMeasure${i + 1}`]),
  })).filter(({ nombre }) => nombre);
}

// "egg" y "eggs" cuentan como el mismo ingrediente
const singular = (texto: string) => texto.replace(/e?s$/, "");
const esElMismo = (a: string, b: string) => a === b || singular(a) === singular(b);

// Solo se aceptan enlaces http(s): lo que venga de fuera no se pone en un href sin mirar
function urlSegura(valor: unknown) {
  const texto = limpiarTexto(valor);
  return URL.canParse(texto) && /^https?:$/.test(new URL(texto).protocol) ? texto : "";
}

// --- Filtro por tipo de cocina ---

// Devuelve pares [cocina, cuántas recetas], de más a menos
export const contarPorCocina = (recetas: Receta[]): [string, number][] =>
  [...Map.groupBy(recetas, ({ cocina }) => cocina)]
    .map(([cocina, grupo]): [string, number] => [cocina, grupo.length])
    .toSorted(([, a], [, b]) => b - a);

export const filtrarPorCocina = (recetas: Receta[], cocina: string) =>
  cocina === TODAS ? recetas : recetas.filter((receta) => receta.cocina === cocina);

// Las sugerencias del campo: nombres en minúscula, sin repetir y en orden alfabético
export const nombresDeIngredientes = (filas: Fila[]) => [
  ...new Set(
    filas
      .map(({ strIngredient }) => normalizarIngrediente(strIngredient))
      .filter(Boolean)
      .toSorted((a, b) => a.localeCompare(b)),
  ),
];
