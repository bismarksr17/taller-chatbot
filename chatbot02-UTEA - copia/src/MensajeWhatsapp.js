const { DataTypes } = require('sequelize');
const sequelize = require('./basedatos');  // Asegúrate que apunte a tu archivo de conexión

const MensajeWhatsapp = sequelize.define('MensajeWhatsapp', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  fecha_registro: { type: DataTypes.DATE },
  cod_canero: { type: DataTypes.INTEGER },
  nombre_canero: { type: DataTypes.STRING },
  numero_cel: { type: DataTypes.BIGINT },
  mensaje: { type: DataTypes.TEXT },
  enviado: { type: DataTypes.BOOLEAN },
  fecha_enviado: { type: DataTypes.DATE },
  numero_contac: { type: DataTypes.TEXT }
}, {
  tableName: 'msj_whatsapp',
  schema: 'notificaciones_wsp',
  timestamps: false
});

module.exports = MensajeWhatsapp;