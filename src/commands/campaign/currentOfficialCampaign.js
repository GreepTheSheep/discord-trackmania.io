const Command = require('../../structures/Command'),
    {ButtonInteraction, MessageEmbed, MessageActionRow, MessageButton, CommandInteraction, SelectMenuInteraction, Message, MessageAttachment} = require('discord.js'),
    MySQL = require('mysql'),
    Table = require('easy-table');

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
    try {
        const RenderEmbeds = await renderCampaignEmbed(tmio),
            embed = RenderEmbeds.embed,
            interactionComponentRows = RenderEmbeds.interactionComponentRows;

        interaction.reply({
            ephemeral: true,
            embeds: [embed],
            components: interactionComponentRows
        });
    } catch (e) {
        interaction.reply({
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
exports.executeButton = async (interaction, buttonId, argument, tmio, commands, sql) => {
    if (buttonId.startsWith('leaderboard')) {

        const clubId = argument.split('-')[0],
            campaignId = argument.split('-')[1];

        leaderboardPosFromCampaignID[campaignId] = leaderboardPosFromCampaignID[campaignId] || 0;

        let table = new Table(),
            rows = 15;

        if (buttonId == 'leaderboard') {
            leaderboardPosFromCampaignID[campaignId] = 0;
            await interaction.deferReply({ephemeral:true});
        } else {
            if (buttonId == 'leaderboard-up') leaderboardPosFromCampaignID[campaignId] -= rows;
            else if (buttonId == 'leaderboard-down') leaderboardPosFromCampaignID[campaignId] += rows;
            await interaction.deferUpdate();
        }

        const campaign = await tmio.campaigns.get(clubId, campaignId);
        await campaign.leaderboardLoadMore();

        if (leaderboardPosFromCampaignID[campaignId] < 0) leaderboardPosFromCampaignID[campaignId] = 0;

        for (let i = leaderboardPosFromCampaignID[campaignId]; i < leaderboardPosFromCampaignID[campaignId]+rows; i++) {
            if (i >= campaign.leaderboard.length) break;
            const leader = campaign.leaderboard[i];
            table.cell('Rank', leader.position);
            table.cell('Player', leader.playerName);
            table.cell('Points', leader.points);
            if (i > 0) table.cell("Delta (from first)", `(+${campaign.leaderboard[0].points - leader.points})`);
            table.newRow();
        }

        const interactionComponentRows = [];
        interactionComponentRows.push(new MessageActionRow());

        interactionComponentRows[0].addComponents(
            new MessageButton()
                .setCustomId(this.name+'_leaderboard-up_'+clubId+'-'+campaignId)
                .setLabel('⬆')
                .setStyle('PRIMARY')
                .setDisabled(leaderboardPosFromCampaignID[campaignId] == 0)
            );

        interactionComponentRows[0].addComponents(
            new MessageButton()
                .setCustomId(this.name+'_leaderboard-down_'+clubId+'-'+campaignId)
                .setLabel('⬇')
                .setStyle('PRIMARY')
                .setDisabled(leaderboardPosFromCampaignID[campaignId] + rows >= campaign.leaderboard.length)
            );

        if (leaderboardPosFromCampaignID[campaignId] + rows >= campaign.leaderboard.length) {
            interactionComponentRows[0].addComponents(
                new MessageButton()
                    .setURL('https://trackmania.io/#/campaigns/'+clubId+'/'+campaignId)
                    .setLabel('View on Trackmania.io')
                    .setStyle('LINK')
                );
        }

        interaction.editReply({
            content: 'Top '+campaign.leaderboard.length+
                ' on "' + campaign.name + '" ' +
                '(page '+(Math.floor(leaderboardPosFromCampaignID[campaignId] / rows) +1) +'/'+Math.ceil(campaign.leaderboard.length / rows)+')'+
                '\`\`\`'+table.toString()+
                ((Math.floor(leaderboardPosFromCampaignID[campaignId] / rows) + 1) == Math.ceil(campaign.leaderboard.length / rows) ?
                '\nTo view more, open the leaderboard on Trackmania.io website': '')+
                '\`\`\`',
            components: interactionComponentRows
        });
    }
};

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

/**
 * Render the embeds
 * @param {number} clubID
 * @param {number} campaignID
 * @param {import('trackmania.io').Client} tmio
 * @returns {Object<MessageEmbed, MessageActionRow>}
 */
async function renderCampaignEmbed(tmio){

    try {
        let embed = new MessageEmbed(),
            campaign = await tmio.campaigns.currentSeason();

        embed.setColor('#9B850E')
        .addField('Created by:', 'Nadeo', true)
        .setTitle(campaign.name)
        .addField('Maps number:', `${campaign.mapCount} maps`, true)
        .setFooter({text: `Leaderboard UID: ${campaign.leaderboardId}`});

        const interactionComponentRows = [];
        interactionComponentRows.push(new MessageActionRow());


        interactionComponentRows[0].addComponents(
            new MessageButton()
                .setCustomId('campaign_leaderboard_0-'+campaign.id)
                .setLabel('Campaign leaderboard')
                .setStyle('PRIMARY')
            );
        // interactionComponentRows[0].addComponents(
        //     new MessageButton()
        //         .setCustomId('campaign_maps_0-'+campaign.id)
        //         .setLabel('Map list')
        //         .setStyle('PRIMARY')
        //     );
        interactionComponentRows[0].addComponents(
            new MessageButton()
                .setURL(`https://trackmania.io/#/campaigns/0/${campaign.id}`)
                .setLabel('View on Trackmania.io')
                .setStyle('LINK')
            );

        return {
            embed,
            interactionComponentRows
        }
    } catch (e) {
        throw e;
    }
}