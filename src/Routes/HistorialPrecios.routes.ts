import { Router } from "express";
import HistorialPreciosController from "../Controllers/HistorialPrecios.controller";
import validador  from '../Middlewares/auth.middleware'; // Middleware para validar el token

const router: Router = Router();

// Ruta para obtener el historial completo de precios
router.get("/priceHistory", validador.token,async (req, res, next) => {
  try {
    await HistorialPreciosController.leerHistorial(req, res);
  } catch (error) {
    next(error);
  }
});

// Ruta para obtener el historial de precios por producto
router.post("/priceHistoryByProduct", validador.token,async (req, res, next) => {
  try {
    await HistorialPreciosController.leerHistorialPorProducto(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
