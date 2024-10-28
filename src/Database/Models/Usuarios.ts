// Usuarios.ts
import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Bitacora } from "./Bitacora";
import { RolesUsuarios } from "./RolesUsuarios"; // Importación del modelo relacionado

@Table({
  tableName: "Usuarios",
  timestamps: false,
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
    unique: true,
    allowNull: false,
  })
  dni!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  nombre!: string;

  @Column({
    type: DataType.STRING(100),
    unique: true,
    allowNull: false,
  })
  email!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  password_hash!: string;

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

  // Relación de HasMany con el modelo Bitacora para tener acceso a todos los registros
  @HasMany(() => Bitacora)
  bitacoras!: Bitacora[];

  // Definir la clave foránea para RolesUsuarios
  @ForeignKey(() => RolesUsuarios)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  idRol!: number;

  // Asociación con el modelo RolesUsuarios
  @BelongsTo(() => RolesUsuarios, { as: "rol" })
  rol!: RolesUsuarios;

  // Método para validar la contraseña (se usará en Auth)
  async validarPassword(password: string): Promise<boolean> {
    const bcrypt = require("bcrypt");
    return await bcrypt.compare(password, this.password_hash);
  }
}
