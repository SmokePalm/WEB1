import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type DefaultValues } from "react-hook-form";
import { useInscribir } from "../hooks/useInscribir.ts";
import {
  CATEGORIAS,
  DISCIPLINAS,
  NIVELES,
  inscripcionSchema,
  type CampoInscripcion,
  type Inscripcion,
  type InscripcionEntrada,
} from "../schemas/luchador.ts";
import { ErrorApi } from "../services/luchadores.ts";
import { Campo } from "./Campo.tsx";
import { Casilla } from "./Casilla.tsx";
import { GrupoOpciones } from "./GrupoOpciones.tsx";
import { PistaCategoria } from "./PistaCategoria.tsx";

// Categoría, disciplina, nivel y reglamento empiezan sin elegir: así Zod obliga a escogerlos.
const VACIO: DefaultValues<InscripcionEntrada> = { nombre: "", alias: "", email: "", fechaNacimiento: "", peso: "" };

export function FormularioInscripcion() {
  const inscribir = useInscribir();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    setValue,
    control,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<InscripcionEntrada, unknown, Inscripcion>({
    // Zod decide qué es válido y con qué mensaje; React Hook Form recoge los valores y decide cuándo validar.
    resolver: zodResolver(inscripcionSchema),
    defaultValues: VACIO,
  });

  // Todos los register() se llaman dentro de los render props de Campo, GrupoOpciones y Casilla, en el
  // orden del formulario: así, al fallar el envío, React Hook Form pone el foco en el PRIMER campo con error.

  // Solo se llama si Zod da el visto bueno: `datos` ya viene limpio (peso en número, textos sin espacios).
  async function onSubmit(datos: Inscripcion) {
    try {
      await inscribir.mutateAsync(datos);
      reset();
    } catch (error) {
      // El servidor revalida: si rechaza un campo (correo repetido…), el error se pinta en ese campo.
      if (error instanceof ErrorApi && error.campos) {
        const campos = Object.entries(error.campos) as [CampoInscripcion, string][];
        for (const [campo, mensaje] of campos) setError(campo, { type: "servidor", message: mensaje });
        if (campos.length > 0) setFocus(campos[0][0]);
      }
      // Cualquier otro error se ve en el aviso general de abajo (inscribir.isError).
    }
  }

  return (
    <section className="panel" aria-labelledby="titulo-inscripcion">
      <h2 id="titulo-inscripcion">Inscríbete</h2>
      <p className="entradilla">Rellena la ficha. Si algo no cuadra, el árbitro (Zod) te lo dirá antes de subir al ring.</p>

      {/* noValidate: fuera la validación nativa del navegador, aquí manda Zod. */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="formulario">
        <div className="fila">
          <Campo id="nombre" etiqueta="Nombre y apellidos" error={errors.nombre}>
            {(aria) => <input {...aria} type="text" autoComplete="name" {...register("nombre")} />}
          </Campo>
          <Campo id="alias" etiqueta="Alias de guerra" error={errors.alias} opcional pista="Así te anunciará el speaker.">
            {(aria) => <input {...aria} type="text" autoComplete="nickname" {...register("alias")} />}
          </Campo>
        </div>

        <Campo id="email" etiqueta="Correo electrónico" error={errors.email} pista="Te mandaremos aquí el horario de tu combate.">
          {(aria) => <input {...aria} type="email" autoComplete="email" inputMode="email" {...register("email")} />}
        </Campo>

        <div className="fila">
          <Campo id="fechaNacimiento" etiqueta="Fecha de nacimiento" error={errors.fechaNacimiento}>
            {(aria) => <input {...aria} type="date" autoComplete="bday" {...register("fechaNacimiento")} />}
          </Campo>
          <Campo id="peso" etiqueta="Peso (kg)" error={errors.peso} pista="Entre 45 y 150 kg.">
            {(aria) => (
              <input
                {...aria}
                type="number"
                inputMode="decimal"
                step="0.1"
                // Si cambia el peso, se revalida también la categoría (la regla cruza los dos campos).
                {...register("peso", { deps: ["categoria"] })}
              />
            )}
          </Campo>
        </div>

        <div className="fila">
          <Campo
            id="categoria"
            etiqueta="Categoría"
            error={errors.categoria}
            pista={<PistaCategoria control={control} setValue={setValue} validarAlElegir={isSubmitted} />}
          >
            {(aria) => (
              <select {...aria} defaultValue="" {...register("categoria")}>
                <option value="" disabled>
                  Elige…
                </option>
                {Object.entries(CATEGORIAS).map(([valor, { nombre, min, max }]) => (
                  <option key={valor} value={valor}>
                    {nombre} ({min}-{max} kg)
                  </option>
                ))}
              </select>
            )}
          </Campo>
          <Campo id="disciplina" etiqueta="Disciplina" error={errors.disciplina}>
            {(aria) => (
              <select {...aria} defaultValue="" {...register("disciplina")}>
                <option value="" disabled>
                  Elige…
                </option>
                {Object.entries(DISCIPLINAS).map(([valor, texto]) => (
                  <option key={valor} value={valor}>
                    {texto}
                  </option>
                ))}
              </select>
            )}
          </Campo>
        </div>

        <GrupoOpciones nombre="nivel" leyenda="Experiencia" opciones={NIVELES} error={errors.nivel}>
          {(valor, aria) => <input {...aria} type="radio" value={valor} {...register("nivel")} />}
        </GrupoOpciones>

        <Casilla
          id="reglamento"
          texto="He leído el reglamento y acepto el pesaje oficial el día del torneo."
          error={errors.reglamento}
        >
          {(aria) => <input {...aria} type="checkbox" {...register("reglamento")} />}
        </Casilla>

        {/* Siempre pulsable (salvo mientras se envía): si falta algo, al enviar el foco salta al primer error. */}
        <button type="submit" className="boton-principal" disabled={isSubmitting}>
          {isSubmitting ? "Inscribiendo…" : "🥊 Inscribirme"}
        </button>

        {inscribir.isSuccess && (
          <p className="aviso exito" role="status">
            ¡Dentro! <strong>{inscribir.data.alias || inscribir.data.nombre}</strong> lleva el dorsal{" "}
            <strong>#{inscribir.data.dorsal}</strong>. Ya apareces en el cartel.
          </p>
        )}
        {inscribir.isError && (
          <p className="aviso fallo" role="alert">
            {inscribir.error.message}
            {inscribir.error instanceof ErrorApi && inscribir.error.campos ? " Revisa los campos marcados." : ""}
          </p>
        )}
      </form>
    </section>
  );
}
