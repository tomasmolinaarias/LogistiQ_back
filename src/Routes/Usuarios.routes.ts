import { Router } from "express";
import UsuariosController from "../Controllers/Usuarios.controller";

const router: Router = Router();

// Ruta para crear un nuevo usuario
router.post("/register", async (req, res, next) => {
  try {
    await UsuariosController.crearUsuario(req, res);
  } catch (error) {
    next(error);
  }
});

// Ruta para iniciar sesión y generar un token
router.post("/login", async (req, res, next) => {
  try {
    await UsuariosController.iniciarSesion(req, res);
  } catch (error) {
    next(error);
  }
});

// Ruta para leer todos los usuarios
router.get("/getAll", async (req, res, next) => {
  try {
    await UsuariosController.leerUsuarios(req, res);
  } catch (error) {
    next(error);
  }
});

// Ruta para leer un usuario por ID o RUT
router.get("/getUser", async (req, res, next) => {
  try {
    await UsuariosController.leerUsuarioPorIdORut(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
