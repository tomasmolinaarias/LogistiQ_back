import { Request, Response } from 'express';
import { Productos } from '../Database/Models/Productos';
import { Inventario } from "../Database/Models/Inventario";
import { CreationAttributes } from "sequelize";

const ProductosController = {
  // Crear un nuevo producto
  crearProducto: async (req: Request, res: Response): Promise<Response | void> => {
    const { codigoSAP, nombre, categoria, precioCompra, estado } = req.body;

    try {
      const productoExistente = await Productos.findOne({ where: { codigoSAP } });
      if (productoExistente) {
        return res.status(400).json({ message: 'El código SAP ya está en uso' });
      }

      // Crear el nuevo producto, asegurando los atributos requeridos
      const nuevoProducto = await Productos.create({
        codigoSAP,
        nombre,
        categoria,
        precioCompra,
        estado: estado || 'activo',
        fecha_registro: new Date()
      } as CreationAttributes<Productos>); // Se usa `CreationAttributes` para evitar error de tipos

      return res.status(201).json({
        message: 'Producto creado exitosamente',
        producto: nuevoProducto
      });
    } catch (error) {
      console.error('Error al crear producto:', error);
      return res.status(500).json({ message: 'Error interno del servidor', error });
    }
  },

  // Leer todos los productos
  leerProductos: async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const productos = await Productos.findAll();
      return res.status(200).json({
        message: 'Productos obtenidos exitosamente',
        productos
      });
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return res.status(500).json({ message: 'Error interno del servidor', error });
    }
  },
   // Buscar producto por idProducto (usando el cuerpo de la solicitud)
   buscarProductoPorId: async (req: Request, res: Response): Promise<Response | void> => {
    const { idProducto } = req.body;

    if (!idProducto) {
      return res.status(400).json({ message: "Se requiere idProducto" });
    }

    try {
      const producto = await Productos.findByPk(idProducto);

      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      return res.status(200).json({
        message: "Producto obtenido exitosamente",
        producto,
      });
    } catch (error) {
      console.error("Error al buscar producto por ID:", error);
      return res.status(500).json({ message: "Error interno del servidor", error });
    }
  },

  // Actualizar un producto
  actualizarProducto: async (req: Request, res: Response): Promise<Response | void> => {
    const { idProducto, codigoSAP, nombre, categoria, precioCompra, estado } = req.body;

    // Validación: asegurar que el idProducto esté presente en la solicitud
    if (!idProducto) {
      return res.status(400).json({ message: 'Se requiere idProducto' });
    }

    try {
      // Buscar el producto por ID
      const producto = await Productos.findByPk(idProducto);
      if (!producto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      // Actualizar los campos del producto que se han proporcionado en la solicitud
      await producto.update({
        codigoSAP: codigoSAP || producto.codigoSAP,
        nombre: nombre || producto.nombre,
        categoria: categoria || producto.categoria,
        precioCompra: precioCompra || producto.precioCompra,
        estado: estado || producto.estado
      });

      return res.status(200).json({
        message: 'Producto actualizado exitosamente',
        producto
      });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      return res.status(500).json({ message: 'Error interno del servidor', error });
    }
  },

  // Eliminar un producto
  eliminarProducto: async (req: Request, res: Response): Promise<Response | void> => {
    const { idProducto } = req.body;
    console.log("🚀 ~ eliminarProducto: ~ id:", idProducto)

    try {
      const producto = await Productos.findByPk(idProducto);
      if (!producto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      await producto.destroy();

      return res.status(200).json({
        message: 'Producto eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      return res.status(500).json({ message: 'Error interno del servidor', error });
    }
  }
};

export default ProductosController;
