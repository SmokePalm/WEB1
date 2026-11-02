export const PREGUNTAS = [
  {
    id: "q1",
    texto: "¿Qué hook añade memoria a un componente?",
    opciones: ["useEffect", "useState", "useRef", "useContext"],
    correcta: 1,
  },
  {
    id: "q2",
    texto: "¿Qué prop necesita cada elemento de una lista creada con .map()?",
    opciones: ["id", "name", "key", "index"],
    correcta: 2,
  },
  {
    id: "q3",
    texto: "¿Cómo añades un elemento a un array del estado sin mutarlo?",
    opciones: [
      "lista.push(nuevo)",
      "setLista([...lista, nuevo])",
      "lista[lista.length] = nuevo",
      "setLista(lista.push(nuevo))",
    ],
    correcta: 1,
  },
  {
    id: "q4",
    texto: "¿Qué devuelve un componente para no pintar nada?",
    opciones: ["undefined", "false", "0", "null"],
    correcta: 3,
  },
];
