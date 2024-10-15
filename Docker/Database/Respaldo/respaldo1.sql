-- Creación de la tabla RolesUsuarios
CREATE TABLE RolesUsuarios (
    idRol INT AUTO_INCREMENT PRIMARY KEY,  -- Cambié a INT para que coincida con la clave foránea en Usuarios
    nombreRol VARCHAR(50) NOT NULL  -- Ej: 'Administrador', 'Gerente de Ventas', 'Usuario'
);

-- Creación de la tabla Usuarios (con DNI, estado y mejoras)
CREATE TABLE Usuarios (
    idUsuario INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(20) UNIQUE NOT NULL,  -- DNI o Cédula de Identidad como identificador único adicional
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- Hash de la contraseña
    idRol INT NOT NULL,  -- Relación con RolesUsuarios
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',  -- Estado del usuario: activo o inactivo
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idRol) REFERENCES RolesUsuarios(idRol) ON DELETE CASCADE  -- Clave foránea corregida
);

-- Creación de la tabla Productos (con Código SAP y estado agregado)
CREATE TABLE Productos (
    idProducto INT AUTO_INCREMENT PRIMARY KEY,
    codigoSAP VARCHAR(50) UNIQUE NOT NULL,  -- Código SAP como identificador único adicional para los productos
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(100),
    precioCompra DECIMAL(10, 2) NOT NULL,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',  -- Estado del producto: activo o inactivo
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creación de la tabla Inventario
CREATE TABLE Inventario (
    idInventario INT AUTO_INCREMENT PRIMARY KEY,
    idProducto INT NOT NULL,
    cantidadDisponible INT NOT NULL,
    nivelMinimo INT DEFAULT 0,  -- Nivel mínimo de stock para alertas
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idProducto) REFERENCES Productos(idProducto) ON DELETE CASCADE  -- Clave foránea corregida
);

-- Creación de la tabla Predicciones
CREATE TABLE Predicciones (
    idPrediccion INT AUTO_INCREMENT PRIMARY KEY,
    idProducto INT NOT NULL,
    precioPredicho DECIMAL(10, 2) NOT NULL,
    metodo VARCHAR(50),  -- Método de predicción, ej: Holt o Brown
    fecha_prediccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idProducto) REFERENCES Productos(idProducto) ON DELETE CASCADE  -- Clave foránea corregida
);

-- Creación de la tabla Sesiones
CREATE TABLE Sesiones (
    idSesion INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    tokenJWT VARCHAR(255) NOT NULL,  -- Token JWT para autenticación
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP,
    FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario) ON DELETE CASCADE  -- Clave foránea corregida
);

-- Creación de la tabla Bitácora con ENUM para tablas afectadas y mejoras
CREATE TABLE Bitacora (
    idBitacora INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT,  -- Usuario que realizó la acción
    accion ENUM('Creación', 'Edición', 'Eliminación') NOT NULL,  -- Tipo de operación
    tabla_afectada ENUM('Usuarios', 'Productos', 'Inventario') NOT NULL,  -- Enum para tablas afectadas
    identificadorAfectado VARCHAR(100) NOT NULL,  -- Nombre del usuario o código SAP del producto
    descripcion TEXT,  -- Detalles sobre la operación realizada
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Fecha y hora de la operación
    FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario) ON DELETE SET NULL  -- Clave foránea corregida
);

-- Insertando roles iniciales en la tabla RolesUsuarios
INSERT INTO RolesUsuarios (nombreRol) VALUES 
('Administrador'), 
('Gerente de Ventas'), 
('Usuario');
