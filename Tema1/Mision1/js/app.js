// Interfaz de la máquina: estado, pintado del DOM y eventos.

const FILAS = ["A", "B", "C"];
const COLUMNAS = ["1", "2", "3", "4"];
// Cada tecla separa lo que se ve (etiqueta) de lo que hace (un carácter o una acción)
const TECLAS = [
  ...FILAS.map((fila) => ({ etiqueta: fila, caracter: fila })),
  { etiqueta: "⌫", accion: "borrar", descripcion: "Borrar" },
  ...COLUMNAS.map((columna) => ({ etiqueta: columna, caracter: columna })),
  { etiqueta: "OK", accion: "comprar", descripcion: "Comprar" },
];
const ATAJOS_TECLADO = { Enter: "comprar", Backspace: "borrar", Escape: "cancelar" };

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

// ---------- Creación de nodos ----------

function crearElemento(etiqueta, clase, texto) {
  const nodo = document.createElement(etiqueta);
  nodo.className = clase;
  nodo.textContent = texto;
  return nodo;
}

function crearBoton(clase, texto) {
  const boton = crearElemento("button", clase, texto);
  boton.type = "button";
  return boton;
}

// Las monedas de 1 € y 2 € se pintan doradas
function claseMoneda(valor) {
  return valor >= 100 ? "moneda moneda-oro" : "moneda";
}

function crearMoneda(valor) {
  return crearElemento("span", claseMoneda(valor), formatearMoneda(valor));
}

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

function pintarMonedas() {
  const botones = MONEDAS.map((valor) => {
    const boton = crearBoton(claseMoneda(valor), formatearMoneda(valor));
    boton.dataset.valor = valor;
    boton.setAttribute("aria-label", `Insertar ${formatearEuros(valor)}`);
    return boton;
  });
  dom.monedas.append(...botones);
}

function pintarTeclado() {
  const botones = TECLAS.map(({ etiqueta, caracter, accion, descripcion }) => {
    const boton = crearBoton("tecla", etiqueta);
    if (accion === undefined) {
      boton.dataset.caracter = caracter;
    } else {
      boton.dataset.accion = accion;
      boton.setAttribute("aria-label", descripcion);
    }
    boton.classList.toggle("tecla-ok", accion === "comprar");
    return boton;
  });
  dom.teclado.append(...botones);
}

function pintarCambio() {
  dom.cambio.replaceChildren(...estado.cambio.map(crearMoneda));
  dom.cambio.disabled = estado.cambio.length === 0;
}

function pintarBandeja() {
  const producto = estado.productoEnBandeja;
  if (producto === null) {
    dom.bandeja.textContent = "Bandeja vacía";
    dom.bandeja.disabled = true;
    return;
  }

  const emoji = crearElemento("span", "bandeja-emoji", producto.emoji);
  dom.bandeja.replaceChildren(emoji, `${producto.nombre} · pulsa para recoger`);
  dom.bandeja.disabled = false;
}

function pintarBolsa() {
  const articulos = estado.bolsa.map((producto) =>
    crearElemento("li", "articulo-bolsa", `${producto.emoji} ${producto.nombre}`)
  );
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
  dom.botonDevolver.disabled = !hayAlgoQueCancelar();
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
function marcarCaracter(caracter) {
  const esFila = estado.codigo.length === 0 && FILAS.includes(caracter);
  const esColumna = estado.codigo.length === 1 && COLUMNAS.includes(caracter);
  if (!esFila && !esColumna) {
    actualizarPantalla("Marca una letra y después un número", true);
    return;
  }
  estado.codigo += caracter;
  actualizarPantalla(describirCodigo());
}

function borrarCaracter() {
  if (estado.codigo === "") {
    return;
  }
  estado.codigo = estado.codigo.slice(0, -1);
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

function hayAlgoQueCancelar() {
  return estado.saldo > 0 || estado.codigo !== "";
}

// Si no hay nada que cancelar no hace nada: así Escape no muestra errores sin motivo
function cancelarOperacion() {
  if (!hayAlgoQueCancelar()) {
    return;
  }
  estado.codigo = "";
  const hayCambio = devolverSaldo();
  actualizarPantalla(hayCambio ? "Operación cancelada. Recoge tu dinero" : "Código borrado");
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

// Acciones que se pueden lanzar desde el teclado de la máquina o el del ordenador
const ACCIONES = {
  comprar,
  borrar: borrarCaracter,
  cancelar: cancelarOperacion,
};

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
  if (boton === null) {
    return;
  }
  const { accion, caracter } = boton.dataset;
  if (accion === undefined) {
    marcarCaracter(caracter);
  } else {
    ACCIONES[accion]();
  }
});

dom.botonDevolver.addEventListener("click", cancelarOperacion);
dom.cambio.addEventListener("click", recogerCambio);
dom.bandeja.addEventListener("click", recogerProducto);

// Teclas que se deja gestionar al navegador:
// - combinaciones como Ctrl+C o Ctrl+A (copiar, seleccionar todo…)
// - la autorrepetición al mantener una tecla pulsada
// - Enter sobre un botón con el foco, que debe pulsar ese botón y no comprar
function esTeclaDelNavegador(evento) {
  const conModificador = evento.ctrlKey || evento.altKey || evento.metaKey;
  const enterSobreBoton = evento.key === "Enter" && evento.target instanceof HTMLButtonElement;
  return conModificador || evento.repeat || enterSobreBoton;
}

// Atajos: A-C y 1-4 marcan el código, Enter = OK, Retroceso = borrar, Escape = devolver
document.addEventListener("keydown", (evento) => {
  if (esTeclaDelNavegador(evento)) {
    return;
  }

  const accion = ATAJOS_TECLADO[evento.key];
  const caracter = evento.key.toUpperCase();
  if (accion !== undefined) {
    evento.preventDefault();
    ACCIONES[accion]();
  } else if (FILAS.includes(caracter) || COLUMNAS.includes(caracter)) {
    evento.preventDefault();
    marcarCaracter(caracter);
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
