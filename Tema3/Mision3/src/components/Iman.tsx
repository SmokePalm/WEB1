type ImanProps = {
  ingrediente: string;
  onQuitar: (ingrediente: string) => void;
};

// Cada ingrediente es un imán pegado en la puerta de la nevera
export default function Iman({ ingrediente, onQuitar }: ImanProps) {
  return (
    <li className="iman">
      <span>{ingrediente}</span>
      <button type="button" aria-label={`Quitar ${ingrediente}`} onClick={() => onQuitar(ingrediente)}>
        ×
      </button>
    </li>
  );
}
