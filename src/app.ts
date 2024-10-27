import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { load as middlewareLoad } from "./Middlewares/loadMiddleware";
import { load as routerLoad } from "./Routes/loadRouter.routes";
import sequelize from "./Database/datebase"; // Importar la configuración de Sequelize

dotenv.config();

const app: Application = express();

// Cargar middlewares
middlewareLoad(app);

// Cargar las rutas
routerLoad(app);

// Probar la conexión con la base de datos y sincronizar los modelos
sequelize.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos exitosa.');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('Modelos sincronizados con la base de datos.');
  })
  .catch((error) => {
    console.error('Error al conectar a la base de datos:', error);
  });

// Manejo de errores global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Ocurrió un error en el servidor.",
    error: err.message,
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3500;
app.listen(PORT, () =>
  console.log(`Servidor 🚀 🟢 http://localhost:${PORT} 🟢`)
);

export default app;
