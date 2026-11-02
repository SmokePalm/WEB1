import { useMemo } from "react";
import Nevera from "./components/Nevera.tsx";
import Resultados from "./components/Resultados.tsx";
import { useLocalStorage } from "./hooks/useLocalStorage.ts";
import { usePeticion } from "./hooks/usePeticion.ts";
import { listarIngredientes } from "./lib/api.ts";
import { buscarRecetas } from "./lib/buscador.ts";
import { leerNevera, nombresDeIngredientes } from "./lib/recetas.ts";

// Fuera del componente: es siempre la misma función, así que solo se pide una vez
const pedirSugerencias = async (signal: AbortSignal) =>
  nombresDeIngredientes(await listarIngredientes(signal));

export default function App() {
  // El único estado de verdad de la app: qué hay en la nevera
  const [nevera, setNevera] = useLocalStorage("que-cocino:nevera", leerNevera);

  // La búsqueda cambia solo cuando cambia la nevera. Con la nevera vacía no hay nada que buscar.
  const tarea = useMemo(
    () => (nevera.length > 0 ? (signal: AbortSignal) => buscarRecetas(nevera, signal) : null),
    [nevera],
  );
  const busqueda = usePeticion(tarea);

  // Las sugerencias son un extra: si fallan, se puede seguir escribiendo el ingrediente a mano
  const sugerencias = usePeticion(pedirSugerencias);
  const nombres = sugerencias.estado === "lista" ? sugerencias.datos : [];

  return (
    <>
      <header className="cabecera">
        <h1>¿Qué cocino?</h1>
        <p>Dime qué tienes en la nevera y te digo qué puedes cocinar con ello.</p>
      </header>

      <main>
        <Nevera
          ingredientes={nevera}
          sugerencias={nombres}
          onAnadir={(ingrediente) => setNevera((actual) => [...actual, ingrediente])}
          onQuitar={(ingrediente) =>
            setNevera((actual) => actual.filter((otro) => otro !== ingrediente))
          }
          onVaciar={() => setNevera([])}
        />
        <Resultados nevera={nevera} busqueda={busqueda} onReintentar={busqueda.reintentar} />
      </main>

      <footer className="pie">
        <p>
          Datos de{" "}
          <a href="https://www.themealdb.com/" target="_blank" rel="noopener noreferrer">
            TheMealDB
          </a>
          .
        </p>
      </footer>
    </>
  );
}
