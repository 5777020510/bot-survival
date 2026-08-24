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

  // Limpiar el reloj para que deje de enviar el comando una vez dentro
  function detencionBucle() {
    if (intervalPlaySurvival) {
      clearInterval(intervalPlaySurvival);
      intervalPlaySurvival = null;
    }
  }

  // Silenciar errores internos NBT
  bot._client.on('error', (err) => {});

  bot.on('spawn', async () => {
    console.log('[SISTEMA] ¡Conectado al servidor/lobby!');
    detencionBucle();
    inSurvival = false;

    // 1. Loguearse a los 3 segundos
    setTimeout(() => {
      bot.chat(`/login ${CONFIG.passwordLogin}`);
      console.log('[SISTEMA] Login enviado. Iniciando intentos de ingreso al Survival...');

      // 2. Intentar entrar inmediatamente la primera vez
      bot.chat('/play survival');

      // 3. Reintentar /play survival cada 6 segundos hasta lograr entrar
      intervalPlaySurvival = setInterval(() => {
        if (!inSurvival) {
          console.log('[SISTEMA] Reintentando /play survival...');
          bot.chat('/play survival');
        } else {
          detencionBucle();
        }
      }, 6000);

    }, 3000);
  });

  // Escuchar el chat del servidor en texto plano
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    console.log(`[CHAT] ${username}: ${message}`);

    if (message === '!hola') {
      bot.chat('¡Hola! Soy un bot AFK funcionando 24/7.');
    }
  });

  // Traducir mensajes del servidor y detectar ingreso al Survival
  bot.on('message', (jsonMsg) => {
    const txt = jsonMsg.toString().trim();
    if (!txt) return;

    console.log(`[SERVIDOR] ${txt}`);

    // Si el servidor confirma la entrada al Survival
    const txtLower = txt.toLowerCase();
    if (
      txtLower.includes('conectando a survival') || 
      txtLower.includes('enviando a survival') ||
      txtLower.includes('bienvenido a survival') ||
      txtLower.includes('conectado a survival')
    ) {
      inSurvival = true;
      detencionBucle();
      console.log('[SISTEMA] ¡Ingreso al Survival confirmado! Bucle de comando detenido.');
    }
  });

  // Capturar expulsión
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
