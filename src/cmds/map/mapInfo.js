const Discord = require('discord.js');
const Trackmania = require('trackmania.io')
const ms = require('pretty-ms')
const download = require('download')
const fs = require('fs')

module.exports = function(client, message, prefix, config, sql) {
    if (message.content.startsWith(prefix + 'map')) {
        let args = message.content.split(" ")
        args.shift()
        if (args.length < 1) return message.reply('Usage: `'+prefix+'map [Map UID]`')
        
        Trackmania.map(args[0]).then(map=>{
            if (map.error) return message.reply('Invalid map UID, check the map\'s page at trackmania.io and copy paste the UID.')
            else {
                let embed = new Discord.MessageEmbed()
                embed.setColor('#9B850E')
                embed.setTitle(map.name)
                embed.addField('Created by:', map.authordisplayname, true)
                embed.addField('Medals:', `Author: **${ms(map.authorScore, {colonNotation: true, secondsDecimalDigits: 3})}**\nGold: ${ms(map.goldScore, {colonNotation: true, secondsDecimalDigits: 3})}\nSilver: ${ms(map.silverScore, {colonNotation: true, secondsDecimalDigits: 3})}\nBronze: ${ms(map.bronzeScore, {colonNotation: true, secondsDecimalDigits: 3})}`)
                embed.addField('Uploaded:', `${ms(new Date() - new Date(map.timestamp), {compact: true, verbose: true})} ago by ${ map.submitterdisplayname}`, true)
                embed.addField('Links:', `[Download](${map.fileUrl}) | [Trackmania.io](https://trackmania.io/#/leaderboard/${map.mapUid})${map.exchangeid != 0 ? ` | [Trackmania.exchange](https://trackmania.exchange/tracks/view/${map.exchangeid})`:''}`)
                embed.setFooter(`Map UID: ${map.mapUid}`)
                sql.query("SELECT * FROM `map_thumbnail_cache` WHERE mapUid = ?", map.mapUid, (err, res)=>{
                    if (err){
                        client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on getting map thumbnail on cache: \`\`\`${err}\`\`\``)
                        console.error(err)
                        message.channel.send(embed)
                    } else {
                        if (!res[0]){
                            download(map.thumbnailUrl, './data', {filename: map.mapUid+'.jpg'}).then(()=>{
                                const attachment = new Discord.MessageAttachment('./data/'+map.mapUid+'.jpg')
                                client.channels.fetch('761520592066707468').then(c=>{
                                    c.send(`${map.name} by ${map.authordisplayname}`, attachment)
                                    .then(msg=>{
                                        if (msg.attachments.size > 0){
                                            embed.setImage(msg.attachments.array()[0].url)
                                            message.channel.send(embed)
                    
                                            sql.query("INSERT INTO `map_thumbnail_cache` (mapUid, thumbnail) VALUES (?, ?)", [map.mapUid, msg.attachments.array()[0].url], (err) =>{
                                                if (err){
                                                    client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on setting map thumbnail on cache: \`\`\`${err}\`\`\``)
                                                    console.error(err)
                                                } else {
                                                    console.log('Successfully added ' + map.name + ' as map thumbnail cache')
                                                }
                                            })
                    
                                            fs.unlinkSync('./data/'+map.mapUid+'.jpg')
                                        }
                                    })
                                }).catch(()=>{
                                    // do nothing because of shards
                                })
                            })
                        } else {
                            embed.setImage(res[0].thumbnail)
                            message.channel.send(embed)
                        }
                    }
                })
            }
        })
    }
}
