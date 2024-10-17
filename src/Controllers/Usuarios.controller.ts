import { Request, Response } from "express";
import { Usuarios } from "../Database/Models/Usuarios";
import bcrypt from "bcrypt";

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

      // Hashear la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear el nuevo usuario con las propiedades específicas
      const nuevoUsuario = await Usuarios.create({
        nombre,
        email,
        password_hash: hashedPassword, // Guardamos el hash de la contraseña
        dni,
        idRol,
      } as Usuarios); // Forzamos a que el objeto tenga el tipo de 'Usuarios'

      return res.status(201).json({
        estado: true,
        message: "Usuario creado exitosamente",
        usuario: {
          idUsuario: nuevoUsuario.idUsuario,
          nombre: nuevoUsuario.nombre,
          email: nuevoUsuario.email,
          idRol: nuevoUsuario.idRol,
        },
      });
    } catch (error) {
      console.error("Error al crear usuario:", error);
      return res
        .status(500)
        .json({ estado: false, message: "Error interno del servidor", error });
    }
  },
};

export default UsuariosController;
