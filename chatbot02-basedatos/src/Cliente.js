const { DataTypes } = require("sequelize");
const sequelize = require("./basedatos");


const Cliente = sequelize.define(
  'Cliente',
  {
    // Model attributes are defined here
    nro_whatsapp: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    nombre_whatsapp: {
      type: DataTypes.STRING(50)
    },
    pais: {
        type: DataTypes.STRING(50)
    },
    latitud: {
        type: DataTypes.STRING(50)
    },
    longitud: {
        type: DataTypes.STRING(50)
    },
    saldo: {
        type: DataTypes.DECIMAL(12, 2)
    }
  },
  {
    // Other model options go here
  },
);

Cliente.sync();

module.exports = Cliente