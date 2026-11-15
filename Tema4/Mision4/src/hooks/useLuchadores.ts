import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { obtenerLuchadores, type FiltroLuchadores } from "../services/luchadores.ts";
import { clavesLuchadores } from "./claves.ts";

/**
 * Lista de luchadores para un filtro. La key y la función se construyen juntas aquí dentro,
 * así que es imposible pedir una cosa y guardarla en la caché con la key de otra.
 */
export function useLuchadores(filtro: FiltroLuchadores) {
  return useQuery({
    queryKey: clavesLuchadores.lista(filtro),
    queryFn: ({ signal }) => obtenerLuchadores(filtro, signal),
    // Al cambiar de categoría se sigue viendo la lista anterior (atenuada) hasta que llega la nueva.
    placeholderData: keepPreviousData,
  });
}
