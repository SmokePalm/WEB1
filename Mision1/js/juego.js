// Interfaz del juego: estado de la partida, pintado del DOM y eventos.

const TAMANO_MANO = 5;
const NOMBRE_RIVAL = {
  aprendiz: "Aprendiz",
  archimago: "Archimago",
};

const dom = {
  pantallaInicio: document.querySelector("#pantalla-inicio"),
  formInicio: document.querySelector("#form-inicio"),
  inputNombre: document.querySelector("#nombre"),
  selectDificultad: document.querySelector("#dificultad"),
  tablero: document.querySelector("#tablero"),
  nombreJugador: document.querySelector("#nombre-jugador"),
  nombreRival: document.querySelector("#nombre-rival"),
  puntosJugador: document.querySelector("#puntos-jugador"),
  puntosRival: document.querySelector("#puntos-rival"),
  ronda: document.querySelector("#ronda"),
  cartasMazo: document.querySelector("#cartas-mazo"),
  manoJugador: document.querySelector("#mano-jugador"),
  manoRival: document.querySelector("#mano-rival"),
  slotJugador: document.querySelector("#slot-jugador"),
  slotRival: document.querySelector("#slot-rival"),
  resultado: document.querySelector("#resultado-ronda"),
  cronica: document.querySelector("#cronica"),
  plantillaCarta: document.querySelector("#plantilla-carta"),
};

let estado = null;

function crearEstadoInicial(nombre, dificultad) {
  const mazo = barajar(crearMazo());
  return {
    nombre,
    dificultad,
    mazo,
    manoJugador: robar(mazo, TAMANO_MANO),
    manoRival: robar(mazo, TAMANO_MANO),
    puntos: { jugador: 0, rival: 0 },
    ronda: 1,
  };
}

// ---------- Pintado ----------

function crearCarta(carta) {
  const nodo = dom.plantillaCarta.content.firstElementChild.cloneNode(true);
  nodo.classList.add(`carta-${carta.elemento}`);
  nodo.querySelector(".carta-poder").textContent = carta.poder;
  nodo.querySelector(".carta-icono").textContent = ELEMENTOS[carta.elemento].icono;
  nodo.querySelector(".carta-nombre").textContent = carta.nombre;
  return nodo;
}

function crearBotonCarta(carta, indice) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "boton-carta";
  boton.dataset.indice = indice;
  boton.dataset.tecla = indice + 1;
  boton.setAttribute(
    "aria-label",
    `${carta.nombre}, ${carta.elemento}, poder ${carta.poder}. Tecla ${indice + 1}`
  );
  boton.append(crearCarta(carta));
  return boton;
}

function crearDorso() {
  const dorso = document.createElement("div");
  dorso.className = "carta carta-dorso";
  dorso.textContent = "ᚱ";
  return dorso;
}

function pintarManoJugador() {
  const fragmento = document.createDocumentFragment();
  estado.manoJugador.forEach((carta, indice) => {
    fragmento.append(crearBotonCarta(carta, indice));
  });
  dom.manoJugador.replaceChildren(fragmento);
}

function pintarManoRival() {
  const dorsos = estado.manoRival.map(() => crearDorso());
  dom.manoRival.replaceChildren(...dorsos);
}

function pintarMarcador() {
  dom.nombreJugador.textContent = estado.nombre;
  dom.nombreRival.textContent = NOMBRE_RIVAL[estado.dificultad];
  dom.puntosJugador.textContent = estado.puntos.jugador;
  dom.puntosRival.textContent = estado.puntos.rival;
  dom.ronda.textContent = `Ronda ${estado.ronda}`;
  dom.cartasMazo.textContent = `${estado.mazo.length} cartas en el mazo`;
}

function pintarTablero() {
  pintarMarcador();
  pintarManoJugador();
  pintarManoRival();
}

// ---------- Flujo de la partida ----------

function iniciarPartida(nombre, dificultad) {
  estado = crearEstadoInicial(nombre, dificultad);
  dom.slotJugador.replaceChildren();
  dom.slotRival.replaceChildren();
  dom.cronica.replaceChildren();
  dom.resultado.textContent = "Elige una carta para empezar";
  dom.resultado.className = "resultado";
  dom.pantallaInicio.hidden = true;
  dom.tablero.hidden = false;
  pintarTablero();
}

// ---------- Eventos ----------

dom.formInicio.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const nombre = dom.inputNombre.value.trim();
  if (nombre === "") {
    dom.inputNombre.focus();
    return;
  }
  iniciarPartida(nombre, dom.selectDificultad.value);
});
