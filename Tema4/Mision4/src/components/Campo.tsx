import type { ReactNode } from "react";
import type { FieldError } from "react-hook-form";

/** Atributos que el input necesita para quedar unido a su etiqueta, su pista y su error. */
export type AriaCampo = {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
};

type Props = {
  id: string;
  etiqueta: string;
  error?: FieldError;
  pista?: ReactNode;
  opcional?: boolean;
  /** Recibe los atributos de accesibilidad ya calculados: no hay que acordarse de ponerlos a mano. */
  children: (aria: AriaCampo) => ReactNode;
};

/**
 * Un campo del formulario: <label htmlFor> + input + pista + error.
 * El error lleva role="alert" (se anuncia al aparecer) y el input apunta a él con aria-describedby.
 */
export function Campo({ id, etiqueta, error, pista, opcional = false, children }: Props) {
  const idPista = `${id}-pista`;
  const idError = `${id}-error`;
  const describe = [pista ? idPista : null, error ? idError : null].filter(Boolean).join(" ");

  return (
    <div className="campo">
      <label htmlFor={id}>
        {etiqueta}
        {opcional && <span className="opcional"> (opcional)</span>}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describe || undefined })}
      {pista && (
        <p id={idPista} className="pista">
          {pista}
        </p>
      )}
      {error && (
        <p id={idError} className="error" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}
