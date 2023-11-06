const Command = require('../../structures/Command'),
    {MessageEmbed, MessageActionRow, MessageButton, CommandInteraction, SelectMenuInteraction, ButtonInteraction, Message, MessageAttachment} = require('discord.js'),
    MySQL = require('mysql'),
    monthsArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    { Time } = require('tm-essentials'),
    Table = require('easy-table');

let leaderboardPosFromMapUID = {};

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
            };
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
 * @param {string} buttonId
 * @param {string} argument
 * @param {import('trackmania.io').Client} tmio
 * @param {Command[]} commands
 * @param {MySQL.Connection} sql
 */
exports.executeButton = async (interaction, buttonId, argument, tmio, commands, sql) => {
    if (buttonId.startsWith('totd-leaderboard')) {
        leaderboardPosFromMapUID[argument] = leaderboardPosFromMapUID[argument] || 0;

        let table = new Table(),
            rows = 15;

        if (buttonId == 'totd-leaderboard') {
            leaderboardPosFromMapUID[argument] = 0;
            await interaction.deferReply({ephemeral:true});
        } else {
            if (buttonId == 'totd-leaderboard-up') leaderboardPosFromMapUID[argument] -= rows;
            else if (buttonId == 'totd-leaderboard-down') leaderboardPosFromMapUID[argument] += rows;
            await interaction.deferUpdate();
        }

        const map = await tmio.maps.get(argument);
        if (map.leaderboard.length == 0) await map.leaderboardLoadMore();

        if (leaderboardPosFromMapUID[argument] < 0) leaderboardPosFromMapUID[argument] = 0;

        for (let i = leaderboardPosFromMapUID[argument]; i < leaderboardPosFromMapUID[argument]+rows; i++) {
            if (i >= map.leaderboard.length) break;
            const leader = map.leaderboard[i];
            table.cell('Rank', i + 1);
            if (leader.playerClubTag) table.cell('Club tag', tmio.stripFormat(leader.playerClubTag));
            table.cell('Player', leader.playerName);
            table.cell('Time', Time.fromMilliseconds(leader.time).toTmString());
            if (i > 0) table.cell("Delta (from WR)", `(+${Time.fromMilliseconds(leader.time - map.leaderboard[0].time).toTmString()})`);
            table.newRow();
        }

        const interactionComponentRows = [];
        interactionComponentRows.push(new MessageActionRow());

        interactionComponentRows[0].addComponents(
            new MessageButton()
                .setCustomId(this.name+'_totd-leaderboard-up_'+map.uid)
                .setLabel('⬆')
                .setStyle('PRIMARY')
                .setDisabled(leaderboardPosFromMapUID[argument] == 0)
        );

        interactionComponentRows[0].addComponents(
            new MessageButton()
                .setCustomId(this.name+'_totd-leaderboard-down_'+map.uid)
                .setLabel('⬇')
                .setStyle('PRIMARY')
                .setDisabled(leaderboardPosFromMapUID[argument] + rows >= map.leaderboard.length)
        );

        if (leaderboardPosFromMapUID[argument] + rows >= map.leaderboard.length) {
            interactionComponentRows[0].addComponents(
                new MessageButton()
                    .setURL('https://trackmania.io/#/leaderboard/'+map.uid)
                    .setLabel('View on Trackmania.io')
                    .setStyle('LINK')
            );
        }

        interaction.editReply({
            content: 'Top '+map.leaderboard.length+
                ' on "' + tmio.stripFormat(map.name) + '" ' +
                '(page '+(Math.floor(leaderboardPosFromMapUID[argument] / rows) +1) +'/'+Math.ceil(map.leaderboard.length / rows)+')'+
                '```'+table.toString()+
                ((Math.floor(leaderboardPosFromMapUID[argument] / rows) + 1) == Math.ceil(map.leaderboard.length / rows) ?
                    '\nTo view more, open the leaderboard on Trackmania.io website': '')+
                '```',
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
 * Generate the Embed and the Actions for the TOTD
 * @param {import('trackmania.io').Client} tmio
 * @param {?Number} month The Month of the TOTD
 * @param {?Number} day The day of the TOTD
 * @param {?Number} year The year of the TOTD
 * @returns {Promise<Object<MessageEmbed, MessageActionRow>>}
 */
async function renderTOTDEmbed(tmio, month, day, year){
    return new Promise((resolve, reject) => {
        let embed = new MessageEmbed(),
            date = new Date();

        if (month != null && day != null) {
            date = new Date(date.setMonth(month));
            date = new Date(date.setDate(day));
            if (year != null) date = new Date(date.setFullYear(year));
        }
        try {
            tmio.totd.get(date).then(totd=>{
                totd.map().then(async map=>{
                    embed.setColor('GREEN').setAuthor({name: `Track of The Day - ${date.getDate()} ${monthsArray[date.getMonth()]} ${date.getFullYear()}`})
                        .setTitle(tmio.stripFormat(map.name))
                        .addFields([
                            {name:'Created by:', value:map.authorName, inline:true},
                            {name:'Medals:', value:`Author: **${Time.fromMilliseconds(map.medalTimes.author).toTmString()}**\nGold: ${Time.fromMilliseconds(map.medalTimes.gold).toTmString()}\nSilver: ${Time.fromMilliseconds(map.medalTimes.silver).toTmString()}\nBronze: ${Time.fromMilliseconds(map.medalTimes.bronze).toTmString()}`},
                            {name:'Uploaded:', value:`<t:${map.uploaded.getTime() / 1000}:R>`, inline:true}
                        ])
                        .setFooter({text: `Map UID: ${map.uid}`})
                        .setImage(map.thumbnailCached);

                    let exchange = await map.exchange();
                    if (exchange != null) embed.addFields({name:'TMX Info:', value:`🎮 ${exchange.difficulty}\n🏆 ${exchange.awards} Awards`, inline:true});

                    // create 2 interaction rows (button or select menus)
                    const interactionComponentRows = [];
                    for (let i = 0; i < 1; i++) {
                        interactionComponentRows.push(new MessageActionRow());
                    }

                    interactionComponentRows[0].addComponents(
                        new MessageButton()
                            .setCustomId('totd_totd-leaderboard_'+map.uid)
                            .setLabel('Leaderboard')
                            .setStyle('PRIMARY')
                    );

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
                });
            });

        } catch (e) {
            reject(e);
        }
    });
}