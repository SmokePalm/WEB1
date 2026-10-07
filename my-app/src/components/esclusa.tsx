type EsclusaProps = {
  abierta: boolean;
  avisos: number;
};

export default function Esclusa({ abierta, avisos }: EsclusaProps) {
  return (
    <div>
      <p>{abierta ? "Esclusa abierta" : "Esclusa cerrada"}</p>
      {/* avisos > 0 y no solo avisos: con 0, React pintaría un "0" suelto */}
      {avisos > 0 && <p>⚠️ Tienes {avisos} avisos pendientes</p>}
    </div>
  );
}
