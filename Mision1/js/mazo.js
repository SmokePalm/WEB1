// Reglas y datos del juego. Aquí no se toca el DOM: solo lógica pura.

const ELEMENTOS = {
  fuego: {
    icono: "🔥",
    vence: "planta",
    nombres: ["Chispa", "Brasa", "Llama", "Hoguera", "Incendio", "Fénix"],
  },
  agua: {
    icono: "💧",
    vence: "fuego",
    nombres: ["Gota", "Rocío", "Arroyo", "Marea", "Torrente", "Leviatán"],
  },
  planta: {
    icono: "🌿",
    vence: "agua",
    nombres: ["Brote", "Hoja", "Enredadera", "Roble", "Bosque", "Dríade"],
  },
};

const BONUS_VENTAJA = 3;

function crearMazo() {
  return Object.entries(ELEMENTOS).flatMap(([elemento, datos]) =>
    datos.nombres.map((nombre, indice) => ({
      id: `${elemento}-${indice + 1}`,
      elemento,
      nombre,
      poder: indice + 1,
    }))
  );
}

// Algoritmo de Fisher-Yates sobre una copia, para no mutar el original
function barajar(cartas) {
  const copia = [...cartas];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function robar(mazo, cantidad) {
  return mazo.splice(0, cantidad);
}

function tieneVentaja(carta, rival) {
  return ELEMENTOS[carta.elemento].vence === rival.elemento;
}

function calcularPoder(carta, rival) {
  return carta.poder + (tieneVentaja(carta, rival) ? BONUS_VENTAJA : 0);
}

function resolverEnfrentamiento(cartaJugador, cartaRival) {
  const poderJugador = calcularPoder(cartaJugador, cartaRival);
  const poderRival = calcularPoder(cartaRival, cartaJugador);

  let ganador = "empate";
  if (poderJugador > poderRival) {
    ganador = "jugador";
  } else if (poderRival > poderJugador) {
    ganador = "rival";
  }

  return { poderJugador, poderRival, ganador };
}

// El aprendiz juega al azar; el archimago elige la carta que gana
// contra más cartas de la mano del jugador.
function elegirCartaRival(manoRival, manoJugador, dificultad) {
  if (dificultad === "aprendiz") {
    return manoRival[Math.floor(Math.random() * manoRival.length)];
  }

  const victoriasPorCarta = manoRival.map(
    (cartaRival) =>
      manoJugador.filter(
        (cartaJugador) => resolverEnfrentamiento(cartaJugador, cartaRival).ganador === "rival"
      ).length
  );
  const mejorResultado = Math.max(...victoriasPorCarta);
  return manoRival[victoriasPorCarta.indexOf(mejorResultado)];
}
