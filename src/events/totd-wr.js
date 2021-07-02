const Discord = require('discord.js')
const ms = require('pretty-ms')
const Trackmania = require('trackmania.io')
const totd = new Trackmania.TOTD({listener: false})

module.exports = function(client, sql, config){
    var fetchedChannels = [];
    sql.query("SELECT * FROM `totd-wr_channels`", function(err, res){
        if (err){
            client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on getting TOTD channels list: \`\`\`${err}\`\`\``)
            console.error(err)
        } else {
            if (res.length<1) return
            res.forEach(function(r){
                fetchedChannels.push({
                    guild: r.guildId,
                    channel: r.channelId
                })
            })
        }
    })

    var totd1;
    var wr1
    totd.totd().then(function(totd){
        totd.reverse()
        totd1 = totd[0]
        Trackmania.leaderboard(totd1.map.mapUid).then(function(leader){
           wr1 = leader[0]
        })
    })

    setInterval(()=>{
        totd.totd().then(function(totd){
            totd.reverse()
            totd = totd[0]

            if (totd.map.mapUid == totd1.map.mapUid){
                Trackmania.leaderboard(totd.map.mapUid).then(function(leader){
                    var wr = leader[0]
                    if (wr.time < wr1.time){
                        let embed = new Discord.MessageEmbed
                        embed.setColor('#A2C175')
                        .setTitle('New WR on '+totd.map.name+' - Track of The Day')
                        .setDescription(`The new World Record on ${totd.map.name} is set by **${wr.player.name}** with a time of **__${ms(wr.time, {colonNotation: true, secondsDecimalDigits: 3})}__**`)
                        if (wr1.time != Infinity) embed.addField('Before:', `The old World Record is set by ${wr1.player.name} with a time of ${ms(wr1.time, {colonNotation: true, secondsDecimalDigits: 3})}`)

                        wr1 = wr

                        fetchedChannels.forEach(c=>{
                            client.channels.fetch(c.channel).then(c=>c.send(embed))
                        })
                    }
                })
            } else{
                totd1 = totd
                wr1.time = Infinity
            }
        })
    }, 10*60*1000)
}