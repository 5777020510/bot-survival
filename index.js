const http = require('http');
http.createServer((req, res) => res.end('Bot activo 24/7')).listen(process.env.PORT || 3000);

const stdoutWrite = process.stdout.write;
process.stdout.write = function (string) {
  if (typeof string === 'string' && (string.includes('Chunk size') || string.includes('partial packet'))) return;
  return stdoutWrite.apply(process.stdout, arguments);
};

const mineflayer = require('mineflayer');
const { HttpProxyAgent } = require('http-proxy-agent');

// TUS DATOS EXACTOS DE WEBSHARE
const proxyUrl = 'http://nrsmplds:ty62hirpi3jq@31.59.20.176:6754';
const agent = new HttpProxyAgent(proxyUrl);

const CONFIG = {
  host: 'fancyverso.net', // <-- PON AQUÍ LA IP DE TU SERVIDOR DE MINECRAFT
  port: 25565,                  // <-- PUERTO
  username: 'xafkfx',   // <-- TU NICK
  version: '1.21.11',             // <-- TU VERSIÓN DE MINECRAFT
  passwordLogin: 'xafk123'    // <-- TU CONTRASEÑA EN EL SERVIDOR
};

function startBot() {
  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version,
    agent: agent
  });

  let inSurvival = false;

  bot.on('spawn', async () => {
    if (inSurvival) return;

    console.log('¡Conectado exitosamente con Proxy Residencial!');

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

  bot.on('error', err => console.log('Error:', err.message));

  bot.on('end', () => {
    inSurvival = false;
    console.log('Reconectando en 15s...');
    setTimeout(startBot, 15000);
  });
}

startBot();
