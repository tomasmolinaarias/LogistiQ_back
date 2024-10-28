import { Router } from 'express';
import InventarioController from '../Controllers/Inventario.controller';
import validador  from '../Middlewares/auth.middleware'; // Middleware para validar el token

const router: Router = Router();


// Ruta para leer todo el inventario
router.get('/getAll', validador.token, async (req, res, next) => {
  try {
    await InventarioController.leerInventario(req, res);
  } catch (error) {
    next(error);
  }
});
// Ruta para buscar inventario por idProducto (usando el cuerpo de la solicitud)
router.post("/get",validador.token, async (req, res, next) => {
  try {
    await InventarioController.buscarInventarioPorProducto(req, res);
  } catch (error) {
    next(error);
  }
});

// Ruta para actualizar una entrada de inventario (idInventario en el cuerpo)
router.put('/update',validador.token, async (req, res, next) => {
  try {
    await InventarioController.actualizarInventario(req, res);
  } catch (error) {
    next(error);
  }
});


export default router;
