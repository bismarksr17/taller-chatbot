// reporteMensaje.js
const Reporte = require('./Reporte');

async function obtenerMensajeReporte() {
    const fila = await Reporte.findByPk(1); // Busca por ID = 1

    if (!fila) return 'No se encontró el reporte.';

    const mensaje = `*REPORTE*
*⚙️ Trapiches:* ${fila.trapiches_estado}
*🚛 Viajes disponibles:* ${Number(fila.viajes_disponibles).toFixed(2)}
*🔢 Toneladas aprox.:* ${Number(fila.toneladas_aprox).toFixed(2)}
*⏱️ Promedio llegada vj.:* ${Number(fila.promedio_llegada_viajes).toFixed(2)}
*📈 Viajes estimados:* ${Number(fila.viajes_estimados).toFixed(2)}
*🕰️Total horas abas.:* ${Number(fila.total_horas_abastecimiento).toFixed(2)}
*⏳Tiempo espera:* ${Number(fila.tiempo_espera).toFixed(2)}
*🎋 Molienda actual:* ${Number(fila.molienda_actual).toFixed(2)}
*📅 Planificacion actual:* ${Number(fila.planificacion_actual).toFixed(2)}
*🔻 Diferencia actual:* ${Number(fila.diferencia_actual).toFixed(2)}
*🕒 Promedio horario:* ${Number(fila.promedio_horario).toFixed(2)}
*🏭Molienda segun promedio:* ${Number(fila.molienda_segun_promedio).toFixed(2)}
*📊Molienda segun estimacion:* ${Number(fila.molienda_segun_estimacion).toFixed(2)}`;

    return mensaje;
}

module.exports = { obtenerMensajeReporte };
