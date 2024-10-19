import { Request, Response } from "express";
import { Usuarios } from "../Database/Models/Usuarios";
import bcrypt from "bcrypt";

// Función para validar el RUT chileno
const validarRut = (rut: string): boolean => {
  rut = rut.replace(/\./g, "").replace(/-/g, "");

  if (rut.length < 8) return false;

  const cuerpo = rut.slice(0, -1);
  const digitoVerificador = rut.slice(-1).toUpperCase();

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const dvEsperado = 11 - (suma % 11);
  const dv = dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : dvEsperado.toString();

  return dv === digitoVerificador;
};

const UsuariosController = {
  // Crear un nuevo usuario
  crearUsuario: async (req: Request, res: Response): Promise<Response | void> => {
    const { nombre, email, password, rut, idRol } = req.body;

    try {
      // Validar el RUT antes de proceder
      if (!validarRut(rut)) {
        return res.status(400).json({ message: "El RUT proporcionado no es válido" });
      }

      // Verificar si el email ya está en uso
      const usuarioExistente = await Usuarios.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ message: "El email ya está en uso" });
      }

      // Verificar si el RUT ya está en uso
      const rutExistente = await Usuarios.findOne({ where: { rut } });
      if (rutExistente) {
        return res.status(400).json({ message: "El RUT ya está en uso" });
      }

      // Hashear la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear el nuevo usuario con las propiedades específicas
      const nuevoUsuario = await Usuarios.create({
        nombre,
        email,
        password_hash: hashedPassword, // Asegúrate de usar el nombre correcto de la propiedad
        rut,
        idRol,
      } as Usuarios);

      return res.status(201).json({
        estado: true,
        message: "Usuario creado exitosamente",
        usuario: {
          idUsuario: nuevoUsuario.idUsuario,
          nombre: nuevoUsuario.nombre,
          email: nuevoUsuario.email,
          rut: nuevoUsuario.rut,
          idRol: nuevoUsuario.idRol,
          estado: nuevoUsuario.estado,
          fecha_registro: nuevoUsuario.fecha_registro,
        },
      });
    } catch (error) {
      console.error("Error al crear usuario:", error);
      return res.status(500).json({ estado: false, message: "Error interno del servidor", error });
    }
  },

  // Leer todos los usuarios
  leerUsuarios: async (req: Request, res: Response): Promise<Response | void> => {
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
      return res.status(500).json({ estado: false, message: "Error interno del servidor", error });
    }
  },

  // Leer un usuario por ID o RUT
  leerUsuarioPorIdORut: async (req: Request, res: Response): Promise<Response | void> => {
    const { id, rut } = req.query;

    try {
      let usuario;

      if (id) {
        // Buscar el usuario por ID excluyendo la contraseña hasheada
        usuario = await Usuarios.findByPk(id as string, {
          attributes: { exclude: ["password_hash"] },
        });
      } else if (rut && typeof rut === 'string') {
        // Buscar el usuario por RUT solo si `rut` está definido y es una cadena
        usuario = await Usuarios.findOne({
          where: { rut },
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
};

export default UsuariosController;
