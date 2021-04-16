// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const Trackmania = require('trackmania.io')
const ms = require('pretty-ms')
const Table = require('easy-table')

module.exports = function(client, message, prefix, config, sql) {
    if (message.content.startsWith(prefix + 'leaderboard') || message.content.startsWith(prefix + 'leader')) {
        let args = message.content.split(" ")
        args.shift()
        if (args.length < 1) return message.reply('Usage: `'+prefix+'leader [Map UID] (optional: sub/unsub)`. Use sub to get WR updates, unsub to unsubscribe.')
        
        Trackmania.map(args[0]).then(map=>{
            if (map.error) return message.reply('Invalid map UID, check the map\'s page at trackmania.io and copy paste the UID.')
            else {
                args.shift()
                if (args.length < 1){
                    Trackmania.leaderboard(map.mapUid).then(leader=>{
                        var t = new Table()
                        var i = 1
                        leader.forEach(top=>{
                            t.cell("Pos.", i)
                            t.cell("Name", top.displayname)
                            t.cell("Time", ms(top.time, {colonNotation: true, secondsDecimalDigits: 3}))
                            if (i > 1) t.cell("Diff.", `(+${ms(top.time - leader[0].time, {colonNotation: true, secondsDecimalDigits: 3})})`)
                            t.newRow()
                            i++
                        })
            
                        message.channel.send('Top 15 of ' + map.name +`\`\`\`${t.toString()}\`\`\``)
                    })
                } else if (args[0].toLowerCase() == 'sub'){
                    if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply(`:warning: Only administrators on this server can do that.`)
                    var channel = message.mentions.channels.first()
                    if (!channel) return message.reply(`Usage \`${prefix}leader ${map.mapUid} sub [channel mention]\``)
                
                    sql.query('INSERT INTO `map-wr_channels` (userId, guildId, channelId, mapUid) VALUES (?, ?, ?, ?)', [message.author.id, message.guild.id, channel.id, map.mapUid], (err) =>{
                        if (err){
                            if (err.code == 'ER_DUP_ENTRY'){
                                sql.query("UPDATE `map-wr_channels` SET channelId = ? WHERE guildId = ? AND `mapUid` = ?", [channel.id, message.guild.id, map.mapUid], (err)=>{
                                    if (err){
                                        console.error(err)
                                        message.channel.send('Error while updating the database. This is reported')
                                        client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on map WR sub event: \`\`\`${err}\`\`\``)
                                    } else {
                                        message.channel.send(`Successfully updated #${channel.name} to get ${map.name} World Record updates.`)
                                    }
                                })
                            } else {
                                message.channel.send('Error while updating the database. This is reported')
                                client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on map WR sub event: \`\`\`${err}\`\`\``)
                            }
                        } else {
                            message.channel.send(`Successfully added #${channel.name} to get ${map.name} World Record updates.`)
                        }
                    })
                } else if (args[0].toLowerCase().startsWith('unsub')){
                    if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply(`:warning: Only administrators on this server can do that.`)
                    sql.query('DELETE FROM `map-wr_channels` WHERE `guildId` = ? AND `mapUid` = ?', [message.guild.id, map.mapUid], (err, res) =>{
                        if (err){
                            console.error(err)
                            message.channel.send('Hmm... There\'s an unattended error while updating the database. This is reported')
                            client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on map unsub event: \`\`\`${err}\`\`\``)
                        } else {
                            if (res.affectedRows == 0) {
                                message.channel.send(`You have not subscribed on this server to get this map updates, please run \`${prefix}leader ${map.mapUid} sub [channel mention]\` to get updates`)
                            } else {
                                message.channel.send(`Successfully deleted World Record updates for ${map.name} on this server.`)
                            }
                        }
                    })
                }
            }
        })
    }
}
