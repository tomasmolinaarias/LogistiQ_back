import { Request, Response } from "express";
import { Bitacora } from "../Database/Models/Bitacora";
import { Usuarios } from "../Database/Models/Usuarios";

const BitacoraController = {
  getAllLogs: async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const logs = await Bitacora.findAll({
        include: [
          {
            model: Usuarios,
            attributes: ["nombre", "email", "dni"], // Selecciona solo los campos que quieras mostrar
          },
        ],
        order: [["fecha", "DESC"]],
      });

      return res.status(200).json({
        message: "Registros de bitácora obtenidos exitosamente",
        logs,
      });
    } catch (error) {
      console.error("Error al obtener registros de bitácora:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  },
};

export default BitacoraController;
