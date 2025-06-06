const { default: makeWASocket, useMultiFileAuthState } = require("baileys");

async function conectarWhatsApp() {

  //useMultiFileAuthState es una función que crea un estado de autenticación en un carpeta
  //state es el estado de autenticación que se guarda en la carpeta auth_info_baileys
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  //makeWASocket es una función que crea un socket de WhatsApp
  //sock se encargara de enviar mensajes, recibir eventos, recibir mensajes, etc.
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true, // Imprime el código QR en la terminal
  });

  // guarda la sesión de WhatsApp
  sock.ev.on("creds.update", saveCreds); // Guarda las credenciales cuando se actualizan
}

conectarWhatsApp();