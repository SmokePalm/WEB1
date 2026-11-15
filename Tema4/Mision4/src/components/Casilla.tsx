import type { ReactNode } from "react";
import type { FieldError } from "react-hook-form";
import type { AriaCampo } from "./Campo.tsx";

type Props = {
  id: string;
  texto: ReactNode;
  error?: FieldError;
  children: (aria: AriaCampo) => ReactNode;
};

/** Un checkbox con su texto dentro del <label> y su error unido con aria-describedby. */
export function Casilla({ id, texto, error, children }: Props) {
  const idError = `${id}-error`;
  return (
    <div className="campo">
      <label className="opcion casilla">
        {children({ id, "aria-invalid": Boolean(error), "aria-describedby": error ? idError : undefined })}
        {texto}
      </label>
      {error && (
        <p id={idError} className="error" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}
