require('dotenv').config();
const DJS = require("discord.js"),
    rest = new DJS.REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN),
    Command = require('./structures/Command');

/**
 * Register all commands for a guild
 * @param {string|null} guildId The Guild ID to register commands for
 * @param {string} userId The bot's user ID
 * @param {Command[]} commands The list of commands to register
 */
async function registerCommands(guildId, userId, commands) {
    try {
        if (typeof guildId == "string")
            console.log(`🔃 Started refreshing slash commands for guild ${guildId}.`);
        else
            console.log(`🔃 Started refreshing global slash commands.`);
        const bodyCommands = [];

        for (const command of commands) {
            let slashCommand = new DJS.SlashCommandBuilder()
                .setName(command.name)
                .setDescription(command.description ? (command.category ? command.category.name + ": " : "") + command.description : 'No description for this command');

            if (command.args && command.args.length > 0) {
                command.args.forEach(arg => {
                    if (arg.type == 'string') {
                        let slashCommandOption = new DJS.SlashCommandStringOption()
                            .setName(arg.name)
                            .setDescription(arg.description ? arg.description : 'No description for this argument')
                            .setRequired(arg.required);

                        if (arg.choices && arg.choices.length > 0) {
                            arg.choices.forEach(choice => {
                                if (choice != null) slashCommandOption.addChoices(choice);
                            });
                        }

                        slashCommand.addStringOption(slashCommandOption);
                    } else if (arg.type == 'bool') {
                        let slashCommandOption = new DJS.SlashCommandBooleanOption()
                            .setName(arg.name)
                            .setDescription(arg.description ? arg.description : 'No description for this argument')
                            .setRequired(arg.required);

                        slashCommand.addBooleanOption(slashCommandOption);
                    } else if (arg.type == 'number') {
                        let slashCommandOption = new DJS.SlashCommandNumberOption()
                            .setName(arg.name)
                            .setDescription(arg.description ? arg.description : 'No description for this argument')
                            .setRequired(arg.required);

                        if (arg.choices && arg.choices.length > 0) {
                            arg.choices.forEach(choice => {
                                if (choice != null) slashCommandOption.addChoices(choice);
                            });
                        }

                        slashCommand.addNumberOption(slashCommandOption);
                    } else if (arg.type == 'channel') {
                        let slashCommandOption = new DJS.SlashCommandChannelOption()
                            .setName(arg.name)
                            .setDescription(arg.description ? arg.description : 'No description for this argument')
                            .setRequired(arg.required);

                        if (arg.channelTypes && arg.channelTypes.length > 0) {
                            arg.channelTypes.forEach(channelType => slashCommandOption.addChannelTypes(typeof channelType == 'string' ? DJS.ChannelType[channelType] : channelType));
                        }

                        if (arg.choices && arg.choices.length > 0) {
                            arg.choices.forEach(choice => slashCommandOption.addChannelTypes(choice.value));
                        }

                        slashCommand.addChannelOption(slashCommandOption);
                    } else if (arg.type == 'mention') {
                        let slashCommandOption = new DJS.SlashCommandMentionableOption()
                            .setName(arg.name)
                            .setDescription(arg.description ? arg.description : 'No description for this argument')
                            .setRequired(arg.required);

                        slashCommand.addMentionableOption(slashCommandOption);
                    } else if (arg.type == 'role') {
                        let slashCommandOption = new DJS.SlashCommandRoleOption()
                            .setName(arg.name)
                            .setDescription(arg.description ? arg.description : 'No description for this argument')
                            .setRequired(arg.required);

                        slashCommand.addRoleOption(slashCommandOption);
                    } else if (arg.type == 'user') {
                        let slashCommandOption = new DJS.SlashCommandUserOption()
                            .setName(arg.name)
                            .setDescription(arg.description ? arg.description : 'No description for this argument')
                            .setRequired(arg.required);

                        slashCommand.addUserOption(slashCommandOption);
                    }
                });
            }

            bodyCommands.push(slashCommand);
        }

        if (guildId == null)
            await rest.put(
                DJS.Routes.applicationCommands(userId),
                { body: bodyCommands },
            ).catch(err=>{
                console.error("Discord API error:", err);
            });
        else
            await rest.put(
                DJS.Routes.applicationGuildCommands(userId, guildId),
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