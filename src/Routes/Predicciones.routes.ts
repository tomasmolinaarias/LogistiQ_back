import { Router } from "express";
import PrediccionesController from "../Controllers/Predicciones.controller";
import validador  from '../Middlewares/auth.middleware'; // Middleware para validar el token

const router: Router = Router();

router.get("/getAllPredictions", validador.token, (req, res, next) => {
  PrediccionesController.leerPredicciones(req, res).catch(next);
});

router.post("/getPredictionsByProduct", validador.token, (req, res, next) => {
  PrediccionesController.leerPrediccionesPorProducto(req, res).catch(next);
});

export default router;
