// models/Reporte.js
const { DataTypes } = require('sequelize');
const sequelize = require('./basedatos');  // <-- Asegúrate que apunte a tu archivo de conexión

const Reporte = sequelize.define('Reporte', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  trapiches_estado: DataTypes.STRING,
  viajes_disponibles: DataTypes.FLOAT,
  toneladas_aprox: DataTypes.FLOAT,
  promedio_llegada_viajes: DataTypes.FLOAT,
  viajes_estimados: DataTypes.FLOAT,
  total_horas_abastecimiento: DataTypes.FLOAT,
  tiempo_espera: DataTypes.FLOAT,
  molienda_actual: DataTypes.FLOAT,
  planificacion_actual: DataTypes.FLOAT,
  diferencia_actual: DataTypes.FLOAT,
  promedio_horario: DataTypes.FLOAT,
  molienda_segun_promedio: DataTypes.FLOAT,
  molienda_segun_estimacion: DataTypes.FLOAT,
}, {
  tableName: 'reporte',
  schema: 'datos_iag',
  timestamps: false
});

module.exports = Reporte;
