import { describe, expect, it } from "vitest";
import { inscripcionSchema, luchadorSchema } from "./luchador.ts";

// Lo que manda el formulario: todo texto, como sale de los inputs.
const formularioValido = {
  nombre: "  Lucía Braga  ",
  alias: "",
  email: "lucia@ejemplo.com",
  fechaNacimiento: "2000-04-10",
  peso: "64.5",
  categoria: "ligero",
  disciplina: "boxeo",
  nivel: "novato",
  reglamento: true,
};

const erroresPorCampo = (resultado: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) =>
  Object.fromEntries((resultado.error?.issues ?? []).map((i) => [String(i.path[0]), i.message]));

describe("inscripcionSchema (formulario)", () => {
  it("acepta una ficha correcta, recorta espacios y pasa el peso a número", () => {
    const resultado = inscripcionSchema.safeParse(formularioValido);
    expect(resultado.success).toBe(true);
    expect(resultado.data?.nombre).toBe("Lucía Braga");
    expect(resultado.data?.peso).toBe(64.5);
  });

  it("rechaza menores de 18, correo mal escrito y reglamento sin aceptar", () => {
    const errores = erroresPorCampo(
      inscripcionSchema.safeParse({ ...formularioValido, fechaNacimiento: "2012-01-01", email: "lucia@", reglamento: false }),
    );
    expect(errores.fechaNacimiento).toMatch(/18 años/);
    expect(errores.email).toMatch(/correo/);
    expect(errores.reglamento).toMatch(/reglamento/);
  });

  it("cruza peso y categoría aunque otro campo (el z.literal del reglamento) haya fallado", () => {
    const errores = erroresPorCampo(
      inscripcionSchema.safeParse({ ...formularioValido, peso: "95", categoria: "pluma", reglamento: false }),
    );
    expect(errores.categoria).toBe("Pluma es de 45 a 60 kg y tú pesas 95 kg: te toca Pesado.");
    expect(errores.reglamento).toBeDefined();
  });

  it("no repite el error de categoría si el peso ya es inválido", () => {
    const errores = erroresPorCampo(inscripcionSchema.safeParse({ ...formularioValido, peso: "" }));
    expect(errores.peso).toMatch(/45 a 150/);
    expect(errores.categoria).toBeUndefined();
  });
});

describe("luchadorSchema (respuesta del API)", () => {
  const luchador = {
    id: "l-1",
    dorsal: 1,
    nombre: "Carmen Topuria",
    alias: "La Tormenta",
    email: "carmen.topuria@ejemplo.com",
    fechaNacimiento: "1998-03-14",
    peso: 57,
    categoria: "pluma",
    disciplina: "muay-thai",
    nivel: "profesional",
    inscritoEn: "2026-11-01T10:00:00.000Z",
  };

  it("acepta un luchador bien formado", () => {
    expect(luchadorSchema.safeParse(luchador).success).toBe(true);
  });

  it("atrapa un peso que llega como texto (en la respuesta no hay coerce)", () => {
    const errores = erroresPorCampo(luchadorSchema.safeParse({ ...luchador, peso: "57" }));
    expect(Object.keys(errores)).toEqual(["peso"]);
  });

  it("atrapa una categoría inventada y un id que falta", () => {
    const { id: _id, ...sinId } = luchador;
    void _id;
    const errores = erroresPorCampo(luchadorSchema.safeParse({ ...sinId, categoria: "superpesado" }));
    expect(errores).toHaveProperty("id");
    expect(errores).toHaveProperty("categoria");
  });
});
