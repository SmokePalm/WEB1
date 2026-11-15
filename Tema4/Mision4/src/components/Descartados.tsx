import type { Descartado } from "../services/luchadores.ts";

/** ★ Bonus: lo que el API mandó y Zod (safeParse) no dejó pasar, con el motivo. */
export function Descartados({ descartados }: { descartados: Descartado[] }) {
  if (descartados.length === 0) return null;

  const n = descartados.length;
  return (
    <details className="descartados">
      <summary>
        🛡️ Zod ha bloqueado {n} {n === 1 ? "registro corrupto" : "registros corruptos"} del API
      </summary>
      <p>
        Llegaron en la respuesta, pero no cumplen <code>luchadorSchema</code>. En vez de romper la pantalla o
        pintar datos absurdos, se apartan aquí.
      </p>
      <ol>
        {descartados.map(({ posicion, recibido, motivos }) => (
          <li key={posicion}>
            <p>
              Registro {posicion + 1} de la respuesta:
            </p>
            <pre>{JSON.stringify(recibido)}</pre>
            <ul>
              {motivos.map((motivo) => (
                <li key={motivo}>{motivo}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </details>
  );
}
