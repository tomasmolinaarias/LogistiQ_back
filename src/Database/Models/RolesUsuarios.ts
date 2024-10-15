import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'RolesUsuarios',
  timestamps: false, // Esta tabla no tiene columnas de timestamps (createdAt, updatedAt)
})
export class RolesUsuarios extends Model<RolesUsuarios> {
  
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  idRol!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  nombreRol!: string;
}
