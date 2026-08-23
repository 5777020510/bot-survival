const http = require('http');
http.createServer((req, res) => res.end('Bot activo 24/7')).listen(process.env.PORT || 3000);

// 1. SILENCIAR SPAM DE PACKETS/CHUNKS
const stdoutWrite = process.stdout.write;
process.stdout.write = function (string) {
  if (typeof string === 'string' && (string.includes('Chunk size') || string.includes('partial packet'))) return;
  return stdoutWrite.apply(process.stdout, arguments);
};

const mineflayer = require('mineflayer');
const readline = require('readline');

const CONFIG = {
  host: 'fancyverso.net', // TU IP
  port: 25565,                  // PUERTO
  username: 'xafkfx',   // TU NICK
  version: '1.21.11',             // TU VERSIÓN
  passwordLogin: 'xafk123'    // TU CONTRASEÑA
};

// Crear interfaz para escribir desde la consola
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function startBot() {
  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version
  });

  let inSurvival = false;

  bot.on('spawn', async () => {
    if (inSurvival) return;

    console.log('¡Conectado al servidor!');

    // 1. Login automático
    setTimeout(() => {
      bot.chat(`/login ${CONFIG.passwordLogin}`);
      console.log('Login enviado.');
    }, 2500);

    // 2. Caminar suavemente hacia el NPC
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

          // Mostrar coordenadas exactas 3 segundos después de entrar
          setTimeout(() => {
            if (bot.entity) {
              const { x, y, z } = bot.entity.position;
              console.log(`\n========================================`);
              console.log(`¡BOT EN SURVIVAL!`);
              console.log(`Ubicación exactas -> X: ${Math.round(x)}, Y: ${Math.round(y)}, Z: ${Math.round(z)}`);
              console.log(`Puedes escribir comandos aquí abajo (ejemplo: /tpaccept):`);
              console.log(`========================================\n`);
            }
          }, 3000);

        }, 500);

      }, 2000);

    }, 5000);
  });

  // Mostrar lo que dicen en el chat global
  bot.on('message', (jsonMsg) => {
    const text = jsonMsg.toString().trim();
    if (text) console.log(`[CHAT] ${text}`);
  });

  // Permitir escribir comandos desde el CMD
  rl.removeAllListeners('line');
  rl.on('line', (line) => {
    if (line.trim()) {
      bot.chat(line.trim());
    }
  });

  bot.on('kicked', (reason) => {
    // Convierte el objeto de respuesta en texto plano
    const cleanReason = typeof reason === 'object' ? JSON.stringify(reason) : reason;
    console.log('MOTIVO EXACTO DE EXPULSIÓN:', cleanReason);
    inSurvival = false;
  });

  bot.on('error', err => console.log('Error:', err.message));

  bot.on('end', () => {
    inSurvival = false;
    console.log('Desconectado. Reconectando en 10s...');
    setTimeout(startBot, 10000);
  });
}

startBot();
