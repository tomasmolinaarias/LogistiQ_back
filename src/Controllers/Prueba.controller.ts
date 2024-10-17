import { Request, Response } from "express";

const Prueba = {
  leer: async (req: Request, res: Response): Promise<Response | void> => {
    try {
      console.log("Ruta de prueba ejecutad XDDDD 🟢");
      return res.send("Ruta de prueba ejecutada correctamente 🟢");
    } catch (error) {
      console.error("Error ", error);
      return res.status(500).json({
        error: "Error en la ruta de prueba",
      });
    }
  },
};

export default Prueba;
