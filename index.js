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

  // Evitar que errores de paquetes NBT tumben el bot
  bot._client.on('error', (err) => {
    if (err.message && err.message.includes('compound')) return;
  });

  bot.on('spawn', async () => {
    console.log('¡Conectado al servidor/lobby!');

    // 1. Mandar /login a los 4 segundos
    setTimeout(() => {
      bot.chat(`/login ${CONFIG.passwordLogin}`);
      console.log('Login enviado.');
      console.log('Esperando 2 minutos a que el Survival abra tras el reinicio...');
    }, 4000);

    // 2. Esperar 2 minutos (120.000 ms) antes de intentar entrar al Survival
    setTimeout(() => {
      console.log('Pasaron los 2 minutos. Intentando entrar al Survival...');
      bot.setControlState('forward', true);

      setTimeout(() => {
        bot.setControlState('forward', false);

        setTimeout(() => {
          const entity = bot.nearestEntity(e => e.type === 'player' || e.type === 'mob');
          if (entity) {
            bot.activateEntity(entity);
            bot.attack(entity);
          } else {
            bot.swingArm('mainhand');
          }

          inSurvival = true;
          console.log('¡Bot adentro del Survival!');

        }, 1000);

      }, 2500);

    }, 124000); // 120 seg de espera + 4 seg del login
  });

  // Escuchar el chat del servidor
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    console.log(`[Chat] ${username}: ${message}`);

    if (message === '!hola') {
      bot.chat('¡Hola! Soy un bot AFK funcionando 24/7.');
    }
  });

  bot.on('message', (jsonMsg) => {
    console.log(jsonMsg.toString());
  });

  bot.on('kicked', (reason) => {
    console.log('Expulsado por:', JSON.stringify(reason));
    inSurvival = false;
  });

  bot.on('error', err => {
    if (!err.message.includes('compound')) {
      console.log('Error:', err.message);
    }
  });

  bot.on('end', () => {
    inSurvival = false;
    console.log('Reconectando en 15s...');
    setTimeout(startBot, 15000);
  });
}

startBot();
