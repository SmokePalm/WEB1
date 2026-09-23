// app.js — el oráculo elige su número secreto:
const secreto = Math.floor(Math.random() * 100) + 1;

// Conexión: seleccionamos los elementos de la página
const input = document.querySelector("#numero");
const boton = document.querySelector("#consultar");
const mensaje = document.querySelector("#mensaje");
const marcador = document.querySelector("#intentos");

let intentos = 0;

boton.addEventListener("click", () => {
  const texto = input.value.trim();
  const numero = Number(texto);

  // Valor vacío o fuera de rango: aviso sin gastar intento
  if (texto === "" || !Number.isInteger(numero) || numero < 1 || numero > 100) {
    mensaje.textContent = "⚠️ Escribe un número entero entre 1 y 100.";
    return;
  }

  // Consulta válida: cuenta como intento
  intentos++;
  marcador.textContent = `Intentos: ${intentos}`;

  if (numero === secreto) {
    mensaje.textContent = `🎉 ¡Correcto! El número era ${secreto}. Lo has adivinado en ${intentos} ${intentos === 1 ? "intento" : "intentos"}.`;
    boton.disabled = true;
  } else if (numero < secreto) {
    mensaje.textContent = `📈 El número secreto es mayor que ${numero}.`;
  } else {
    mensaje.textContent = `📉 El número secreto es menor que ${numero}.`;
  }

  input.value = "";
  input.focus();
});
