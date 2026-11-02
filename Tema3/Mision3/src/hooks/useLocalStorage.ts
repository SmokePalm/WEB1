import { useEffect, useState } from "react";

// Como useState, pero el valor sobrevive a recargar la página.
// "leer" valida lo guardado: localStorage puede traer cualquier cosa (o nada).
export function useLocalStorage<T>(clave: string, leer: (guardado: unknown) => T) {
  // Inicialización perezosa: localStorage solo se lee en el primer render, no en cada uno
  const [valor, setValor] = useState(() => leer(cargar(clave)));

  // localStorage es un sistema externo a React: sincronizarlo es justo el trabajo de un efecto
  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
    } catch {
      // Sin almacenamiento (modo privado, cuota llena) la app funciona igual, solo no recuerda
    }
  }, [clave, valor]);

  return [valor, setValor] as const;
}

function cargar(clave: string): unknown {
  try {
    const texto = localStorage.getItem(clave);
    return texto === null ? null : JSON.parse(texto);
  } catch {
    return null;
  }
}
