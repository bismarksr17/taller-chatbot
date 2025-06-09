const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("baileys");
const qrcode = require("qrcode-terminal");

async function conectarWhatsApp() {

  //useMultiFileAuthState es una función que crea un estado de autenticación en un carpeta
  //state es el estado de autenticación que se guarda en la carpeta auth_info_baileys
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  //makeWASocket es una función que crea un socket de WhatsApp
  //sock se encargara de enviar mensajes, recibir eventos, recibir mensajes, etc.
  const sock = makeWASocket({
    auth: state,
  });

  // guarda la sesión de WhatsApp
  sock.ev.on("creds.update", saveCreds); // Guarda las credenciales cuando se actualizan

  // evento de conexión
  sock.ev.on('connection.update', async (update) => {
    const {connection, lastDisconnect, qr} = update;
    console.log(qr);
    // Si hay un código QR, lo genera y lo muestra en la terminal
    if (qr) {
      qrcode.generate(qr, {small: true});
    }
    // Maneja el estado de conexión
    if(connection === 'close') {
      // Si la conexión se cierra, verifica si se puede re conectar
      const puedoConectar = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if(puedoConectar) {
        conectarWhatsApp(); // Re-conecta si no se ha cerrado por logout
      }
    } else if(connection === 'open') {
      // Si la conexión se abre, muestra un mensaje en la terminal
      console.log('CONEXIÓN ABIERTA!!!');
    }
  });

  sock.ev.on('messages.upsert', async function (event) {
    
    //console.log(event);
    const type = event.type;
    const message = event.messages[0];
    const id = message.key.remoteJid;

    if (type != 'notify' || message.key.fromMe || id.includes('@g.us') || id.includes('@broadcast')) {
      return; // Ignora mensajes que no son notificaciones, enviados por el propio bot, 
              // o de grupos/broadcasts
    }

    if (id==="59177040205@s.whatsapp.net" || id==="59175380725@s.whatsapp.net" || id==="59168908131@s.whatsapp.net"){

      let mensaje = message.message?.conversation || message.message?.extendedTextMessage?.text;
      mensaje = mensaje+"".toLowerCase();
      console.log(mensaje)
      if (mensaje === "Reporte") {
        const m = obtenerFechaHoraTexto();
        console.log(m);
        await sock.sendMessage(id, {
          text: m
        });
      }
    }
    //await sock.sendMessage(id, {
    //  text: "Hola soy un Bot!, en que te puedo ayudar?" 
    //});

  });
}

conectarWhatsApp();

function obtenerFechaHoraTexto() {
  const ahora = new Date();
  const pad = n => n.toString().padStart(2, '0');

  const fecha = `${pad(ahora.getDate())}/${pad(ahora.getMonth() + 1)}/${ahora.getFullYear()}`;
  const hora = `${pad(ahora.getHours())}:${pad(ahora.getMinutes())}:${pad(ahora.getSeconds())}`;

  return `🕒 Fecha y hora actual: ${fecha} ${hora}`;
}