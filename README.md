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

> «Voy a construir un simulador de máquina expendedora en el directorio Mision1 con HTML, CSS y JavaScript puro, sin frameworks ni librerías.» (junto con el enunciado y la rúbrica de la misión)


> «Revisa mi index.html, styles.css y app.js como si fueras el profesor que va a corregirlos con esta rúbrica: DOM 20, eventos 15, fundamentos JS 15, calidad 10, originalidad 10. Dime los tres puntos más débiles y por qué, sin arreglarlos todavía — quiero intentarlo yo primero.»

**Cómo verifiqué lo generado:**

- Le pedí a la IA que revisara el código como si fuera el profesor. Encontró tres puntos débiles, que después también arregló la IA en tres commits separados:
  1. El atajo de teclado global capturaba **Ctrl+C** y **Ctrl+A**: marcaba la fila C o A e impedía copiar. Además, **Esc** mostraba un error aunque no hubiera nada que cancelar.
  2. El estado estaba repartido en cinco variables sueltas, y el número de productos comprados se leía del DOM. Ahora todo vive en un único objeto `estado` y el DOM solo lo refleja.
  3. La creación de botones y elementos estaba repetida, y el texto de las teclas (`OK`, `⌫`) se usaba también como identificador de la acción. Ahora hay helpers `crearElemento`/`crearBoton`, y cada tecla separa `etiqueta` y `accion`.
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

---

# 🧊 ¿Qué cocino?

Aplicación que te dice qué puedes cocinar con lo que tienes en la nevera. Escribes tus ingredientes y busca recetas reales en la API pública [TheMealDB](https://www.themealdb.com/), ordenadas por cuántos de tus ingredientes aprovechan.

Hecha con **JavaScript puro y Vite**, sin frameworks. El proyecto está en [`Tema2/Mision2/`](Tema2/Mision2/).

## Descripción

- Añades hasta 6 ingredientes, que aparecen como imanes pegados en la nevera. La API solo entiende **inglés** (`chicken`, `rice`, `egg`…); el campo sugiere los nombres válidos mientras escribes.
- Cada vez que cambia la nevera se lanza una búsqueda nueva. Primero salen las recetas que usan más ingredientes tuyos.
- Cada tarjeta dice qué ingredientes tuyos usa y cuántos te faltan. Al desplegarla se ven la lista completa (con los que ya tienes marcados), los pasos y el enlace al vídeo.
- Puedes filtrar los resultados por tipo de cocina.
- La nevera se guarda en `localStorage`, así que sigue ahí al recargar.

## Cómo ejecutarlo

Hace falta [Node.js](https://nodejs.org/) (20.19 o superior).

```bash
cd Tema2/Mision2
npm install
npm run dev      # servidor de desarrollo en http://localhost:5173
```

Para generar la versión de producción: `npm run build` (sale en `dist/`) y `npm run preview` para probarla.

## Estructura del proyecto

```
Tema2/Mision2/
├── index.html          # Estructura de la página
├── package.json        # Scripts y dependencias (solo Vite)
└── src/
    ├── main.js         # Estado, eventos y decidir qué se pinta
    ├── api.js          # fetch a TheMealDB y traducción de errores
    ├── buscador.js     # Orquesta las peticiones: de una nevera a una lista de recetas
    ├── recetas.js      # Lógica pura: combinar, ordenar, limpiar y filtrar los datos
    ├── render.js       # Todo lo que toca el DOM
    ├── almacen.js      # Guardar y leer la nevera en localStorage
    └── styles.css
```

Cada módulo tiene una sola responsabilidad: `api.js` no sabe nada del DOM, `render.js` no hace peticiones y `recetas.js` no hace ninguna de las dos cosas (solo recibe datos y devuelve datos nuevos).

## Cómo funciona

### Asincronía

La búsqueda (`buscador.js`) tiene dos pasos:

1. **Una petición por ingrediente, todas a la vez.** Son independientes, así que se lanzan en paralelo con `Promise.allSettled`.
2. **El detalle de las 12 mejores recetas, también en paralelo.** Este paso sí depende del primero (hacen falta los `id`), por eso va después con `await`.

Se usa `allSettled` y no `all` para que un fallo aislado no tire toda la búsqueda: si falla un ingrediente se avisa y se sigue con los demás, y si falla el detalle de una receta su tarjeta sale igualmente, sin la parte desplegable.

Si cambias la nevera mientras hay una búsqueda en marcha, la anterior se cancela con `AbortController`. Así una respuesta antigua que llegue tarde no pisa a la nueva. Además, cada petición tiene un tiempo máximo de 10 segundos.

### Estados que ve el usuario

| Estado | Qué se ve |
| --- | --- |
| Inicio | Mensaje para que añadas el primer ingrediente |
| Cargando | Tarjetas grises que laten y el texto «Buscando recetas con…» |
| Error | El motivo en lenguaje normal (sin conexión, la API tarda, error HTTP…) y un botón **Reintentar** |
| Vacío | Aviso de que no hay recetas con esos ingredientes |
| Datos | Las tarjetas, más avisos si algún ingrediente ha fallado o no tiene recetas |

### Transformación de datos

Los datos de la API no se pintan tal cual llegan, se transforman antes con métodos de array (no hay ningún bucle `for`):

- `flatMap` + `reduce` sobre un `Map` para juntar las respuestas de todos los ingredientes en una sola lista sin repetidos, apuntando qué ingredientes han encontrado cada receta.
- `toSorted` para ordenar por número de coincidencias sin mutar el array.
- `Array.from` + `filter` para convertir los 40 campos sueltos de la API (`strIngredient1…20` y `strMeasure1…20`) en una lista de ingredientes de verdad.
- `Object.groupBy` para contar las recetas de cada tipo de cocina, y `filter` para filtrar por ella.
- `Set` para quitar duplicados.

### Robustez

Casos que se han probado y que no rompen la aplicación:

- **Sin resultados**: la API devuelve `{ "meals": null }`, no un array vacío.
- **`id` inexistente**: devuelve `{ "meals": "Invalid ID" }` (un texto donde debería ir un array).
- **Errores de red, HTTP 500 y respuestas que no son JSON**: se comprueba `response.ok` y todo va dentro de `try/catch`.
- **Datos raros**: recetas sin nombre, sin foto, sin instrucciones o sin ingredientes; huecos con `""`, `" "` o `null`; nombres con espacios de sobra.
- **Enlaces**: solo se aceptan URL `http(s)` antes de ponerlas en un `href` o un `src`.
- **`localStorage` corrupto** o no disponible: se arranca con la nevera vacía.
- **Texto de la API**: se pinta siempre con `textContent`, nunca con `innerHTML`.

## Uso de IA

**Herramienta:** Claude Code (modelo Claude Opus 5.5), usado desde la extensión de VS Code.

**Qué partes hice con IA:** la IA generó el código del proyecto: el HTML, el CSS, los seis módulos JavaScript y este README. Mi trabajo fue definir qué quería, elegir la idea y dirigir los cambios:

- Elegí la idea de la nevera y la API TheMealDB por originalidad, en lugar de usar la PokéAPI, que es la opción más habitual para este tipo de ejercicio.
- Le pedí que el estado de error tuviera un botón **Reintentar**, para poder repetir la búsqueda sin tener que tocar la nevera ni recargar la página.
- Le pedí que el trabajo se subiera en varios commits pequeños, uno por cada paso (proyecto, API, lógica, buscador, render, eventos), y no en uno solo.

**Prompts reales relevantes:**

> «Crea una aplicación (con Vite) que consuma una API pública TheMealDB usando fetch + async/await, módulos ES y métodos de array. Renderiza los datos en el DOM con estados de carga y error.»

> «Explícame el funcionamiento de buscador.js y déjame tres preguntas como si fueras mi profesor para prepararme bien la defensa.»

**Cómo verifiqué lo generado:**

- Arranqué el proyecto con `npm run dev` y probé a mano en el navegador, con las DevTools abiertas:
  - **Red lenta** (Network en «Slow 3G»): mientras llegan las respuestas se ven las tarjetas grises de carga y el texto «Buscando recetas con…».
  - **Ingrediente inventado**: sale el aviso de que no hay ninguna receta con eso, en lugar de una lista vacía o un error.
  - **Recargar la página**: la nevera sigue con los ingredientes que tenía, porque se guarda en `localStorage`.
  - **Cambiar la nevera rápido**: al añadir dos ingredientes seguidos solo aparecen los resultados de la última búsqueda; la anterior se cancela.
- Le pedí a la IA que me explicara `buscador.js` y me hiciera preguntas como si fuera el profesor, para comprobar que entendía el código antes de defenderlo.
- Revisé el código para entender cada módulo, sobre todo los dos pasos de `buscador.js`, por qué se usa `allSettled` y cómo se cancela una búsqueda con `AbortController`.

**Qué escribí a mano:** los prompts y las decisiones, tanto las del proyecto (la idea, la API y qué tenía que hacer la aplicación) como las de diseño. El código no lo tecleé yo.

## Autopsia

**1. Una petición por ingrediente y el cruce se hace en el cliente.**
`buscarRecetas` lanza una petición a `filter.php` por cada ingrediente de la nevera y después `combinarResultados` junta las respuestas y cuenta cuántos ingredientes comparte cada receta. Lo discutible es el coste: con 6 ingredientes y 12 detalles, una sola búsqueda son hasta 18 peticiones.
*Alternativa descartada:* el filtro por varios ingredientes a la vez de TheMealDB (`filter.php?i=chicken,rice`), que lo resuelve en una petición. Solo está disponible en la versión de pago de la API, y además devuelve únicamente las recetas que tienen todos los ingredientes, así que no serviría para ordenar por «cuántos aprovechas».

**2. El detalle de las 12 mejores recetas se pide por adelantado.**
Después del primer paso se piden los 12 detalles en paralelo, aunque el usuario quizá no despliegue ninguna tarjeta. Lo discutible es que se gastan peticiones en datos que puede que no se lean, y que el filtro por cocina solo ve esas 12 recetas y no todas las encontradas.
*Alternativa descartada:* pedir el detalle al desplegar cada tarjeta. Ahorra peticiones, pero la respuesta de `filter.php` solo trae nombre y foto: sin el detalle no se puede mostrar «te faltan N ingredientes» ni el tipo de cocina en la tarjeta cerrada, que es justo lo que ayuda a elegir.

**3. Los ingredientes se comparan por igualdad, con un singular muy simple.**
Para marcar qué ingredientes de la receta ya tienes, `esElMismo` compara los nombres tal cual y solo iguala plurales (`egg` y `eggs`). Lo discutible es que se queda corto: con `chicken` en la nevera, `chicken breast` aparece como ingrediente que te falta.
*Alternativa descartada:* comprobar si un nombre contiene al otro. Marcaría `chicken breast`, pero daría falsos positivos peores, como `egg` dentro de `eggplant` o `rice` dentro de `rice vinegar`. Preferí que la app se equivoque diciendo que te falta algo antes que diciendo que tienes algo que no tienes.

---

# ⚛️ ¿Qué cocino? en React

La misma aplicación de la misión anterior, reconstruida en **React 19 con TypeScript y Vite**. Hace lo mismo (buscar recetas en [TheMealDB](https://www.themealdb.com/) con los ingredientes de tu nevera), pero ahora la interfaz sale del estado: ya no hay funciones `pintarX` que tocan el DOM a mano.

El proyecto está en [`Tema3/Mision3/`](Tema3/Mision3/).

## Descripción

- Igual que antes: hasta 6 ingredientes como imanes en la nevera, sugerencias en inglés mientras escribes, recetas ordenadas por cuántos ingredientes tuyos usan, detalle desplegable y filtro por tipo de cocina.
- **Novedades:** un contador `N/6` al lado del título de la nevera y un botón **Vaciar** para quitarlo todo de golpe.
- La nevera se sigue guardando en `localStorage`.

## Cómo ejecutarlo

Hace falta [Node.js](https://nodejs.org/) (20.19 o superior).

```bash
cd Tema3/Mision3
npm install
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run lint     # ESLint con las reglas de los hooks de React
npm run build    # comprueba los tipos (tsc) y genera dist/
```

## Estructura del proyecto

```
Tema3/Mision3/
├── index.html
├── package.json
└── src/
    ├── main.tsx                 # Monta <App /> en #root
    ├── App.tsx                  # Estado de la nevera y las dos peticiones
    ├── styles.css
    ├── hooks/
    │   ├── usePeticion.ts       # Petición cancelable: cargando / error / lista + reintentar
    │   └── useLocalStorage.ts   # useState que sobrevive a recargar la página
    ├── lib/                     # Lógica sin React (la de la Misión 2 pasada a TypeScript)
    │   ├── api.ts
    │   ├── buscador.ts
    │   ├── recetas.ts
    │   └── tipos.ts
    └── components/
        ├── Nevera.tsx               # Sección de la nevera: título, contador y vaciar
        ├── FormularioIngrediente.tsx
        ├── Iman.tsx
        ├── Resultados.tsx           # Elige qué estado se ve
        ├── Cargando.tsx
        ├── Mensaje.tsx              # Caja de inicio, error y vacío
        ├── Avisos.tsx
        ├── Recetario.tsx            # Filtro + lista de tarjetas
        ├── FiltroCocinas.tsx
        ├── TarjetaReceta.tsx
        ├── FotoReceta.tsx
        └── DetalleReceta.tsx
```

## Cómo funciona

### Componentes

```
App
├── Nevera
│   ├── FormularioIngrediente
│   └── Iman ×N
└── Resultados
    ├── Mensaje            (inicio, error o vacío)
    ├── Cargando
    └── Recetario
        ├── FiltroCocinas
        ├── Avisos
        └── TarjetaReceta ×N
            ├── FotoReceta
            └── DetalleReceta
```

- Los componentes reciben **datos y callbacks** por props (`onAnadir`, `onQuitar`, `onCambiar`, `onReintentar`) y no saben de dónde salen. `Iman` no sabe que existe una nevera: solo avisa de que le han pulsado la ×.
- `Mensaje` se reutiliza para las tres cajas (inicio, error y vacío) usando `children`, y `Avisos` se usa tanto dentro del mensaje de vacío como encima de las tarjetas.
- Todas las props están tipadas con TypeScript. `DetalleReceta` usa `Pick<Receta, …>` para recibir solo los campos que necesita.

### Estado: lo mínimo, el resto se deriva

El único estado «de verdad» de la app es **la nevera** (un array de textos). Todo lo demás se calcula en cada render:

| Valor | De dónde sale |
| --- | --- |
| Si la búsqueda está cargando | La última respuesta no corresponde a la búsqueda actual |
| Recetas visibles | `filtrarPorCocina(recetas, cocina)` |
| Botones del filtro y sus números | `contarPorCocina(recetas)` |
| Avisos («Ninguna receta usa…») | Los `fallidos` y `sinRecetas` del resultado |
| Contador `3/6` y botón Vaciar | `ingredientes.length` |

Solo hay estado local donde hace falta: el texto y el aviso del formulario (input controlado), la cocina elegida en `Recetario` y si una foto ha fallado en `FotoReceta`.

Las actualizaciones nunca mutan: `[...actual, ingrediente]` para añadir y `filter` para quitar, siempre con la forma de función `setNevera((actual) => …)`.

### Efectos: solo dos

1. **La petición** (`usePeticion`): se lanza cuando cambia la tarea. En la limpieza del efecto se hace `abort()`, así que si cambias la nevera mientras carga, la búsqueda vieja se cancela y su respuesta no pisa a la nueva. El efecto solo llama a `setState` cuando llega la respuesta, nunca de forma síncrona.
2. **Guardar en `localStorage`** (`useLocalStorage`): depende de `[clave, valor]`.

Los dos sincronizan React con algo de fuera (la red y el almacenamiento del navegador), que es justo para lo que sirven los efectos. Lo que **no** se hace con efectos:

- **Reiniciar el filtro a «Todas»** en cada búsqueda nueva: `Recetario` solo se monta cuando hay recetas, y en cada búsqueda se pasa por «cargando», así que se desmonta y vuelve a montarse con su estado inicial.
- **Leer `localStorage` al arrancar**: se hace con inicialización perezosa, `useState(() => …)`.
- **Calcular el filtro o los avisos**: se derivan en el render.

La búsqueda se memoriza con `useMemo(…, [nevera])` para que la función solo cambie cuando cambia la nevera. Si no, sería una función nueva en cada render y el efecto se dispararía sin parar.

### Listas y condicionales

- Todas las listas usan una **key estable** sacada de los datos, nunca el índice: el nombre del ingrediente en los imanes (la nevera no admite repetidos), el `id` de la receta en las tarjetas, el nombre en las cocinas y las sugerencias, el hueco `1…20` de la API en los ingredientes de la receta y el número de paso en las instrucciones.
- `Resultados` decide qué se ve con un `switch` sobre el estado de la petición (`inactiva`, `cargando`, `error`, `lista`). Como es una unión discriminada de TypeScript, solo se puede leer `datos` en el caso `lista` y `error` en el caso `error`.
- Las condiciones con `&&` comparan siempre con un booleano (`ingredientes.length > 0 && …`) para que React no pinte un `0` suelto.
- `FiltroCocinas` devuelve `null` si solo hay una cocina, porque no hay nada que filtrar.

### ★ Bonus: custom hooks

- **`usePeticion(tarea)`**: un `useFetch` genérico. Recibe una función `(signal) => Promise<T>` y devuelve `{ estado, datos | error, reintentar }`. Se usa **dos veces**: para las recetas y para las sugerencias del campo.
- **`useLocalStorage(clave, leer)`**: igual que `useState`, pero guarda el valor. La función `leer` valida lo guardado, porque en `localStorage` puede haber cualquier cosa.

## Uso de IA

**Herramienta:** Claude Code (modelo Claude Opus 5.5), usado desde la extensión de VS Code.

**Qué partes hice con IA:** la IA generó el código del proyecto: la configuración, los componentes, los dos hooks, el paso a TypeScript de la lógica de la Misión 2 y este README. Mi trabajo fue definir qué quería y dirigir los cambios:

- Decidí reconstruir mi app de la misión anterior en lugar de hacer una nueva, para centrarme en el cambio de enfoque: de pintar el DOM a mano a que la interfaz salga del estado.
- Le indiqué dónde tenía que ir el proyecto: `Tema3/Mision3`.
- Le pedí que subiera el trabajo en varios commits pequeños (mínimo 5), uno por paso: proyecto, lógica, hooks, componentes de la nevera, componentes de resultados y App.

**Prompts reales relevantes:**

> «Créame aquí la misión 3, crea un directorio llamado Tema3 que dentro esté otro llamado Mision3 y ahí lo haces.» (junto con el enunciado y la rúbrica de la misión)

> «Dime cómo correr la web y qué tengo que comprobar a mano en el navegador.»

> «Explícame las partes de la web que no entiendo.»

**Cómo verifiqué lo generado:**

- Arranqué el proyecto con `npm run dev` y probé a mano en el navegador, con las DevTools abiertas y la consola a la vista:
  - **Formulario**: con el campo vacío sale «Escribe un ingrediente.», un ingrediente repetido avisa de que ya lo tengo y el aviso se borra al volver a escribir. Las sugerencias aparecen mientras escribo y el contador sube (`1/6`, `2/6`…).
  - **Red lenta** (Network en «Slow 4G»): mientras llegan las respuestas se ven las tarjetas grises latiendo y el texto «Buscando recetas con…».
  - **Resultados**: primero salen las recetas que usan más ingredientes míos, y al desplegar una tarjeta los ingredientes que ya tengo salen en verde con ✓.
  - **Filtro por cocina**: al pulsar una cocina solo quedan sus recetas, y al cambiar la nevera el filtro vuelve solo a «Todas».
  - **Cambiar la nevera rápido**: al añadir dos ingredientes seguidos solo aparecen los resultados de la última búsqueda; la anterior se cancela.
  - **Ingrediente inventado** (`zzzz`): sale el mensaje de que no hay ninguna receta con eso.
  - **Sin conexión** (Network en «Offline»): sale el error con el botón **Reintentar**, y al volver la red ese botón recupera las recetas.
  - **Límite**: con 6 ingredientes no deja meter un séptimo.
  - **Recargar la página**: la nevera sigue con los ingredientes que tenía.
  - En la consola no salió ningún error en ninguna de las pruebas.
- Le pedí a la IA que me explicara las partes que no entendía, para poder defender el código.
- `npm run lint` (con las reglas de los hooks de React, que avisan de dependencias mal puestas en los efectos o de `setState` dentro de un efecto) y `npm run build` (que pasa `tsc` en modo estricto) terminan sin errores ni avisos.
- Se probaron todos los flujos en Chrome contra la API real: estado de inicio, aviso con el campo vacío, ingrediente duplicado, límite de 6, cambiar la nevera rápido (solo se ven los resultados de la última búsqueda), filtro por cocina, detalle de la receta, recargar la página (la nevera sigue y el filtro vuelve a «Todas»), ingrediente inventado (mensaje de vacío) y red cortada (mensaje de error y **Reintentar**). No salió ningún error en la consola.

**Qué escribí a mano:** los prompts y las decisiones descritas arriba. El código no lo tecleé yo.

## Autopsia

**1. «Cargando» no se guarda en el estado, se deduce.**
`usePeticion` solo guarda la última respuesta junto con la tarea y el intento a los que pertenece. Si no coinciden con los actuales, está cargando. Lo discutible es que es menos evidente de leer que un `const [cargando, setCargando] = useState(false)`.
*Alternativa descartada:* poner `setCargando(true)` al principio del efecto. Es lo más habitual, pero llama a `setState` de forma síncrona dentro del efecto (la regla `react-hooks/set-state-in-effect` lo marca), provoca un render extra y hay que acordarse de volver a ponerlo a `false` en todos los caminos. Al deducirlo, es imposible que «cargando» y los datos se contradigan.

**2. La tarea de búsqueda se memoriza con `useMemo` en vez de pasar la nevera al hook.**
`App` crea la función `(signal) => buscarRecetas(nevera, signal)` dentro de un `useMemo` que depende de `[nevera]`, y el hook depende de esa función. Lo discutible es que quien use el hook tiene que acordarse de memorizar la función (o definirla fuera del componente, como `pedirSugerencias`). Si no, el efecto se lanzaría en cada render.
*Alternativa descartada:* un hook con su propio array de dependencias, `usePeticion(tarea, [nevera])`. Es más cómodo de usar, pero ESLint ya no puede comprobar que esas dependencias son las correctas, y se podría olvidar una sin que nada avise.

**3. Guardar en `localStorage` con un efecto.**
`useLocalStorage` escribe en un `useEffect` cada vez que cambia el valor. Lo discutible es que también escribe en el primer render (vuelve a guardar lo mismo que acaba de leer) y que la escritura ocurre un instante después de pintar, no en el momento del clic.
*Alternativa descartada:* escribir dentro del propio setter, en el manejador del evento. Ahorra un efecto, pero obliga a envolver `setValor` y a calcular ahí el valor nuevo cuando llega como función (`setNevera((actual) => …)`). Preferí el efecto porque `localStorage` es un sistema externo y el código queda más corto y fácil de explicar.
