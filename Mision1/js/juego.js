// Interfaz del juego: estado de la partida, pintado del DOM y eventos.

const TAMANO_MANO = 5;
const PUNTOS_RESONANCIA = 2;
const PAUSA_ENTRE_RONDAS = 1200;
const PUNTOS_VICTORIA = 5;
const CLAVE_HISTORIAL = "duelo-runas-historial";
const NOMBRE_RIVAL = {
  aprendiz: "Aprendiz",
  archimago: "Archimago",
};
const TITULOS_FIN = {
  victoria: "🏆 ¡Victoria!",
  derrota: "💀 Derrota",
  empate: "⚖️ Empate",
};

const dom = {
  pantallaInicio: document.querySelector("#pantalla-inicio"),
  formInicio: document.querySelector("#form-inicio"),
  inputNombre: document.querySelector("#nombre"),
  selectDificultad: document.querySelector("#dificultad"),
  historial: document.querySelector("#historial"),
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
  dialogoFin: document.querySelector("#fin-partida"),
  tituloFin: document.querySelector("#titulo-fin"),
  textoFin: document.querySelector("#texto-fin"),
  botonRevancha: document.querySelector("#boton-revancha"),
  botonSalir: document.querySelector("#boton-salir"),
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

// ---------- Historial (localStorage) ----------

function leerHistorial() {
  const vacio = { victoria: 0, derrota: 0, empate: 0 };
  try {
    return { ...vacio, ...JSON.parse(localStorage.getItem(CLAVE_HISTORIAL)) };
  } catch {
    return vacio;
  }
}

function registrarEnHistorial(desenlace) {
  const historial = leerHistorial();
  historial[desenlace]++;
  try {
    localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(historial));
  } catch {
    // Sin acceso al almacenamiento el juego sigue funcionando, solo no se guarda
  }
}

function pintarHistorial() {
  const { victoria, derrota, empate } = leerHistorial();
  const total = victoria + derrota + empate;
  dom.historial.textContent =
    total === 0
      ? "Aún no has librado ningún duelo."
      : `Historial: ${victoria} victorias · ${derrota} derrotas · ${empate} empates`;
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

  if (ganador === "empate") {
    return `Empate (${poderJugador} vs ${poderRival}). Nadie puntúa.`;
  }

  const poderGanador = Math.max(poderJugador, poderRival);
  const poderPerdedor = Math.min(poderJugador, poderRival);
  const marcadorRonda = `${poderGanador} vs ${poderPerdedor}`;

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

  setTimeout(partidaTerminada() ? terminarPartida : siguienteRonda, PAUSA_ENTRE_RONDAS);
}

function partidaTerminada() {
  const { jugador, rival } = estado.puntos;
  const sinCartas = estado.manoJugador.length === 0 && estado.mazo.length === 0;
  return jugador >= PUNTOS_VICTORIA || rival >= PUNTOS_VICTORIA || sinCartas;
}

function siguienteRonda() {
  estado.manoJugador.push(...robar(estado.mazo, 1));
  estado.manoRival.push(...robar(estado.mazo, 1));
  estado.ronda++;
  estado.bloqueado = false;
  dom.manoJugador.classList.remove("mano-bloqueada");
  pintarTablero();
}

function terminarPartida() {
  const { jugador, rival } = estado.puntos;
  let desenlace = "empate";
  if (jugador > rival) {
    desenlace = "victoria";
  } else if (rival > jugador) {
    desenlace = "derrota";
  }

  registrarEnHistorial(desenlace);
  dom.tituloFin.textContent = TITULOS_FIN[desenlace];
  dom.textoFin.textContent =
    `${estado.nombre} ${jugador} – ${rival} ${NOMBRE_RIVAL[estado.dificultad]} ` +
    `tras ${estado.ronda} rondas.`;
  dom.dialogoFin.showModal();
}

function volverAlInicio() {
  estado = null;
  dom.tablero.hidden = true;
  dom.pantallaInicio.hidden = false;
  pintarHistorial();
  dom.inputNombre.focus();
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
  if (dom.tablero.hidden || dom.dialogoFin.open || evento.repeat) {
    return;
  }
  const indice = Number(evento.key) - 1;
  if (Number.isInteger(indice) && indice >= 0) {
    jugarRonda(indice);
  }
});

dom.botonRevancha.addEventListener("click", () => {
  dom.dialogoFin.close();
  iniciarPartida(estado.nombre, estado.dificultad);
});

dom.botonSalir.addEventListener("click", () => {
  dom.dialogoFin.close();
  volverAlInicio();
});

// Con Escape el diálogo se cerraría y dejaría el tablero bloqueado
dom.dialogoFin.addEventListener("cancel", (evento) => {
  evento.preventDefault();
});

pintarHistorial();
