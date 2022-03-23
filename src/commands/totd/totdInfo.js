const Command = require('../../structures/Command'),
    {MessageEmbed, MessageActionRow, MessageButton, CommandInteraction, SelectMenuInteraction, Message, MessageAttachment} = require('discord.js'),
    MySQL = require('mysql'),
    monthsArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
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
        required: false,
        choices: monthsArray.map(m=>{
            return {
                name: m,
                value: monthsArray.indexOf(m)
            }
        })
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
    await interaction.deferReply({
        ephemeral: true,
    });

    try {
        const month = interaction.options.getNumber('month'),
            day = interaction.options.getNumber('day'),
            year = interaction.options.getNumber('year'),
            TOTDRenders = await renderTOTDEmbed(tmio, month, day, year),
            embed = TOTDRenders.embed,
            interactionComponentRows = TOTDRenders.interactionComponentRows;

        interaction.editReply({
            embeds: [embed],
            components: interactionComponentRows
        });
    } catch (e) {
        interaction.editReply('Error: ' + e);
    }
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

/**
 * Generate the Embed and the Actions for the TOTD
 * @param {?Number} month The Month of the TOTD
 * @param {?Number} day The day of the TOTD
 * @param {?Number} year The year of the TOTD
 * @param {import('trackmania.io').Client} tmio
 * @returns {Promise<Object<MessageEmbed, MessageActionRow>>}
 */
async function renderTOTDEmbed(tmio, month, day, year){
    return new Promise(async (resolve, reject) => {
        let embed = new MessageEmbed(),
            date = new Date();

        if (month != null && day != null) {
            date = new Date(date.setMonth(month));
            date = new Date(date.setDate(day));
            if (year != null) date = new Date(date.setFullYear(year));
        }
        try {
            const totd = await tmio.totd.get(date),
                map = await totd.map(),
                author = await map.author();

            embed.setColor('GREEN').setAuthor({name: `Track of The Day - ${date.getDate()} ${monthsArray[date.getMonth()]} ${date.getFullYear()}`})
                .setTitle(tmio.formatTMText(map.name))
                .addField('Created by:', author.name, true)
                .addField('Medals:', `Author: **${ms(map.medalTimes.author, {colonNotation: true, secondsDecimalDigits: 3})}**\nGold: ${ms(map.medalTimes.gold, {colonNotation: true, secondsDecimalDigits: 3})}\nSilver: ${ms(map.medalTimes.silver, {colonNotation: true, secondsDecimalDigits: 3})}\nBronze: ${ms(map.medalTimes.bronze, {colonNotation: true, secondsDecimalDigits: 3})}`)
                .addField('Uploaded:', `<t:${map.uploaded.getTime() / 1000}:R>`, true)
                .setFooter({text: `Map UID: ${map.uid}`})
                .setImage(map.thumbnailCached);

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

            resolve({
                embed,
                interactionComponentRows
            });

        } catch (e) {
            reject(e);
        }
    });
}