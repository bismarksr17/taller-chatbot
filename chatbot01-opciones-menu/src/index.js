const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("baileys");
const qrcode = require("qrcode-terminal");

const userContext = {};

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
        await conectarWhatsApp(); // Re-conecta si no se ha cerrado por logout
      }
    } else if(connection === 'open') {
      // Si la conexión se abre, muestra un mensaje en la terminal
      console.log('CONEXIÓN ABIERTA!!!');
    }
  });
  
  sock.ev.on('messages.upsert', async (event) => {
    for (const m of event.messages) {
      console.log(JSON.stringify(m, undefined, 2));
      const id = m.key.remoteJid;

      if (event.type != 'notify' || m.key.fromMe || id.includes('@g.us') || id.includes('@broadcast')) {
        return;
      }

      let mensaje = m.message?.conversation || m.message?.extendedTextMessage?.text;
      mensaje = mensaje+"".toUpperCase();

      if (!userContext[id]) {
        userContext[id] = {menuActual: "main"};
        enviarMenu(sock, id, "main");
        return;
      }
      
      console.log("MENSAJES: ", mensaje);
      console.log("CONTACTOS: ", userContext);
      
      const menuActual = userContext[id].menuActual;
      const menu = menuData[menuActual];

      const opcionSeleccionada = menu.options[mensaje];
      if (opcionSeleccionada) {
        if (opcionSeleccionada.respuesta) {
          const tipo = opcionSeleccionada.respuesta.tipo;
          if(tipo === "text") {
            await sock.sendMessage(id, {text: opcionSeleccionada.respuesta.msg});
          }
          if(tipo === "image") {
            await sock.sendMessage(id, {image: opcionSeleccionada.respuesta.msg});
          }
          if(tipo === "location") {
            await sock.sendMessage(id, {location: opcionSeleccionada.respuesta.msg});
          }
        }
        if (opcionSeleccionada.submenu) {
          userContext[id].menuActual = opcionSeleccionada.submenu;
          enviarMenu(sock, id, opcionSeleccionada.submenu);
        }
      } else {
        await sock.sendMessage(id, {text: "Por favor, selecciona una opcion valida del menu"});
      }

      enviarMenu(sock, id, "main");

      //console.log("respondiendo a: ", m.key.remoteJid);
      //await sock.sendMessage(id, {text: "Hola mundo...!!!"});
    }
  });
}

conectarWhatsApp();

async function enviarMenu(sock, id, menuKey) {
  const menu = menuData[menuKey]

  const optionText = Object.entries(menu.options)
      .map(([key, option]) => `- 👉 *${key}*: ${option.text}`)
      .join("\n");
  const menuMensaje = `${menu.mensaje}\n${optionText}\n\n> *Indicanos una opcion*`;
  sock.sendMessage(id, {text: menuMensaje});
}

const menuData = {
  main : {
    mensaje: "*Hola, bienvenido, Como puedo ayudarte?*",
    options: {
      A: {
        text: "Mas informacion",
        respuesta: {
          tipo: "text",
          msg: "Nosotros somos una empresa que nos dedicamos..."
        }
      },
      B: {
        text: "Ver catalogo",
        respuesta: {
          tipo: "image",
          msg: {
            url: "https://th.bing.com/th/id/OIP.l7eey5U421cgks21ps8jeAHaC7?rs=1&pid=ImgDetMain"
            }
        }
      },
      C: {
        text: "Ver ubicacion",
        respuesta: {
          tipo: "location",
          msg: {
            degreesLatitude: "-17.3155194686467",
            degreesLongitude: "-63.262421487265016",
            address: "IAG"
          }
        }
      },
      D: {
        text: "Nuestros servicios",
        submenu: "servicios"
      },
      E: {
        text: "Hablar con un asesor",
        respuesta: {
          tipo: "text",
          msg: "Contactanos, este es nuestro numero: +59178194371"
        }
      }
    }
  },
  servicios : {
    mensaje: "*Observe nuestros servicios*",
    options: {
      1: {
        text: "Desarrollo de software",
        respuesta: {
          tipo: "text",
          msg: "Desarrollamos software a la medida, para tu negocio"
        }
      },
      2: {
        text: "Nuestros clientes",
        respuesta: {
          tipo: "image",
          msg: {
            url: "https://th.bing.com/th/id/OIP.vWKIRYXzPj1j9u5qby2qnwHaFj?w=1400&h=1050&rs=1&pid=ImgDetMain"
          }
        }
      },
      3: {
        text: "Volver a menu principal",
        submenu: "main"
      }
    }
  }
}