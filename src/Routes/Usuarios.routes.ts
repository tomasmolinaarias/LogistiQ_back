import { Router } from "express";
import UsuariosController from "../Controllers/Usuarios.controller";

const router: Router = Router();

// Ruta para crear un nuevo usuario
router.post("/register", (req, res, next) => {
  UsuariosController.crearUsuario(req, res).catch(next); // Pasar el manejo de errores
});

export default router;
