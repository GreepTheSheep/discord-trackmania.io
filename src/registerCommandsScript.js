require('dotenv').config();
const { REST } = require('@discordjs/rest'),
    { SlashCommandBuilder } = require('@discordjs/builders'),
    { Routes } = require('discord-api-types/v9'),
    fs = require('fs'),
    rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

/**
 * Register all commands for a guild
 * @param {string} guildId The Guild ID to register commands for
 * @param {string} userId The bot's user ID
 */
async function registerCommands(guildId, userId) {
    try {
        console.log(`🔃 Started refreshing slash commands for guild ${guildId}.`);
        const commands = [];
        
        const commandFiles = await fs.readdirSync('./src/commands');
        for (const file of commandFiles) {
            // if file is a directory, take as category
            if (fs.statSync(`./src/commands/${file}`).isDirectory()) {
                const categoryCommands = await fs.readdirSync(`./src/commands/${file}`);
                for (const categoryCommand of categoryCommands) {
                    // take only if file is a JS file
                    if (categoryCommand.endsWith('.js')) {
                        const command = require(`./commands/${file}/${categoryCommand}`);
                        commands.push(
                            new SlashCommandBuilder()
                                .setName(command.name)
                                .setDescription(command.description ? file + ": " + command.description : 'No description for this command')
                        );
                    }
                }
            } else {
                if (file.endsWith('.js')) {
                    const command = require(`./commands/${file}`);
                    commands.push(
                        new SlashCommandBuilder()
                            .setName(command.name)
                            .setDescription(command.description ? command.description : 'No description for this command')
                    );
                }
            }
        }

        // console.log(commands);

        await rest.put(
            Routes.applicationGuildCommands(userId, guildId),
            { body: commands },
        );

        console.log(`✔️ Done.`);
    } catch (error) {
        console.error(error);
    }
}

module.exports = registerCommands;