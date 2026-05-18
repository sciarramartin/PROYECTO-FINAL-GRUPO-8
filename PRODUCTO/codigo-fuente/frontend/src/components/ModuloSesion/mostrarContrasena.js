import { useState } from "react";

export const useMostrarContraseña = () => {
  const [mostrarContraseña, setMostrarContraseña] = useState(false);

  // función para alternar entre true y false
  const alternarVisibilidad = () => {
    setMostrarContraseña(!mostrarContraseña);
  };

  // Exportamos tanto el valor actual como la función para cambiarlo
  return {
    mostrarContraseña,
    alternarVisibilidad,
  };
};