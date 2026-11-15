import { afterEach, describe, expect, it, vi } from "vitest";
import { CORRUPTOS, SEMILLA } from "../../api/semilla.ts";
import { ErrorApi, ErrorRespuestaCorrupta, inscribirLuchador, obtenerLuchadores } from "./luchadores.ts";

const TODAS = { categoria: "todas", sabotaje: false, caida: false } as const;

function apiDevuelve(estado: number, cuerpo: unknown) {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(cuerpo), { status: estado })));
}

afterEach(() => vi.unstubAllGlobals());

describe("obtenerLuchadores", () => {
  it("devuelve los luchadores válidos y ninguno descartado", async () => {
    apiDevuelve(200, { luchadores: SEMILLA });
    const { luchadores, descartados } = await obtenerLuchadores(TODAS);
    expect(luchadores).toHaveLength(SEMILLA.length);
    expect(descartados).toEqual([]);
  });

  it("★ bonus: con datos corruptos, safeParse los aparta y deja pasar los buenos", async () => {
    apiDevuelve(200, { luchadores: [...SEMILLA, ...CORRUPTOS] });
    const { luchadores, descartados } = await obtenerLuchadores(TODAS);

    expect(luchadores.map((l) => l.id)).toEqual(SEMILLA.map((l) => l.id));
    expect(descartados).toHaveLength(CORRUPTOS.length);

    const motivos = descartados.flatMap((d) => d.motivos).join("\n");
    expect(motivos).toMatch(/^peso: /m); // "ochenta"
    expect(motivos).toMatch(/^email: /m);
    expect(motivos).toMatch(/^categoria: /m); // "superpesado" y 120 kg en pluma
    expect(motivos).toMatch(/^id: /m);
    expect(motivos).toMatch(/18 años/); // menor de edad
  });

  it("si el sobre no es una lista, la petición entera falla con ErrorRespuestaCorrupta", async () => {
    apiDevuelve(200, { datos: "nada" });
    await expect(obtenerLuchadores(TODAS)).rejects.toBeInstanceOf(ErrorRespuestaCorrupta);
  });

  it("un 503 se convierte en ErrorApi con el mensaje del servidor (fetch no lo haría solo)", async () => {
    apiDevuelve(503, { mensaje: "KO" });
    await expect(obtenerLuchadores(TODAS)).rejects.toMatchObject({ estado: 503, message: "KO" });
  });
});

describe("inscribirLuchador", () => {
  it("lleva los errores por campo del servidor (409 correo repetido)", async () => {
    apiDevuelve(409, { mensaje: "No se ha podido.", campos: { email: "Ya hay un luchador inscrito con este correo." } });
    const error = await inscribirLuchador({} as never).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ErrorApi);
    expect((error as ErrorApi).campos?.email).toMatch(/correo/);
  });
});
