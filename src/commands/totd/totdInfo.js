const Command = require('../../structures/Command'),
    FormData = require('form-data'),
    fetch = require('node-fetch'),
    {getMapThumbnailEmbed} = require("../../utils"),
    {MessageEmbed, MessageActionRow, MessageButton, CommandInteraction, SelectMenuInteraction, Message, MessageAttachment} = require('discord.js'),
    MySQL = require('mysql'),
    ms = require('pretty-ms');

/**
 * Set the command here, it's what we'll type in the message
 * @type {string}
 */
exports.name = 'totd';


/**
 * Set the description here, this is what will show up when you need help for the command
 * @type {string}
 */
exports.description = 'Display the TOTD of any date';


/**
 * Set the command arguments here, this is what will show up when you type the command
 * @type {Command.commandArgs[]}
 */
exports.args = [
    {
        name: 'month',
        description: 'The month number of the TOTD',
        type: 'number',
        required: false
    },
    {
        name: 'day',
        description: 'The date of the month of the TOTD',
        type: 'number',
        required: false
    },
    {
        name: 'year',
        description: 'The year of the TOTD',
        type: 'number',
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
    interaction.deferReply();
    
    const month = interaction.options.getNumber('month'),
        day = interaction.options.getNumber('day'),
        year = interaction.options.getNumber('year'),
        embed = new MessageEmbed(),
        monthsArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        date = new Date();

    if (month && day && year){
        date = new Date(date.setFullYear(year, month-1, day));
    }

    const totd = await tmio.totd.get(date),
        map = await totd.map(),
        author = await map.author();

    embed.setColor('GREEN').setAuthor(`Track of The Day - ${date.getDate()} ${monthsArray[date.getMonth()]} ${date.getFullYear()}`)
        .setTitle(tmio.formatTMText(map.name))
        .addField('Created by:', author.name, true)
        .addField('Medals:', `Author: **${ms(map.medalTimes.author, {colonNotation: true, secondsDecimalDigits: 3})}**\nGold: ${ms(map.medalTimes.gold, {colonNotation: true, secondsDecimalDigits: 3})}\nSilver: ${ms(map.medalTimes.silver, {colonNotation: true, secondsDecimalDigits: 3})}\nBronze: ${ms(map.medalTimes.bronze, {colonNotation: true, secondsDecimalDigits: 3})}`)
        .addField('Uploaded:', `<t:${map.uploaded.getTime() / 1000}:R>`, true)
        .setFooter(`Map UID: ${map.uid}`);


    if (process.env.IMGUR_CLIENT_ID){
        // download map thumbnail and send it to Discord (because Nadeo Services can't serve thumbnails directly, so we need to dl)
        try{
            embed.setImage(await getMapThumbnailEmbed(tmio, map, sql));
        } catch (err) {
            console.error(err);
        }
    }

    // create 2 interaction rows (button or select menus)
    const interactionComponentRows = [];
    for (let i = 0; i < 1; i++) {
        interactionComponentRows.push(new MessageActionRow());
    }

    interactionComponentRows[0].addComponents(
        new MessageButton()
            .setURL(map.url)
            .setLabel('Download Map')
            .setStyle('LINK')
        );
    interactionComponentRows[0].addComponents(
        new MessageButton()
            .setURL(`https://trackmania.io/#/totd/leaderboard/${totd.leaderboardId}/${map.uid}`)
            .setLabel('Trackmania.io')
            .setStyle('LINK')
        );
    if (map.exchangeId) {
        interactionComponentRows[0].addComponents(
            new MessageButton()
                .setURL(`https://trackmania.exchange/tracks/view/${map.exchangeId}`)
                .setLabel('Trackmania.exchange')
                .setStyle('LINK')
            );
    }

    interaction.editReply({
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
    const month = Number(args[1]),
        day = Number(args[0]),
        year = Number(args[2]),
        embed = new MessageEmbed(),
        monthsArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        date = new Date();

    if (month && day){
        date = new Date(date.setMonth(month-1));
        date = new Date(date.setDate(day));
        if (year) date = new Date(date.setFullYear(year));
    }

    const totd = await tmio.totd.get(date),
        map = await totd.map(),
        author = await map.author();

    embed.setColor('GREEN').setAuthor(`Track of The Day - ${date.getDate()} ${monthsArray[date.getMonth()]} ${date.getFullYear()}`)
        .setTitle(tmio.formatTMText(map.name))
        .addField('Created by:', author.name, true)
        .addField('Medals:', `Author: **${ms(map.medalTimes.author, {colonNotation: true, secondsDecimalDigits: 3})}**\nGold: ${ms(map.medalTimes.gold, {colonNotation: true, secondsDecimalDigits: 3})}\nSilver: ${ms(map.medalTimes.silver, {colonNotation: true, secondsDecimalDigits: 3})}\nBronze: ${ms(map.medalTimes.bronze, {colonNotation: true, secondsDecimalDigits: 3})}`)
        .addField('Uploaded:', `<t:${map.uploaded.getTime() / 1000}:R>`, true)
        .setFooter(`Map UID: ${map.uid}`);


    if (process.env.IMGUR_CLIENT_ID){
        // download map thumbnail and send it to Discord (because Nadeo Services can't serve thumbnails directly, so we need to dl)
        try{
            embed.setImage(await getMapThumbnailEmbed(tmio, map, sql));
        } catch (err) {
            console.error(err);
        }
    }

    // create 2 interaction rows (button or select menus)
    const interactionComponentRows = [];
    for (let i = 0; i < 1; i++) {
        interactionComponentRows.push(new MessageActionRow());
    }

    interactionComponentRows[0].addComponents(
        new MessageButton()
            .setURL(map.url)
            .setLabel('Download Map')
            .setStyle('LINK')
        );
    interactionComponentRows[0].addComponents(
        new MessageButton()
            .setURL(`https://trackmania.io/#/totd/leaderboard/${totd.leaderboardId}/${map.uid}`)
            .setLabel('Trackmania.io')
            .setStyle('LINK')
        );
    if (map.exchangeId) {
        interactionComponentRows[0].addComponents(
            new MessageButton()
                .setURL(`https://trackmania.exchange/tracks/view/${map.exchangeId}`)
                .setLabel('Trackmania.exchange')
                .setStyle('LINK')
            );
    }

    message.reply({
        content: month && day ? '' : `Tip: You can set a specific TOTD day with \`/${this.name} [date-of-the-month] [month] <year>\`. Example \`/${this.name} 12 7\` to get the TOTD of July, 12, ${new Date().getFullYear()}`,
        embeds: [embed],
        components: interactionComponentRows
    });
};

/**
 * This method is executed when an a button is clicked in the message
 * @param {ButtonInteraction} interaction
 * @param {import('trackmania.io').Client} tmio
 * @param {Command[]} commands 
 * @param {MySQL.Connection} sql
 */
exports.executeButton = async (interaction, tmio, commands, sql) => {};

/**
 * This method is executed when an update is made in a selectMenu
 * @param {SelectMenuInteraction} interaction
 * @param {import('trackmania.io').Client} tmio
 * @param {Command[]} commands 
 * @param {MySQL.Connection} sql
 */
exports.executeSelectMenu = async (interaction, tmio, commands, sql) => {};