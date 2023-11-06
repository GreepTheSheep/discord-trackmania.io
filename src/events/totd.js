const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js'),
    monthsArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    { Time } = require('tm-essentials');


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
            .setTitle(tmio.stripFormat(map.name))
            .addFields([
                {name:'Created by:', value:map.authorName, inline:true},
                {name:'Medals:', value:`Author: **${Time.fromMilliseconds(map.medalTimes.author).toTmString()}**\nGold: ${Time.fromMilliseconds(map.medalTimes.gold).toTmString()}\nSilver: ${Time.fromMilliseconds(map.medalTimes.silver).toTmString()}\nBronze: ${Time.fromMilliseconds(map.medalTimes.bronze).toTmString()}`}
            ])
            .addFields({name:'Uploaded:', value:`<t:${map.uploaded.getTime() / 1000}:R>`, inline:true})
            .setFooter({text: `Map UID: ${map.uid}`})
            .setImage(map.thumbnailCached);

        map.exchange().then(exchange=>{
            if (exchange != null) embed.addFields({name:'TMX Info:', value:`🎮 ${exchange.difficulty}\n🏆 ${exchange.awards} Awards`, inline:true});
        }).catch(err=>{});

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
                    reason: 'New Track of the Day: ' + tmio.stripFormat(map.name),
                    name: '[TOTD] '+ new Date().toLocaleDateString().replace(/\//gmi,'-') + ', ' + tmio.stripFormat(map.name) + ' by ' + map.authorName,
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