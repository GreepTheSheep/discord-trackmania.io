const Command = require('../../structures/Command'),
    {MessageEmbed, CommandInteraction, SelectMenuInteraction, Message, MessageActionRow, MessageButton, ButtonInteraction, Permissions} = require('discord.js'),
    MySQL = require('mysql');

/**
 * Set the command here, it's what we'll type in the message
 * @type {string}
 */
exports.name = 'totd-unsub';


/**
 * Set the description here, this is what will show up when you need help for the command
 * @type {string}
 */
exports.description = 'Unsubscribes your server of the TOTD updates';


/**
 * Set the command arguments here, this is what will show up when you type the command
 * @type {Command.commandArgs[]}
 */
exports.args = [];

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
    await interaction.deferReply({ephemeral: true});

    sql.query("DELETE FROM `totd_channels` WHERE guildId = ?", interaction.guild.id, (err, result) => {
        if (err) {
            console.error(err);
            return interaction.editReply({
                content: "An error occurred. Try again later.",
            });
        }
        if (result.affectedRows == 0) {
            interaction.editReply({
                content: "You have not registered on here.",
            });
        } else {
            interaction.editReply({
                content: `✅ Channel has been unregistered from the TOTD updates.`,
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