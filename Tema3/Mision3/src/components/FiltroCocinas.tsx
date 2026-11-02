import { TODAS } from "../lib/recetas.ts";

type FiltroCocinasProps = {
  conteo: [string, number][];
  activa: string;
  onCambiar: (cocina: string) => void;
};

export default function FiltroCocinas({ conteo, activa, onCambiar }: FiltroCocinasProps) {
  // Con una sola cocina no hay nada que filtrar
  if (conteo.length < 2) return null;

  const total = conteo.reduce((suma, [, cuantas]) => suma + cuantas, 0);
  const opciones: [string, number][] = [[TODAS, total], ...conteo];

  return (
    <div className="cocinas" role="group" aria-label="Filtrar por cocina">
      {opciones.map(([cocina, cuantas]) => (
        <button
          key={cocina}
          type="button"
          className="cocina"
          aria-pressed={cocina === activa}
          onClick={() => onCambiar(cocina)}
        >
          {cocina} ({cuantas})
        </button>
      ))}
    </div>
  );
}
