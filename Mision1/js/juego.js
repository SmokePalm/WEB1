// Interfaz del juego: estado de la partida, pintado del DOM y eventos.

const TAMANO_MANO = 5;
const PUNTOS_RESONANCIA = 2;
const PAUSA_ENTRE_RONDAS = 1200;
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
    ultimaVictoria: null,
    bloqueado: false,
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

function crearCartaEnArena(carta, lado, ganador) {
  const nodo = crearCarta(carta);
  nodo.classList.add("carta-jugada");
  if (ganador !== "empate") {
    nodo.classList.add(ganador === lado ? "carta-ganadora" : "carta-perdedora");
  }
  return nodo;
}

function anotarEnCronica(texto, ganador) {
  const entrada = document.createElement("li");
  entrada.className = `cronica-${ganador}`;
  entrada.textContent = texto;
  dom.cronica.prepend(entrada);
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

// Ganar dos rondas seguidas con el mismo elemento da puntos extra
function puntosPorVictoria(ganador, cartaGanadora) {
  const anterior = estado.ultimaVictoria;
  const hayResonancia =
    anterior !== null &&
    anterior.ganador === ganador &&
    anterior.elemento === cartaGanadora.elemento;
  return hayResonancia ? PUNTOS_RESONANCIA : 1;
}

function describirRonda(resultado, cartaGanadora, puntosGanados) {
  const { poderJugador, poderRival, ganador } = resultado;
  const marcadorRonda = `${poderJugador} vs ${poderRival}`;

  if (ganador === "empate") {
    return `Empate (${marcadorRonda}). Nadie puntúa.`;
  }

  const nombreGanador = ganador === "jugador" ? estado.nombre : NOMBRE_RIVAL[estado.dificultad];
  const bonus = puntosGanados === PUNTOS_RESONANCIA ? `¡Resonancia! +${PUNTOS_RESONANCIA}` : "+1";
  return `${nombreGanador} gana con ${cartaGanadora.nombre} (${marcadorRonda}). ${bonus}`;
}

function jugarRonda(indice) {
  if (estado === null || estado.bloqueado || indice >= estado.manoJugador.length) {
    return;
  }
  estado.bloqueado = true;
  dom.manoJugador.classList.add("mano-bloqueada");

  // El rival decide antes de que la carta salga de la mano del jugador
  const cartaRival = elegirCartaRival(estado.manoRival, estado.manoJugador, estado.dificultad);
  const [cartaJugador] = estado.manoJugador.splice(indice, 1);
  estado.manoRival.splice(estado.manoRival.indexOf(cartaRival), 1);

  const resultado = resolverEnfrentamiento(cartaJugador, cartaRival);
  const { ganador } = resultado;
  const cartaGanadora = ganador === "jugador" ? cartaJugador : cartaRival;
  let puntosGanados = 0;

  if (ganador === "empate") {
    estado.ultimaVictoria = null;
  } else {
    puntosGanados = puntosPorVictoria(ganador, cartaGanadora);
    estado.puntos[ganador] += puntosGanados;
    estado.ultimaVictoria = { ganador, elemento: cartaGanadora.elemento };
  }

  const texto = describirRonda(resultado, cartaGanadora, puntosGanados);
  dom.resultado.textContent = texto;
  dom.resultado.className = `resultado resultado-${ganador}`;
  anotarEnCronica(texto, ganador);

  dom.slotJugador.replaceChildren(crearCartaEnArena(cartaJugador, "jugador", ganador));
  dom.slotRival.replaceChildren(crearCartaEnArena(cartaRival, "rival", ganador));
  pintarTablero();

  setTimeout(siguienteRonda, PAUSA_ENTRE_RONDAS);
}

function siguienteRonda() {
  estado.manoJugador.push(...robar(estado.mazo, 1));
  estado.manoRival.push(...robar(estado.mazo, 1));
  estado.ronda++;
  estado.bloqueado = false;
  dom.manoJugador.classList.remove("mano-bloqueada");
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

// Delegación: un solo listener para todas las cartas de la mano
dom.manoJugador.addEventListener("click", (evento) => {
  const boton = evento.target.closest(".boton-carta");
  if (boton !== null) {
    jugarRonda(Number(boton.dataset.indice));
  }
});

document.addEventListener("keydown", (evento) => {
  if (dom.tablero.hidden || evento.repeat) {
    return;
  }
  const indice = Number(evento.key) - 1;
  if (Number.isInteger(indice) && indice >= 0) {
    jugarRonda(indice);
  }
});
