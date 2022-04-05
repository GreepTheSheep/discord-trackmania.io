require('dotenv').config();
const Command = require('./structures/Command'),
    { Client, Intents } = require('discord.js'),
    client = new Client({
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
    }),
    TrackmaniaIO = require('trackmania.io'),
    tmio = new TrackmaniaIO.Client();
let sql = require('mysql').createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

sql.connect((err)=>{
    if (err){
        console.error('❌ Impossible to connect to MySQL server. Code: ' + err.code);
        console.error('❌ All queries will be ignored, it can broke your bot!');
        sql = null;
    } else {
        console.log('📔 Connected to the MySQL server! Connexion ID: ' + sql.threadId);
    }

    client.login().catch(err=>{
        console.error("❌ Connexion to Discord failed: " + err);
        process.exit(1);
    });
});

/**
 * The list of commands the bot will use
 * @type {Command[]}
 */
let commands=[];


client.on('ready', async () => {
    console.log(`🤖 Logged in as ${client.user.tag}!`);
    client.user.setActivity('Bot is starting up...', {type: 'WATCHING'});

    tmio.setUserAgent('DiscordBot ' + client.user.tag + ' (' + client.user.id + ')');

    commands = require('./fetchAllCommands')();

    // Register commands
    client.guilds.cache.forEach(async (guild) => {
        await require('./registerCommandsScript')(guild.id, client.user.id, commands);
    });

    require('./botStatus')(client, tmio, commands);
});

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isCommand()) {
            const command = commands.find(c => c.name === interaction.commandName);
            if (!command) return;

            await command.execute(interaction, tmio, commands, sql);

        } else if (interaction.isSelectMenu()) {

            const command = commands.find(c => c.name === interaction.customId.split('_')[0]);
            if (!command) return;

            let idIndexOf = interaction.customId.indexOf('_')+1,
                categoryId = interaction.customId.substring(idIndexOf, interaction.customId.indexOf('_', idIndexOf)),
                argument = null;

            if (categoryId === command.name+'_') categoryId = interaction.customId.substring(idIndexOf);
            else argument = interaction.customId.substring(interaction.customId.indexOf('_', idIndexOf)+1);

            await command.executeSelectMenu(interaction, categoryId, argument, tmio, commands, sql);

        } else if (interaction.isButton()) {

            const command = commands.find(c => c.name === interaction.customId.split('_')[0]);
            if (!command) return;

            let idIndexOf = interaction.customId.indexOf('_')+1,
                buttonId = interaction.customId.substring(idIndexOf, interaction.customId.indexOf('_', idIndexOf)),
                argument = null;

            if (buttonId === command.name+'_') buttonId = interaction.customId.substring(idIndexOf);
            else argument = interaction.customId.substring(interaction.customId.indexOf('_', idIndexOf)+1);

            await command.executeButton(interaction, buttonId, argument, tmio, commands, sql);

        }
    } catch (err) {
        interaction.reply('❌ An error occurred while executing the command: ' + err);
        console.error(err);
    }
});

tmio.on('totd', totd=>{
    require('./events/totd')(client, totd, tmio, sql);
});

tmio.on('apiRequest', request=>{
    console.log('Request to: ' + request.url);
});

tmio.on('apiResponse', ()=>{
    console.log(tmio.ratelimit.remaining + ' requests remaining, reset in ' + (tmio.ratelimit.reset - Date.now()) + 'ms');
});

tmio.on('debug', (instance, message)=>{
    console.log('[TMIO DEBUG ('+instance+')] ' + message);
});

tmio.on('error', message=>{
    console.log('[TMIO ERROR] ' + message);
});