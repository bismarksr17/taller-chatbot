const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("baileys");
const qrcode = require("qrcode-terminal");

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

    sock.ev.on('messages.upsert', async function (event) {

        for (const m of event.messages) {
            console.log(JSON.stringify(m, undefined, 2))

            const id = m.key.remoteJid

            if (type != 'notify' || m.key.fromMe || id.includes('@g.us') || id.includes('@broadcast')) {
                return; // Ignora mensajes que no son notificaciones, enviados por el propio bot, o de grupos/broadcasts
            }

            console.log('Respondiendo a ', m.key.remoteJid)
            await sock.sendMessage(m.key.remoteJid, { text: 'Hello Word' })
        }
    });

    
}

// run in main file
connectToWhatsApp()