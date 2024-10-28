import { Bitacora } from "../Database/Models/Bitacora";
import { CreationAttributes } from "sequelize";

export const registrarEnBitacora = async (
  idUsuario: number | null,
  accion: "Creacion" | "Edicion" | "Eliminacion",
  tabla_afectada: "Usuarios" | "Productos" | "Inventario",
  identificadorAfectado: string,
  descripcion: string
) => {
  try {

    await Bitacora.create({
      idUsuario,
      accion,
      tabla_afectada,
      identificadorAfectado,
      descripcion,
      fecha: new Date(),
    } as CreationAttributes<Bitacora>);

    console.log("Registro de bitácora guardado correctamente");
  } catch (error) {
    console.error("Error al registrar en bitácora:", error);
  }
};
