const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js'),
    monthsArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    ms = require('pretty-ms');


/**
 * @param {fetchedChannels} dataChannel
 * @param {import('discord.js').Client} client
 * @param {import('trackmania.io').Client} tmio
 * @param {import('trackmania.io/typings/structures/TMMap')} map
 * @param {import('trackmania.io/typings/structures/TOTD')} totd
 */
exports.sendTOTD = async function(dataChannel, client, tmio, map, totd){
    try {
        let guild = await client.guilds.fetch(dataChannel.guildId);
        if (!guild) return;
        let channel = await guild.channels.fetch(dataChannel.channelId);
        if (!channel) return console.log(`❌ Impossible to fetch channel ${dataChannel.channelId} from guild ${dataChannel.guildId}`);

        let date = new Date(),
            embed = new MessageEmbed();

        embed.setColor('GREEN')
            .setAuthor({name: `Track of The Day - ${date.getDate()} ${monthsArray[date.getMonth()]} ${date.getFullYear()}`})
            .setTitle(tmio.formatTMText(map.name))
            .addField('Created by:', map.authorName, true)
            .addField('Medals:', `Author: **${ms(map.medalTimes.author, {colonNotation: true, secondsDecimalDigits: 3})}**\nGold: ${ms(map.medalTimes.gold, {colonNotation: true, secondsDecimalDigits: 3})}\nSilver: ${ms(map.medalTimes.silver, {colonNotation: true, secondsDecimalDigits: 3})}\nBronze: ${ms(map.medalTimes.bronze, {colonNotation: true, secondsDecimalDigits: 3})}`)
            .addField('Uploaded:', `<t:${map.uploaded.getTime() / 1000}:R>`, true)
            .setFooter({text: `Map UID: ${map.uid}`})
            .setImage(map.thumbnailCached);

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

        if (channel.isText()) {
            let message;

            if (dataChannel.roleId){
                message = await channel.send({
                    embeds: [embed],
                    content: `<@&${dataChannel.roleId}>`,
                    components: interactionComponentRows
                });
            } else {
                message = await channel.send({
                    embeds: [embed],
                    components: interactionComponentRows
                });
            }

            if (dataChannel.threads) {
                channel.threads.create({
                    startMessage: message,
                    reason: 'New Track of the Day: ' + tmio.formatTMText(map.name),
                    name: '[TOTD] '+ new Date().toLocaleDateString().replace(/\//gmi,'-') + ', ' + tmio.formatTMText(map.name) + ' by ' + map.authorName,
                    autoArchiveDuration: 1440
                });
            }
        }
    } catch (err) {
        console.error(err);
    }
};
let sendTOTD = this.sendTOTD;

/**
 * @param {import('discord.js').Client} client
 * @param {import('trackmania.io/typings/structures/TOTD')} totd
 * @param {import('trackmania.io').Client} tmio
 * @param {import('mysql').Connection} sql
 */
exports.routine = async function(client, totd, tmio, sql) {
    let map = await totd.map();
    console.log('New TOTD!' + map.name);
    if (!sql) return console.log('No database connexion for getting channels for TOTD alert');

    /**
     * @type {Array<fetchedChannels>}
     */
    let dataChannels = await new Promise((resolve, reject)=>{
        sql.query("SELECT guildId, channelId, roleId, threads FROM `totd_channels`", (err, res)=>{
            if (err){
                reject(err);
            } else {
                resolve(res);
            }
        });
    }).catch(console.error);

    dataChannels.forEach(async dataChannel=>{
        sendTOTD(dataChannel, client, tmio, map, totd);
    });

};


/**
 * @typedef {Object} fetchedChannels
 * @property {string} guildId
 * @property {string} channelId
 * @property {?string} roleId
 * @property {boolean} threads
 */