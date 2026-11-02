import { useState } from "react";
import { TODAS, contarPorCocina, filtrarPorCocina } from "../lib/recetas.ts";
import type { Receta } from "../lib/tipos.ts";
import Avisos from "./Avisos.tsx";
import FiltroCocinas from "./FiltroCocinas.tsx";
import TarjetaReceta from "./TarjetaReceta.tsx";

type RecetarioProps = {
  recetas: Receta[];
  avisos: string[];
};

// Solo se monta cuando hay recetas. Cada búsqueda nueva pasa por "cargando", que lo
// desmonta, así que el filtro vuelve solo a "Todas" sin ningún efecto que lo reinicie.
export default function Recetario({ recetas, avisos }: RecetarioProps) {
  const [cocina, setCocina] = useState(TODAS);

  // Todo lo demás se deriva de las props y del filtro: no se guarda en el estado
  const conteo = contarPorCocina(recetas);
  const visibles = filtrarPorCocina(recetas, cocina);

  return (
    <>
      <FiltroCocinas conteo={conteo} activa={cocina} onCambiar={setCocina} />
      <Avisos textos={avisos} />
      <ul className="recetas">
        {visibles.map((receta) => (
          <TarjetaReceta key={receta.id} receta={receta} />
        ))}
      </ul>
    </>
  );
}
