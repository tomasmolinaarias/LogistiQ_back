import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { load as middlewareLoad } from "./Middlewares/loadMiddleware";
import { load as routerLoad } from "./Routes/loadRouter.routes";
import sequelize from "./Database/datebase"; // Importar la configuración de Sequelize

dotenv.config();

const app: Application = express();

middlewareLoad(app);
routerLoad(app);

sequelize
  .authenticate()
  .then(() => {
    console.log("Conexión exitosa con la base de datos 🟢");
    return sequelize.sync(); // Sincroniza los modelos con la base de datos
  })
  .then(() => {
    console.log("Modelos sincronizados con la base de datos 🟢");
  })
  .catch((error) => {
    console.error("Error al conectar con la base de datos 🔴:", error);
  });

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Ocurrió un error en el servidor.",
    error: err.message,
  });
});
const PORT = process.env.PORT || 3500;
app.listen(PORT, () =>
  console.log(`Servidor 🚀 🟢 http://localhost:${PORT} 🟢`)
);
