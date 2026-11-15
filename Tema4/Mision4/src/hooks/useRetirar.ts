import { useMutation, useQueryClient } from "@tanstack/react-query";
import { retirarLuchador } from "../services/luchadores.ts";
import { clavesLuchadores } from "./claves.ts";

/** DELETE de un luchador. Cada tarjeta tiene el suyo, así cada una sabe si se está retirando. */
export function useRetirar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: retirarLuchador,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clavesLuchadores.todas }),
  });
}
