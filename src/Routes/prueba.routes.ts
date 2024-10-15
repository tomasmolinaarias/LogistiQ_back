import { Router } from "express";
import Prueba from "../Controllers/Prueba.controller";

const router: Router = Router();

router.get("/prueba", (req, res, next) => {
  Prueba.leer(req, res).catch(next); // Asegúrate de pasar el manejo de errores a `next`
});

export default router;