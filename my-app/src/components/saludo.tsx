// Lo habitual: desestructurar en los parámetros y tipar las props
type SaludoProps = {
  nombre: string;
};

export default function Saludo({ nombre }: SaludoProps) {
  return <p>Hola, {nombre}</p>;
}
