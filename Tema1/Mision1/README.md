# 🥤 Vendomatic 3000

Simulador de máquina expendedora hecho con **HTML, CSS y JavaScript puro** (sin frameworks ni librerías). El escaparate, el teclado, las monedas y el cambio se crean y se actualizan manipulando el DOM a mano.

## Descripción

La máquina tiene 12 productos organizados en filas (A, B, C) y columnas (1–4). Cada uno tiene un precio y un stock limitado. Metes monedas, marcas el código y la máquina te entrega el producto en la bandeja y te devuelve el cambio desglosado en monedas.

## Cómo usarlo

1. Mete dinero pulsando las monedas (5 c, 10 c, 20 c, 50 c, 1 € y 2 €).
2. Marca el código del producto en el teclado: primero la letra y después el número (por ejemplo **B3**).
3. Pulsa **OK**.
4. Pulsa la **bandeja** para guardar el producto en tu bolsa y la zona de **cambio** para recoger las monedas.
5. Con **Devolver dinero** cancelas la operación y recuperas el saldo.

### Atajos de teclado

| Tecla | Acción |
| --- | --- |
| `A`, `B`, `C` y `1`–`4` | Marcar el código |
| `Enter` | OK (comprar) |
| `Retroceso` | Borrar el último carácter |
| `Esc` | Devolver el dinero |

### Qué pasa si…

- **No tienes saldo suficiente**: la pantalla te dice cuánto falta.
- **El producto está agotado**: la tarjeta se ve apagada y la máquina no lo vende.
- **No has recogido el producto anterior**: la máquina no deja comprar otro hasta que vacíes la bandeja.
- **Marcas un código mal**: la pantalla te avisa de que va primero la letra y después el número.

## Cómo ejecutarlo

No necesita instalación ni servidor: abre `index.html` en cualquier navegador moderno.

## Estructura del proyecto

```
Mision1/
├── index.html      # Estructura de la página y plantilla <template> de producto
├── css/
│   └── styles.css  # Diseño de la máquina, animaciones y responsive
├── js/
│   ├── datos.js    # Productos, monedas, formato en euros y cálculo del cambio
│   └── app.js      # Estado de la máquina, pintado del DOM y eventos
└── README.md
```

## Tecnologías y técnicas

- **HTML5 semántico**: `header`, `main`, `section`, `article` y `template`.
- **CSS3**: variables, Grid, Flexbox, `@keyframes` para la caída del producto y las monedas, y media queries.
- **JavaScript (ES6+)** sin dependencias:
  - Los importes se guardan en **céntimos (enteros)** para evitar errores de redondeo como `0.1 + 0.2 !== 0.3`.
  - El cambio se calcula con un algoritmo voraz: se usa siempre la moneda más grande posible.
  - Las tarjetas se crean clonando un `<template>`, y las teclas y las monedas con `createElement` a partir de arrays.
  - Cada tarjeta se guarda en un `Map`, así que después de una compra solo se actualiza esa tarjeta y no todo el escaparate.
  - El texto se cambia siempre con `textContent`, nunca con `innerHTML`.
  - Los eventos se enganchan con `addEventListener`, sin handlers inline. Hay **delegación de eventos** en el teclado y las monedas, y atajos con `keydown`.
  - `const` por defecto y `let` solo para el estado que cambia (saldo, código, bandeja…).

## Autor

**SmokePalm** · Misión M1 «El Despertar del DOM» · Desarrollo Web
