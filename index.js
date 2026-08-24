const http = require('http');
http.createServer((req, res) => res.end('Bot activo 24/7 en Android')).listen(process.env.PORT || 3000);

const mineflayer = require('mineflayer');

const CONFIG = {
  host: 'fancyverso.net',
  port: 25565,
  username: 'xafkfx',
  version: '1.20.4',
  passwordLogin: 'xafk123'
};

function startBot() {
  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version,
    checkTimeoutInterval: 60000
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
    
    console.log('[SISTEMA] Iniciando bucle de reintento /play survival...');
    bot.chat('/play survival');

    intervalPlaySurvival = setInterval(() => {
      if (!inSurvival) {
        console.log('[SISTEMA] Reintentando /play survival...');
        bot.chat('/play survival');
      } else {
        detencionBucle();
      }
    }, 6000);
  }

  bot._client.on('error', (err) => {});

  bot.on('spawn', async () => {
    console.log('[SISTEMA] ¡Conectado al servidor!');
    detencionBucle();
    inSurvival = false;

    setTimeout(() => {
      bot.chat(`/login ${CONFIG.passwordLogin}`);
      console.log('[SISTEMA] Login enviado.');
      iniciarBucleReconexion();
    }, 3000);
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    console.log(`[CHAT] ${username}: ${message}`);

    if (message === '!hola') {
      bot.chat('¡Hola! Soy un bot AFK funcionando 24/7.');
    }
  });

  // Detectar mensajes con las frases exactas del servidor
  bot.on('message', (jsonMsg) => {
    const txt = jsonMsg.toString().trim();
    if (!txt) return;

    console.log(`[SERVIDOR] ${txt}`);
    const txtLower = txt.toLowerCase();

    // 1. Confirmación de entrada a Survival
    if (
      txtLower.includes('conectando a survival') || 
      txtLower.includes('enviando a survival') ||
      txtLower.includes('bienvenido a survival') ||
      txtLower.includes('conectado a survival')
    ) {
      inSurvival = true;
      detencionBucle();
      console.log('[SISTEMA] ¡Confirmado en Survival! Bucle detenido.');
    }

    // 2. Detección exacta de expulsión al Lobby tras el reinicio
    if (
      txtLower.includes('You were kicked from Survival-Worlds') ||
      txtLower.includes('Server is restarting') ||
      txtLower.includes('bienvenid@ xafkfx') ||
      txtLower.includes('reiniciando')
    ) {
      if (inSurvival) {
        console.log('[SISTEMA] Reinicio de Survival detectado. Reactivando /play survival...');
        inSurvival = false;
        iniciarBucleReconexion();
      }
    }
  });

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

    console.log(`\n[EXPULSADO] Motivo real: "${motivoLimpio}"\n`);
    inSurvival = false;
  });

  bot.on('error', err => {
    console.log('[ERROR CONEXION]', err.message);
  });

  bot.on('end', () => {
    detencionBucle();
    inSurvival = false;
    console.log('[SISTEMA] Conexión perdida. Reconectando en 15 segundos...\n');
    setTimeout(startBot, 15000);
  });
}

startBot();
