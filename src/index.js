require('dotenv').config();
const { Client, Intents } = require('discord.js'),
    client = new Client({
        intents: [Intents.FLAGS.GUILDS]
    }),
    fs = require('fs');
   

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Register commands
    client.guilds.cache.forEach(async (guild) => {
        await require('./registerCommandsScript')(guild.id, client.user.id);
    });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const commandFiles = await fs.readdirSync('./src/commands');
    for (const file of commandFiles) {
        // if file is a directory, take as category
        if (fs.statSync(`./src/commands/${file}`).isDirectory()) {
            const categoryCommands = await fs.readdirSync(`./src/commands/${file}`);
            for (const categoryCommand of categoryCommands) {
                // take only if file is a JS file
                if (categoryCommand.endsWith('.js')) {
                    const command = require(`./commands/${file}/${categoryCommand}`);
                    if (interaction.commandName === command.name) {
                        await command.execute(interaction);
                    }
                }
            }
        } else {
            if (file.endsWith('.js')) {
                const command = require(`./commands/${file}`);
                if (interaction.commandName === command.name) {
                    await command.execute(interaction);
                }
            }
        }
    }
});

client.on('messageCreate', async message => {
    console.log(message.content);

    if (message.author.bot) return;
    if (!message.content.startsWith(process.env.PREFIX)) return;
    const prefix = process.env.PREFIX | 'tm!',
        command = message.content.split(' ')[0].slice(prefix.length),
        args = message.content.split(' ').slice(1);

    const commandFiles = await fs.readdirSync('./src/commands');
    for (const file of commandFiles) {
        // if file is a directory, take as category
        if (fs.statSync(`./src/commands/${file}`).isDirectory()) {
            const categoryCommands = await fs.readdirSync(`./src/commands/${file}`);
            for (const categoryCommand of categoryCommands) {
                // take only if file is a JS file
                if (categoryCommand.endsWith('.js')) {
                    const commandFile = require(`./commands/${file}/${categoryCommand}`);
                    if (message.content.startsWith(prefix+command)) {
                        await commandFile.executeMessage(message, args);
                    }
                }
            }
        } else {
            if (file.endsWith('.js')) {
                const commandFile = require(`./commands/${file}`);
                if (message.content.startsWith(prefix+command)) {
                    await commandFile.executeMessage(message, args);
                }
            }
        }
    }
});

client.login();