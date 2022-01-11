const Command = require('../../structures/Command'),
    {MessageEmbed, MessageActionRow, MessageButton, CommandInteraction, SelectMenuInteraction, Message, MessageAttachment} = require('discord.js'),
    MySQL = require('mysql');

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
    interaction.deferReply();

    const clubID = interaction.options.getNumber('club-id'),
        campaignID = interaction.options.getNumber('campaign-id'),
        RenderEmbeds = await renderCampaignEmbed(clubID, campaignID, tmio),
        embed = RenderEmbeds.embed,
        interactionComponentRows = RenderEmbeds.interactionComponentRows;

    interaction.reply({
        embeds: [embed],
        components: interactionComponentRows
    });
};

/**
 * This part is executed as a normal message command
 * @param {Message} message
 * @param {string[]} args
 * @param {import('trackmania.io').Client} tmio
 * @param {Command[]} commands 
 * @param {MySQL.Connection} sql
 */
exports.executeMessage = async (message, args, tmio, commands, sql) => {
    if (args.length < 2) return message.reply('Usage: `/campaign [Club ID] [campaign ID]`');

    const clubID = Number(args[0]),
        campaignID = Number(args[1]);

    if (isNaN(clubID) || isNaN(campaignID)) return message.reply('Club ID or Campaign ID is not numbers. Check your syntax and retry');

    const RenderEmbeds = await renderCampaignEmbed(clubID, campaignID, tmio),
        embed = RenderEmbeds.embed,
        interactionComponentRows = RenderEmbeds.interactionComponentRows;

    message.reply({
        embeds: [embed],
        components: interactionComponentRows
    })
};

/**
 * This method is executed when an a button is clicked in the message
 * @param {ButtonInteraction} interaction
 * @param {import('trackmania.io').Client} tmio
 * @param {Command[]} commands 
 * @param {MySQL.Connection} sql
 */
exports.executeButton = async (interaction, tmio, commands, sql) => {
    if (interaction.customId.substring(interaction.customId.indexOf('_')+1) == 'leaderboard') {
        interaction.update('Button primary!');
    }
    if (interaction.customId.substring(interaction.customId.indexOf('_')+1) == 'maps') {
        interaction.update('Button primary!');
    }
};

/**
 * This method is executed when an update is made in a selectMenu
 * @param {SelectMenuInteraction} interaction
 * @param {import('trackmania.io').Client} tmio
 * @param {Command[]} commands 
 * @param {MySQL.Connection} sql
 */
exports.executeSelectMenu = async (interaction, tmio, commands, sql) => {
    
};

/**
 * Render the embeds
 * @param {number} clubID 
 * @param {number} campaignID 
 * @param {import('trackmania.io').Client} tmio
 * @returns {Object<MessageEmbed, MessageActionRow>}
 */
async function renderCampaignEmbed(clubID, campaignID, tmio){

    let embed = new MessageEmbed(),
        campaign = await tmio.campaigns.get(clubID, campaignID),
        maps = await campaign.maps().catch(err=>{
            console.error(err);
            maps = [];
        });

    if (clubID != 0) {
        let club = await campaign.club();
        embed.addField('Club:', club.name, true);
    }

    embed.setColor('#9B850E')
    .setTitle(campaign.name)
    .addField('Maps number:', `${maps.length} maps`, true)
    .setImage(clubID != 0 ? campaign.image : campaign.media.decal)
    .setFooter({text: `Leaderboard UID: ${campaign.leaderboardId}`});

    // create 2 interaction rows (button or select menus)
    const interactionComponentRows = [];
    interactionComponentRows.push(new MessageActionRow());

    // Add 2 button to the message in the first row
    interactionComponentRows[0].addComponents(
        new MessageButton()
            .setCustomId(this.name+'_'+'leaderboard')
            .setLabel('Campaign leaderboard')
            .setStyle('PRIMARY')
        );
    interactionComponentRows[0].addComponents(
        new MessageButton()
            .setCustomId(this.name+'_'+'maps')
            .setLabel('Map list')
            .setStyle('PRIMARY')
        );
    interactionComponentRows[0].addComponents(
        new MessageButton()
            .setURL(`https://trackmania.io/#/campaigns/${campaign.clubid}/${campaign.id}`)
            .setLabel('View on Trackmania.io')
            .setStyle('LINK')
        );

    return {
        embed,
        interactionComponentRows
    }
}