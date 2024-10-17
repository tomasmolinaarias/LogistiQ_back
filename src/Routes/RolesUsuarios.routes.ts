import { Router } from "express";
import RolesUsuariosController from "../Controllers/RolesUsuarios.controller";

const router: Router = Router();

router.get("/roles", (req, res, next) => {
  RolesUsuariosController.listarRoles(req, res).catch(next); // Pasar el manejo de errores
});

export default router;
