import { z } from "zod";
import { es } from "zod/locales";
import { edadEn } from "../lib/edad.ts";

// Mensajes por defecto de Zod en español (los que no personalizamos abajo).
z.config(es());

/*
 * ÚNICA FUENTE DE VERDAD de lo que es un luchador válido.
 * De aquí salen:
 *   - inscripcionSchema → valida el formulario (React Hook Form + zodResolver)
 *     y el servidor lo vuelve a usar para revalidar el POST.
 *   - luchadorSchema    → valida cada luchador que devuelve el API (bonus, safeParse).
 * Los tipos de TypeScript se infieren de los esquemas: no hay interfaces escritas a mano.
 */

export const CATEGORIAS = {
  pluma: { nombre: "Pluma", min: 45, max: 60 },
  ligero: { nombre: "Ligero", min: 60, max: 70 },
  medio: { nombre: "Medio", min: 70, max: 85 },
  pesado: { nombre: "Pesado", min: 85, max: 150 },
} as const;

export const DISCIPLINAS = {
  kickboxing: "Kickboxing",
  "muay-thai": "Muay thai",
  boxeo: "Boxeo",
  karate: "Karate kyokushin",
} as const;

export const NIVELES = {
  novato: "Novato (0-2 combates)",
  amateur: "Amateur (3-10 combates)",
  profesional: "Profesional (más de 10)",
} as const;

const claves = <T extends object>(objeto: T) => Object.keys(objeto) as [keyof T & string, ...(keyof T & string)[]];

export const categoriaSchema = z.enum(claves(CATEGORIAS), { error: "Elige una categoría de peso." });
export const disciplinaSchema = z.enum(claves(DISCIPLINAS), { error: "Elige una disciplina." });
export const nivelSchema = z.enum(claves(NIVELES), { error: "Elige tu nivel." });

export type Categoria = z.infer<typeof categoriaSchema>;

export const PESO_MIN = CATEGORIAS.pluma.min;
export const PESO_MAX = CATEGORIAS.pesado.max;
export const EDAD_MIN = 18;

/** La categoría que corresponde a un peso (la más ligera en la que cabe). */
export function categoriaParaPeso(peso: number): Categoria | null {
  const encontrada = Object.entries(CATEGORIAS).find(([, c]) => peso >= c.min && peso <= c.max);
  return encontrada ? (encontrada[0] as Categoria) : null;
}

export function cabeEnCategoria(peso: number, categoria: Categoria): boolean {
  const { min, max } = CATEGORIAS[categoria];
  return peso >= min && peso <= max;
}

// --- Campos compartidos por el formulario y por la respuesta del API ---

const campos = {
  nombre: z
    .string()
    .trim()
    .min(2, { error: "El nombre necesita al menos 2 letras." })
    .max(40, { error: "Máximo 40 caracteres." }),
  alias: z.string().trim().max(20, { error: "El alias de guerra admite 20 caracteres como mucho." }),
  email: z.email({ error: "Ese correo no parece válido (ejemplo: nombre@dominio.com)." }),
  fechaNacimiento: z
    .iso.date({ error: "Pon tu fecha de nacimiento." })
    .refine((fecha) => edadEn(fecha) >= EDAD_MIN, {
      error: `Hay que tener al menos ${EDAD_MIN} años para pelear.`,
    })
    .refine((fecha) => edadEn(fecha) <= 99, { error: "Revisa el año de nacimiento." }),
  categoria: categoriaSchema,
  disciplina: disciplinaSchema,
  nivel: nivelSchema,
};

const pesoKg = z
  .number({ error: "Escribe tu peso en kg (solo el número)." })
  .min(PESO_MIN, { error: `El peso va de ${PESO_MIN} a ${PESO_MAX} kg.` })
  .max(PESO_MAX, { error: `El peso va de ${PESO_MIN} a ${PESO_MAX} kg.` });

type ConPesoYCategoria = { peso: number; categoria: Categoria };

/**
 * Regla que cruza dos campos: el peso tiene que caber en la categoría.
 * `when` hace que se compruebe aunque otros campos (por ejemplo el checkbox del
 * reglamento, un z.literal) hayan fallado: sin él, Zod 4 se saltaría la regla.
 */
function pesoEncajaEnCategoria<T extends ConPesoYCategoria>(datos: T, ctx: z.RefinementCtx<T>) {
  if (cabeEnCategoria(datos.peso, datos.categoria)) return;
  const sugerida = categoriaParaPeso(datos.peso);
  const { nombre, min, max } = CATEGORIAS[datos.categoria];
  ctx.addIssue({
    code: "custom",
    path: ["categoria"],
    input: datos.categoria,
    message:
      `${nombre} es de ${min} a ${max} kg y tú pesas ${datos.peso} kg` +
      (sugerida ? `: te toca ${CATEGORIAS[sugerida].nombre}.` : "."),
  });
}

/** Solo tiene sentido cruzar peso y categoría si los dos son válidos (y si lo recibido es un objeto). */
const sinErroresEnPesoNiCategoria = {
  when: (payload: z.core.ParsePayload) =>
    !payload.issues.some(
      (issue) => !issue.path?.length || issue.path[0] === "peso" || issue.path[0] === "categoria",
    ),
};

// --- Formulario de inscripción ---

export const inscripcionSchema = z
  .object({
    ...campos,
    // Los inputs siempre dan texto: z.coerce.number() lo pasa a número antes de validar.
    peso: z.coerce.number<string>().pipe(pesoKg),
    reglamento: z.literal(true, { error: "Tienes que aceptar el reglamento para subir al ring." }),
  })
  .superRefine(pesoEncajaEnCategoria, sinErroresEnPesoNiCategoria);

/** Lo que escribe el usuario (texto, checkbox…) y lo que sale ya validado. */
export type InscripcionEntrada = z.input<typeof inscripcionSchema>;
export type Inscripcion = z.output<typeof inscripcionSchema>;
export type CampoInscripcion = keyof Inscripcion;

// --- Respuesta del API ---

/** Un luchador tal y como debe llegar del servidor. Aquí el peso ya tiene que ser un número. */
export const luchadorSchema = z
  .object({
    ...campos,
    peso: pesoKg,
    id: z.string().min(1),
    dorsal: z.number().int().positive(),
    inscritoEn: z.iso.datetime(),
  })
  .superRefine(pesoEncajaEnCategoria, sinErroresEnPesoNiCategoria);

export type Luchador = z.infer<typeof luchadorSchema>;

/** El sobre de la lista: solo exigimos que sea un array; cada elemento se valida aparte con safeParse. */
export const respuestaListaSchema = z.object({ luchadores: z.array(z.unknown()) });

/** Errores que manda el servidor: un mensaje y, si los hay, errores por campo. */
export const errorApiSchema = z.object({
  mensaje: z.string(),
  campos: z.partialRecord(z.enum(Object.keys(inscripcionSchema.shape) as [CampoInscripcion]), z.string()).optional(),
});

export type ErrorApiCuerpo = z.infer<typeof errorApiSchema>;
