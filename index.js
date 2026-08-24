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

  // Silenciar errores internos de paquetes NBT de versiones modernas
  bot._client.on('error', (err) => {});

  bot.on('spawn', async () => {
    console.log('[SISTEMA] ¡Conectado al lobby del servidor!');

    // 1. Mandar /login a los 4 segundos de entrar al Lobby
    setTimeout(() => {
      bot.chat(`/login ${CONFIG.passwordLogin}`);
      console.log('[SISTEMA] Login enviado. Esperando 2 minutos para asegurar el Survival...');
    }, 4000);

    // 2. Esperar 2 minutos (120 seg) tras la reconexión y enviar comando directo
    setTimeout(() => {
      console.log('[SISTEMA] Enviando comando /play survival...');
      bot.chat('/play survival');
      inSurvival = true;
      console.log('[SISTEMA] ¡Comando enviado! Entrando al Survival...');
    }, 124000); // 120 seg de espera + 4 seg del login
  });

  // Escuchar el chat del servidor en texto plano
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    console.log(`[CHAT] ${username}: ${message}`);

    if (message === '!hola') {
      bot.chat('¡Hola! Soy un bot AFK funcionando 24/7.');
    }
  });

  // Traducir mensajes del sistema a texto plano en consola
  bot.on('message', (jsonMsg) => {
    const txt = jsonMsg.toString().trim();
    if (txt) console.log(`[SERVIDOR] ${txt}`);
  });

  // Capturar la expulsión traducida a texto claro
  bot.on('kicked', (reason) => {
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
    inSurvival = false;
    console.log('[SISTEMA] Conexión perdida. Reconectando en 15 segundos...\n');
    setTimeout(startBot, 15000);
  });
}

startBot();
