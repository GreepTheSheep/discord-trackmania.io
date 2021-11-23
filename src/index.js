require('dotenv').config();
const Command = require('./structures/Command'), // eslint-disable-line no-unused-vars
    { Client, Intents } = require('discord.js'),
    client = new Client({
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
    }),
    TrackmaniaIO = require('trackmania.io'),
    tmio = new TrackmaniaIO.Client();

/**
 * The list of commands the bot will use
 * @type {Command[]}
 */
let commands=[];
   

client.on('ready', async () => {
    console.log(`🤖 Logged in as ${client.user.tag}!`);

    tmio.setUserAgent('DiscordBot ' + client.user.tag + ' (' + client.user.id + ')');

    commands = require('./fetchAllCommands')();

    // Register commands
    client.guilds.cache.forEach(async (guild) => {
        await require('./registerCommandsScript')(guild.id, client.user.id, commands);
    });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = commands.find(c => c.name === interaction.commandName);
    if (!command) return;

    await command.execute(interaction, tmio, commands);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    let prefix = process.env.PREFIX;
    if (!prefix) prefix = 'tm!'; 
    if (!message.content.startsWith(prefix)) return;
    const typedCommand = message.content.split(' ')[0].slice(prefix.length),
        args = message.content.split(' ').slice(1),
        command = commands.find(c => c.name === typedCommand);

    if (!command) return;

    await command.executeMessage(message, args, tmio, commands);
});

client.login();