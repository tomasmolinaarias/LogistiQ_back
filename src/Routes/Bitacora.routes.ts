// Bitacora.routes.ts
import { Router } from "express";
import { Bitacora } from "../Database/Models/Bitacora";
import validador from "../Middlewares/auth.middleware";

const router: Router = Router();

// Ruta para obtener los registros de la bitácora
router.get("/log", validador.token, async (req, res, next) => { // Agregamos 'next' como parámetro
  try {
    const registros = await Bitacora.findAll({
      order: [["fecha", "DESC"]],
    });
    res.status(200).json({
      message: "Registros de la bitácora obtenidos exitosamente",
      registros,
    });
  } catch (error) {
    console.error("Error al obtener bitácora:", error);
    next(error); // Llamamos a 'next' en lugar de retornar
  }
});

export default router;
