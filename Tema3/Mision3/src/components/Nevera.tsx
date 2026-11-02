import { MAX_INGREDIENTES } from "../lib/recetas.ts";
import FormularioIngrediente from "./FormularioIngrediente.tsx";
import Iman from "./Iman.tsx";

type NeveraProps = {
  ingredientes: string[];
  sugerencias: string[];
  onAnadir: (ingrediente: string) => void;
  onQuitar: (ingrediente: string) => void;
  onVaciar: () => void;
};

export default function Nevera({
  ingredientes,
  sugerencias,
  onAnadir,
  onQuitar,
  onVaciar,
}: NeveraProps) {
  return (
    <section className="nevera" aria-labelledby="titulo-nevera">
      <div className="nevera__cabecera">
        <h2 id="titulo-nevera">
          Tu nevera{" "}
          <span className="nevera__contador">
            {ingredientes.length}/{MAX_INGREDIENTES}
          </span>
        </h2>
        {ingredientes.length > 0 && (
          <button type="button" className="nevera__vaciar" onClick={onVaciar}>
            Vaciar
          </button>
        )}
      </div>

      <FormularioIngrediente nevera={ingredientes} sugerencias={sugerencias} onAnadir={onAnadir} />

      <ul className="imanes" aria-label="Ingredientes en tu nevera">
        {/* El ingrediente sirve de key: la nevera nunca tiene dos iguales */}
        {ingredientes.map((ingrediente) => (
          <Iman key={ingrediente} ingrediente={ingrediente} onQuitar={onQuitar} />
        ))}
      </ul>
    </section>
  );
}
