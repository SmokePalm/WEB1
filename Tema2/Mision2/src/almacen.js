// Guarda la nevera en localStorage para que siga ahí al recargar la página.

import { MAX_INGREDIENTES, normalizarIngrediente } from "./recetas.js";

const CLAVE = "que-cocino:nevera";

export function cargarNevera() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE));
    if (!Array.isArray(guardado)) return [];

    // Lo guardado puede haberlo tocado cualquiera: se limpia igual que lo que escribe el usuario
    const ingredientes = guardado.map(normalizarIngrediente).filter(Boolean);
    return [...new Set(ingredientes)].slice(0, MAX_INGREDIENTES);
  } catch {
    return [];
  }
}

export function guardarNevera(nevera) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(nevera));
  } catch {
    // Sin almacenamiento (modo privado, cuota llena) la app funciona igual, solo no recuerda
  }
}
