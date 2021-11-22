require('dotenv').config();
const { REST } = require('@discordjs/rest'),
    { SlashCommandBuilder } = require('@discordjs/builders'),
    { Routes } = require('discord-api-types/v9'),
    rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN),
    Command = require('./structures/Command'); // eslint-disable-line no-unused-vars

/**
 * Register all commands for a guild
 * @param {string} guildId The Guild ID to register commands for
 * @param {string} userId The bot's user ID
 * @param {Command[]} commands The list of commands to register
 */
async function registerCommands(guildId, userId, commands) {
    try {
        console.log(`🔃 Started refreshing slash commands for guild ${guildId}.`);
        const bodyCommands = [];
        
        for (const command of commands) {
            bodyCommands.push(
                new SlashCommandBuilder()
                    .setName(command.name)
                    .setDescription(command.description ? (command.category ? command.category + ": " : "") + command.description : 'No description for this command')
            );
        }

        console.log(commands);

        await rest.put(
            Routes.applicationGuildCommands(userId, guildId),
            { body: bodyCommands },
        );

        console.log(`✔️ Done.`);
    } catch (error) {
        console.error(error);
    }
}

module.exports = registerCommands;