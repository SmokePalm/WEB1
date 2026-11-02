// El porcentaje y el mensaje se derivan de puntos: no se guardan en estado
function mensajePara(porcentaje) {
  if (porcentaje === 100) return "¡Pleno! Eres un crack de React 🏆";
  if (porcentaje >= 75) return "¡Muy bien! Casi perfecto 💪";
  if (porcentaje >= 50) return "No está mal, pero se puede mejorar 🙂";
  return "Toca repasar el cuaderno 📚";
}

export default function Resultado({ puntos, total, onReiniciar }) {
  const porcentaje = Math.round((puntos / total) * 100);

  return (
    <section className="quiz resultado">
      <h2>Resultado</h2>
      <p className="resultado-puntos">
        {puntos} de {total} aciertos
      </p>
      <p className="resultado-porcentaje">{porcentaje}%</p>
      <p className="resultado-mensaje">{mensajePara(porcentaje)}</p>
      <button type="button" className="boton-principal" onClick={onReiniciar}>
        Jugar otra vez
      </button>
    </section>
  );
}
