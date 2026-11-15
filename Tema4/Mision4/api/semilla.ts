import type { Luchador } from "../src/schemas/luchador.ts";

/** Luchadores con los que arranca el servidor: nombres inventados con apellidos de luchadores famosos de la UFC. Se pierden los cambios al reiniciar. */
export const SEMILLA: Luchador[] = [
  { id: "l-1", dorsal: 1, nombre: "Carmen Topuria", alias: "La Tormenta", email: "carmen.topuria@ejemplo.com", fechaNacimiento: "1998-03-14", peso: 57, categoria: "pluma", disciplina: "muay-thai", nivel: "profesional", inscritoEn: "2026-11-01T10:00:00.000Z" },
  { id: "l-2", dorsal: 2, nombre: "Diego Volkanovski", alias: "", email: "diego.volkanovski@ejemplo.com", fechaNacimiento: "2001-07-02", peso: 68, categoria: "ligero", disciplina: "kickboxing", nivel: "amateur", inscritoEn: "2026-11-02T18:30:00.000Z" },
  { id: "l-3", dorsal: 3, nombre: "Nerea Adesanya", alias: "Martillo", email: "nerea.adesanya@ejemplo.com", fechaNacimiento: "1995-12-21", peso: 79, categoria: "medio", disciplina: "boxeo", nivel: "profesional", inscritoEn: "2026-11-03T09:15:00.000Z" },
  { id: "l-4", dorsal: 4, nombre: "Íker Ngannou", alias: "El Muro", email: "iker.ngannou@ejemplo.com", fechaNacimiento: "1990-05-30", peso: 102, categoria: "pesado", disciplina: "karate", nivel: "amateur", inscritoEn: "2026-11-05T20:45:00.000Z" },
  { id: "l-5", dorsal: 5, nombre: "Aitana Nunes", alias: "Relámpago", email: "aitana.nunes@ejemplo.com", fechaNacimiento: "2004-09-09", peso: 63, categoria: "ligero", disciplina: "muay-thai", nivel: "novato", inscritoEn: "2026-11-08T12:00:00.000Z" },
];

/**
 * Registros rotos que el «modo sabotaje» cuela en la respuesta, como haría un backend con un bug
 * o una migración a medias. El cliente tiene que atraparlos con Zod (safeParse).
 */
export const CORRUPTOS: unknown[] = [
  // El peso llega como texto y el correo no es un correo.
  { id: "x-1", dorsal: 90, nombre: "Bruno Corrupto", alias: "", email: "bruno-arroba-ejemplo", fechaNacimiento: "1999-01-01", peso: "ochenta", categoria: "medio", disciplina: "boxeo", nivel: "amateur", inscritoEn: "2026-11-10T10:00:00.000Z" },
  // Una categoría que no existe, sin id y con dorsal negativo.
  { dorsal: -3, nombre: "Sin Identificar", alias: "", email: "anonimo@ejemplo.com", fechaNacimiento: "2000-02-02", peso: 75, categoria: "superpesado", disciplina: "kickboxing", nivel: "novato", inscritoEn: "2026-11-11T10:00:00.000Z" },
  // Todo bien escrito, pero 120 kg en pluma y menor de edad: lo atrapa la regla que cruza campos.
  { id: "x-3", dorsal: 92, nombre: "Pedro Imposible", alias: "Truco", email: "pedro@ejemplo.com", fechaNacimiento: "2015-06-01", peso: 120, categoria: "pluma", disciplina: "karate", nivel: "profesional", inscritoEn: "2026-11-12T10:00:00.000Z" },
  // Ni siquiera es un objeto.
  "luchador_borrado",
];
