const ESQUELETOS = [1, 2, 3, 4, 5, 6];

type CargandoProps = {
  nevera: string[];
};

// Tarjetas grises que laten mientras llegan los datos
export default function Cargando({ nevera }: CargandoProps) {
  return (
    <>
      <p className="cargando">Buscando recetas con {nevera.join(", ")}…</p>
      <ul className="recetas">
        {ESQUELETOS.map((numero) => (
          <li key={numero} className="receta receta--esqueleto" aria-hidden="true" />
        ))}
      </ul>
    </>
  );
}
