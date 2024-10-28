// Bitacora.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Usuarios } from "./Usuarios";

@Table({
  tableName: "Bitacora",
  timestamps: false,
})
export class Bitacora extends Model<Bitacora> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  idBitacora!: number;

  // Definimos `idUsuario` como clave foránea que hace referencia a `Usuarios`
  @ForeignKey(() => Usuarios)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  idUsuario!: number | null;

  // Relación de `BelongsTo` con el modelo `Usuarios`
  @BelongsTo(() => Usuarios)
  usuario!: Usuarios;

  @Column({
    type: DataType.ENUM("Creacion", "Edicion", "Eliminacion"),
    allowNull: false,
  })
  accion!: string;

  @Column({
    type: DataType.ENUM("Usuarios", "Productos", "Inventario"),
    allowNull: false,
  })
  tabla_afectada!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  identificadorAfectado!: string;

  @Column({
    type: DataType.TEXT,
  })
  descripcion!: string;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  fecha!: Date;
}
