import { Request, Response } from "express";
import { Usuarios } from "../Database/Models/Usuarios";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UsuariosController = {
  // Crear un nuevo usuario
  crearUsuario: async (
    req: Request,
    res: Response
  ): Promise<Response | void> => {
    const { nombre, email, password, dni, idRol } = req.body;

    try {
      // Verificar si el email ya está en uso
      const usuarioExistente = await Usuarios.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ message: "El email ya está en uso" });
      }

      // Verificar si el dni ya está en uso
      const dniExistente = await Usuarios.findOne({ where: { dni } });
      if (dniExistente) {
        return res.status(400).json({ message: "El DNI ya está en uso" });
      }

      // Hashear la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear el nuevo usuario con las propiedades necesarias
      const nuevoUsuario = await Usuarios.create({
        nombre,
        email,
        password_hash: hashedPassword,
        dni,
        idRol,
        estado: "activo",
        fecha_registro: new Date(),
      } as Usuarios); // Usamos `as Usuarios` para asegurar el tipado

      // Crear el token JWT
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
  // Leer todos los usuarios
  leerUsuarios: async (
    req: Request,
    res: Response
  ): Promise<Response | void> => {
    try {
      const usuarios = await Usuarios.findAll({
        attributes: { exclude: ["password_hash"] }, 
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
  // Método para buscar un usuario por ID o RUT desde el cuerpo de la solicitud
  buscarUsuario: async (req: Request, res: Response): Promise<Response | void> => {
    const { id, dni } = req.body;  // Obtenemos ID o DNI desde el cuerpo de la solicitud
    try {
      let usuario;

      if (id) {
        usuario = await Usuarios.findByPk(id, {
          attributes: { exclude: ["password_hash"] },
        });
      } else if (dni) {
        usuario = await Usuarios.findOne({
          where: { dni },
          attributes: { exclude: ["password_hash"] },
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
      return res.status(500).json({ estado: false, message: "Error interno del servidor", error });
    }
  },
  // Eliminar un usuario con ID
  eliminarUsuario: async (
    req: Request,
    res: Response
  ): Promise<Response | void> => {
    const { id } = req.body; // Obtenemos el ID del usuario desde el cuerpo (body) de la solicitud

    try {
      const usuario = await Usuarios.findByPk(id);

      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      await usuario.destroy(); // Eliminamos el usuario de la base de datos

      return res.status(200).json({
        estado: true,
        message: "Usuario eliminado correctamente",
      });
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      return res.status(500).json({
        estado: false,
        message: "Error interno del servidor",
        error,
      });
    }
  },
  // Actualizar usuario
  actualizarUsuario: async (req: Request, res: Response): Promise<Response | void> => {
    const { id } = req.body; // Asumimos que el ID del usuario siempre será enviado

    try {
      // Buscamos el usuario por su ID
      const usuario = await Usuarios.findByPk(id);

      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Preparamos un objeto con los datos a actualizar
      const actualizaciones: any = {};

      // Solo actualizamos los campos que se envían en el cuerpo de la solicitud
      if (req.body.nombre) {
        actualizaciones.nombre = req.body.nombre;
      }
      if (req.body.email) {
        const emailExistente = await Usuarios.findOne({ where: { email: req.body.email } });
        if (emailExistente && emailExistente.idUsuario !== id) {
          return res.status(400).json({ message: "El email ya está en uso" });
        }
        actualizaciones.email = req.body.email;
      }
      if (req.body.dni) {
        const dniExistente = await Usuarios.findOne({ where: { dni: req.body.dni } });
        if (dniExistente && dniExistente.idUsuario !== id) {
          return res.status(400).json({ message: "El DNI ya está en uso" });
        }
        actualizaciones.dni = req.body.dni;
      }
      if (req.body.password) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        actualizaciones.password_hash = hashedPassword;
      }
      if (req.body.idRol) {
        actualizaciones.idRol = req.body.idRol;
      }
      if (req.body.estado) {
        actualizaciones.estado = req.body.estado;
      }

      // Realizamos la actualización
      await usuario.update(actualizaciones);

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
      return res.status(500).json({
        estado: false,
        message: "Error interno del servidor",
        error,
      });
    }
  },
};

export default UsuariosController;
