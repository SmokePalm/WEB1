type AvisosProps = {
  textos: string[];
};

export default function Avisos({ textos }: AvisosProps) {
  return textos.map((texto) => (
    <p key={texto} className="aviso">
      {texto}
    </p>
  ));
}
