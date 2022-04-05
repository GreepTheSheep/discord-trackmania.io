const Command = require('../../structures/Command'),
    {ButtonInteraction, MessageEmbed, MessageActionRow, MessageButton, CommandInteraction, SelectMenuInteraction, Message, MessageAttachment} = require('discord.js'),
    MySQL = require('mysql'),
    Table = require('easy-table'),
    campaignCmd = require('./campaign');

let leaderboardPosFromCampaignID = {};

/**
 * Set the command here, it's what we'll type in the message
 * @type {string}
 */
exports.name = 'currentcampaign';


/**
 * Set the description here, this is what will show up when you need help for the command
 * @type {string}
 */
exports.description = 'Gets the current seasonial campaign';


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
    await interaction.deferReply({ephemeral:true});
    try {
        const Campaign = await tmio.campaigns.currentSeason(),
            RenderEmbeds = await campaignCmd.renderCampaignEmbed(Campaign, tmio),
            embed = RenderEmbeds.embed,
            interactionComponentRows = RenderEmbeds.interactionComponentRows;

        interaction.editReply({
            ephemeral: true,
            embeds: [embed],
            components: interactionComponentRows
        });
    } catch (e) {
        interaction.editReply({
            content: 'Error: ' + e,
            ephemeral: true
        });
    }
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
exports.executeButton = campaignCmd.executeButton;

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