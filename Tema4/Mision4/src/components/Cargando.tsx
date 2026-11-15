/** Tres tarjetas grises mientras llega el cartel. */
export function Cargando({ intentosFallidos }: { intentosFallidos: number }) {
  return (
    <div className="cargando" role="status">
      <p>{intentosFallidos > 0 ? `El servidor no responde. Reintentando (intento ${intentosFallidos + 1})…` : "Cargando el cartel…"}</p>
      <ul className="lista" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <li key={n} className="tarjeta esqueleto" />
        ))}
      </ul>
    </div>
  );
}
