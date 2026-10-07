import Boton from "./components/button.tsx";
import Esclusa from "./components/esclusa.tsx";
import Ranking from "./components/ranking.tsx";
import Saludo from "./components/saludo.tsx";

const RANKING = [
  { id: "a1", jugador: "NOVA", puntos: 9800 },
  { id: "b2", jugador: "PIXEL", puntos: 8650 },
  { id: "c3", jugador: "KIRA", puntos: 7400 },
  { id: "d4", jugador: "BYTE", puntos: 5200 },
];

export default function App() {
  return (
    <>
      <Saludo nombre="Ada" />
      <Boton />
      <Esclusa abierta={true} avisos={2} />
      <Esclusa abierta={false} avisos={0} />
      <Esclusa abierta={true} avisos={0} />
      <Ranking ranking={RANKING} />
    </>
  );
}
