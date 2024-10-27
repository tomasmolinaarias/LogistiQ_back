// Productos.ts
import {
  Table,
  Column,
  Model,
  DataType,
  Unique,
  HasOne,
} from "sequelize-typescript";
import { Inventario } from "./Inventario";

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

  @Unique  // Aseguramos la unicidad de codigoSAP
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
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
}
