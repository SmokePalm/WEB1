import { useState } from "react";

type FotoRecetaProps = {
  foto: string;
  nombre: string;
};

export default function FotoReceta({ foto, nombre }: FotoRecetaProps) {
  // Si la foto no carga se deja de pintar y queda el hueco con su fondo
  const [rota, setRota] = useState(false);

  return (
    <div className="receta__foto">
      {foto && !rota && <img src={foto} alt={nombre} loading="lazy" onError={() => setRota(true)} />}
    </div>
  );
}
