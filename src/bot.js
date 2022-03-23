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

    tmio.setUserAgent('DiscordBot ' + client.user.tag + ' (' + client.user.id + ')');

    commands = require('./fetchAllCommands')();

    // Register commands
    client.guilds.cache.forEach(async (guild) => {
        await require('./registerCommandsScript')(guild.id, client.user.id, commands);
    });
});

client.on('interactionCreate', async interaction => {
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

        if (categoryId === '_') categoryId = interaction.customId.substring(idIndexOf);
        else argument = interaction.customId.substring(interaction.customId.indexOf('_', idIndexOf)+1);

        await command.executeSelectMenu(interaction, categoryId, argument, tmio, commands, sql);

    } else if (interaction.isButton()) {

        const command = commands.find(c => c.name === interaction.customId.split('_')[0]);
        if (!command) return;

        let idIndexOf = interaction.customId.indexOf('_')+1,
            buttonId = interaction.customId.substring(idIndexOf, interaction.customId.indexOf('_', idIndexOf)),
            argument = null;

        if (buttonId === '_') buttonId = interaction.customId.substring(idIndexOf);
        else argument = interaction.customId.substring(interaction.customId.indexOf('_', idIndexOf)+1);

        await command.executeButton(interaction, buttonId, argument, tmio, commands, sql);

    }
});