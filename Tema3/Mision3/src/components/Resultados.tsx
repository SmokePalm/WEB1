import { explicarError } from "../lib/api.ts";
import type { ResultadoBusqueda } from "../lib/tipos.ts";
import type { Peticion } from "../hooks/usePeticion.ts";
import Avisos from "./Avisos.tsx";
import Cargando from "./Cargando.tsx";
import Mensaje from "./Mensaje.tsx";
import Recetario from "./Recetario.tsx";

type ResultadosProps = {
  nevera: string[];
  busqueda: Peticion<ResultadoBusqueda>;
  onReintentar: () => void;
};

function crearAvisos({ fallidos, sinRecetas }: ResultadoBusqueda) {
  return [
    fallidos.length > 0 && `No se ha podido consultar: ${fallidos.join(", ")}.`,
    sinRecetas.length > 0 && `Ninguna receta usa: ${sinRecetas.join(", ")}.`,
  ].filter((aviso) => aviso !== false);
}

// Decide qué estado ve el usuario. La UI sale entera del estado de la búsqueda.
function Contenido({ nevera, busqueda, onReintentar }: ResultadosProps) {
  switch (busqueda.estado) {
    case "inactiva":
      return (
        <Mensaje icono="🧊" variante="inicio">
          <p>La nevera está vacía. Añade algún ingrediente para empezar.</p>
        </Mensaje>
      );

    case "cargando":
      return <Cargando nevera={nevera} />;

    case "error":
      return (
        <Mensaje icono="⚠️" variante="error">
          <p>{explicarError(busqueda.error)}</p>
          <button type="button" onClick={onReintentar}>
            Reintentar
          </button>
        </Mensaje>
      );

    case "lista": {
      const avisos = crearAvisos(busqueda.datos);

      if (busqueda.datos.recetas.length === 0) {
        return (
          <Mensaje icono="🍽️" variante="vacio">
            <p>No hay ninguna receta con eso. Prueba con otro ingrediente.</p>
            <Avisos textos={avisos} />
          </Mensaje>
        );
      }

      return <Recetario recetas={busqueda.datos.recetas} avisos={avisos} />;
    }
  }
}

export default function Resultados(props: ResultadosProps) {
  return (
    <section className="resultados" aria-labelledby="titulo-resultados">
      <h2 id="titulo-resultados">Recetas</h2>
      <div aria-live="polite" aria-busy={props.busqueda.estado === "cargando"}>
        <Contenido {...props} />
      </div>
    </section>
  );
}
