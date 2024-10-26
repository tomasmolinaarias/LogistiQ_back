import { Request, Response } from 'express';
import { Inventario } from '../Database/Models/Inventario';
import { Productos } from '../Database/Models/Productos';
import { CreationAttributes } from 'sequelize';

const InventarioController = {
  // Crear una nueva entrada en el inventario
  crearInventario: async (req: Request, res: Response): Promise<Response | void> => {
    const { idProducto, cantidadDisponible, nivelMinimo } = req.body;

    try {
      const producto = await Productos.findByPk(idProducto);
      if (!producto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      const nuevoInventario = await Inventario.create({
        idProducto,
        cantidadDisponible,
        nivelMinimo: nivelMinimo || 0,
        fecha_actualizacion: new Date()
      } as CreationAttributes<Inventario>); // Se usa `CreationAttributes` para evitar error de tipos

      return res.status(201).json({
        message: 'Inventario creado exitosamente',
        inventario: nuevoInventario
      });
    } catch (error) {
      console.error('Error al crear inventario:', error);
      return res.status(500).json({ message: 'Error interno del servidor', error });
    }
  },

  // Leer todas las entradas de inventario
  leerInventario: async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const inventario = await Inventario.findAll({ include: Productos });
      return res.status(200).json({
        message: 'Inventario obtenido exitosamente',
        inventario
      });
    } catch (error) {
      console.error('Error al obtener inventario:', error);
      return res.status(500).json({ message: 'Error interno del servidor', error });
    }
  },

  // Actualizar una entrada de inventario
  actualizarInventario : async (req: Request, res: Response): Promise<Response | void> => {
    const { idInventario, cantidadDisponible, nivelMinimo } = req.body;

    if (!idInventario) {
      return res.status(400).json({ message: 'Se requiere idInventario' });
    }
    
    try {
      const inventario = await Inventario.findByPk(idInventario);
      if (!inventario) {
        return res.status(404).json({ message: 'Inventario no encontrado' });
      }
  
      await inventario.update({
        cantidadDisponible: cantidadDisponible || inventario.cantidadDisponible,
        nivelMinimo: nivelMinimo || inventario.nivelMinimo,
        fecha_actualizacion: new Date()
      });
  
      return res.status(200).json({
        message: 'Inventario actualizado exitosamente',
        inventario
      });
    } catch (error) {
      console.error('Error al actualizar inventario:', error);
      return res.status(500).json({ message: 'Error interno del servidor', error });
    }
  },
 // Buscar inventario por idProducto (usando el cuerpo de la solicitud)
 buscarInventarioPorProducto: async (req: Request, res: Response): Promise<Response | void> => {
  const { idProducto } = req.body;

  if (!idProducto) {
    return res.status(400).json({ message: "Se requiere idProducto" });
  }

  try {
    const inventario = await Inventario.findOne({
      where: { idProducto },
      include: [Productos], // Incluye información del producto asociado
    });

    if (!inventario) {
      return res.status(404).json({ message: "Inventario para el producto no encontrado" });
    }

    return res.status(200).json({
      message: "Inventario obtenido exitosamente",
      inventario,
    });
  } catch (error) {
    console.error("Error al buscar inventario por producto:", error);
    return res.status(500).json({ message: "Error interno del servidor", error });
  }
},

  // Eliminar una entrada de inventario
  eliminarInventario: async (req: Request, res: Response): Promise<Response | void> => {
    const { idInventario } = req.body;

    try {
      const inventario = await Inventario.findByPk(idInventario);
      if (!inventario) {
        return res.status(404).json({ message: 'Inventario no encontrado' });
      }

      await inventario.destroy();

      return res.status(200).json({
        message: 'Inventario eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar inventario:', error);
      return res.status(500).json({ message: 'Error interno del servidor', error });
    }
  }
};

export default InventarioController;
