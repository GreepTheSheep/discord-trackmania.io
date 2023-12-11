const Command = require('../../structures/Command'),
    {EmbedBuilder, CommandInteraction, SelectMenuInteraction, Message, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder} = require('discord.js'),
    MySQL = require('mysql');

/**
 * Set the command here, it's what we'll type in the message
 * @type {string}
 */
exports.name = 'owner-force-totd-send';


/**
 * Set the description here, this is what will show up when you need help for the command
 * @type {string}
 */
exports.description = 'Force sending TOTD event on this server';


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
    if (interaction.member.id !== process.env.OWNER_ID) return interaction.reply({
        content: '⛔ You are not the owner of this bot',
        ephemeral: true
    });
    if (!sql) return interaction.reply({
        content: 'No database connection',
        ephemeral: true
    });
    await interaction.deferReply({ephemeral:true});

    const totd = await tmio.totd.get(new Date()),
        map = await totd.map(),
        dataChannel = await new Promise((resolve, reject)=>{
            sql.query("SELECT guildId, channelId, roleId, threads FROM `totd_channels` WHERE guildId = ?", [interaction.guild.id], (err, res)=>{
                if (err){
                    reject(err);
                } else {
                    resolve(res[0]);
                }
            });
        }).catch(console.error);

    require('../../events/totd').sendTOTD(dataChannel, interaction.client, tmio, map, totd);

    interaction.editReply({
        content: 'Successfully sent TOTD event',
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