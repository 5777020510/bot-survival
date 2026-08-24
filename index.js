const mineflayer = require('mineflayer');
const readline = require('readline');

const CONFIG = {
  host: 'fancyverso.net',
  port: 25565,
  username: 'xafkfx',
  version: '1.20.4',
  passwordLogin: 'xafk123'
};

// Crear interfaz para escribir comandos/chat desde Termux
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function startBot() {
  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version,
    viewDistance: 'tiny',          // Mínima carga de chunks
    checkTimeoutInterval: 120000,  // Margen de datos móviles
    loadInternalChunking: false   // No guardar mapa en RAM
  });

  let inSurvival = false;
  let intervalPlaySurvival = null;

  function detencionBucle() {
    if (intervalPlaySurvival) {
      clearInterval(intervalPlaySurvival);
      intervalPlaySurvival = null;
    }
  }

  function iniciarBucleReconexion() {
    if (intervalPlaySurvival) return;
    
    console.log('[SISTEMA] Enviando /play survival...');
    bot.chat('/play survival');

    intervalPlaySurvival = setInterval(() => {
      if (!inSurvival) {
        console.log('[SISTEMA] Reintentando /play survival...');
        bot.chat('/play survival');
      } else {
        detencionBucle();
      }
    }, 8000);
  }

  // Permite enviar mensajes o comandos directo escribiendo en Termux
  rl.removeAllListeners('line');
  rl.on('line', (line) => {
    const input = line.trim();
    if (input.length > 0) {
      bot.chat(input);
      console.log(`[ENVIADO] ${input}`);
    }
  });

  bot.once('spawn', () => {
    // Apagar físicas para ahorrar 90% de CPU y batería
    if (bot.physics) bot.physicsEnabled = false;
  });

  bot._client.on('error', () => {});

  bot.on('spawn', () => {
    console.log('[SISTEMA] Conectado al servidor.');
    detencionBucle();
    inSurvival = false;

    setTimeout(() => {
      bot.chat(`/login ${CONFIG.passwordLogin}`);
      console.log('[SISTEMA] Login enviado.');
      iniciarBucleReconexion();
    }, 4000);
  });

  // Evento ÚNICO para el chat (Evita duplicados y traduce el formato del server)
  bot.on('message', (jsonMsg) => {
    const txt = jsonMsg.toString().trim();
    if (!txt) return;

    // Imprimir mensaje limpio en consola
    console.log(txt);

    const txtLower = txt.toLowerCase();

    // Confirmación de ingreso a Survival
    if (
      txtLower.includes('conectando a survival') || 
      txtLower.includes('enviando a survival') ||
      txtLower.includes('bienvenido a survival') ||
      txtLower.includes('conectado a survival')
    ) {
      inSurvival = true;
      detencionBucle();
      console.log('[SISTEMA] ¡En Survival! AFK de granja activo.');
    }

    // Detección de caída al Lobby/Reinicio
    if (
      txtLower.includes('you were kicked from survival') ||
      txtLower.includes('server is restarting') ||
      txtLower.includes('bienvenid@ xafkfx') ||
      txtLower.includes('reiniciando')
    ) {
      if (inSurvival) {
        console.log('[SISTEMA] Caída a lobby detectada. Reintentando entrada...');
        inSurvival = false;
        iniciarBucleReconexion();
      }
    }
  });

  // Limpieza automática de memoria RAM cada 15 minutos
  setInterval(() => {
    if (bot.entities) {
      // Vaciar registro interno de entidades alrededor
      for (const id in bot.entities) {
        delete bot.entities[id];
      }
    }
    if (global.gc) {
      global.gc(); // Forzar liberación de RAM
    }
    console.log('[MEMORIA] Limpieza de RAM ejecutada correctamente.');
  }, 900000);

  bot.on('kicked', (reason) => {
    detencionBucle();
    let motivoLimpio = reason;
    try {
      if (typeof reason === 'object') {
        motivoLimpio = reason.value?.text?.value || JSON.stringify(reason);
      }
    } catch (e) {
      motivoLimpio = reason;
    }
    console.log(`\n[EXPULSADO] Motivo: "${motivoLimpio}"\n`);
    inSurvival = false;
  });

  bot.on('error', err => console.log('[ERROR]', err.message));

  bot.on('end', () => {
    detencionBucle();
    inSurvival = false;
    console.log('[SISTEMA] Reconectando en 15 segundos...\n');
    setTimeout(startBot, 15000);
  });
}

startBot();
