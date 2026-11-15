import { useWatch, type Control, type UseFormSetValue } from "react-hook-form";
import { CATEGORIAS, categoriaParaPeso, type Inscripcion, type InscripcionEntrada } from "../schemas/luchador.ts";

type Props = {
  control: Control<InscripcionEntrada, unknown, Inscripcion>;
  setValue: UseFormSetValue<InscripcionEntrada>;
  validarAlElegir: boolean;
};

/**
 * Mira el peso mientras se escribe (useWatch: solo se re-renderiza este componente, no el formulario)
 * y sugiere la categoría que toca, con un botón para elegirla de un toque.
 */
export function PistaCategoria({ control, setValue, validarAlElegir }: Props) {
  const [peso, categoria] = useWatch({ control, name: ["peso", "categoria"] });
  const kilos = Number(peso);
  const sugerida = peso === "" || Number.isNaN(kilos) ? null : categoriaParaPeso(kilos);

  if (!sugerida) return <>Elige según tu peso: pluma, ligero, medio o pesado.</>;

  const { nombre, min, max } = CATEGORIAS[sugerida];
  return (
    <>
      Con {kilos} kg te toca <strong>{nombre}</strong> ({min}-{max} kg).{" "}
      {categoria !== sugerida && (
        <button
          type="button"
          className="enlace"
          onClick={() => setValue("categoria", sugerida, { shouldValidate: validarAlElegir, shouldDirty: true })}
        >
          Elegir {nombre}
        </button>
      )}
    </>
  );
}
