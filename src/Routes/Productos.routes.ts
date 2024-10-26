import { Router } from 'express';
import ProductosController from '../Controllers/Productos.controlle';
import validador from '../Middlewares/auth.middleware';

const router: Router = Router();

// Ruta para crear un nuevo producto
router.post('/crear', validador.token, async (req, res, next) => {
    try {
      await ProductosController.crearProducto(req, res);
    } catch (error) {
      next(error);
    }
  });
  
  // Ruta para leer todos los productos
  router.get('/todos', validador.token, async (req, res, next) => {
    try {
      await ProductosController.leerProductos(req, res);
    } catch (error) {
      next(error);
    }
  });
  // Ruta para buscar producto por idProducto (usando el cuerpo de la solicitud)
router.post("/buscar", validador.token, async (req, res, next) => {
  try {
    await ProductosController.buscarProductoPorId(req, res);
  }catch (error) {
    next(error);
  }
});
  
  // Ruta para actualizar un producto (requiere ID del producto)
  router.put('/actualizar', validador.token, async (req, res, next) => {
    try {
      await ProductosController.actualizarProducto(req, res);
    } catch (error) {
      next(error);
    }
  });
  
  // Ruta para eliminar un producto (requiere ID del producto)
  router.delete('/eliminar', validador.token, async (req, res, next) => {
    try {
      await ProductosController.eliminarProducto(req, res);
    } catch (error) {
      next(error);
    }
  });
  
  export default router;