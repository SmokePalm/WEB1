import { CATEGORIAS, type Categoria } from "../schemas/luchador.ts";

type Opcion = Categoria | "todas";

type Props = {
  actual: Opcion;
  onCambiar: (categoria: Opcion) => void;
};

const OPCIONES: [Opcion, string][] = [
  ["todas", "Todas"],
  ...Object.entries(CATEGORIAS).map(([clave, { nombre }]) => [clave as Categoria, nombre] as [Opcion, string]),
];

export function FiltroCategoria({ actual, onCambiar }: Props) {
  return (
    <div className="filtro" role="group" aria-label="Filtrar por categoría">
      {OPCIONES.map(([valor, texto]) => (
        <button key={valor} type="button" aria-pressed={actual === valor} onClick={() => onCambiar(valor)}>
          {texto}
        </button>
      ))}
    </div>
  );
}
