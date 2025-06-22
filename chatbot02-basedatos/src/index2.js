const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("baileys");
const qrcode = require("qrcode-terminal");

const Contacto = require("./Contacto")
const Cliente = require("./Cliente");
const Reporte = require('./Reporte');

async function connectToWhatsApp() {

    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')

    const sock = makeWASocket({
        // can provide additional config here
        auth: state,
    });

    // to storage creds (session info) when it updates
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update
        if (qr) {
              qrcode.generate(qr, {small: true});
            }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('Conexión cerrada ', lastDisconnect.error, ', re-conectando ', shouldReconnect)
            // reconnect if not logged out
            if (shouldReconnect) {
                connectToWhatsApp()
            }
        } else if (connection === 'open') {
            console.log('CONEXIÓN ABIERTA!!!')
        }
    });

    const { obtenerMensajeReporte } = require('./reporteMensaje'); 

    sock.ev.on('messages.upsert', async function (event) {
    for (const m of event.messages) {
        const id = m.key.remoteJid;

        // Ignorar mensajes de grupos, broadcast o del mismo bot
        if (event.type !== 'notify' || m.key.fromMe || id.includes('@g.us') || id.includes('@broadcast')) {
            return;
        }

        // Validar si el mensaje es de texto
        const mensajeTexto = m.message?.conversation || m.message?.extendedTextMessage?.text;

        if (mensajeTexto && mensajeTexto.trim().toLowerCase() === 'reporte') {
            const reporte = await obtenerMensajeReporte();
            await sock.sendMessage(id, { text: reporte });
        }

        // ... aquí puedes mantener el resto de tu lógica actual si quieres
    }
});
    
}

// run in main file
connectToWhatsApp()