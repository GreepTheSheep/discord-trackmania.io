const Command = require('../../structures/Command'),
    {MessageEmbed, CommandInteraction, SelectMenuInteraction, Message, MessageActionRow, MessageButton, ButtonInteraction, Permissions} = require('discord.js'),
    MySQL = require('mysql');

/**
 * Set the command here, it's what we'll type in the message
 * @type {string}
 */
exports.name = 'totd-sub';


/**
 * Set the description here, this is what will show up when you need help for the command
 * @type {string}
 */
exports.description = 'Subscribes your server to get the TOTD every day';


/**
 * Set the command arguments here, this is what will show up when you type the command
 * @type {Command.commandArgs[]}
 */
exports.args = [
    {
        name: 'channel',
        description: 'The channel where the bot will post the TOTD',
        type: 'channel',
        required: true,
        channelTypes: ['GuildText']
    },
    {
        name: 'role',
        description: 'The role to mention when the TOTD is posted',
        type: 'role',
        required: false
    },
    {
        name: 'threads',
        description: 'Create a thread for each new TOTD',
        type: 'bool',
        required: false
    }
];

/**
 * Set the usage here, this is what will show up when you type the command
 * This part is executed as slash command
 * @param {CommandInteraction} interaction
 * @param {import('trackmania.io').Client} tmio
 * @param {Command[]} commands
 * @param {MySQL.Connection} sql
 */
exports.execute = async (interaction, tmio, commands, sql) => {
    if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({
        content: ':warning: You need to be an administrator to use this command.',
        ephemeral: true
    });
    if (!sql) return interaction.reply({
        content: 'No database connection',
        ephemeral: true
    });
    let channel = interaction.options.getChannel('channel'),
        role = interaction.options.getRole('role'),
        threads = interaction.options.getBoolean('threads');

    await interaction.deferReply({ephemeral: true});

    let roleId = role ? role.id : null;

    sql.query("UPSERT INTO `totd_channels` (userId, guildId, channelId, roleId, threads) VALUES (?, ?, ?, ?, ?)", [interaction.member.id, interaction.guild.id, channel.id, roleId, threads], (err, result) => {
        if (err) {
            console.error(err);
            return interaction.editReply({
                content: "An error occurred. Try again later.",
            });
        }
        if (result.affectedRows == 0) {
            interaction.editReply({
                content: "You have already subscribed to the TOTD on the right channel.",
            });
        } else {
            interaction.editReply({
                content: `✅ Channel has been registered to <#${channel.id}> ${roleId ? `with role mention <@&${roleId}>` : 'with no role mention'}.`,
            });
        }
    });
};

/**
 * This method is executed when an a button is clicked in the message
 * @param {ButtonInteraction} interaction
 * @param {string} buttonId
 * @param {string} argument
 * @param {import('trackmania.io').Client} tmio
 * @param {Command[]} commands
 * @param {MySQL.Connection} sql
 */
exports.executeButton = async (interaction, buttonId, argument, tmio, commands, sql) => {};

/**
 * This method is executed when an update is made in a selectMenu
 * @param {SelectMenuInteraction} interaction
 * @param {string} categoryId
 * @param {string} argument
 * @param {import('trackmania.io').Client} tmio
 * @param {Command[]} commands
 * @param {MySQL.Connection} sql
 */
exports.executeSelectMenu = async (interaction, categoryId, argument, tmio, commands, sql) => {};