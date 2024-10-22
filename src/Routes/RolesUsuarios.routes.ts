import { Router } from "express";
import RolesUsuariosController from "../Controllers/RolesUsuarios.controller";
import validador from '../Middlewares/auth.middleware';
const router: Router = Router();

router.get("/getAll", validador.token, (req, res, next) => {
  RolesUsuariosController.listarRoles(req, res).catch(next); // Pasar el manejo de errores
});

export default router;
