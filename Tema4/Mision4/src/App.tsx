import { useState } from "react";
import { Cartel } from "./components/Cartel.tsx";
import { FormularioInscripcion } from "./components/FormularioInscripcion.tsx";
import { Laboratorio } from "./components/Laboratorio.tsx";

export default function App() {
  // El único estado de App: los interruptores del laboratorio. Los datos del servidor viven en TanStack Query.
  const [sabotaje, setSabotaje] = useState(false);
  const [caida, setCaida] = useState(false);

  return (
    <>
      <header className="cabecera">
        <p className="antetitulo">Torneo de artes marciales · U-tad · 2026</p>
        <h1>🥊 Full Contact</h1>
        <p className="lema">«Valida o muere.»</p>
      </header>

      <main className="rejilla">
        <FormularioInscripcion />
        <Cartel sabotaje={sabotaje} caida={caida} />
        <Laboratorio sabotaje={sabotaje} caida={caida} onSabotaje={setSabotaje} onCaida={setCaida} />
      </main>
    </>
  );
}
