import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface CustomRequest extends Request {
  user?: {
    idUsuario: number;
  };
}

const validarToken = (req: CustomRequest, res: Response, next: NextFunction): void => {
  const token = req.headers['x-access-token'] as string;

  if (!token) {
    res.status(401).json({ message: "Acceso denegado. No se proporcionó un token." });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key") as { idUsuario: number };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido o expirado." });
  }
};

export default { token: validarToken };
