import { Router } from "express";
import UsuariosController from "../Controllers/Usuarios.controller";
import AuthController from "../Controllers/Auth.controller";
import validador from '../Middlewares/auth.middleware'; // Middleware para validar el token

const router: Router = Router();

// Ruta para crear un nuevo usuario (no requiere validación de token)
router.post("/register",validador.token,async (req, res, next) => {
  try {
    await UsuariosController.crearUsuario(req, res);
  } catch (error) {
    next(error);
  }
});

// Ruta para iniciar sesión y generar un token (no requiere validación de token)
router.post("/login", async (req, res, next) => {
  try {
    await AuthController.iniciarSesion(req, res);
  } catch (error) {
    next(error);
  }
});

// Ruta para leer todos los usuarios (requiere validación de token)
router.get("/getAll",validador.token, async (req, res, next) => {
  try {
    await UsuariosController.leerUsuarios(req, res);
  } catch (error) {
    next(error);
  }
});

// Ruta para llamar un usuario
router.post("/getUser",validador.token, async (req, res, next) => {
  try {
    await UsuariosController.buscarUsuario(req, res);
  } catch (error) {
    next(error);
  }
});

// Ruta para eliminar un usuario por ID 
router.delete("/deleteUser",validador.token, async (req, res, next) => {
  try {
    await UsuariosController.eliminarUsuario(req, res);
  } catch (error) {
    next(error);
  }
});
// ACtualizar Usuario
router.patch("/updateUser",validador.token, async (req, res, next) => {
  try {
    await UsuariosController.actualizarUsuario(req, res);
  } catch (error) {
    next(error);
  }
});
router.post("/activate", validador.token, async (req, res, next)=>{
  try {
    await UsuariosController.activarUsuario(req, res);
  } catch (error) {
    next(error);
  }
});
router.post("/deactivate", validador.token, async(req, res,next) => {
  try {
    await UsuariosController.desactivarUsuario(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
