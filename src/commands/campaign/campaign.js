const Command = require('../../structures/Command'),
    {ButtonInteraction, MessageEmbed, MessageActionRow, MessageButton, CommandInteraction, SelectMenuInteraction, Message, MessageAttachment} = require('discord.js'),
    MySQL = require('mysql'),
    Table = require('easy-table');

let leaderboardPosFromCampaignID = {};

/**
 * Set the command here, it's what we'll type in the message
 * @type {string}
 */
exports.name = 'campaign';


/**
 * Set the description here, this is what will show up when you need help for the command
 * @type {string}
 */
exports.description = 'Gets the campaign info';


/**
 * Set the command arguments here, this is what will show up when you type the command
 * @type {Command.commandArgs[]}
 */
exports.args = [
    {
        name: 'club-id',
        description: 'The club ID of the campaign',
        type: 'number',
        required: true,
    },
    {
        name: 'campaign-id',
        description: 'The campaign ID',
        type: 'number',
        required: true,
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
    try {
        const clubID = interaction.options.getNumber('club-id'),
            campaignID = interaction.options.getNumber('campaign-id'),
            RenderEmbeds = await renderCampaignEmbed(clubID, campaignID, tmio),
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

        const campaign = await tmio.campaigns.get(clubId, campaignId),
            campLeader = await campaign.leaderboard();

        if (leaderboardPosFromCampaignID[campaignId] < 0) leaderboardPosFromCampaignID[campaignId] = 0;

        for (let i = leaderboardPosFromCampaignID[campaignId]; i < leaderboardPosFromCampaignID[campaignId]+rows; i++) {
            if (i >= campLeader.length) break;
            const leader = campLeader[i];
            table.cell('Rank', leader.position);
            table.cell('Player', leader.playerName);
            table.cell('Points', leader.points);
            if (i > 0) table.cell("Delta (from first)", `(+${campLeader[0].points - leader.points})`);
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
                .setDisabled(leaderboardPosFromCampaignID[campaignId] + rows >= campLeader.length)
            );

        if (leaderboardPosFromCampaignID[campaignId] + rows >= campLeader.length) {
            interactionComponentRows[0].addComponents(
                new MessageButton()
                    .setURL('https://trackmania.io/#/campaigns/'+clubId+'/'+campaignId)
                    .setLabel('View on Trackmania.io')
                    .setStyle('LINK')
                );
        }

        interaction.editReply({
            content: 'Top '+campLeader.length+
                ' on "' + campaign.name + '"' +
                '(page '+(Math.floor(leaderboardPosFromCampaignID[campaignId] / rows) +1) +'/'+Math.ceil(campLeader.length / rows)+')'+
                '\`\`\`'+table.toString()+
                ((Math.floor(leaderboardPosFromCampaignID[campaignId] / rows) + 1) == Math.ceil(campLeader.length / rows) ?
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
async function renderCampaignEmbed(clubID, campaignID, tmio){

    try {
        let embed = new MessageEmbed(),
            campaign = await tmio.campaigns.get(clubID, campaignID);

        if (clubID != 0) {
            let club = await campaign.club();
            embed.addField('Club:', tmio.formatTMText(club.name), true)
                .setImage(campaign.image);
        } else {
            embed.addField('Created by:', 'Nadeo', true);
        }

        embed.setColor('#9B850E')
        .setTitle(campaign.name)
        .addField('Maps number:', `${campaign.mapCount} maps`, true)
        .setFooter({text: `Leaderboard UID: ${campaign.leaderboardId}`});

        const interactionComponentRows = [];
        interactionComponentRows.push(new MessageActionRow());


        interactionComponentRows[0].addComponents(
            new MessageButton()
                .setCustomId('campaign_leaderboard_'+clubID+'-'+campaign.id)
                .setLabel('Campaign leaderboard')
                .setStyle('PRIMARY')
            );
        // interactionComponentRows[0].addComponents(
        //     new MessageButton()
        //         .setCustomId('campaign_maps_'+clubID+'-'+campaign.id)
        //         .setLabel('Map list')
        //         .setStyle('PRIMARY')
        //     );
        interactionComponentRows[0].addComponents(
            new MessageButton()
                .setURL(`https://trackmania.io/#/campaigns/${clubID}/${campaign.id}`)
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