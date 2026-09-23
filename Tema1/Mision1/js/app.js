// Interfaz de la máquina: estado, pintado del DOM y eventos.

const FILAS = ["A", "B", "C"];
const COLUMNAS = ["1", "2", "3", "4"];
const TECLAS = [...FILAS, "⌫", ...COLUMNAS, "OK"];

const dom = {
  productos: document.querySelector("#productos"),
  plantillaProducto: document.querySelector("#plantilla-producto"),
  pantalla: document.querySelector("#pantalla"),
  mensaje: document.querySelector("#mensaje"),
  saldo: document.querySelector("#saldo"),
  codigo: document.querySelector("#codigo"),
  teclado: document.querySelector("#teclado"),
  monedas: document.querySelector("#monedas"),
};

// Copia de los productos para poder cambiar el stock sin tocar los datos originales
const inventario = PRODUCTOS.map((producto) => ({ ...producto }));

// Guardamos cada tarjeta para actualizarla sin volver a pintar todo el escaparate
const tarjetas = new Map();

let saldo = 0;
let codigo = "";

// ---------- Pintado ----------

function crearTarjetaProducto(producto) {
  const tarjeta = dom.plantillaProducto.content.firstElementChild.cloneNode(true);
  tarjeta.querySelector(".producto-codigo").textContent = producto.codigo;
  tarjeta.querySelector(".producto-emoji").textContent = producto.emoji;
  tarjeta.querySelector(".producto-nombre").textContent = producto.nombre;
  tarjeta.querySelector(".producto-precio").textContent = formatearEuros(producto.precio);
  return tarjeta;
}

function actualizarTarjeta(producto) {
  const tarjeta = tarjetas.get(producto.codigo);
  const agotado = producto.stock === 0;
  tarjeta.classList.toggle("producto-agotado", agotado);
  tarjeta.querySelector(".producto-stock").textContent = agotado
    ? "AGOTADO"
    : `Quedan ${producto.stock}`;
}

function pintarProductos() {
  const fragmento = document.createDocumentFragment();
  for (const producto of inventario) {
    const tarjeta = crearTarjetaProducto(producto);
    tarjetas.set(producto.codigo, tarjeta);
    actualizarTarjeta(producto);
    fragmento.append(tarjeta);
  }
  dom.productos.append(fragmento);
}

// Las monedas de 1 € y 2 € se pintan doradas
function claseMoneda(valor) {
  return valor >= 100 ? "moneda moneda-oro" : "moneda";
}

function pintarMonedas() {
  const botones = MONEDAS.map((valor) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = claseMoneda(valor);
    boton.dataset.valor = valor;
    boton.textContent = formatearMoneda(valor);
    boton.setAttribute("aria-label", `Insertar ${formatearEuros(valor)}`);
    return boton;
  });
  dom.monedas.append(...botones);
}

function pintarTeclado() {
  const botones = TECLAS.map((tecla) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = tecla === "OK" ? "tecla tecla-ok" : "tecla";
    boton.dataset.tecla = tecla;
    boton.textContent = tecla;
    return boton;
  });
  dom.teclado.append(...botones);
}

function mostrarMensaje(texto, esError = false) {
  dom.mensaje.textContent = texto;
  dom.pantalla.classList.toggle("pantalla-error", esError);
}

function actualizarPantalla() {
  dom.saldo.textContent = formatearEuros(saldo);
  dom.codigo.textContent = codigo.padEnd(2, "-");
  for (const [codigoTarjeta, tarjeta] of tarjetas) {
    tarjeta.classList.toggle("producto-seleccionado", codigoTarjeta === codigo);
  }
}

// ---------- Acciones ----------

function buscarProducto(codigoBuscado) {
  return inventario.find((producto) => producto.codigo === codigoBuscado);
}

function insertarMoneda(valor) {
  saldo += valor;
  actualizarPantalla();
  mostrarMensaje(`Has metido ${formatearEuros(valor)}`);
}

// El código es siempre una fila (letra) seguida de una columna (número)
function pulsarTecla(tecla) {
  if (tecla === "OK") {
    comprar();
    return;
  }

  if (tecla === "⌫") {
    codigo = codigo.slice(0, -1);
  } else if (codigo.length === 0 && FILAS.includes(tecla)) {
    codigo = tecla;
  } else if (codigo.length === 1 && COLUMNAS.includes(tecla)) {
    codigo += tecla;
  } else {
    mostrarMensaje("Marca una letra y después un número", true);
    return;
  }

  actualizarPantalla();
  const producto = buscarProducto(codigo);
  if (producto !== undefined) {
    mostrarMensaje(`${producto.nombre}: ${formatearEuros(producto.precio)}. Pulsa OK`);
  }
}

function comprar() {
  const producto = buscarProducto(codigo);

  if (producto === undefined) {
    mostrarMensaje("Marca un código completo, por ejemplo A1", true);
    return;
  }
  if (producto.stock === 0) {
    mostrarMensaje(`${producto.nombre}: agotado. Elige otro`, true);
    return;
  }
  if (saldo < producto.precio) {
    mostrarMensaje(`Faltan ${formatearEuros(producto.precio - saldo)}`, true);
    return;
  }

  producto.stock--;
  saldo -= producto.precio;
  codigo = "";
  actualizarTarjeta(producto);
  actualizarPantalla();
  mostrarMensaje(`Aquí tienes: ${producto.nombre}`);
}

// ---------- Eventos ----------

// Delegación: un único listener para todas las monedas y otro para todo el teclado
dom.monedas.addEventListener("click", (evento) => {
  const boton = evento.target.closest(".moneda");
  if (boton !== null) {
    insertarMoneda(Number(boton.dataset.valor));
  }
});

dom.teclado.addEventListener("click", (evento) => {
  const boton = evento.target.closest(".tecla");
  if (boton !== null) {
    pulsarTecla(boton.dataset.tecla);
  }
});

// ---------- Inicio ----------

pintarProductos();
pintarMonedas();
pintarTeclado();
actualizarPantalla();
