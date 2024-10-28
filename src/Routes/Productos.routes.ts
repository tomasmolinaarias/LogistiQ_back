import { Router } from 'express';
import ProductosController from '../Controllers/Productos.controlle';
import validador from '../Middlewares/auth.middleware'; // Middleware para validar el token


const router: Router = Router();

// Ruta para crear un nuevo producto
router.post('/create',validador.token, async (req, res, next) => {
    try {
      await ProductosController.crearProducto(req, res);
    } catch (error) {
      next(error);
    }
  });
  
  // Ruta para leer todos los productos
  router.get('/getALl',validador.token, async (req, res, next) => {
    try {
      await ProductosController.leerProductos(req, res);
    } catch (error) {
      next(error);
    }
  });
  // Ruta para buscar producto por idProducto (usando el cuerpo de la solicitud)
router.post("/get",validador.token, async (req, res, next) => {
  try {
    await ProductosController.buscarProductoPorId(req, res);
  }catch (error) {
    next(error);
  }
});
  
  // Ruta para actualizar un producto (requiere ID del producto)
  router.put('/update',validador.token, async (req, res, next) => {
    try {
      await ProductosController.actualizarProducto(req, res);
    } catch (error) {
      next(error);
    }
  });
  
  // Ruta para eliminar un producto (requiere ID del producto)
  router.delete('/delete',validador.token, async (req, res, next) => {
    try {
      await ProductosController.eliminarProducto(req, res);
    } catch (error) {
      next(error);
    }
  });
  router.post("/activate", validador.token, async (req, res, next)=>{
    try {
      await ProductosController.activarProducto(req, res);
    } catch (error) {
      next(error);
    }
  });
  router.post("/deactivate", validador.token, async(req, res,next) => {
    try {
      await ProductosController.desactivarProducto(req, res);    } catch (error) {
      next(error);
    }
  });
  
  export default router;