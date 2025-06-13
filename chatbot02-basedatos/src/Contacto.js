const { DataTypes } = require("sequelize");
const sequelize = require("./basedatos")

const Contacto = sequelize.define(
  'Contacto',
  {
    // Model attributes are defined here
    nro_whatsapp: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    nombre_whatsapp: {
      type: DataTypes.STRING(50)
      // allowNull defaults to true
    },
    pais: {
        type: DataTypes.STRING(50)
    },
    saldo:{
        type: DataTypes.DECIMAL(12, 2)
    }
  },
  {
    // Other model options go here
  },
);

// crea la tabla en base a la configuración (eso es migración)
Contacto.sync()

module.exports = Contacto