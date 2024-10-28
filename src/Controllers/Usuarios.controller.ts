import { Request, Response } from "express";
import { Usuarios } from "../Database/Models/Usuarios";
import { RolesUsuarios } from "../Database/Models/RolesUsuarios";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { registrarEnBitacora } from "../utils/auditoria";
import { CustomRequest } from "../Middlewares/auth.middleware";
import { CreationAttributes } from "sequelize"; // Asegúrate de importar esto

const UsuariosController = {
  // Crear un nuevo usuario y registrar en bitácora
  crearUsuario: async (
    req: CustomRequest,
    res: Response
  ): Promise<Response | void> => {
    const { nombre, email, password, dni, idRol } = req.body;

    try {
      const usuarioExistente = await Usuarios.findOne({
        where: { email: email.toLowerCase() },
      });
      if (usuarioExistente) {
        return res.status(400).json({ message: "El email ya está en uso" });
      }

      const dniExistente = await Usuarios.findOne({ where: { dni } });
      if (dniExistente) {
        return res.status(400).json({ message: "El DNI ya está en uso" });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const nuevoUsuario = await Usuarios.create({
        nombre,
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        dni,
        idRol,
        estado: "activo",
        fecha_registro: new Date(),
      } as unknown as CreationAttributes<Usuarios>);

      // Registra en bitácora, asegurando que `req.user` esté definido
      await registrarEnBitacora(
        req.user?.idUsuario || null,
        "Creacion",
        "Usuarios",
        dni,
        `Usuario ${nombre} creado con DNI ${dni}`
      );

      const token = jwt.sign(
        { idUsuario: nuevoUsuario.idUsuario, email: nuevoUsuario.email },
        process.env.JWT_SECRET || "secret_key",
        { expiresIn: "1h" }
      );

      return res.status(201).json({
        estado: true,
        message: "Usuario creado exitosamente",
        usuario: {
          idUsuario: nuevoUsuario.idUsuario,
          nombre: nuevoUsuario.nombre,
          email: nuevoUsuario.email,
          dni: nuevoUsuario.dni,
          idRol: nuevoUsuario.idRol,
          estado: nuevoUsuario.estado,
          fecha_registro: nuevoUsuario.fecha_registro,
        },
        token,
      });
    } catch (error) {
      console.error("Error al crear usuario:", error);
      return res
        .status(500)
        .json({ estado: false, message: "Error interno del servidor", error });
    }
  },
  // Leer todos los usuarios con rol asociado
  leerUsuarios: async (
    req: Request,
    res: Response
  ): Promise<Response | void> => {
    try {
      const usuarios = await Usuarios.findAll({
        attributes: { exclude: ["password_hash"] },
        include: [{ model: RolesUsuarios, attributes: ["nombreRol"] }], // Incluye el rol y su nombre
      });

      return res.status(200).json({
        estado: true,
        message: "Usuarios obtenidos exitosamente",
        usuarios,
      });
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      return res
        .status(500)
        .json({ estado: false, message: "Error interno del servidor", error });
    }
  },
  // Método para buscar un usuario por ID o DNI y mostrar su rol
  buscarUsuario: async (
    req: Request,
    res: Response
  ): Promise<Response | void> => {
    const { id, dni } = req.body;

    try {
      let usuario;

      if (id) {
        usuario = await Usuarios.findByPk(id, {
          attributes: { exclude: ["password_hash"] },
          include: [{ model: RolesUsuarios, attributes: ["nombreRol"] }],
        });
      } else if (dni) {
        usuario = await Usuarios.findOne({
          where: { dni },
          attributes: { exclude: ["password_hash"] },
          include: [{ model: RolesUsuarios, attributes: ["nombreRol"] }],
        });
      }

      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      return res.status(200).json({
        estado: true,
        message: "Usuario obtenido exitosamente",
        usuario,
      });
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      return res
        .status(500)
        .json({ estado: false, message: "Error interno del servidor", error });
    }
  },
  // Eliminar usuario y registrar en bitácora
  eliminarUsuario: async (
    req: CustomRequest,
    res: Response
  ): Promise<Response | void> => {
    const { id } = req.body;

    try {
      const usuario = await Usuarios.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      await usuario.destroy();

      // Registra en bitácora
      await registrarEnBitacora(
        req.user?.idUsuario || null,
        "Eliminacion",
        "Usuarios",
        usuario.dni,
        `Usuario ${usuario.nombre} con DNI ${usuario.dni} eliminado`
      );

      return res.status(200).json({
        estado: true,
        message: "Usuario eliminado correctamente",
      });
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      return res
        .status(500)
        .json({ estado: false, message: "Error interno del servidor", error });
    }
  },
  // Actualizar usuario y registrar en bitácora
  actualizarUsuario: async (
    req: CustomRequest,
    res: Response
  ): Promise<Response | void> => {
    // Asumimos que el ID del usuario se obtiene del token en `req.user`
    const idUsuario = req.user?.idUsuario;

    if (!idUsuario) {
      return res
        .status(400)
        .json({ message: "ID de usuario no encontrado en el token" });
    }

    try {
      // Buscamos el usuario por su ID (obtenido del token)
      const usuario = await Usuarios.findByPk(idUsuario);

      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Guardamos los datos anteriores para registrar los cambios en la bitácora
      const datosAnteriores = {
        nombre: usuario.nombre,
        email: usuario.email,
        dni: usuario.dni,
        idRol: usuario.idRol,
        estado: usuario.estado,
      };

      // Preparamos un objeto con los datos a actualizar
      const actualizaciones: any = {};

      // Actualizamos solo los campos que se envían en el cuerpo de la solicitud
      if (req.body.nombre) actualizaciones.nombre = req.body.nombre;
      if (req.body.email) actualizaciones.email = req.body.email.toLowerCase();
      if (req.body.dni) actualizaciones.dni = req.body.dni;
      if (req.body.password) {
        const saltRounds = 10;
        actualizaciones.password_hash = await bcrypt.hash(
          req.body.password,
          saltRounds
        );
      }
      if (req.body.idRol) actualizaciones.idRol = req.body.idRol;
      if (req.body.estado) actualizaciones.estado = req.body.estado;

      // Realizamos la actualización
      await usuario.update(actualizaciones);

      // Registro en bitácora para edición
      await registrarEnBitacora(
        idUsuario, // ID del usuario que realizó la actualización, obtenido del token
        "Edicion",
        "Usuarios",
        usuario.dni,
        `Usuario ${usuario.nombre} actualizado de ${JSON.stringify(
          datosAnteriores
        )} a ${JSON.stringify(actualizaciones)}`
      );

      return res.status(200).json({
        estado: true,
        message: "Usuario actualizado correctamente",
        usuario: {
          idUsuario: usuario.idUsuario,
          nombre: usuario.nombre,
          email: usuario.email,
          dni: usuario.dni,
          idRol: usuario.idRol,
          estado: usuario.estado,
        },
      });
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      return res
        .status(500)
        .json({ estado: false, message: "Error interno del servidor", error });
    }
  },
  // Activar usuario
  activarUsuario: async (
    req: CustomRequest,
    res: Response
  ): Promise<Response | void> => {
    const { id } = req.body;

    try {
      const usuario = await Usuarios.findByPk(id);
      if (!usuario)
        return res.status(404).json({ message: "Usuario no encontrado" });

      await usuario.update({ estado: "activo" });
      await registrarEnBitacora(
        req.user?.idUsuario || null,
        "Edicion",
        "Usuarios",
        usuario.dni,
        `Usuario ${usuario.nombre} activado`
      );

      return res.status(200).json({ message: "Usuario activado" });
    } catch (error) {
      console.error("Error al activar usuario:", error);
      return res
        .status(500)
        .json({ message: "Error interno del servidor", error });
    }
  },

  // Desactivar usuario
  desactivarUsuario: async (
    req: CustomRequest,
    res: Response
  ): Promise<Response | void> => {
    const { id } = req.body;

    try {
      const usuario = await Usuarios.findByPk(id);
      if (!usuario)
        return res.status(404).json({ message: "Usuario no encontrado" });

      await usuario.update({ estado: "inactivo" });
      await registrarEnBitacora(
        req.user?.idUsuario || null,
        "Edicion",
        "Usuarios",
        usuario.dni,
        `Usuario ${usuario.nombre} desactivado`
      );

      return res.status(200).json({ message: "Usuario desactivado" });
    } catch (error) {
      console.error("Error al desactivar usuario:", error);
      return res
        .status(500)
        .json({ message: "Error interno del servidor", error });
    }
  },
};

export default UsuariosController;
