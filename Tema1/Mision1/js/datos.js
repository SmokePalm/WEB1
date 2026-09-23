// Datos de la máquina y funciones de cálculo. Aquí no se toca el DOM.
// Todos los importes van en céntimos (números enteros) para evitar
// los errores de redondeo de los decimales: 0.1 + 0.2 !== 0.3

const MONEDAS = [200, 100, 50, 20, 10, 5];

const PRODUCTOS = [
  { codigo: "A1", nombre: "Agua", emoji: "💧", precio: 80, stock: 5 },
  { codigo: "A2", nombre: "Refresco de cola", emoji: "🥤", precio: 150, stock: 4 },
  { codigo: "A3", nombre: "Zumo de naranja", emoji: "🧃", precio: 120, stock: 3 },
  { codigo: "A4", nombre: "Café", emoji: "☕", precio: 100, stock: 5 },
  { codigo: "B1", nombre: "Patatas fritas", emoji: "🍟", precio: 130, stock: 4 },
  { codigo: "B2", nombre: "Galletas", emoji: "🍪", precio: 110, stock: 3 },
  { codigo: "B3", nombre: "Chocolatina", emoji: "🍫", precio: 125, stock: 5 },
  { codigo: "B4", nombre: "Palomitas", emoji: "🍿", precio: 140, stock: 2 },
  { codigo: "C1", nombre: "Sándwich", emoji: "🥪", precio: 250, stock: 2 },
  { codigo: "C2", nombre: "Donut", emoji: "🍩", precio: 135, stock: 1 },
  { codigo: "C3", nombre: "Manzana", emoji: "🍎", precio: 90, stock: 0 },
  { codigo: "C4", nombre: "Caramelos", emoji: "🍬", precio: 65, stock: 6 },
];

// 135 -> "1,35 €"
function formatearEuros(centimos) {
  return `${(centimos / 100).toFixed(2).replace(".", ",")} €`;
}

// Texto corto para las monedas: 200 -> "2 €", 50 -> "50 c"
function formatearMoneda(centimos) {
  return centimos >= 100 ? `${centimos / 100} €` : `${centimos} c`;
}

function sumar(importes) {
  return importes.reduce((total, importe) => total + importe, 0);
}

// Devuelve las monedas del cambio empezando por la más grande: 85 -> [50, 20, 10, 5]
function calcularCambio(importe) {
  const cambio = [];
  let restante = importe;
  for (const moneda of MONEDAS) {
    while (restante >= moneda) {
      cambio.push(moneda);
      restante -= moneda;
    }
  }
  return cambio;
}
