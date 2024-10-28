import { Table, Column, Model, DataType, Unique, HasOne, HasMany } from "sequelize-typescript";
import { Inventario } from "./Inventario";
import { HistorialPrecios } from "./HistorialPrecios";

@Table({
  tableName: "Productos",
  timestamps: false,
})
export class Productos extends Model<Productos> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  idProducto!: number;

  @Unique
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true 
  })
  codigoSAP!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  nombre!: string;

  @Column({
    type: DataType.STRING(100),
  })
  categoria!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  precioCompra!: number;

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

  @HasOne(() => Inventario)
  inventario!: Inventario;

  // Relación con HistorialPrecios
  @HasMany(() => HistorialPrecios)
  historialPrecios!: HistorialPrecios[];
}
