import { Request, Response } from "express";
import { Predicciones } from "../Database/Models/Predicciones";
import { Productos } from "../Database/Models/Productos";

const PrediccionesController = {
  // Obtener todas las predicciones con datos del producto asociado
  leerPredicciones: async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const predicciones = await Predicciones.findAll({
        include: [{ model: Productos, attributes: ["nombre", "codigoSAP", "categoria", "precioCompra", "estado"] }],
        order: [["fecha_prediccion", "DESC"]],
      });

      return res.status(200).json({
        message: "Predicciones obtenidas exitosamente",
        predicciones,
      });
    } catch (error) {
      console.error("Error al obtener predicciones:", error);
      return res.status(500).json({ message: "Error interno del servidor", error });
    }
  },

  // Obtener predicciones por idProducto
  leerPrediccionesPorProducto: async (req: Request, res: Response): Promise<Response | void> => {
    const { idProducto } = req.body;

    if (!idProducto) {
      return res.status(400).json({ message: "Se requiere idProducto" });
    }

    try {
      // Verificar que el producto exista
      const producto = await Productos.findByPk(idProducto);
      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      // Obtener las predicciones del producto
      const predicciones = await Predicciones.findAll({
        where: { idProducto },
        include: [{ model: Productos, attributes: ["nombre", "codigoSAP", "categoria", "precioCompra", "estado"] }],
        order: [["fecha_prediccion", "DESC"]],
      });

      return res.status(200).json({
        message: "Predicciones obtenidas exitosamente",
        predicciones,
      });
    } catch (error) {
      console.error("Error al obtener predicciones del producto:", error);
      return res.status(500).json({ message: "Error interno del servidor", error });
    }
  },
};

export default PrediccionesController;
