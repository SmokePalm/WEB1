# 🥤 Vendomatic 3000

Simulador de máquina expendedora hecho con **HTML, CSS y JavaScript puro** (sin frameworks ni librerías). El escaparate, el teclado, las monedas y el cambio se crean y se actualizan manipulando el DOM a mano.

El proyecto está en [`Tema1/Mision1/`](Tema1/Mision1/).

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

No necesita instalación ni servidor: abre `Tema1/Mision1/index.html` en cualquier navegador moderno.

## Estructura del proyecto

```
WEB1/
├── README.md
└── Tema1/
    └── Mision1/
        ├── index.html      # Estructura de la página y plantilla <template> de producto
        ├── css/
        │   └── styles.css  # Diseño de la máquina, animaciones y responsive
        └── js/
            ├── datos.js    # Productos, monedas, formato en euros y cálculo del cambio
            └── app.js      # Estado de la máquina, pintado del DOM y eventos
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

## Uso de IA

**Herramienta:** Claude Code (modelo Claude Opus 5.5), usado desde la extensión de VS Code.

**Qué partes hice con IA:** la IA generó el código del proyecto: el HTML, el CSS, los dos archivos JavaScript y este README. Mi trabajo fue definir qué quería, elegir la idea y dirigir los cambios:

- Primero le pedí un juego de cartas. Me pareció demasiado complicado, así que lo descarté y le pedí una máquina expendedora, que es más sencilla de entender y de defender.
- Le corregí la ubicación: había creado el proyecto en una carpeta nueva en la raíz y le pedí que lo moviera a `Tema1/Mision1`, que es donde yo lo tenía preparado.
- Le pedí que el trabajo se subiera en varios commits pequeños, uno por cada paso, y no en uno solo.

**Prompts reales relevantes:**

> «Voy a construir un juego de cartas en el directorio Mision1 con HTML, CSS y JavaScript puro, sin frameworks ni librerías.» (junto con el enunciado y la rúbrica de la misión)

> «me parece el juego un poco complicado, haz mejor un simulador de máquina expendedora. A demas has creado tu un directorio aparte y queria que lo hicieras en el tema uno el directorio Mision1 que yo ya he creado»

**Cómo verifiqué lo generado:**

- Se probaron todos los flujos en un navegador simulado (jsdom): compra con cambio exacto, saldo insuficiente, producto agotado, bandeja ocupada, cancelar y atajos de teclado. Esa prueba encontró un error real: la tecla `Enter` fallaba si no había ningún botón con el foco. Se corrigió antes de subirlo.
- Se buscó en el código que no hubiera `var`, `innerHTML`, `onclick` ni `console.log`, que son cosas que bajan la nota.
- Revisé el código para entender cada función, sobre todo el cálculo del cambio, la delegación de eventos y por qué se trabaja en céntimos.

**Qué escribí a mano:** los prompts y las decisiones de diseño y de organización descritas arriba. El código no lo tecleé yo.

## Autopsia

**1. Dos scripts clásicos que comparten el ámbito global, en lugar de módulos ES.**
`datos.js` declara `PRODUCTOS`, `MONEDAS` y las funciones de cálculo con `const` en el nivel superior, y `app.js` las usa directamente porque los dos se cargan con `<script defer>` en orden. Lo discutible es que todo eso queda en el ámbito global y cualquier script podría pisarlo.
*Alternativa descartada:* usar `type="module"` con `export`/`import`. Es más limpio, pero los módulos no funcionan al abrir el `index.html` con doble clic (`file://`), porque el navegador los bloquea por CORS. Habría obligado a usar un servidor local, y el requisito era que se abriera sin instalar nada.

**2. El cambio se calcula con un algoritmo voraz y suponiendo monedas infinitas.**
`calcularCambio` siempre usa la moneda más grande que cabe. Con las monedas de euro (2 €, 1 €, 50 c, 20 c, 10 c, 5 c) eso da siempre el mínimo de monedas, y como todos los precios son múltiplos de 5 céntimos el cambio siempre es exacto. Lo discutible es que la máquina nunca se queda sin monedas, cosa que en una máquina real sí pasa.
*Alternativa descartada:* llevar un inventario de monedas dentro de la máquina (las que mete el usuario se suman y las del cambio se restan) y negarse a vender si no puede dar el cambio exacto. Es más realista, pero complica bastante la lógica: habría que buscar combinaciones cuando la voraz falla. Preferí mantener el código simple y fácil de explicar.
