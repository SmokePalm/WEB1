/** Años cumplidos en `hoy` por alguien nacido en `fechaIso` (AAAA-MM-DD). */
export function edadEn(fechaIso: string, hoy: Date = new Date()): number {
  const [anio, mes, dia] = fechaIso.split("-").map(Number);
  let edad = hoy.getFullYear() - anio;
  const yaCumplio =
    hoy.getMonth() + 1 > mes || (hoy.getMonth() + 1 === mes && hoy.getDate() >= dia);
  if (!yaCumplio) edad -= 1;
  return edad;
}
