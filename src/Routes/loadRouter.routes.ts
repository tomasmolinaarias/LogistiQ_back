import { Application } from "express";
import prueba from "./prueba.routes";
import Roles from "./RolesUsuarios.routes" 
export const load = (app: Application): void => {

  app.use("/api", Roles);
  app.use("/api", prueba);
  app.use("*", (req, res) => res.redirect("/api"));
};
