import { Request, Response } from "express";
import { Productos } from "../Database/Models/Productos";
import { Inventario } from "../Database/Models/Inventario";
import { registrarEnBitacora } from "../utils/auditoria";
import { CustomRequest } from "../Middlewares/auth.middleware";
import { CreationAttributes } from "sequelize";

const ProductosController = {
  // Crear un nuevo producto y su inventario
  crearProducto: async (
    req: CustomRequest,
    res: Response
  ): Promise<Response | void> => {
    const {
      codigoSAP,
      nombre,
      categoria,
      precioCompra,
      estado,
      cantidadDisponible,
      nivelMinimo,
    } = req.body;

    try {
      const productoExistente = await Productos.findOne({
        where: { codigoSAP },
      });
      if (productoExistente) {
        return res
          .status(400)
          .json({ message: "El código SAP ya está en uso" });
      }

      const nuevoProducto = await Productos.create({
        codigoSAP,
        nombre,
        categoria,
        precioCompra,
        estado: estado || "activo",
        fecha_registro: new Date(),
      } as CreationAttributes<Productos>);

      await Inventario.create({
        idProducto: nuevoProducto.idProducto,
        cantidadDisponible: cantidadDisponible || 0,
        nivelMinimo: nivelMinimo || 0,
        fecha_actualizacion: new Date(),
      } as CreationAttributes<Inventario>);

      await registrarEnBitacora(
        req.user?.idUsuario || null,
        "Creacion",
        "Productos",
        codigoSAP,
        `Producto ${nombre} creado con código SAP ${codigoSAP}`
      );

      return res.status(201).json({
        message: "Producto e inventario creados exitosamente",
        producto: nuevoProducto,
      });
    } catch (error) {
      console.error("Error al crear producto:", error);
      return res
        .status(500)
        .json({ message: "Error interno del servidor", error });
    }
  },
  // Leer todos los productos
  leerProductos: async (
    req: CustomRequest,
    res: Response
  ): Promise<Response | void> => {
    try {
      const productos = await Productos.findAll();
      return res.status(200).json({
        message: "Productos obtenidos exitosamente",
        productos,
      });
    } catch (error) {
      console.error("Error al obtener productos:", error);
      return res
        .status(500)
        .json({ message: "Error interno del servidor", error });
    }
  },

  // Buscar producto por idProducto (usando el cuerpo de la solicitud)
  buscarProductoPorId: async (
    req: CustomRequest,
    res: Response
  ): Promise<Response | void> => {
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
      return res
        .status(500)
        .json({ message: "Error interno del servidor", error });
    }
  },

  // Actualizar un producto y registrar en bitácora
  actualizarProducto: async (
    req: CustomRequest,
    res: Response
  ): Promise<Response | void> => {
    const { idProducto, codigoSAP, nombre, categoria, precioCompra, estado } =
      req.body;

    if (!idProducto) {
      return res.status(400).json({ message: "Se requiere idProducto" });
    }

    try {
      const producto = await Productos.findByPk(idProducto);
      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      const datosAnteriores = {
        codigoSAP: producto.codigoSAP,
        nombre: producto.nombre,
        categoria: producto.categoria,
        precioCompra: producto.precioCompra,
        estado: producto.estado,
      };

      await producto.update({
        codigoSAP: codigoSAP || producto.codigoSAP,
        nombre: nombre || producto.nombre,
        categoria: categoria || producto.categoria,
        precioCompra: precioCompra || producto.precioCompra,
        estado: estado || producto.estado,
      });

      await registrarEnBitacora(
        req.user?.idUsuario || null,
        "Edicion",
        "Productos",
        producto.codigoSAP,
        `Producto ${producto.nombre} actualizado de ${JSON.stringify(
          datosAnteriores
        )} a ${JSON.stringify({
          codigoSAP: codigoSAP || producto.codigoSAP,
          nombre: nombre || producto.nombre,
          categoria: categoria || producto.categoria,
          precioCompra: precioCompra || producto.precioCompra,
          estado: estado || producto.estado,
        })}`
      );

      return res.status(200).json({
        message: "Producto actualizado exitosamente",
        producto,
      });
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      return res
        .status(500)
        .json({ message: "Error interno del servidor", error });
    }
  },

  // Eliminar un producto y su inventario
  eliminarProducto: async (
    req: CustomRequest,
    res: Response
  ): Promise<Response | void> => {
    const { idProducto } = req.body;

    try {
      const producto = await Productos.findByPk(idProducto);
      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      const codigoSAP = producto.codigoSAP;
      const nombreProducto = producto.nombre;

      // Eliminar el inventario asociado
      await Inventario.destroy({ where: { idProducto } });
      // Eliminar el producto
      await producto.destroy();

      // Registro en bitácora para eliminación
      await registrarEnBitacora(
        req.user?.idUsuario || null,
        "Eliminacion",
        "Productos",
        codigoSAP,
        `Producto ${nombreProducto} eliminado con código SAP ${codigoSAP}`
      );

      return res.status(200).json({
        message: "Producto e inventario eliminados exitosamente",
      });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      return res
        .status(500)
        .json({ message: "Error interno del servidor", error });
    }
  },
  // Activar producto
  activarProducto: async (
    req: CustomRequest,
    res: Response
  ): Promise<Response | void> => {
    const { idProducto } = req.body;

    try {
      const producto = await Productos.findByPk(idProducto);
      if (!producto)
        return res.status(404).json({ message: "Producto no encontrado" });

      await producto.update({ estado: "activo" });
      await registrarEnBitacora(
        req.user?.idUsuario || null,
        "Edicion",
        "Productos",
        producto.codigoSAP,
        `Producto ${producto.nombre} activado`
      );

      return res.status(200).json({ message: "Producto activado" });
    } catch (error) {
      console.error("Error al activar producto:", error);
      return res
        .status(500)
        .json({ message: "Error interno del servidor", error });
    }
  },

  // Desactivar producto
  desactivarProducto: async (
    req: CustomRequest,
    res: Response
  ): Promise<Response | void> => {
    const { idProducto } = req.body;

    try {
      const producto = await Productos.findByPk(idProducto);
      if (!producto)
        return res.status(404).json({ message: "Producto no encontrado" });

      await producto.update({ estado: "inactivo" });
      await registrarEnBitacora(
        req.user?.idUsuario || null,
        "Edicion",
        "Productos",
        producto.codigoSAP,
        `Producto ${producto.nombre} desactivado`
      );

      return res.status(200).json({ message: "Producto desactivado" });
    } catch (error) {
      console.error("Error al desactivar producto:", error);
      return res
        .status(500)
        .json({ message: "Error interno del servidor", error });
    }
  },
};

export default ProductosController;
