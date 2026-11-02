import type { ReactNode } from "react";

type MensajeProps = {
  icono: string;
  variante: "inicio" | "error" | "vacio";
  children: ReactNode;
};

// La caja centrada que ocupa los resultados cuando no hay recetas que enseñar
export default function Mensaje({ icono, variante, children }: MensajeProps) {
  return (
    <div className={`mensaje mensaje--${variante}`}>
      <p className="mensaje__icono" aria-hidden="true">
        {icono}
      </p>
      {children}
    </div>
  );
}
