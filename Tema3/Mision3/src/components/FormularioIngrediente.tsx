import { useId, useState, type FormEvent } from "react";
import { comprobarIngrediente, normalizarIngrediente } from "../lib/recetas.ts";

type FormularioIngredienteProps = {
  nevera: string[];
  sugerencias: string[];
  onAnadir: (ingrediente: string) => void;
};

export default function FormularioIngrediente({
  nevera,
  sugerencias,
  onAnadir,
}: FormularioIngredienteProps) {
  const [texto, setTexto] = useState("");
  const [aviso, setAviso] = useState("");
  const id = useId();

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const ingrediente = normalizarIngrediente(texto);
    const problema = comprobarIngrediente(nevera, ingrediente);

    setAviso(problema);
    if (problema) return;

    onAnadir(ingrediente);
    setTexto("");
  }

  return (
    <form className="formulario" autoComplete="off" onSubmit={enviar}>
      <label htmlFor={`${id}-campo`}>Ingrediente (en inglés, la API no habla otro idioma)</label>
      <div className="formulario__fila">
        <input
          id={`${id}-campo`}
          type="text"
          list={`${id}-sugerencias`}
          placeholder="chicken, rice, egg…"
          maxLength={40}
          value={texto}
          onChange={(evento) => {
            setTexto(evento.target.value);
            setAviso("");
          }}
        />
        <button type="submit">Añadir</button>
      </div>
      <datalist id={`${id}-sugerencias`}>
        {sugerencias.map((nombre) => (
          <option key={nombre} value={nombre} />
        ))}
      </datalist>
      <p className="formulario__aviso" role="alert">
        {aviso}
      </p>
    </form>
  );
}
