// Interfaz de la máquina: estado, pintado del DOM y eventos.

const FILAS = ["A", "B", "C"];
const COLUMNAS = ["1", "2", "3", "4"];
const TECLAS = [...FILAS, "⌫", ...COLUMNAS, "OK"];
const ATAJOS_TECLADO = { Enter: "OK", Backspace: "⌫" };

const dom = {
  productos: document.querySelector("#productos"),
  plantillaProducto: document.querySelector("#plantilla-producto"),
  pantalla: document.querySelector("#pantalla"),
  mensaje: document.querySelector("#mensaje"),
  saldo: document.querySelector("#saldo"),
  codigo: document.querySelector("#codigo"),
  teclado: document.querySelector("#teclado"),
  monedas: document.querySelector("#monedas"),
  botonDevolver: document.querySelector("#boton-devolver"),
  cambio: document.querySelector("#cambio"),
  bandeja: document.querySelector("#bandeja"),
  listaBolsa: document.querySelector("#lista-bolsa"),
  gastado: document.querySelector("#gastado"),
};

// Todo el estado de la máquina vive aquí. El DOM solo lo refleja, nunca se lee de él.
const estado = {
  // Copia de los productos para poder cambiar el stock sin tocar los datos originales
  inventario: PRODUCTOS.map((producto) => ({ ...producto })),
  saldo: 0,
  codigo: "",
  cambio: [],
  productoEnBandeja: null,
  bolsa: [],
};

// Guardamos cada tarjeta para actualizarla sin volver a pintar todo el escaparate
const tarjetas = new Map();

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
  for (const producto of estado.inventario) {
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

function crearMonedaCambio(valor) {
  const moneda = document.createElement("span");
  moneda.className = claseMoneda(valor);
  moneda.textContent = formatearMoneda(valor);
  return moneda;
}

function pintarCambio() {
  dom.cambio.replaceChildren(...estado.cambio.map(crearMonedaCambio));
  dom.cambio.disabled = estado.cambio.length === 0;
}

function pintarBandeja() {
  const producto = estado.productoEnBandeja;
  if (producto === null) {
    dom.bandeja.textContent = "Bandeja vacía";
    dom.bandeja.disabled = true;
    return;
  }

  const emoji = document.createElement("span");
  emoji.className = "bandeja-emoji";
  emoji.textContent = producto.emoji;
  dom.bandeja.replaceChildren(emoji, `${producto.nombre} · pulsa para recoger`);
  dom.bandeja.disabled = false;
}

function pintarBolsa() {
  const articulos = estado.bolsa.map((producto) => {
    const articulo = document.createElement("li");
    articulo.textContent = `${producto.emoji} ${producto.nombre}`;
    return articulo;
  });
  dom.listaBolsa.replaceChildren(...articulos);

  const cantidad = estado.bolsa.length;
  if (cantidad === 0) {
    dom.gastado.textContent = "Todavía no has comprado nada.";
    return;
  }
  const gastado = sumar(estado.bolsa.map((producto) => producto.precio));
  const palabra = cantidad === 1 ? "producto" : "productos";
  dom.gastado.textContent = `Has gastado ${formatearEuros(gastado)} en ${cantidad} ${palabra}.`;
}

// Pinta la pantalla completa: mensaje, saldo, código y producto seleccionado
function actualizarPantalla(mensaje, esError = false) {
  dom.mensaje.textContent = mensaje;
  dom.pantalla.classList.toggle("pantalla-error", esError);
  dom.saldo.textContent = formatearEuros(estado.saldo);
  dom.codigo.textContent = estado.codigo.padEnd(2, "-");
  for (const [codigoTarjeta, tarjeta] of tarjetas) {
    tarjeta.classList.toggle("producto-seleccionado", codigoTarjeta === estado.codigo);
  }
}

// ---------- Acciones ----------

function buscarProducto(codigo) {
  return estado.inventario.find((producto) => producto.codigo === codigo);
}

function insertarMoneda(valor) {
  estado.saldo += valor;
  actualizarPantalla(`Has metido ${formatearEuros(valor)}`);
}

function describirCodigo() {
  if (estado.codigo === "") {
    return "Marca una letra (A-C)";
  }
  if (estado.codigo.length === 1) {
    return "Ahora marca un número (1-4)";
  }
  const producto = buscarProducto(estado.codigo);
  return `${producto.nombre}: ${formatearEuros(producto.precio)}. Pulsa OK`;
}

// El código es siempre una fila (letra) seguida de una columna (número)
function pulsarTecla(tecla) {
  if (tecla === "OK") {
    comprar();
    return;
  }

  if (tecla === "⌫") {
    estado.codigo = estado.codigo.slice(0, -1);
  } else if (estado.codigo.length === 0 && FILAS.includes(tecla)) {
    estado.codigo = tecla;
  } else if (estado.codigo.length === 1 && COLUMNAS.includes(tecla)) {
    estado.codigo += tecla;
  } else {
    actualizarPantalla("Marca una letra y después un número", true);
    return;
  }

  actualizarPantalla(describirCodigo());
}

function comprar() {
  const producto = buscarProducto(estado.codigo);

  if (producto === undefined) {
    actualizarPantalla("Marca un código completo, por ejemplo A1", true);
    return;
  }
  if (estado.productoEnBandeja !== null) {
    actualizarPantalla("Recoge primero el producto de la bandeja", true);
    return;
  }
  if (producto.stock === 0) {
    actualizarPantalla(`${producto.nombre}: agotado. Elige otro`, true);
    return;
  }
  if (estado.saldo < producto.precio) {
    actualizarPantalla(`Faltan ${formatearEuros(producto.precio - estado.saldo)}`, true);
    return;
  }

  producto.stock--;
  estado.saldo -= producto.precio;
  estado.codigo = "";
  estado.productoEnBandeja = producto;
  const hayCambio = devolverSaldo();

  actualizarTarjeta(producto);
  pintarBandeja();
  actualizarPantalla(`Aquí tienes: ${producto.nombre}${hayCambio ? ". Recoge tu cambio" : ""}`);
}

// Pasa el saldo a la bandeja de cambio en monedas. Devuelve si había algo que devolver.
function devolverSaldo() {
  if (estado.saldo === 0) {
    return false;
  }
  estado.cambio.push(...calcularCambio(estado.saldo));
  estado.saldo = 0;
  pintarCambio();
  return true;
}

function cancelarOperacion() {
  estado.codigo = "";
  const hayCambio = devolverSaldo();
  if (hayCambio) {
    actualizarPantalla("Operación cancelada. Recoge tu dinero");
  } else {
    actualizarPantalla("No hay dinero que devolver", true);
  }
}

function recogerCambio() {
  const recogido = sumar(estado.cambio);
  estado.cambio = [];
  pintarCambio();
  actualizarPantalla(`Has recogido ${formatearEuros(recogido)} de cambio`);
}

function recogerProducto() {
  const producto = estado.productoEnBandeja;
  estado.bolsa.push(producto);
  estado.productoEnBandeja = null;
  pintarBandeja();
  pintarBolsa();
  actualizarPantalla(`${producto.nombre} guardado en tu bolsa`);
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

dom.botonDevolver.addEventListener("click", cancelarOperacion);
dom.cambio.addEventListener("click", recogerCambio);
dom.bandeja.addEventListener("click", recogerProducto);

// Atajos: A-C y 1-4 marcan el código, Enter = OK, Retroceso = borrar, Escape = devolver
document.addEventListener("keydown", (evento) => {
  // Enter sobre un botón con el foco debe pulsar ese botón, no comprar
  if (evento.repeat || (evento.key === "Enter" && evento.target instanceof HTMLButtonElement)) {
    return;
  }
  if (evento.key === "Escape") {
    cancelarOperacion();
    return;
  }

  const tecla = ATAJOS_TECLADO[evento.key] ?? evento.key.toUpperCase();
  if (TECLAS.includes(tecla)) {
    evento.preventDefault();
    pulsarTecla(tecla);
  }
});

// ---------- Inicio ----------

pintarProductos();
pintarMonedas();
pintarTeclado();
pintarCambio();
pintarBandeja();
pintarBolsa();
actualizarPantalla("Inserta monedas");
