# 🥊 Full Contact · Inscripciones del torneo

> «Valida o muere.» Misión 4 · Formularios y peticiones HTTP.

App de **React 19 + TypeScript + Vite** para apuntarse a un torneo de artes marciales: un formulario de inscripción serio (**React Hook Form + Zod**) y un cartel de luchadores con datos remotos (**TanStack Query v5**), contra un API REST que corre dentro del propio servidor de Vite.

## Descripción

- **Inscríbete**: nombre, alias de guerra (opcional), correo, fecha de nacimiento, peso, categoría, disciplina, experiencia y aceptar el reglamento.
  - Reglas de verdad, no solo «obligatorio»: mayor de 18, peso de 45 a 150 kg y **el peso tiene que caber en la categoría** (regla que cruza dos campos).
  - Mientras escribes el peso, una pista te dice qué categoría te toca y te deja elegirla con un botón.
  - El servidor revalida: si el correo ya está inscrito, el error aparece **en el campo del correo** y el foco salta a él.
- **Cartel de luchadores**: lista con dorsal, filtro por categoría y botón **Retirar** (con confirmación). Al inscribir o retirar, la lista se refresca sola (invalidación).
- **🧪 Laboratorio de sabotaje**: dos interruptores para ver la app contra un API que se porta mal:
  - **Datos corruptos**: el API mete 4 registros rotos en la lista y Zod los bloquea (★ bonus).
  - **Servidor caído**: la lista responde 503; TanStack Query reintenta y luego enseña el error con **Reintentar**.

## Cómo ejecutarlo

Hace falta [Node.js](https://nodejs.org/) 20.19 o superior.

```bash
cd Tema4/Mision4
npm install
npm run dev      # app + API en http://localhost:5173 (el API está en /api)
npm test         # 12 pruebas con Vitest (esquemas y capa de servicios)
npm run lint     # ESLint con las reglas de los hooks de React
npm run build    # comprueba los tipos (tsc) y genera dist/
```

No hay que arrancar ningún backend aparte: `api/apiTorneo.ts` es un plugin de Vite que monta el API en `/api` (también funciona con `npm run preview`). Los datos viven en memoria: al reiniciar el servidor vuelven los 5 luchadores de ejemplo. Cada respuesta tarda 0,7 s a propósito para que se vean los estados de carga.

| Método | Ruta | Respuestas |
| --- | --- | --- |
| GET | `/api/luchadores?categoria=medio&sabotaje=1&caida=1` | 200 `{ luchadores: [...] }`, 503 con `caida` |
| POST | `/api/luchadores` | 201 luchador creado, 409 correo repetido, 422 datos inválidos (errores por campo) |
| DELETE | `/api/luchadores/:id` | 204, 404 |

## Estructura del proyecto

```
Tema4/Mision4/
├── index.html
├── vite.config.ts               # React + el plugin del API
├── api/                         # El «backend» (Node, dentro de Vite)
│   ├── apiTorneo.ts             # Rutas GET/POST/DELETE; revalida con el MISMO esquema Zod
│   └── semilla.ts               # Luchadores de ejemplo y los registros corruptos del sabotaje
└── src/
    ├── main.tsx                 # QueryClientProvider + React Query DevTools
    ├── App.tsx                  # Maqueta y los dos interruptores del laboratorio
    ├── styles.css
    ├── schemas/
    │   ├── luchador.ts          # ★ Única fuente de verdad: formulario, respuesta del API y tipos
    │   └── luchador.test.ts
    ├── services/
    │   ├── luchadores.ts        # Todos los fetch: response.ok, errores y safeParse de las respuestas
    │   └── luchadores.test.ts
    ├── hooks/
    │   ├── claves.ts            # Fábrica de query keys
    │   ├── useLuchadores.ts     # useQuery
    │   ├── useInscribir.ts      # useMutation + invalidateQueries
    │   └── useRetirar.ts        # useMutation + invalidateQueries
    ├── lib/
    │   ├── queryClient.ts       # Política de reintentos y staleTime
    │   └── edad.ts
    └── components/
        ├── FormularioInscripcion.tsx  # useForm + zodResolver + useInscribir
        ├── Campo.tsx                  # label + input + pista + error accesibles
        ├── GrupoOpciones.tsx          # radios en fieldset/legend
        ├── Casilla.tsx                # checkbox
        ├── PistaCategoria.tsx         # useWatch del peso → categoría sugerida
        ├── Cartel.tsx                 # useLuchadores: cargando / error / vacío / lista
        ├── FiltroCategoria.tsx
        ├── TarjetaLuchador.tsx        # useRetirar con confirmación
        ├── Descartados.tsx            # ★ lo que Zod no dejó pasar
        ├── Cargando.tsx
        └── Laboratorio.tsx
```

## Cómo funciona

### React Hook Form

- `useForm<InscripcionEntrada, unknown, Inscripcion>({ resolver: zodResolver(inscripcionSchema), defaultValues })`. El primer tipo es lo que hay en los inputs (texto) y el tercero lo que sale validado (el peso ya es número): no se tipa a mano con el tipo de salida.
- Todos los campos con `{...register("campo")}` (inputs no controlados: escribir no re-renderiza el formulario) y `<form onSubmit={handleSubmit(onSubmit)} noValidate>`: fuera la validación nativa, manda Zod.
- `formState.errors` pinta cada error debajo de su campo; `isSubmitting` desactiva el botón y cambia el texto a «Inscribiendo…» mientras dura el POST (porque `onSubmit` hace `await mutateAsync`), así no hay dobles envíos.
- `register("peso", { deps: ["categoria"] })`: al cambiar el peso se revalida también la categoría.
- `useWatch` en `PistaCategoria`: solo ese componente se re-renderiza al escribir el peso. `setValue` elige la categoría sugerida.
- Errores del servidor → `setError(campo, { type: "servidor", message })` + `setFocus(campo)`. Éxito → `reset()`.
- El botón **no** se desactiva «hasta que sea válido»: siempre se puede pulsar, y al fallar el foco va al primer error. Para que ese «primero» sea el de arriba, todos los `register()` se llaman en el orden del formulario (dentro de los render props de `Campo`, `GrupoOpciones` y `Casilla`).

### Zod: única fuente de verdad

`src/schemas/luchador.ts` define los campos **una vez** y de ahí salen:

| Esquema | Para qué | Dónde se usa |
| --- | --- | --- |
| `inscripcionSchema` | Formulario (peso con `z.coerce.number()`, `reglamento: z.literal(true)`) | `zodResolver` en el cliente **y** `safeParse` del POST en el servidor |
| `luchadorSchema` | Un luchador que llega del API (peso ya número, `id`, `dorsal`, `inscritoEn`) | `safeParse` de cada elemento de la lista y de la respuesta del POST |
| `errorApiSchema` | Cuerpo de los errores 4xx/5xx | Capa de servicios |

Los tipos (`Inscripcion`, `Luchador`…) son `z.infer` / `z.input` / `z.output`: no hay ninguna interfaz escrita a mano. Los mensajes van en español (los personalizados con `error:` y el resto con `z.config(es())`).

Reglas destacadas: `z.email()` y `z.iso.date()` de Zod 4, `.refine` de edad ≥ 18, y la regla peso ↔ categoría con `superRefine(..., { when })` (ver Autopsia).

### TanStack Query v5

- `QueryClientProvider` en `main.tsx` y `<ReactQueryDevtools />` para ver la caché.
- **Query**: `useLuchadores(filtro)` → `useQuery({ queryKey: ["luchadores", "lista", filtro], queryFn: ({ signal }) => obtenerLuchadores(filtro, signal), placeholderData: keepPreviousData })`. Cambiar de categoría es cambiar la key; mientras llega la nueva se ve la lista anterior atenuada. El `signal` cancela peticiones viejas.
- **Mutations**: `useInscribir()` (POST) y `useRetirar()` (DELETE), las dos con `onSuccess: () => queryClient.invalidateQueries({ queryKey: ["luchadores"] })`. Como todas las keys empiezan por `"luchadores"`, se invalidan todas las listas filtradas a la vez.
- **Política** (`lib/queryClient.ts`): `staleTime` de 30 s; reintentar solo lo que puede ser pasajero (red o 5xx, máximo 2 veces), nunca un 404 ni una respuesta corrupta; las mutations no se reintentan (un POST repetido inscribiría dos veces).
- **Capa de servicios**: los componentes no ven ni un `fetch`. `pedir()` comprueba siempre `response.ok` (un 503 no rechaza la promesa de `fetch`) y lo convierte en `ErrorApi` con el mensaje y los errores por campo.

### Experiencia de usuario y accesibilidad

| Situación | Qué ve el usuario |
| --- | --- |
| Cargando el cartel | 3 tarjetas grises latiendo + «Cargando el cartel…» (`role="status"`) |
| Refresco de fondo | «⟳ Actualizando…»; si falla, «No responde, reintentando (intento 2)…» |
| Error de la lista | Caja roja con el mensaje y **Reintentar** (`role="alert"`) |
| Lista vacía | «Todavía no hay nadie inscrito…» o «Nadie en Medio todavía.» |
| Error en un campo | Borde rojo, `aria-invalid="true"`, mensaje con `role="alert"` unido con `aria-describedby` |
| Enviando | Botón desactivado con «Inscribiendo…» |
| Inscrito | «¡Dentro! *alias* lleva el dorsal #7.» (`role="status"`) y el formulario se vacía |
| Retirando | Confirmación «¿Retirar a…? Sí / No», luego «Retirando…» en esa tarjeta |

Además: cada campo con `<label htmlFor>` + `id`, radios en `<fieldset>` + `<legend>`, `autocomplete` (`name`, `email`, `bday`, `nickname`), foco visible amarillo, `aria-pressed` en el filtro, sin animación si el sistema pide menos movimiento, y diseño que se adapta al móvil.

### ★ Bonus: validar la respuesta del API con `safeParse`

En `services/luchadores.ts`:

1. El **sobre** (`{ luchadores: [...] }`) se valida con `respuestaListaSchema`. Si ni siquiera es una lista, la query entera pasa a error con `ErrorRespuestaCorrupta` (y no se reintenta: los datos seguirían rotos).
2. **Cada luchador** se valida con `luchadorSchema.safeParse()`. Los buenos se pintan; los malos se apartan con sus motivos y se enseñan en el panel **«🛡️ Zod ha bloqueado N registros corruptos»**.

**Demostración**: activa *Datos corruptos* en el laboratorio. El API cuela estos 4 registros (`api/semilla.ts`) y los 4 quedan fuera del cartel:

| Registro | Lo que atrapa Zod |
| --- | --- |
| Bruno Corrupto | `peso: "ochenta"` (texto) y `email: "bruno-arroba-ejemplo"` |
| Sin Identificar | categoría `"superpesado"`, sin `id`, `dorsal: -3` |
| Pedro Imposible | menor de edad y 120 kg en pluma (la regla que cruza campos también vale para el API) |
| `"luchador_borrado"` | ni siquiera es un objeto |

Lo mismo lo comprueba `npm test` (`services/luchadores.test.ts`, prueba «★ bonus»).

## Uso de IA

**Herramienta:** Claude (Claude Code, modelo Claude Opus 5.5).

**Qué hice con IA:** la IA generó el código del proyecto (esquemas, API simulada, servicios, hooks, componentes, estilos, pruebas) y este README, siguiendo los apuntes de la Unidad 4 y el feedback de la Misión 3. Mis decisiones:

- Pedirle una app nueva y no rehacer «¿Qué cocino?» otra vez, porque en la M3 la originalidad fue lo que más bajó.
- Que siguiera la estructura de las misiones anteriores (`Tema4/Mision4`, TypeScript, varios commits pequeños).
- Que tuviera en cuenta el feedback de la corrección de la M3: hooks difíciles de usar mal (aquí la key y la función de cada query se crean juntas dentro del hook), nada de props pasadas solo para un texto de «cargando» (cada componente lee su propio estado de TanStack Query) y nada de escribir en `localStorage` en el primer render (no se usa).

**Prompts reales relevantes:**

> «Con todo lo que sabemos de teoría y las anteriores misiones hay que hacer la 4» (junto con el enunciado y la rúbrica de la misión).

**Cómo se verificó:**

- `npm run lint` y `npm run build` (`tsc` estricto) sin errores ni avisos; `npm test`: 12 pruebas en verde (esquemas del formulario y del API, capa de servicios con `fetch` simulado y el bonus).
- Prueba de punta a punta en Chromium con Playwright: carga del cartel con esqueleto; enviar vacío (8 errores y foco en «Nombre»); peso 72 en Pluma (error en categoría y botón «Elegir Medio» que lo arregla); correo repetido (409 → error en el campo del correo y foco en él); inscripción correcta (botón «Inscribiendo…», mensaje con dorsal, formulario vacío y el nuevo en el cartel); filtro por categoría; modo sabotaje (4 registros bloqueados, cartel intacto); retirar (desaparece de la lista); servidor caído (reintentos y luego error con «Reintentar») y vuelta a la normalidad; móvil a 390 px sin scroll horizontal.
- Comprobaciones a mano en el navegador: solo con teclado (Tab en orden, Enter envía, foco al primer error) y las React Query DevTools para ver cómo se invalida la caché al inscribir.

## Autopsia

**1. El API simulado vive dentro de Vite, no en un servidor aparte ni en un servicio público.**
`api/apiTorneo.ts` es un plugin de Vite: un solo `npm run dev` levanta app y API, y el servidor puede importar el mismo esquema Zod que el formulario. Lo discutible es que no es un backend «de verdad»: los datos se pierden al reiniciar y en un despliegue estático (solo `dist/`) no habría API.
*Alternativa descartada:* JSONPlaceholder o similar. Es real, pero no guarda los POST (la invalidación no se notaría), no deja simular datos corruptos ni caídas y no revalida nada. También descarté `json-server`: obliga a arrancar dos procesos y no comparte el esquema.

**2. La regla peso ↔ categoría usa `superRefine` con `when`.**
En Zod 4, si falla un `z.enum`, un `z.literal` o un tipo, el refine del objeto se salta. Sin `when`, con el reglamento sin marcar **no** saldría el aviso de que 95 kg no caben en Pluma, y el usuario lo descubriría en un segundo envío. `when` hace que la regla se ejecute siempre que peso y categoría sean válidos, aunque falle otro campo. Lo discutible es que es una opción poco conocida y más difícil de leer que un `.refine` normal.
*Alternativa descartada:* comprobarlo dentro del `onSubmit` o con `validate` de React Hook Form. Funcionaría, pero la regla quedaría fuera del esquema y el servidor y la validación de la respuesta del API ya no la compartirían: dejaría de ser la única fuente de verdad.

**3. Los registros corruptos se descartan uno a uno, en vez de hacer fallar la lista entera.**
Con `safeParse` por elemento, un registro roto no tumba el cartel: se ven los buenos y se avisa de los malos. Lo discutible es que se enseñan datos «incompletos» sin que el usuario lo pida, y que el panel de descartados tiene sentido para depurar pero quizá no para un usuario final.
*Alternativa descartada:* `z.array(luchadorSchema).parse()` de golpe, como en los apuntes. Es más simple, pero un solo registro malo dejaría la pantalla en error y sin datos.
