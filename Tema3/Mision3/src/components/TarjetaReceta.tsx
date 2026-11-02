import type { Receta } from "../lib/tipos.ts";
import DetalleReceta from "./DetalleReceta.tsx";
import FotoReceta from "./FotoReceta.tsx";

type TarjetaRecetaProps = {
  receta: Receta;
};

export default function TarjetaReceta({ receta }: TarjetaRecetaProps) {
  const etiquetas = [receta.categoria, receta.cocina].filter(Boolean).join(" · ");

  return (
    <li className="receta">
      <FotoReceta foto={receta.foto} nombre={receta.nombre} />
      <div className="receta__cuerpo">
        <h3>{receta.nombre}</h3>
        <p className="receta__etiquetas">{etiquetas}</p>
        <p className="receta__usa">
          Usa {receta.coincidencias.length} de tus ingredientes: {receta.coincidencias.join(", ")}
        </p>
        {receta.sinDetalle ? (
          <p className="aviso">No se ha podido cargar el detalle de esta receta.</p>
        ) : (
          <DetalleReceta
            ingredientes={receta.ingredientes}
            faltan={receta.faltan}
            pasos={receta.pasos}
            video={receta.video}
          />
        )}
      </div>
    </li>
  );
}
