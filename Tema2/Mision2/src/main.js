// Punto de entrada: guarda el estado, escucha los eventos y decide qué se pinta.

import "./styles.css";
import { explicarError, listarIngredientes } from "./api.js";
import { cargarNevera, guardarNevera } from "./almacen.js";
import { buscarRecetas } from "./buscador.js";
import {
  TODAS,
  anadirIngrediente,
  contarPorCocina,
  filtrarPorCocina,
  quitarIngrediente,
} from "./recetas.js";
import {
  pintarAvisoFormulario,
  pintarCargando,
  pintarCocinas,
  pintarError,
  pintarInicio,
  pintarNevera,
  pintarRecetas,
  pintarSugerencias,
  pintarVacio,
} from "./render.js";

const estado = {
  nevera: cargarNevera(),
  recetas: [],
  avisos: [],
  cocina: TODAS,
  busqueda: null, // AbortController de la búsqueda en curso
};

const formulario = document.querySelector("#formulario");

// --- Búsqueda ---

async function buscar() {
  // Si había una búsqueda a medias ya no interesa: su respuesta llegaría tarde y pisaría a la nueva
  estado.busqueda?.abort();
  estado.recetas = [];
  estado.avisos = [];
  estado.cocina = TODAS;
  pintarCocinas([], TODAS);

  if (estado.nevera.length === 0) {
    pintarInicio();
    return;
  }

  const busqueda = new AbortController();
  estado.busqueda = busqueda;
  pintarCargando(estado.nevera);

  try {
    const { recetas, fallidos, sinRecetas } = await buscarRecetas(estado.nevera, busqueda.signal);

    estado.recetas = recetas;
    estado.avisos = [
      fallidos.length && `No se ha podido consultar: ${fallidos.join(", ")}.`,
      sinRecetas.length && `Ninguna receta usa: ${sinRecetas.join(", ")}.`,
    ].filter(Boolean);

    pintarResultados();
  } catch (error) {
    // Una búsqueda cancelada no es un error que haya que enseñar
    if (busqueda.signal.aborted) return;
    pintarError(explicarError(error));
  }
}

function pintarResultados() {
  if (estado.recetas.length === 0) {
    pintarVacio(estado.avisos);
    return;
  }

  pintarCocinas(contarPorCocina(estado.recetas), estado.cocina);
  pintarRecetas(filtrarPorCocina(estado.recetas, estado.cocina), estado.avisos);
}

function cambiarNevera(nueva) {
  estado.nevera = nueva;
  guardarNevera(nueva);
  pintarNevera(nueva);
  buscar();
}

// --- Eventos ---

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const campo = formulario.elements.ingrediente;

  try {
    const nueva = anadirIngrediente(estado.nevera, campo.value);
    pintarAvisoFormulario();
    campo.value = "";
    cambiarNevera(nueva);
  } catch (error) {
    pintarAvisoFormulario(error.message);
  }
});

document.querySelector("#nevera").addEventListener("click", ({ target }) => {
  const boton = target.closest("[data-ingrediente]");
  if (!boton) return;

  pintarAvisoFormulario();
  cambiarNevera(quitarIngrediente(estado.nevera, boton.dataset.ingrediente));
});

document.querySelector("#cocinas").addEventListener("click", ({ target }) => {
  const boton = target.closest("[data-cocina]");
  if (!boton) return;

  estado.cocina = boton.dataset.cocina;
  pintarResultados();
});

document.querySelector("#resultados").addEventListener("click", ({ target }) => {
  if (target.closest("[data-accion='reintentar']")) buscar();
});

// --- Arranque ---

// Las sugerencias son un extra: si fallan, se puede seguir escribiendo el ingrediente a mano
async function cargarSugerencias() {
  try {
    const ingredientes = await listarIngredientes();
    const nombres = ingredientes
      .map(({ strIngredient }) => strIngredient)
      .filter((nombre) => typeof nombre === "string" && nombre.trim())
      .map((nombre) => nombre.trim().toLowerCase())
      .toSorted((a, b) => a.localeCompare(b));

    pintarSugerencias([...new Set(nombres)]);
  } catch {
    pintarSugerencias([]);
  }
}

pintarNevera(estado.nevera);
buscar();
cargarSugerencias();
