import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const validarToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers['x-access-token'] as string;

  if (!token) {
    res.status(401).json({ message: "Acceso denegado. No se proporcionó un token." });
    return;  // Terminamos la ejecución aquí
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
    req.body.user = decoded;
    next();  // Continuamos al siguiente middleware o función de la ruta
  } catch (error) {
    res.status(401).json({ message: "Token inválido o expirado." });
  }
};

export default {
  token: validarToken,  // Exportamos correctamente el middleware
};
