const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals: { GoalBlock } } = require('mineflayer-pathfinder');
const config = require('./settings.json');
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot has arrived');
});

app.listen(8080, () => {
  console.log('Server started');
});

function createBot() {
  const bot = mineflayer.createBot({
    username: config['bot-account']['username'],
    password: config['bot-account']['password'],
    auth: config['bot-account']['type'],
    host: config.server.ip,
    port: config.server.port,
    version: config.server.version,
  });

  bot.loadPlugin(pathfinder);

  bot.once('spawn', () => {
    const mcData = require('minecraft-data')(bot.version);
    const defaultMove = new Movements(bot, mcData);
    bot.pathfinder.setMovements(defaultMove);

    console.log('Bot spawned and walking randomly...');

    function randomWalk() {
      // Random coordinates around spawn
      const x = bot.entity.position.x + (Math.random() * 20 - 10);
      const y = bot.entity.position.y;
      const z = bot.entity.position.z + (Math.random() * 20 - 10);

      const goal = new GoalBlock(Math.floor(x), Math.floor(y), Math.floor(z));
      bot.pathfinder.setGoal(goal);

      // Walk every 15 seconds
      setTimeout(randomWalk, 15000);
    }

    randomWalk();
  });

  bot.on('error', (err) => console.log('Error:', err));
  bot.on('end', () => {
    console.log('Bot disconnected. Reconnecting...');
    setTimeout(createBot, 5000);
  });
}

createBot();
