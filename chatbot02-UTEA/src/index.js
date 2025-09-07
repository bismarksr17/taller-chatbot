const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("baileys");
const qrcode = require("qrcode-terminal");
const cron = require("node-cron");
const MensajeWhatsapp = require("./MensajeWhatsapp");
const { obtenerMensajeReporte } = require("./reporteMensaje");

let sock = null; // 🔁 variable global

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    sock = makeWASocket({ auth: state });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) qrcode.generate(qr, { small: true });

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            
            if (shouldReconnect) {
                await connectToWhatsApp(); // 🔁 actualiza sock global
            }
        } else if (connection === 'open') {
            console.log('✅ Conexión abierta con WhatsApp');
        }
    });

    // 🎧 Escuchar mensajes entrantes tipo "reporte"
    sock.ev.on('messages.upsert', async (event) => {
        for (const m of event.messages) {
            const id = m.key.remoteJid;

            if (event.type !== 'notify' || m.key.fromMe || id.includes('@g.us') || id.includes('@broadcast')) {
                return;
            }

            const mensajeTexto = m.message?.conversation || m.message?.extendedTextMessage?.text;

            if (mensajeTexto && mensajeTexto.trim().toLowerCase() === 'reporte') {
                try {
                    const reporte = await obtenerMensajeReporte();
                    await sock.sendMessage(id, { text: reporte });
                    console.log(`📤 Enviado reporte a ${id}`);
                } catch (e) {
                    console.error("❌ Error al enviar reporte:", e);
                }
            }
        }
    });
}

// 🕒 CRON JOB: cada 5 minutos revisa mensajes pendientes
cron.schedule('*/5 * * * *', async () => {
    console.log("🔍 Revisando mensajes pendientes en la base de datos...");

    try {
        if (!sock?.user) {
            console.log("⚠️ Socket desconectado. Saltando envío.");
            return;
        }

        const mensajes = await MensajeWhatsapp.findAll({
            where: { enviado: false }
        });

        for (const mensaje of mensajes) {
            try {
                const numero = "591" + mensaje.numero_cel + "@s.whatsapp.net";

                await sock.sendMessage(numero, { text: mensaje.mensaje });

                mensaje.enviado = true;
                mensaje.fecha_enviado = new Date();
                await mensaje.save();

                console.log(`✅ Mensaje enviado a ${numero}`);
            } catch (err) {
                console.error(`❌ Error al enviar mensaje a ${mensaje.numero_cel}:`, err.message);
            }
        }
    } catch (err) {
        console.error("❌ Error general en el cron:", err.message);
    }
});

connectToWhatsApp(); // 🚀 Inicia conexión

//funcion para oredenar
function 