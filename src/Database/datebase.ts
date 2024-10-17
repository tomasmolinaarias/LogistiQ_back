import { Sequelize } from 'sequelize-typescript';
import { RolesUsuarios } from './Models/RolesUsuarios';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'use',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'ermanake',
  port: Number(process.env.DB_PORT) || 3306,
  logging: false,
  models: [RolesUsuarios],  // Agrega los modelos aquí
});

export default sequelize;
