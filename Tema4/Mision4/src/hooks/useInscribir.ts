import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inscribirLuchador } from "../services/luchadores.ts";
import { clavesLuchadores } from "./claves.ts";

/** POST de una inscripción. Al terminar bien, invalida todas las listas para que aparezca el nuevo. */
export function useInscribir() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inscribirLuchador,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clavesLuchadores.todas }),
  });
}
