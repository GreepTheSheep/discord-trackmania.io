require('dotenv').config();
const { REST } = require('@discordjs/rest'),
    Builder = require('@discordjs/builders'),
    { Routes, ChannelType } = require('discord-api-types/v9'),
    rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN),
    Command = require('./structures/Command');

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
            let slashCommand = new Builder.SlashCommandBuilder()
                .setName(command.name)
                .setDescription(command.description ? (command.category ? command.category.name + ": " : "") + command.description : 'No description for this command');

            if (command.args && command.args.length > 0) {
                command.args.forEach(arg => {
                    if (arg.type == 'string') {
                        let slashCommandOption = new Builder.SlashCommandStringOption()
                            .setName(arg.name)
                            .setDescription(arg.description ? arg.description : 'No description for this argument')
                            .setRequired(arg.required);

                        if (arg.choices && arg.choices.length > 0) {
                            arg.choices.forEach(choice => {
                                if (choice) slashCommandOption.addChoice(choice.name, choice.value);
                            });
                        }

                        slashCommand.addStringOption(slashCommandOption);
                    } else if (arg.type == 'bool') {
                        let slashCommandOption = new Builder.SlashCommandBooleanOption()
                            .setName(arg.name)
                            .setDescription(arg.description ? arg.description : 'No description for this argument')
                            .setRequired(arg.required);

                        slashCommand.addBooleanOption(slashCommandOption);
                    } else if (arg.type == 'number') {
                        let slashCommandOption = new Builder.SlashCommandNumberOption()
                            .setName(arg.name)
                            .setDescription(arg.description ? arg.description : 'No description for this argument')
                            .setRequired(arg.required);

                        if (arg.choices && arg.choices.length > 0) {
                            arg.choices.forEach(choice => slashCommandOption.addChoice(choice.name, choice.value));
                        }

                        slashCommand.addNumberOption(slashCommandOption);
                    } else if (arg.type == 'channel') {
                        let slashCommandOption = new Builder.SlashCommandChannelOption()
                            .setName(arg.name)
                            .setDescription(arg.description ? arg.description : 'No description for this argument')
                            .setRequired(arg.required);

                        if (arg.channelTypes && arg.channelTypes.length > 0) {
                            arg.channelTypes.forEach(channelType => slashCommandOption.addChannelType(typeof channelType == 'string' ? ChannelType[channelType] : channelType));
                        }

                        if (arg.choices && arg.choices.length > 0) {
                            arg.choices.forEach(choice => slashCommandOption.addChannelType(choice.value));
                        }

                        slashCommand.addChannelOption(slashCommandOption);
                    } else if (arg.type == 'mention') {
                        let slashCommandOption = new Builder.SlashCommandMentionableOption()
                            .setName(arg.name)
                            .setDescription(arg.description ? arg.description : 'No description for this argument')
                            .setRequired(arg.required);

                        slashCommand.addMentionableOption(slashCommandOption);
                    } else if (arg.type == 'role') {
                        let slashCommandOption = new Builder.SlashCommandRoleOption()
                            .setName(arg.name)
                            .setDescription(arg.description ? arg.description : 'No description for this argument')
                            .setRequired(arg.required);

                        slashCommand.addRoleOption(slashCommandOption);
                    } else if (arg.type == 'user') {
                        let slashCommandOption = new Builder.SlashCommandUserOption()
                            .setName(arg.name)
                            .setDescription(arg.description ? arg.description : 'No description for this argument')
                            .setRequired(arg.required);

                        slashCommand.addUserOption(slashCommandOption);
                    }
                });
            }

            bodyCommands.push(slashCommand);
        }

        await rest.put(
            Routes.applicationGuildCommands(userId, guildId),
            { body: bodyCommands },
        ).catch(err => {
            if (err.code == 50013) {
                console.log(`Guild ${guildId} does not exist.`);
            }
            if (err.code == 50001) {
                console.log(`Missing access for guild ${guildId}.`);
            }
        });

        console.log(`✔️  Done.`);
    } catch (error) {
        console.error(error);
    }
}

module.exports = registerCommands;