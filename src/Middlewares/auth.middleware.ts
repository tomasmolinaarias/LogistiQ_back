import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const validarToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Acceso denegado. No se proporcionó un token" });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET || "secret_key");
    req.body.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

export default validarToken;
