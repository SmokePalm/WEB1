import { useState } from "react";
import { PREGUNTAS } from "./preguntas.js";
import Resultado from "./Resultado.jsx";
import "./quiz.css";

// Devuelve una copia desordenada (Fisher-Yates) sin tocar la lista original
function barajar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export default function Quiz() {
  const [preguntas, setPreguntas] = useState(() => barajar(PREGUNTAS));
  const [indice, setIndice] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [seleccion, setSeleccion] = useState(null);
  const [racha, setRacha] = useState(0);

  const total = preguntas.length;

  function reiniciar() {
    setPreguntas(barajar(PREGUNTAS));
    setIndice(0);
    setPuntos(0);
    setSeleccion(null);
    setRacha(0);
  }

  // Pantalla final: cuando el índice se sale de la lista
  if (indice >= total) {
    return <Resultado puntos={puntos} total={total} onReiniciar={reiniciar} />;
  }

  const pregunta = preguntas[indice];
  const respondida = seleccion !== null;
  const esUltima = indice === total - 1;

  function responder(i) {
    if (respondida) return;
    setSeleccion(i);
    if (i === pregunta.correcta) {
      setPuntos(puntos + 1);
      setRacha(racha + 1);
    } else {
      setRacha(0);
    }
  }

  function siguiente() {
    setIndice(indice + 1);
    setSeleccion(null);
  }

  // La clase de cada botón se calcula en el render a partir de seleccion
  function claseOpcion(i) {
    if (!respondida) return "opcion";
    if (i === pregunta.correcta) return "opcion correcta";
    if (i === seleccion) return "opcion incorrecta";
    return "opcion apagada";
  }

  return (
    <section className="quiz">
      <header className="quiz-cabecera">
        <span>
          Pregunta {indice + 1} de {total}
        </span>
        <span>
          {racha >= 2 && <span className="racha">🔥 {racha} seguidas · </span>}
          {puntos} {puntos === 1 ? "punto" : "puntos"}
        </span>
      </header>

      <div className="progreso">
        <div
          className="progreso-barra"
          style={{ width: `${(indice / total) * 100}%` }}
        />
      </div>

      <h2 className="quiz-pregunta">{pregunta.texto}</h2>

      <div className="opciones">
        {pregunta.opciones.map((opcion, i) => (
          <button
            key={opcion}
            type="button"
            className={claseOpcion(i)}
            onClick={() => responder(i)}
            disabled={respondida}
          >
            {opcion}
          </button>
        ))}
      </div>

      {respondida && (
        <div className="quiz-pie">
          <p className="feedback">
            {seleccion === pregunta.correcta ? "¡Correcto!" : "¡Casi! Era la verde."}
          </p>
          <button type="button" className="boton-principal" onClick={siguiente}>
            {esUltima ? "Ver resultado" : "Siguiente"}
          </button>
        </div>
      )}
    </section>
  );
}
