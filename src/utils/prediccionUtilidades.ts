const Prediccion = {
    metodoholt: async (precios: number[], alpha: number, beta: number): Promise<number> => {
      if (precios.length < 2) throw new Error("Se necesitan al menos dos datos para el método de Holt");
  
      let nivel = precios[0];
      let tendencia = precios[1] - precios[0];
      for (let i = 1; i < precios.length; i++) {
        let valorActual = precios[i];
        let nuevoNivel = alpha * valorActual + (1 - alpha) * (nivel + tendencia);
        let nuevaTendencia = beta * (nuevoNivel - nivel) + (1 - beta) * tendencia;
  
        nivel = nuevoNivel;
        tendencia = nuevaTendencia;
      }
  
      return nivel + tendencia; // Predicción para el siguiente período
    },
  
    prediccionBrown: async (precios: number[], alpha: number): Promise<number> => {
      if (precios.length === 0) throw new Error("Se necesita al menos un dato para el método de Brown");
  
      let suavizado = precios[0];
      for (let i = 1; i < precios.length; i++) {
        suavizado = alpha * precios[i] + (1 - alpha) * suavizado;
      }
  
      return suavizado; // Predicción para el siguiente período
    },
  };
  
  export default Prediccion;
  