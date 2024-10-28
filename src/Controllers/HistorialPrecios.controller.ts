import { Request, Response } from "express";
import { HistorialPrecios } from "../Database/Models/HistorialPrecios";
import { Productos } from "../Database/Models/Productos";

const HistorialPreciosController = {
  // Obtener el historial completo de precios
  leerHistorial: async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const historial = await HistorialPrecios.findAll({
        include: [{ model: Productos, attributes: ["nombre", "codigoSAP"] }],
        order: [["fecha_registro", "DESC"]],
      });
      return res.status(200).json({
        message: "Historial de precios obtenido exitosamente",
        historial,
      });
    } catch (error) {
      console.error("Error al obtener historial de precios:", error);
      return res.status(500).json({ message: "Error interno del servidor", error });
    }
  },

  // Obtener el historial de precios por producto
  leerHistorialPorProducto: async (req: Request, res: Response): Promise<Response | void> => {
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

      // Obtener el historial de precios del producto
      const historial = await HistorialPrecios.findAll({
        where: { idProducto },
        include: [{ model: Productos, attributes: ["nombre", "codigoSAP"] }],
        order: [["fecha_registro", "DESC"]]
      });

      return res.status(200).json({
        message: "Historial de precios obtenido exitosamente",
        historial
      });
    } catch (error) {
      console.error("Error al obtener el historial de precios:", error);
      return res.status(500).json({ message: "Error interno del servidor", error });
    }
  },
};

export default HistorialPreciosController;
