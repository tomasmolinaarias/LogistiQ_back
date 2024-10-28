import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  CreatedAt,
  BelongsTo,
} from "sequelize-typescript";
import { Productos } from "./Productos";

@Table({
  tableName: "Predicciones",
  timestamps: false,
})
export class Predicciones extends Model<Predicciones> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  idPrediccion!: number;

  @ForeignKey(() => Productos)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  idProducto!: number;

  @BelongsTo(() => Productos) // Asociación con Productos
  producto!: Productos;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  precioPredicho!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  metodo!: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  fecha_prediccion!: Date;
}
