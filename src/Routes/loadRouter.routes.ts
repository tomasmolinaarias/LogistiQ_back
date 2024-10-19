import { Application } from "express";
import prueba from "./prueba.routes";
import Roles from "./RolesUsuarios.routes";
import usuarios from "./Usuarios.routes";

export const load = (app: Application): void => {
  app.use("/api/usuarios", usuarios); 
  app.use("/api/roles", Roles);
  app.use("/api", prueba);
  app.use("*", (req, res) => res.redirect("/api"));
};


