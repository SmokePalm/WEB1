# 🥊 Full Contact · Inscripciones del torneo

> «Valida o muere.» Misión 4 · Formularios y peticiones HTTP.

Para esta misión quería algo distinto a «¿Qué cocino?», así que hice la web de inscripciones de un torneo de artes marciales. Tiene un formulario para apuntarse y un cartel con los luchadores inscritos. Está hecha con **React 19 + TypeScript + Vite**. El formulario usa **React Hook Form + Zod** y los datos del servidor van con **TanStack Query v5**.

## Qué se puede hacer

- **Inscribirse**: nombre, alias de guerra (opcional), correo, fecha de nacimiento, peso, categoría, disciplina, experiencia y aceptar el reglamento.
  - No me quedé en «campo obligatorio». Hay que ser mayor de 18, pesar entre 45 y 150 kg y, además, **el peso tiene que encajar en la categoría**: no te puedes apuntar a pluma con 95 kg.
  - Mientras escribes el peso, debajo de la categoría te dice cuál te toca y puedes elegirla con un clic.
  - Si el correo ya está inscrito, el servidor lo rechaza y el error aparece en el propio campo del correo.
- **Ver el cartel**: los luchadores con su dorsal, filtrados por categoría si quieres, y un botón para **retirar** a alguien (te pide confirmación). Cada vez que alguien se inscribe o se retira, la lista se actualiza sola.
- **🧪 Laboratorio de sabotaje**: lo añadí para poder enseñar qué pasa cuando el servidor falla.
  - **Datos corruptos**: el API mete 4 luchadores rotos en la lista y Zod los bloquea (es el bonus).
  - **Servidor caído**: la lista devuelve un error 503. La app lo reintenta y, si sigue fallando, muestra el error con un botón **Reintentar**.

## Cómo ejecutarlo

Necesitas [Node.js](https://nodejs.org/) 20.19 o superior.

```bash
cd Tema4/Mision4
npm install
npm run dev      # la web y el API en http://localhost:5173
npm test         # 12 pruebas con Vitest
npm run lint     # ESLint
npm run build    # comprueba los tipos y genera dist/
```

No hay que arrancar ningún backend aparte. El API es un plugin de Vite (`api/apiTorneo.ts`) que responde en `/api`. Los datos se guardan en memoria, así que al reiniciar vuelven los 5 luchadores de ejemplo. Cada respuesta tarda 0,7 s a propósito para que se vean los estados de carga.

| Método | Ruta | Qué devuelve |
| --- | --- | --- |
| GET | `/api/luchadores?categoria=medio&sabotaje=1&caida=1` | 200 con `{ luchadores: [...] }`, o 503 si pides `caida` |
| POST | `/api/luchadores` | 201 con el luchador creado, 409 si el correo está repetido, 422 si los datos no son válidos |
| DELETE | `/api/luchadores/:id` | 204, o 404 si no existe |

## Cómo está organizado

```
Tema4/Mision4/
├── api/
│   ├── apiTorneo.ts             # El servidor de mentira: GET, POST y DELETE
│   └── semilla.ts               # Luchadores de ejemplo y los corruptos del sabotaje
└── src/
    ├── main.tsx                 # Monta la app dentro de QueryClientProvider
    ├── App.tsx
    ├── styles.css
    ├── schemas/luchador.ts      # El esquema Zod: todas las reglas están aquí
    ├── services/luchadores.ts   # Los fetch al API y el safeParse del bonus
    ├── hooks/                   # useLuchadores, useInscribir, useRetirar y las query keys
    ├── lib/                     # Configuración de TanStack Query y cálculo de la edad
    └── components/
        ├── FormularioInscripcion.tsx
        ├── Campo.tsx, Casilla.tsx, GrupoOpciones.tsx   # Piezas del formulario
        ├── PistaCategoria.tsx
        ├── Cartel.tsx, TarjetaLuchador.tsx, FiltroCategoria.tsx, Cargando.tsx
        ├── Descartados.tsx      # El panel del bonus
        └── Laboratorio.tsx
```

## Cómo funciona

### El formulario (React Hook Form)

Uso `useForm` con `zodResolver(inscripcionSchema)`, así que es Zod quien decide qué es válido y React Hook Form solo recoge los valores y decide cuándo validar. Cada campo va con `{...register("campo")}` y el formulario con `handleSubmit(onSubmit)` y `noValidate`, para que no se meta la validación del navegador.

Algunos detalles:

- Los errores salen debajo de cada campo (`formState.errors`) y, al enviar, el foco salta al primer campo que falla.
- Mientras se envía, el botón se desactiva y pone «Inscribiendo…» (`isSubmitting`), así no se puede enviar dos veces.
- Si cambias el peso, se vuelve a comprobar la categoría (`deps: ["categoria"]`).
- La pista de la categoría usa `useWatch`, así que al escribir el peso solo se vuelve a pintar ese trocito y no el formulario entero.
- Si el servidor rechaza un campo, lo marco con `setError` y le pongo el foco con `setFocus`. Si todo va bien, vacío el formulario con `reset()`.
- El botón de enviar nunca está desactivado «hasta que sea válido». Prefiero que se pueda pulsar y que te diga qué falta.

### Zod como única fuente de verdad

Todas las reglas están en `src/schemas/luchador.ts`. Los campos se definen una sola vez y de ahí salen dos esquemas:

- `inscripcionSchema`, para el formulario. El peso llega como texto y `z.coerce.number()` lo convierte en número, y el reglamento tiene que ser `true` (`z.literal(true)`). **El servidor usa este mismo esquema** para comprobar lo que le llega en el POST.
- `luchadorSchema`, para lo que devuelve el API. Aquí el peso ya tiene que venir como número y se añaden el `id`, el `dorsal` y la fecha de inscripción.

Los tipos de TypeScript salen de los esquemas (`z.infer`), así que no he tenido que escribir ninguna interfaz a mano. Los mensajes de error están en español.

### Los datos del servidor (TanStack Query)

- `useLuchadores(filtro)` hace el `useQuery` de la lista. La categoría forma parte de la query key, así que al cambiar de filtro se pide la lista nueva y, mientras llega, se sigue viendo la anterior un poco transparente.
- `useInscribir()` y `useRetirar()` son las mutations del POST y del DELETE. Cuando terminan bien, hacen `invalidateQueries({ queryKey: ["luchadores"] })`. Como todas las listas empiezan por esa key, se refrescan todas a la vez.
- Solo reintento lo que puede arreglarse solo: un fallo de red o un error 5xx, como mucho dos veces. Un 404 o unos datos rotos no se reintentan, y un POST tampoco, para no inscribir a alguien dos veces.
- Los componentes nunca llaman a `fetch`. Todo pasa por `services/luchadores.ts`, que siempre comprueba `response.ok`, porque `fetch` no da error con un 404 ni con un 500.

### Que el usuario sepa qué está pasando

| Situación | Lo que se ve |
| --- | --- |
| Cargando el cartel | Tres tarjetas grises que laten y «Cargando el cartel…» |
| Actualizando en segundo plano | «⟳ Actualizando…», o «reintentando (intento 2)…» si falla |
| Error al cargar | Un aviso rojo con el mensaje y el botón **Reintentar** |
| Lista vacía | «Todavía no hay nadie inscrito…» o «Nadie en Medio todavía.» |
| Campo con error | Borde rojo y el mensaje debajo |
| Enviando | Botón desactivado con «Inscribiendo…» |
| Inscripción hecha | «¡Dentro! *alias* lleva el dorsal #7.» y el formulario se vacía |
| Retirando | Pregunta «¿Retirar a…? Sí / No» y después «Retirando…» |

En accesibilidad: cada campo tiene su `<label htmlFor>`, los errores llevan `aria-invalid`, `aria-describedby` y `role="alert"`, los radios van en `<fieldset>` con `<legend>`, el foco se ve bien, los campos tienen `autocomplete` y la web se adapta al móvil.

### ★ Bonus: validar lo que manda el API

En `services/luchadores.ts` no me fío de lo que llega del servidor:

1. Primero compruebo que la respuesta tenga la forma `{ luchadores: [...] }`. Si ni siquiera es eso, la lista pasa a error.
2. Después valido **cada luchador por separado** con `luchadorSchema.safeParse()`. Los buenos se pintan, y los malos se apartan y salen en el panel «🛡️ Zod ha bloqueado N registros corruptos», con el motivo de cada uno.

Para verlo, activa **Datos corruptos** en el laboratorio. Estos son los 4 registros rotos que mete el API (están en `api/semilla.ts`):

| Registro | Por qué lo para Zod |
| --- | --- |
| Bruno Corrupto | El peso es `"ochenta"` (texto) y el correo es `"bruno-arroba-ejemplo"` |
| Sin Identificar | La categoría `"superpesado"` no existe, no tiene `id` y su dorsal es `-3` |
| Pedro Imposible | Es menor de edad y tiene 120 kg en pluma |
| `"luchador_borrado"` | Ni siquiera es un objeto |

También hay una prueba que lo comprueba (`npm test`, la del «★ bonus» en `services/luchadores.test.ts`).

## Uso de IA

**Herramienta:** Claude (Claude Code, modelo Claude Opus 5.5).

**Qué hice con IA:** el código (esquemas, API, servicios, hooks, componentes, estilos y pruebas) y este README los generó la IA a partir de los apuntes de la Unidad 4 y del feedback de mi M3. Lo que decidí yo:

- Hacer una app nueva en vez de rehacer «¿Qué cocino?», porque en la M3 la originalidad fue lo que más me bajó.
- Mantener la misma estructura que en las misiones anteriores (`Tema4/Mision4`, TypeScript y varios commits pequeños).
- Aplicar el feedback de la M3: hooks difíciles de usar mal (aquí cada hook crea su query key y su función juntas), no pasar props solo para mostrar un «cargando» (cada componente mira su propio estado) y no tocar `localStorage` en el primer render (en esta app no lo uso).
- Cambiar los luchadores de ejemplo por nombres con apellidos de luchadores famosos de la UFC.

**Prompts reales:**

> «Con todo lo que sabemos de teoría y las anteriores misiones hay que hacer la 4» (con el enunciado y la rúbrica de la misión).

> «Podrías poner los peleadores con nombres reales y los apellidos de peleadores famosos de la UFC, y explícame qué archivos son los que hay código de la web para revisarlos yo.»

**Cómo lo comprobé:**

- `npm run lint` y `npm run build` terminan sin errores y las 12 pruebas de `npm test` pasan.
- Se probó entera en el navegador: enviar el formulario vacío (salen los 8 errores y el foco va a «Nombre»), poner 72 kg en pluma (sale el error y el botón «Elegir Medio» lo arregla), usar un correo repetido (error en el campo del correo), hacer una inscripción correcta (aparece en el cartel), filtrar por categoría, retirar a un luchador, activar el sabotaje (los 4 registros quedan bloqueados) y tirar el servidor (reintenta y luego sale «Reintentar»). También se miró en móvil.
- La arranqué en mi ordenador con `npm run dev` y revisé los archivos del código para poder defenderlo.

## Autopsia

**1. El API de prueba está dentro de Vite y no es un servidor aparte.**
Así, con un solo `npm run dev` arranca todo, y el servidor puede usar el mismo esquema Zod que el formulario. Lo malo es que no es un backend de verdad: los datos se pierden al reiniciar y, si publicara solo la carpeta `dist/`, no habría API.
*Lo que descarté:* usar un API público como JSONPlaceholder. Es real, pero no guarda lo que envías (no se notaría la invalidación), no deja simular datos rotos ni caídas y no valida nada. También descarté `json-server`, porque obliga a tener dos procesos abiertos y no puede compartir el esquema.

**2. La regla «el peso tiene que caber en la categoría» usa `superRefine` con `when`.**
En Zod 4, si falla un `enum`, un `literal` o un tipo, la validación del objeto entero se salta. Sin `when`, si no marcabas el reglamento **no** te avisaba de que 95 kg no caben en pluma, y te enterabas en el segundo intento. Con `when`, la regla se comprueba siempre que el peso y la categoría sean válidos, aunque falle otro campo. Lo discutible es que `when` es poco conocido y se lee peor que un `.refine` normal.
*Lo que descarté:* comprobarlo en el `onSubmit` o con `validate` de React Hook Form. Funcionaría, pero la regla quedaría fuera del esquema y el servidor y el bonus ya no la usarían: Zod dejaría de ser la única fuente de verdad.

**3. Los registros corruptos se descartan de uno en uno, sin romper toda la lista.**
Con `safeParse` por elemento, un luchador roto no tumba el cartel: se ven los buenos y se avisa de los malos. Lo discutible es que el panel de descartados sirve para depurar, pero a un usuario normal quizá no le interesa verlo.
*Lo que descarté:* hacer `z.array(luchadorSchema).parse()` de golpe, como en los apuntes. Es más sencillo, pero con un solo registro malo la pantalla entera se quedaría en error y sin datos.
