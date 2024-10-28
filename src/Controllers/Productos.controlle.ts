import { Request, Response } from "express";
import { Productos } from "../Database/Models/Productos";
import { Inventario } from "../Database/Models/Inventario";
import { registrarEnBitacora } from "../utils/auditoria";
import { CustomRequest } from "../Middlewares/auth.middleware";
import { CreationAttributes } from "sequelize";
import { HistorialPrecios } from "../Database/Models/HistorialPrecios";
import { Predicciones } from "../Database/Models/Predicciones";
import Prediccion from "../utils/prediccionUtilidades"; // Importa la utilidad de predicción

const ProductosController = {
  // Crear un nuevo producto, inventario, registrar en el historial de precios y generar predicción inicial
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

      // Registrar el precio inicial en el historial de precios
      await HistorialPrecios.create({
        idProducto: nuevoProducto.idProducto,
        precio: precioCompra,
        fecha_registro: new Date(),
      } as CreationAttributes<HistorialPrecios>);

      await Inventario.create({
        idProducto: nuevoProducto.idProducto,
        cantidadDisponible: cantidadDisponible || 0,
        nivelMinimo: nivelMinimo || 0,
        fecha_actualizacion: new Date(),
      } as CreationAttributes<Inventario>);
      // Generar predicción inicial usando Brown con un ajuste aleatorio
      const precioAjustado = precioCompra * (1 + Math.random() * 0.05 - 0.025); // Ajusta entre ±2.5%
      const prediccionInicial = await Prediccion.prediccionBrown(
        [precioAjustado],
        0.5
      );

      await Predicciones.create({
        idProducto: nuevoProducto.idProducto,
        precioPredicho: prediccionInicial,
        metodo: "Brown",
        fecha_prediccion: new Date(),
      } as CreationAttributes<Predicciones>);

      await registrarEnBitacora(
        req.user?.idUsuario || null,
        "Creacion",
        "Productos",
        codigoSAP,
        `Producto ${nombre} creado con código SAP ${codigoSAP}`
      );

      return res.status(201).json({
        message: "Producto e inventario creados exitosamente con predicción",
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

  // Actualizar un producto y registrar en el historial de precios si cambia el precio y genera una nueva predicción
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

      // Si el precio ha cambiado, registrar el nuevo precio en el historial de precios y generar una predicción
      if (precioCompra && precioCompra !== producto.precioCompra) {
          // Registrar el cambio de precio en el historial
          await HistorialPrecios.create({
              idProducto: producto.idProducto,
              precio: precioCompra,
              fecha_registro: new Date(),
          } as CreationAttributes<HistorialPrecios>);

          // Obtener todos los precios históricos para aplicar la predicción
          const historialPrecios = await HistorialPrecios.findAll({
              where: { idProducto },
              order: [["fecha_registro", "ASC"]],
          });
          const precios = historialPrecios.map((entry) => entry.precio);

          // Generar predicciones utilizando ambos métodos si hay suficientes datos
          let prediccionBrown = null;
          let prediccionHolt = null;

          if (precios.length >= 2) {
              prediccionBrown = await Prediccion.prediccionBrown(precios, 0.5);
              prediccionHolt = await Prediccion.metodoholt(precios, 0.5, 0.5);

              // Guardar ambas predicciones
              await Predicciones.create({
                  idProducto: producto.idProducto,
                  precioPredicho: prediccionBrown,
                  metodo: "Brown",
                  fecha_prediccion: new Date(),
              } as CreationAttributes<Predicciones>);

              await Predicciones.create({
                  idProducto: producto.idProducto,
                  precioPredicho: prediccionHolt,
                  metodo: "Holt",
                  fecha_prediccion: new Date(),
              } as CreationAttributes<Predicciones>);
          } else if (precios.length === 1) {
              // Solo aplicar Brown si hay un solo precio
              prediccionBrown = await Prediccion.prediccionBrown(precios, 0.5);

              await Predicciones.create({
                  idProducto: producto.idProducto,
                  precioPredicho: prediccionBrown,
                  metodo: "Brown",
                  fecha_prediccion: new Date(),
              } as CreationAttributes<Predicciones>);
          }
      }

      // Actualizar el producto con los nuevos datos
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
          message: "Producto actualizado exitosamente y predicción generada",
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
