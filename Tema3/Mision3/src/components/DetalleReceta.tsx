import type { Receta } from "../lib/tipos.ts";

type DetalleRecetaProps = Pick<Receta, "ingredientes" | "faltan" | "pasos" | "video">;

function resumirFaltan(total: number, faltan: number) {
  if (total === 0) return "Ver la receta";
  if (faltan === 0) return "¡Lo tienes todo!";
  return `Te faltan ${faltan} de ${total} ingredientes`;
}

export default function DetalleReceta({ ingredientes, faltan, pasos, video }: DetalleRecetaProps) {
  return (
    <details>
      <summary>{resumirFaltan(ingredientes.length, faltan.length)}</summary>

      {ingredientes.length > 0 ? (
        <ul className="receta__ingredientes">
          {ingredientes.map(({ hueco, nombre, cantidad, loTengo }) => (
            <li key={hueco} className={loTengo ? "lo-tengo" : undefined}>
              {[cantidad, nombre].filter(Boolean).join(" ")}
            </li>
          ))}
        </ul>
      ) : (
        <p>La receta no trae lista de ingredientes.</p>
      )}

      {pasos.length > 0 ? (
        <ol className="receta__pasos">
          {pasos.map(({ numero, texto }) => (
            <li key={numero}>{texto}</li>
          ))}
        </ol>
      ) : (
        <p>La receta no trae instrucciones.</p>
      )}

      {video && (
        <a href={video} target="_blank" rel="noopener noreferrer">
          Ver el vídeo
        </a>
      )}
    </details>
  );
}
