require('dotenv').config();
const { ShardingManager } = require('discord.js');
const execArgs = process.argv.slice(2);
const shard = new ShardingManager('./src/bot.js',{
    token : process.env.DISCORD_TOKEN,
    shardArgs: execArgs,
    autoSpawn: true
});

let BotAPI = require('./api'),
    api = new BotAPI();
api.start();

shard.spawn().catch(e=>console.error(e));

shard.on('shardCreate', shard => {
    console.log(`[SHARD] Shard ${shard.id} started`);
});

module.exports = api;