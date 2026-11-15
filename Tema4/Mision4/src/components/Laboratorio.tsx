type Props = {
  sabotaje: boolean;
  caida: boolean;
  onSabotaje: (activo: boolean) => void;
  onCaida: (activo: boolean) => void;
};

/** Interruptores para probar la app contra un API que se porta mal. */
export function Laboratorio({ sabotaje, caida, onSabotaje, onCaida }: Props) {
  return (
    <section className="panel laboratorio" aria-labelledby="titulo-laboratorio">
      <h2 id="titulo-laboratorio">🧪 Laboratorio de sabotaje</h2>
      <p className="entradilla">Para probar qué pasa cuando el servidor falla. No toca los datos guardados.</p>
      <label className="opcion interruptor">
        <input type="checkbox" checked={sabotaje} onChange={(e) => onSabotaje(e.target.checked)} />
        <span>
          <strong>Datos corruptos</strong>: el API cuela 4 registros rotos en la lista (peso «ochenta», categoría que no
          existe, 120 kg en pluma…). Zod los atrapa con <code>safeParse</code>.
        </span>
      </label>
      <label className="opcion interruptor">
        <input type="checkbox" checked={caida} onChange={(e) => onCaida(e.target.checked)} />
        <span>
          <strong>Servidor caído</strong>: la lista responde 503. TanStack Query reintenta dos veces y luego enseña el
          error con «Reintentar».
        </span>
      </label>
    </section>
  );
}
