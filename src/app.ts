import express, { Application } from "express";
import dotenv from "dotenv";
import { load as middlewareLoad } from "./Middlewares/loadMiddleware";
import { load as routerLoad } from "./Routes/loadRouter.routes";

dotenv.config();

const app: Application = express();

middlewareLoad(app);
routerLoad(app);

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => console.log(`Servidor 🚀 🟢 http://localhost:${PORT} 🟢`));
