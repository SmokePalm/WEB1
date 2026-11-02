// Formas de los datos que circulan por la app, ya limpios (nada de lo crudo de la API).

// Una fila tal cual llega de TheMealDB: no nos fiamos de ningún campo
export type Fila = Record<string, unknown>;

export type Candidata = {
  id: string;
  nombre: string;
  foto: string;
  coincidencias: string[]; // ingredientes de la nevera que la han encontrado
};

export type IngredienteReceta = {
  hueco: number; // posición 1…20 en la API: sirve de key estable
  nombre: string;
  cantidad: string;
  loTengo: boolean;
};

export type Paso = {
  numero: number;
  texto: string;
};

export type Receta = Candidata & {
  sinDetalle: boolean;
  categoria: string;
  cocina: string;
  pasos: Paso[];
  video: string;
  ingredientes: IngredienteReceta[];
  faltan: string[];
};

export type ResultadoBusqueda = {
  recetas: Receta[];
  fallidos: string[]; // ingredientes cuya petición ha fallado
  sinRecetas: string[]; // ingredientes que no aparecen en ninguna receta
};
