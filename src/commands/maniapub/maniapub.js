const Command = require('../../structures/Command'),
    {MessageEmbed, CommandInteraction, SelectMenuInteraction, Message, ButtonInteraction, MessageActionRow, MessageButton, MessageSelectMenu} = require('discord.js'),
    MySQL = require('mysql');
let ads = [],
    adIndex = 0;

/**
 * Set the command here, it's what we'll type in the message
 * @type {string}
 */
exports.name = 'maniapub';


/**
 * Set the description here, this is what will show up when you need help for the command
 * @type {string}
 */
exports.description = 'Show all active Maniapubs from the game';


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
    adIndex = 0;
    ads = await tmio.ads.list();
    if (ads.length == 0) {
        return interaction.reply('There are no active Maniapubs');
    }

    let ad = ads[adIndex];

    let embed = new MessageEmbed()
        .setTitle(ad.name)
        .setDescription(ad.url)
        .setImage(ad.image)
        .setThumbnail(ad.verticalImage)
        .setFooter({text: ad.uid});

    // create 2 interaction rows (button or select menus)
    const interactionComponentRows = [];
    for (let i = 0; i < 1; i++) {
        interactionComponentRows.push(new MessageActionRow());
    }

    // Add 2 button to the message in the first row
    interactionComponentRows[0].addComponents(
            new MessageButton()
                .setCustomId(this.name+'_'+'button-prev')
                .setLabel('⬅')
                .setStyle('PRIMARY')
        );
    interactionComponentRows[0].addComponents(
            new MessageButton()
                .setCustomId(this.name+'_'+'button-next')
                .setLabel('➡')
                .setStyle('PRIMARY')
        );

    interaction.editReply({
        embeds: [embed],
        components: interactionComponentRows
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
exports.executeButton = async (interaction, buttonId, argument, tmio, commands, sql) => {
    if (buttonId == 'button-next') {
        adIndex++;
        if (adIndex >= ads.length) adIndex = 0;
        let ad = ads[adIndex];
        let embed = new MessageEmbed()
            .setTitle(ad.name)
            .setDescription(ad.url)
            .setImage(ad.image)
            .setThumbnail(ad.verticalImage)
            .setFooter({text: ad.uid});
        interaction.update({
            embeds: [embed]
        });
    }
    if (buttonId == 'button-prev') {
        adIndex--;
        if (adIndex < 0) adIndex = ads.length-1;
        let ad = ads[adIndex];
        let embed = new MessageEmbed()
            .setTitle(ad.name)
            .setDescription(ad.url)
            .setImage(ad.image)
            .setThumbnail(ad.verticalImage)
            .setFooter({text: ad.uid});
        interaction.update({
            embeds: [embed]
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