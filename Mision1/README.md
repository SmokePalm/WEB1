# ⚔️ Duelo de Runas

Juego de cartas por turnos contra la máquina, hecho con **HTML, CSS y JavaScript puro** (sin frameworks ni librerías). Todo el tablero se construye y actualiza manipulando el DOM a mano.

## Descripción

Eres un invocador que se enfrenta a un rival en un duelo de cartas elementales. Cada carta pertenece a un elemento (🔥 Fuego, 💧 Agua o 🌿 Planta) y tiene un poder del 1 al 6. En cada ronda los dos jugadores enfrentan una carta, y gana la de mayor poder total.

## Cómo jugar

1. Escribe tu nombre de invocador y elige el rival:
   - **Aprendiz**: juega cartas al azar.
   - **Archimago**: "lee" tu mano y juega la carta que vence a más cartas tuyas.
2. Juega una carta haciendo **clic** sobre ella o pulsando las **teclas 1–5**.
3. El rival responde y la ronda se resuelve en la arena.
4. Después de cada ronda, los dos roban una carta del mazo.

### Reglas

| Regla | Efecto |
| --- | --- |
| Ventaja elemental | 🔥 quema 🌿, 🌿 absorbe 💧, 💧 apaga 🔥. La carta con ventaja suma **+3** de poder. |
| Victoria de ronda | Quien tenga más poder total gana **1 punto**. Si hay empate, nadie puntúa. |
| Resonancia | Si ganas dos rondas seguidas con el **mismo elemento**, la segunda da **2 puntos**. |
| Fin del duelo | Gana quien llegue a **5 puntos**. Si se acaban las cartas, gana quien tenga más puntos. |

Tu historial de victorias, derrotas y empates se guarda en el navegador y aparece en la pantalla de inicio.

## Cómo ejecutarlo

No necesita instalación ni servidor: abre `index.html` en cualquier navegador moderno.

## Estructura del proyecto

```
Mision1/
├── index.html      # Estructura de la página y plantilla <template> de carta
├── css/
│   └── styles.css  # Tema, tablero, cartas, animaciones y responsive
├── js/
│   ├── mazo.js     # Lógica pura: elementos, mazo, barajado, combate e IA del rival
│   └── juego.js    # Estado de la partida, pintado del DOM y eventos
└── README.md
```

## Tecnologías y técnicas

- **HTML5 semántico**: `header`, `main`, `section`, `aside`, `dialog` y `template`.
- **CSS3**: variables (custom properties), Grid, Flexbox, `@keyframes` y media queries.
- **JavaScript (ES6+)** sin dependencias:
  - Selección de nodos con `querySelector`, agrupados en un único objeto `dom`.
  - Creación de nodos con `createElement`, `cloneNode` sobre un `<template>` y `DocumentFragment`.
  - Actualización con `textContent`, `classList`, `dataset` y `replaceChildren`, **nunca `innerHTML`**. Así, el nombre que escribe el usuario no puede inyectar HTML.
  - Eventos enganchados con `addEventListener`, sin ningún handler inline en el HTML. Hay **delegación de eventos** en la mano, atajos de teclado y control del `submit` del formulario.
  - Separación entre la lógica pura (`mazo.js`) y la interfaz (`juego.js`).
  - `localStorage` protegido con `try/catch` para el historial.

## Autor

**SmokePalm** · Misión M1 «El Despertar del DOM» · Desarrollo Web
