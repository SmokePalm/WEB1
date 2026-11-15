import { useState } from "react";
import { useLuchadores } from "../hooks/useLuchadores.ts";
import { CATEGORIAS, type Categoria } from "../schemas/luchador.ts";
import { Cargando } from "./Cargando.tsx";
import { Descartados } from "./Descartados.tsx";
import { FiltroCategoria } from "./FiltroCategoria.tsx";
import { TarjetaLuchador } from "./TarjetaLuchador.tsx";

type Props = {
  /** Interruptores del laboratorio: viajan en la petición (y por tanto en la query key). */
  sabotaje: boolean;
  caida: boolean;
};

export function Cartel({ sabotaje, caida }: Props) {
  const [categoria, setCategoria] = useState<Categoria | "todas">("todas");
  const cartel = useLuchadores({ categoria, sabotaje, caida });

  return (
    <section className="panel" aria-labelledby="titulo-cartel" aria-busy={cartel.isFetching}>
      <div className="cabecera-panel">
        <h2 id="titulo-cartel">Cartel de luchadores</h2>
        {/* isFetching también es true al refrescar de fondo (tras inscribir o retirar) */}
        {cartel.isFetching && !cartel.isPending && (
          <span className="actualizando" role="status">
            {cartel.failureCount > 0 ? `No responde, reintentando (intento ${cartel.failureCount + 1})…` : "Actualizando…"}
          </span>
        )}
      </div>
      <FiltroCategoria actual={categoria} onCambiar={setCategoria} />

      {cartel.isPending ? (
        <Cargando intentosFallidos={cartel.failureCount} />
      ) : cartel.isError ? (
        <div className="aviso fallo" role="alert">
          <p>{cartel.error.message}</p>
          <button type="button" className="boton-secundario" onClick={() => cartel.refetch()} disabled={cartel.isFetching}>
            {cartel.isFetching ? "Reintentando…" : "Reintentar"}
          </button>
        </div>
      ) : (
        <>
          <Descartados descartados={cartel.data.descartados} />
          {cartel.data.luchadores.length === 0 ? (
            <p className="vacio">
              {categoria === "todas"
                ? "Todavía no hay nadie inscrito. ¡Sé el primero en subir al ring!"
                : `Nadie en ${CATEGORIAS[categoria].nombre} todavía.`}
            </p>
          ) : (
            <>
              <p className="recuento">
                {cartel.data.luchadores.length} {cartel.data.luchadores.length === 1 ? "luchador" : "luchadores"}
              </p>
              <ul className={cartel.isPlaceholderData ? "lista atenuada" : "lista"}>
                {cartel.data.luchadores.map((luchador) => (
                  <TarjetaLuchador key={luchador.id} luchador={luchador} />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  );
}
