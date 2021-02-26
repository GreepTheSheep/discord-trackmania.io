const Discord = require('discord.js')

const ms = require('pretty-ms')
const download = require('download')
const fs = require('fs')


module.exports = function(totd, client, sql, config){

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    console.log('New TOTD!', totd.map.name)
    var fetchedChannels = []
    sql.query("SELECT * FROM totd_channels", (err, res)=>{
        if (err){
            client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on getting TOTD channels list: \`\`\`${err}\`\`\``)
            console.error(err)
        } else {
            if (res.length<1) return
            res.forEach(r=>{
                fetchedChannels.push({
                    guild: r.guildId,
                    channel: r.channelId
                })
            })

            console.log('TOTD Channels Database:',fetchedChannels)

            download(totd.map.thumbnailUrl, './data', {filename: totd.map.name+'.jpg'}).then(()=>{
                const attachment = new Discord.MessageAttachment('./data/'+totd.map.name+'.jpg')
                client.channels.fetch('761520592066707468').then(c=>{
                    c.send(`TOTD - ${new Date().getDate()} ${months[new Date().getMonth()]} ${new Date().getFullYear()} - ${totd.map.name} by ${totd.map.authordisplayname}`, attachment)
                    .then(msg=>{
                        if (msg.attachments.size > 0){
                            const embed = new Discord.MessageEmbed()
                            embed.setColor('#00ff00')
                            embed.setTitle(`Track Of The Day - ${new Date().getDate()} ${months[new Date().getMonth()]} ${new Date().getFullYear()}`)
                            embed.addField('Name:', totd.map.name, true)
                            embed.addField('Created by:', totd.map.authordisplayname, true)
                            embed.addField('Medals:', `Author: **${ms(totd.map.authorScore, {colonNotation: true, secondsDecimalDigits: 3})}**\nGold: ${ms(totd.map.goldScore, {colonNotation: true, secondsDecimalDigits: 3})}\nSilver: ${ms(totd.map.silverScore, {colonNotation: true, secondsDecimalDigits: 3})}\nBronze: ${ms(totd.map.bronzeScore, {colonNotation: true, secondsDecimalDigits: 3})}`)
                            embed.addField('Uploaded:', `${ms(new Date() - new Date(totd.map.timestamp), {compact: true, verbose: true})} ago`, true)
                            embed.addField('Links:', `[Download](${totd.map.fileUrl}) | [Trackmania.io](https://trackmania.io/#/totd/leaderboard/${totd.leaderboarduid}/${totd.map.mapUid})${totd.map.exchangeid != 0 ? ` | [Trackmania.exchange](https://trackmania.exchange/tracks/view/${totd.map.exchangeid})`:''}`)
                            embed.setImage(msg.attachments.array()[0].url)
                            embed.setTimestamp()
                            embed.setFooter(`Map UID: ${totd.map.mapUid}`)

                            fetchedChannels.forEach(c=>{
                                console.log('TOTD Sending to guild', c.guild)
                                client.channels.fetch(c.channel).then(c=>c.send(embed))
                            })

                            sql.query("INSERT INTO `totd_thumbnail_cache` (mapUid, date, thumbnail) VALUES (?, ?, ?)", [totd.map.mapUid, new Date().getFullYear()+'-'+(new Date().getMonth()+1)+'-'+new Date().getDate(), msg.attachments.array()[0].url], (err) =>{
                                if (err){
                                    client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on setting TOTD thumbnail on cache: \`\`\`${err}\`\`\``)
                                    console.error(err)
                                } else {
                                    console.log('Successfully added ' + totd.map.name + ' as TOTD thumbnail cache')
                                }
                            })

                            fs.unlinkSync('./data/'+totd.map.name+'.jpg')
                        }
                    })
                }).catch(()=>{
                    // do nothing because of shards
                })
            })
        }
    })
    
}