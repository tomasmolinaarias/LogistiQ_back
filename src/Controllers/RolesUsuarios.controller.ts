import { Request, Response } from 'express';
import { RolesUsuarios } from '../Database/Models/RolesUsuarios';

const RolesUsuariosController = {
  listarRoles: async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const roles = await RolesUsuarios.findAll();  // Obtener todos los roles
      return res.json(roles);  // Retornar los roles en formato JSON
    } catch (error) {
      console.error('Error al listar roles:', error);
      return res.status(500).json({
        message: 'Error al obtener los roles',
        error,
      });
    }
  },
};

export default RolesUsuariosController;
