// Lógica pura: recibe datos y devuelve datos nuevos. Sin fetch y sin DOM.

export const MAX_INGREDIENTES = 6;
export const TODAS = "Todas";

const SIN_COCINA = "Sin clasificar";
const HUECOS_DE_INGREDIENTE = 20;

const limpiarTexto = (valor) => (typeof valor === "string" ? valor.trim() : "");

export const normalizarIngrediente = (texto) =>
  limpiarTexto(texto).toLowerCase().replace(/\s+/g, " ");

// --- La nevera (siempre se devuelve un array nuevo) ---

export function anadirIngrediente(nevera, texto) {
  const ingrediente = normalizarIngrediente(texto);

  if (!ingrediente) throw new Error("Escribe un ingrediente.");
  if (nevera.includes(ingrediente)) throw new Error(`Ya tienes «${ingrediente}» en la nevera.`);
  if (nevera.length >= MAX_INGREDIENTES) {
    throw new Error(`En la nevera solo caben ${MAX_INGREDIENTES} ingredientes.`);
  }

  return [...nevera, ingrediente];
}

export const quitarIngrediente = (nevera, ingrediente) =>
  nevera.filter((actual) => actual !== ingrediente);

// --- De las respuestas de la API a recetas ---

// Recibe pares [ingrediente, platos] y los junta en una sola lista sin repetidos,
// apuntando en cada plato qué ingredientes de la nevera lo han encontrado.
export function combinarResultados(porIngrediente) {
  const candidatas = porIngrediente
    .flatMap(([ingrediente, platos]) => platos.map((plato) => ({ ingrediente, plato })))
    .filter(({ plato }) => plato?.idMeal)
    .reduce((mapa, { ingrediente, plato }) => {
      const anterior = mapa.get(plato.idMeal) ?? {
        id: plato.idMeal,
        nombre: limpiarTexto(plato.strMeal) || "Receta sin nombre",
        foto: urlSegura(plato.strMealThumb),
        coincidencias: [],
      };
      // Set para que un plato repetido en la misma respuesta no cuente dos veces
      const coincidencias = [...new Set([...anterior.coincidencias, ingrediente])];
      return mapa.set(plato.idMeal, { ...anterior, coincidencias });
    }, new Map());

  return [...candidatas.values()];
}

// Primero las que aprovechan más ingredientes; en caso de empate, por orden alfabético
export const ordenarPorCoincidencias = (candidatas) =>
  candidatas.toSorted(
    (a, b) =>
      b.coincidencias.length - a.coincidencias.length || a.nombre.localeCompare(b.nombre),
  );

// "detalle" es la receta completa de la API, o null si esa petición ha fallado
export function completarReceta(candidata, detalle, nevera) {
  const ingredientes = extraerIngredientes(detalle).map((ingrediente) => ({
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
      .filter(Boolean),
    video: urlSegura(detalle?.strYoutube),
    ingredientes,
    faltan: ingredientes.filter(({ loTengo }) => !loTengo).map(({ nombre }) => nombre),
  };
}

// La API no devuelve un array: devuelve strIngredient1…20 y strMeasure1…20,
// con huecos que pueden ser "", " " o null.
function extraerIngredientes(detalle) {
  if (!detalle) return [];

  return Array.from({ length: HUECOS_DE_INGREDIENTE }, (_, i) => ({
    nombre: limpiarTexto(detalle[`strIngredient${i + 1}`]).toLowerCase(),
    cantidad: limpiarTexto(detalle[`strMeasure${i + 1}`]),
  })).filter(({ nombre }) => nombre);
}

// "egg" y "eggs" cuentan como el mismo ingrediente
const singular = (texto) => texto.replace(/e?s$/, "");
const esElMismo = (a, b) => a === b || singular(a) === singular(b);

// Solo se aceptan enlaces http(s): lo que venga de fuera no se pone en un href sin mirar
function urlSegura(valor) {
  const texto = limpiarTexto(valor);
  return URL.canParse(texto) && /^https?:$/.test(new URL(texto).protocol) ? texto : "";
}

// --- Filtro por tipo de cocina ---

// Devuelve pares [cocina, cuántas recetas], de más a menos
export const contarPorCocina = (recetas) =>
  Object.entries(Object.groupBy(recetas, ({ cocina }) => cocina))
    .map(([cocina, grupo]) => [cocina, grupo.length])
    .toSorted(([, a], [, b]) => b - a);

export const filtrarPorCocina = (recetas, cocina) =>
  cocina === TODAS ? recetas : recetas.filter((receta) => receta.cocina === cocina);
