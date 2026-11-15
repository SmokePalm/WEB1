import { useState } from "react";
import { useRetirar } from "../hooks/useRetirar.ts";
import { edadEn } from "../lib/edad.ts";
import { CATEGORIAS, DISCIPLINAS, NIVELES, type Luchador } from "../schemas/luchador.ts";

export function TarjetaLuchador({ luchador }: { luchador: Luchador }) {
  const retirar = useRetirar();
  const [confirmando, setConfirmando] = useState(false);
  const { id, dorsal, nombre, alias, peso, categoria, disciplina, nivel, fechaNacimiento } = luchador;

  return (
    <li className={`tarjeta categoria-${categoria}`} aria-busy={retirar.isPending}>
      <span className="dorsal" aria-label={`Dorsal ${dorsal}`}>
        #{dorsal}
      </span>
      <div className="tarjeta-cuerpo">
        <h3>
          {nombre}
          {alias && <span className="alias"> «{alias}»</span>}
        </h3>
        <p className="datos">
          <span className="chip">{CATEGORIAS[categoria].nombre} · {peso} kg</span>
          <span className="chip">{DISCIPLINAS[disciplina]}</span>
          <span className="chip">{NIVELES[nivel].split(" (")[0]}</span>
          <span className="chip">{edadEn(fechaNacimiento)} años</span>
        </p>
        {retirar.isError && (
          <p className="error" role="alert">
            No se pudo retirar: {retirar.error.message}
          </p>
        )}
      </div>

      <div className="acciones">
        {retirar.isPending ? (
          <span className="retirando">Retirando…</span>
        ) : confirmando ? (
          <>
            <span className="pregunta">¿Retirar a {alias || nombre}?</span>
            <button type="button" className="boton-peligro" onClick={() => retirar.mutate(id)}>
              Sí, retirar
            </button>
            <button type="button" className="boton-secundario" onClick={() => setConfirmando(false)}>
              No
            </button>
          </>
        ) : (
          <button type="button" className="boton-secundario" onClick={() => setConfirmando(true)}>
            Retirar
          </button>
        )}
      </div>
    </li>
  );
}
