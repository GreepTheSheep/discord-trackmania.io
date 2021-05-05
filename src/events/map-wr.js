const Discord = require('discord.js')
const ms = require('pretty-ms')
const Trackmania = require('trackmania.io')

module.exports = function(client, sql, config){
    var fetchedChannels = [];
    var wr1 = {}
    sql.query("SELECT * FROM `map-wr_channels`", function(err, res){
        if (err){
            client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on getting TOTD channels list: \`\`\`${err}\`\`\``)
            console.error(err)
        } else {
            if (res.length<1) return
            res.forEach(function(r){
                fetchedChannels.push({
                    guild: r.guildId,
                    channel: r.channelId,
                    map: r.mapUid
                })
                Trackmania.leaderboard(r.mapUid).then(function(leader){
                    wr1[r.mapUid] = leader[0]
                })
            })
        }
    })

    fetchedChannels.forEach(function(f){
        Trackmania.leaderboard(f.map).then(function(leader){
            wr1[f.map] = leader[0]
        })
    })

    setInterval(()=>{
        var fetchedChannels = [];
        sql.query("SELECT * FROM `map-wr_channels`", function(err, res){
            if (err){
                client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on getting TOTD channels list: \`\`\`${err}\`\`\``)
                console.error(err)
            } else {
                if (res.length<1) return
                res.forEach(r=>{
                    fetchedChannels.push({
                        guild: r.guildId,
                        channel: r.channelId,
                        map: r.mapUid
                    })
                })
            }
        })
        fetchedChannels.forEach(function(fetched){
            Trackmania.map(fetched.map).then(function(map){
                if (map.error) return
                Trackmania.leaderboard(map.mapUid).then(function(leader){
                    var wr = leader[0]
                    if (wr1[map.mapUid] && wr.time < wr1[map.mapUid].time){
                        let embed = new Discord.MessageEmbed
                        embed.setColor('#A2C175')
                        .setTitle('New WR on '+map.name)
                        .setDescription(`The new World Record on ${map.name} is set by **${wr.displayname}** with a time of **__${ms(wr.time, {colonNotation: true, secondsDecimalDigits: 3})}__**`)
                        .setFooter('Map UID: ' + fetched.map + '. To unsubscribe enter command "leader '+fetched.map+' unsub"')
                        if (wr1[map.mapUid].time != Infinity) embed.addField('Before:', `The old World Record is set by ${wr1[map.mapUid].displayname} with a time of ${ms(wr1[map.mapUid].time, {colonNotation: true, secondsDecimalDigits: 3})}`)

                        client.channels.fetch(fetched.channel).then(c=>c.send(embed))
                    }
                    wr1[map.mapUid] = wr
                })
            })
        })
    }, 10*60*1000)
}