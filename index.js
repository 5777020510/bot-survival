const http = require('http');
http.createServer((req, res) => res.end('Bot activo 24/7 en Android')).listen(process.env.PORT || 3000);

const mineflayer = require('mineflayer');

const CONFIG = {
  host: 'fancyverso.net',
  port: 25565,
  username: 'xafkfx',
  version: '1.20.4', // Usamos 1.20.4 para evitar el fallo de NBT de la 1.21 en viaversion
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

  // Anular el choque de paquetes NBT de chat
  bot._client.on('error', (err) => {
    if (err.message && err.message.includes('compound')) return;
  });

  bot.on('spawn', async () => {
    if (inSurvival) return;

    console.log('¡Conectado al servidor!');

    setTimeout(() => {
      bot.chat(`/login ${CONFIG.passwordLogin}`);
      console.log('Login enviado.');
    }, 4000);

    setTimeout(() => {
      console.log('Avanzando hacia el NPC...');
      bot.setControlState('forward', true);

      setTimeout(() => {
        bot.setControlState('forward', false);

        setTimeout(() => {
          console.log('Entrando al Survival...');

          const entity = bot.nearestEntity(e => e.type === 'player' || e.type === 'mob');
          if (entity) {
            bot.activateEntity(entity);
            bot.attack(entity);
          } else {
            bot.swingArm('mainhand');
          }

          inSurvival = true;
          console.log('¡Bot dentro del Survival!');

        }, 1000);

      }, 2500);

    }, 8000);
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
