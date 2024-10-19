import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { RolesUsuarios } from "./RolesUsuarios";

@Table({
  tableName: "Usuarios",
  timestamps: false, // Ya gestionamos el tiempo manualmente con `fecha_registro`
})
export class Usuarios extends Model<Usuarios> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  idUsuario!: number;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    unique: true,
  })
  rut!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  nombre!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  email!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  password_hash!: string;

  @ForeignKey(() => RolesUsuarios)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  idRol!: number;

  @BelongsTo(() => RolesUsuarios)
  rol!: RolesUsuarios;

  @Column({
    type: DataType.ENUM("activo", "inactivo"),
    defaultValue: "activo",
  })
  estado!: string;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  fecha_registro!: Date;

  // Método para validar la contraseña (se usará en Auth)
  async validarPassword(password: string): Promise<boolean> {
    const bcrypt = require("bcrypt");
    return await bcrypt.compare(password, this.password_hash);
  }
}
