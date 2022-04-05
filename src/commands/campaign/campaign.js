const Command = require('../../structures/Command'),
    {ButtonInteraction, MessageEmbed, MessageActionRow, MessageButton, CommandInteraction, SelectMenuInteraction, Message, MessageAttachment, MessageSelectMenu} = require('discord.js'),
    MySQL = require('mysql'),
    Table = require('easy-table');

let leaderboardPosFromCampaignID = {},
    leaderboardPosFromMapUID = {};

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
    await interaction.deferReply({ephemeral:true});
    try {
        const clubID = interaction.options.getNumber('club-id'),
            campaignID = interaction.options.getNumber('campaign-id'),
            Campaign = await tmio.campaigns.get(clubID, campaignID),
            RenderEmbeds = await renderCampaignEmbed(Campaign, tmio),
            embed = RenderEmbeds.embed,
            interactionComponentRows = RenderEmbeds.interactionComponentRows;

        interaction.editReply({
            embeds: [embed],
            components: interactionComponentRows
        });
    } catch (e) {
        interaction.editReply({
            content: 'Error: ' + e
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
        if (campaign.leaderboard.length == 0) await campaign.leaderboardLoadMore();

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
exports.executeSelectMenu = async (interaction, categoryId, argument, tmio, commands, sql) => {
    if (categoryId === 'selectMap') {
        let mapUid = interaction.values[0];
        commands.find(c=>c.name == 'map').execute(interaction, tmio, commands, sql, mapUid);
    }
};

/**
 * Render the embeds
 * @param {import('trackmania.io/typings/structures/Campaign')} campaign
 * @param {import('trackmania.io').Client} tmio
 * @returns {Promise<Object<MessageEmbed, MessageActionRow>>}
 */
async function renderCampaignEmbed(campaign, tmio){

    try {
        let embed = new MessageEmbed(),
            clubID = 0;

        if (!campaign.isOfficial) {
            let club = await campaign.club();
            clubID = club.id;
            embed.addField('Club:', tmio.formatTMText(club.name), true)
                .setImage(campaign.image);
        } else {
            embed.addField('Created by:', 'Nadeo', true);
            const imageSeasons = {
                "fall": "https://i.imgur.com/DX5XnQD.png",
                "spring": "https://i.imgur.com/iQfwDqd.png",
                "summer": "https://i.imgur.com/qmzR2zO.png",
                "winter": "https://i.imgur.com/pSLKNwU.png"
            };
            Object.keys(imageSeasons).forEach(season => {
                if (campaign.name.toLowerCase().includes(season)) {
                    embed.setThumbnail(imageSeasons[season]);
                }
            });
        }

        embed.setColor('#9B850E')
        .setTitle(tmio.formatTMText(campaign.name))
        .addField('Maps number:', `${campaign.mapCount} maps`, true)
        .setFooter({text: `Leaderboard UID: ${campaign.leaderboardId}`});

        const interactionComponentRows = [];
        for (let i = 0; i < 2; i++) {
            interactionComponentRows.push(new MessageActionRow());
        }

        interactionComponentRows[0].addComponents(
            new MessageButton()
                .setCustomId('campaign_leaderboard_'+clubID+'-'+campaign.id)
                .setLabel('Campaign leaderboard')
                .setStyle('PRIMARY')
        );
        interactionComponentRows[0].addComponents(
            new MessageButton()
                .setURL(`https://trackmania.io/#/campaigns/${clubID}/${campaign.id}`)
                .setLabel('View on Trackmania.io')
                .setStyle('LINK')
        );

        const selectOptions = [];
        for (let i = 0; i < campaign.mapCount; i++) {
            let mapFromCampaign = campaign._data.playlist[i];
            selectOptions.push({
                label: tmio.formatTMText(mapFromCampaign.name),
                value: mapFromCampaign.mapUid
            });
        }

        interactionComponentRows[1].addComponents(
            new MessageSelectMenu()
                .setCustomId('campaign_selectMap')
                .setPlaceholder('Select a map')
                .addOptions(selectOptions)
        );

        return {
            embed,
            interactionComponentRows
        }
    } catch (e) {
        throw e;
    }
}

exports.renderCampaignEmbed = renderCampaignEmbed;