// Único módulo que toca el DOM. Recibe datos ya preparados y los pinta.
// Todo el texto entra con textContent: nada de lo que viene de la API se interpreta como HTML.

import { TODAS } from "./recetas.js";

const zonaNevera = document.querySelector("#nevera");
const zonaSugerencias = document.querySelector("#sugerencias");
const zonaCocinas = document.querySelector("#cocinas");
const zonaResultados = document.querySelector("#resultados");
const avisoFormulario = document.querySelector("#aviso-formulario");

const ESQUELETOS = 6;

function crear(etiqueta, { clase, texto, ...atributos } = {}, hijos = []) {
  const nodo = document.createElement(etiqueta);
  if (clase) nodo.className = clase;
  if (texto) nodo.textContent = texto;
  Object.entries(atributos).forEach(([nombre, valor]) => nodo.setAttribute(nombre, valor));
  nodo.append(...hijos);
  return nodo;
}

// --- Nevera y formulario ---

export function pintarNevera(nevera) {
  const imanes = nevera.map((ingrediente) =>
    crear("li", { clase: "iman" }, [
      crear("span", { texto: ingrediente }),
      crear("button", {
        type: "button",
        texto: "×",
        "data-ingrediente": ingrediente,
        "aria-label": `Quitar ${ingrediente}`,
      }),
    ]),
  );

  zonaNevera.replaceChildren(...imanes);
}

export function pintarSugerencias(nombres) {
  zonaSugerencias.replaceChildren(...nombres.map((value) => crear("option", { value })));
}

export function pintarAvisoFormulario(mensaje = "") {
  avisoFormulario.textContent = mensaje;
}

// --- Filtro por cocina ---

export function pintarCocinas(conteo, activa) {
  if (conteo.length < 2) {
    zonaCocinas.replaceChildren();
    return;
  }

  const total = conteo.reduce((suma, [, cuantas]) => suma + cuantas, 0);
  const botones = [[TODAS, total], ...conteo].map(([cocina, cuantas]) =>
    crear("button", {
      type: "button",
      clase: "cocina",
      texto: `${cocina} (${cuantas})`,
      "data-cocina": cocina,
      "aria-pressed": String(cocina === activa),
    }),
  );

  zonaCocinas.replaceChildren(...botones);
}

// --- Los estados de la zona de resultados ---

function pintarMensaje(clase, hijos) {
  zonaResultados.setAttribute("aria-busy", "false");
  zonaResultados.replaceChildren(crear("div", { clase: `mensaje ${clase}` }, hijos));
}

export function pintarInicio() {
  pintarMensaje("mensaje--inicio", [
    crear("p", { clase: "mensaje__icono", texto: "🧊", "aria-hidden": "true" }),
    crear("p", { texto: "La nevera está vacía. Añade algún ingrediente para empezar." }),
  ]);
}

export function pintarCargando(nevera) {
  const esqueletos = Array.from({ length: ESQUELETOS }, () =>
    crear("li", { clase: "receta receta--esqueleto", "aria-hidden": "true" }),
  );

  zonaResultados.setAttribute("aria-busy", "true");
  zonaResultados.replaceChildren(
    crear("p", { clase: "cargando", texto: `Buscando recetas con ${nevera.join(", ")}…` }),
    crear("ul", { clase: "recetas" }, esqueletos),
  );
}

export function pintarError(mensaje) {
  pintarMensaje("mensaje--error", [
    crear("p", { clase: "mensaje__icono", texto: "⚠️", "aria-hidden": "true" }),
    crear("p", { texto: mensaje }),
    crear("button", { type: "button", texto: "Reintentar", "data-accion": "reintentar" }),
  ]);
}

export function pintarVacio(avisos = []) {
  pintarMensaje("mensaje--vacio", [
    crear("p", { clase: "mensaje__icono", texto: "🍽️", "aria-hidden": "true" }),
    crear("p", { texto: "No hay ninguna receta con eso. Prueba con otro ingrediente." }),
    ...avisos.map((texto) => crear("p", { clase: "aviso", texto })),
  ]);
}

export function pintarRecetas(recetas, avisos = []) {
  zonaResultados.setAttribute("aria-busy", "false");
  zonaResultados.replaceChildren(
    ...avisos.map((texto) => crear("p", { clase: "aviso", texto })),
    crear("ul", { clase: "recetas" }, recetas.map(crearTarjeta)),
  );
}

// --- Una tarjeta de receta ---

function crearTarjeta(receta) {
  const etiquetas = [receta.categoria, receta.cocina].filter(Boolean).join(" · ");
  const usa = receta.coincidencias.length;

  return crear("li", { clase: "receta" }, [
    crearFoto(receta),
    crear("div", { clase: "receta__cuerpo" }, [
      crear("h3", { texto: receta.nombre }),
      crear("p", { clase: "receta__etiquetas", texto: etiquetas }),
      crear("p", {
        clase: "receta__usa",
        texto: `Usa ${usa} de tus ingredientes: ${receta.coincidencias.join(", ")}`,
      }),
      receta.sinDetalle
        ? crear("p", { clase: "aviso", texto: "No se ha podido cargar el detalle de esta receta." })
        : crearDetalle(receta),
    ]),
  ]);
}

function crearFoto({ foto, nombre }) {
  const hueco = crear("div", { clase: "receta__foto" });
  if (!foto) return hueco;

  const imagen = crear("img", { src: foto, alt: nombre, loading: "lazy" });
  // Si la foto no carga se quita y queda el hueco con su fondo
  imagen.addEventListener("error", () => imagen.remove(), { once: true });
  hueco.append(imagen);
  return hueco;
}

function crearDetalle({ ingredientes, faltan, pasos, video }) {
  const lista = ingredientes.map(({ nombre, cantidad, loTengo }) =>
    crear("li", {
      clase: loTengo ? "lo-tengo" : "",
      texto: [cantidad, nombre].filter(Boolean).join(" "),
    }),
  );

  const contenido = [
    crear("summary", { texto: resumirFaltan(ingredientes, faltan) }),
    ingredientes.length
      ? crear("ul", { clase: "receta__ingredientes" }, lista)
      : crear("p", { texto: "La receta no trae lista de ingredientes." }),
    pasos.length
      ? crear("ol", { clase: "receta__pasos" }, pasos.map((texto) => crear("li", { texto })))
      : crear("p", { texto: "La receta no trae instrucciones." }),
  ];

  if (video) {
    contenido.push(
      crear("a", { href: video, target: "_blank", rel: "noopener", texto: "Ver el vídeo" }),
    );
  }

  return crear("details", {}, contenido);
}

function resumirFaltan(ingredientes, faltan) {
  if (ingredientes.length === 0) return "Ver la receta";
  if (faltan.length === 0) return "¡Lo tienes todo!";
  return `Te faltan ${faltan.length} de ${ingredientes.length} ingredientes`;
}
