import { Application } from "express";
import prueba from "./prueba.routes";
import Roles from "./RolesUsuarios.routes";
import usuarios from "./Usuarios.routes";
import ProductosRoutes from "./Productos.routes"
import InventarioRoutes from "./Inventario.routes"
import Bitacora from "./Bitacora.routes"
import HistorialPrecios from "./HistorialPrecios.routes"
export const load = (app: Application): void => {
  app.use('/api/HistorialPrecios', HistorialPrecios); 
  app.use('/api/bitacora', Bitacora); 
  app.use('/api/productos', ProductosRoutes); 
  app.use('/api/inventario', InventarioRoutes);
  app.use("/api/usuarios", usuarios); 
  app.use("/api/roles", Roles);
  app.use("/api", prueba);
  app.use("*", (req, res) => res.redirect("/api"));
};


