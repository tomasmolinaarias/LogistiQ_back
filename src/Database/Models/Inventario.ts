import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
  } from "sequelize-typescript";
  import { Productos } from "./Productos";
  
  @Table({
    tableName: "Inventario",
    timestamps: false,  // Gestionamos las fechas manualmente con `fecha_actualizacion`
  })
  export class Inventario extends Model<Inventario> {
    @Column({
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    })
    idInventario!: number;
  
    @ForeignKey(() => Productos)
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    idProducto!: number;
  
    @BelongsTo(() => Productos)
    producto!: Productos;
  
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    cantidadDisponible!: number;
  
    @Column({
      type: DataType.INTEGER,
      defaultValue: 0,
    })
    nivelMinimo!: number;
  
    @Column({
        type: DataType.DATE,
        defaultValue: DataType.NOW,
        onUpdate: 'CURRENT_TIMESTAMP', 
      })
      fecha_actualizacion!: Date;
  }
  