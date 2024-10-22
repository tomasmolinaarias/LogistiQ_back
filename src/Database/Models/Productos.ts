import {
    Table,
    Column,
    Model,
    DataType,
    HasMany,
  } from "sequelize-typescript";
  import { Inventario } from "./Inventario";
  
  @Table({
    tableName: "Productos",
    timestamps: false,  // Gestionamos las fechas manualmente con `fecha_registro`
  })
  export class Productos extends Model<Productos> {
    @Column({
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    })
    idProducto!: number;
  
    @Column({
      type: DataType.STRING(50),
      allowNull: false,
      unique: true,
    })
    codigoSAP!: string;
  
    @Column({
      type: DataType.STRING(100),
      allowNull: false,
    })
    nombre!: string;
  
    @Column({
      type: DataType.STRING(100),
      allowNull: true,
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
  
    // Relación con Inventario
    @HasMany(() => Inventario)
    inventario!: Inventario[];
  }
  