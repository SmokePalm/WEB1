import type { ReactNode } from "react";
import type { FieldError } from "react-hook-form";

type Props = {
  nombre: string;
  leyenda: string;
  opciones: Record<string, string>;
  error?: FieldError;
  /** Pinta el radio de cada opción; recibe el valor y los atributos de accesibilidad ya calculados. */
  children: (valor: string, aria: { "aria-invalid": boolean; "aria-describedby"?: string }) => ReactNode;
};

/** Radios agrupados en <fieldset> + <legend>, con el error unido a cada opción. */
export function GrupoOpciones({ nombre, leyenda, opciones, error, children }: Props) {
  const idError = `${nombre}-error`;
  const aria = { "aria-invalid": Boolean(error), "aria-describedby": error ? idError : undefined };
  return (
    <fieldset className="campo grupo">
      <legend>{leyenda}</legend>
      <div className="opciones">
        {Object.entries(opciones).map(([valor, texto]) => (
          <label key={valor} className="opcion">
            {children(valor, aria)}
            {texto}
          </label>
        ))}
      </div>
      {error && (
        <p id={idError} className="error" role="alert">
          {error.message}
        </p>
      )}
    </fieldset>
  );
}
