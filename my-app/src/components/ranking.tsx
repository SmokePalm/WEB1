type Puesto = {
  id: string;
  jugador: string;
  puntos: number;
};

type RankingProps = {
  ranking: Puesto[];
};

export default function Ranking({ ranking }: RankingProps) {
  return (
    <ol>
      {ranking.map((puesto) => (
        <li key={puesto.id}>
          {puesto.jugador} — {puesto.puntos}
          {puesto.puntos > 8000 && ""}
        </li>
      ))}
    </ol>
  );
}
