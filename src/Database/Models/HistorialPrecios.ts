// HistorialPrecios.ts
import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    CreatedAt,
  } from "sequelize-typescript";
  import { Productos } from "./Productos";
  
  @Table({
    tableName: "HistorialPrecios",
    timestamps: false,
  })
  export class HistorialPrecios extends Model<HistorialPrecios> {
    @Column({
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    })
    idHistorial!: number;
  
    @ForeignKey(() => Productos)
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    idProducto!: number;
  
    @Column({
      type: DataType.DECIMAL(10, 2),
      allowNull: false,
    })
    precio!: number;
  
    @CreatedAt
    @Column({
      type: DataType.DATE,
      defaultValue: DataType.NOW,
    })
    fecha_registro!: Date;
  }
  