// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js')
const Trackmania = require('trackmania.io')
const ms = require('pretty-ms')
const fs = require('fs')
const download = require('download')

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

module.exports = function(client, message, prefix, config, sql){
    if (message.content.toLowerCase() == prefix + 'totd'){
        const totd = new Trackmania.TOTD()
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        let args = message.content.split(" ")
        args.shift()
        if (args.length == 0){
            totd.totd().then(totd=>{
                totd.reverse()
                totd = totd[0]
    
                const embed = new Discord.MessageEmbed()
                embed.setColor('#00ff00')
                embed.setTitle(`Track Of The Day - ${new Date().getDate()} ${months[new Date().getMonth()]} ${new Date().getFullYear()}`)
                embed.addField('Name:', totd.map.name, true)
                embed.addField('Created by:', totd.map.authordisplayname, true)
                embed.addField('Medals:', `Author: ${ms(totd.map.authorScore, {colonNotation: true, secondsDecimalDigits: 3})}\nGold: ${ms(totd.map.goldScore, {colonNotation: true, secondsDecimalDigits: 3})}\nSilver: ${ms(totd.map.silverScore, {colonNotation: true, secondsDecimalDigits: 3})}\nBronze: ${ms(totd.map.bronzeScore, {colonNotation: true, secondsDecimalDigits: 3})}`)
                embed.addField('Uploaded:', `${ms(new Date() - new Date(totd.map.timestamp), {compact: true, verbose: true})} ago`, true)
                embed.addField('Links:', `[Download](${totd.map.fileUrl}) | [Trackmania.io](https://trackmania.io/#/leaderboard/${totd.map.mapUd})${totd.map.exchangeid != 0 ? `| [Trackmania.exchange](https://trackmania.exchange/tracks/view/${totd.map.exchangeid})`:''}`)
                embed.setFooter(`Map UID: ${totd.map.mapUid}`)
    
                sql.query("SELECT * FROM `totd_thumbnail_cache` WHERE mapUid = ?", totd.map.mapUid, (err, res)=>{
                    if (err){
                        client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on getting TOTD thumbnail on cache: \`\`\`${err}\`\`\``)
                        console.error(err)
                        if (getRandomInt(2) == 0) message.channel.send(`Tip: type \`${prefix}totd help\` to get help if you want a TOTD of another day`,embed)
                        else message.channel.send(embed)
                    } else {
                        embed.setImage(res[0].thumbnail)
                        if (getRandomInt(2) == 0) message.channel.send(`Tip: type \`${prefix}totd help\` to get help if you want a TOTD of another day`,embed)
                        else message.channel.send(embed)
                    }
                })
            })
        } else {
            if (args[0].toLowerCase() == 'help') return message.reply(`Usage \`${prefix}totd [3-char month] [day] [year]\`\nExample: \`${prefix}totd dec 24 2020\` for December, 24 2020. \`${prefix}totd sep 9 2020\` for September, 9 2020 etc...`)
            const monthsShort = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sepr", "oct", "nov", "dec"];
            if (monthsShort.includes(args[0].toLowerCase())){
                if (isNaN(Number(args[1])) || isNaN(Number(args[2]))) return message.reply(`Date or year isn't a numeric value, type \`${prefix}totd help\` to get help`)
                var date = new Date()
                var yearBefore = date.getFullYear() - Number(args[2])
                var yearsBack = yearBefore * 12
                var monthsBack
                var i = 0
                monthsShort.forEach(m=>{
                    if (args[0].toLowerCase == m) monthsBack = i
                    else i++
                })

                totd.totd(monthsBack + yearsBack).then(totd=>{
                    totd = totd[Number(args[1])]
                    if (!totd) return message.reply('This was not found')

                    const embed = new Discord.MessageEmbed()
                    embed.setColor('#00ff00')
                    embed.setTitle(`Track Of The Day - ${new Date().getDate()} ${months[new Date().getMonth()]} ${new Date().getFullYear()}`)
                    embed.addField('Name:', totd.map.name, true)
                    embed.addField('Created by:', totd.map.authordisplayname, true)
                    embed.addField('Medals:', `Author: ${ms(totd.map.authorScore, {colonNotation: true, secondsDecimalDigits: 3})}\nGold: ${ms(totd.map.goldScore, {colonNotation: true, secondsDecimalDigits: 3})}\nSilver: ${ms(totd.map.silverScore, {colonNotation: true, secondsDecimalDigits: 3})}\nBronze: ${ms(totd.map.bronzeScore, {colonNotation: true, secondsDecimalDigits: 3})}`)
                    embed.addField('Uploaded:', `${ms(new Date() - new Date(totd.map.timestamp), {compact: true, verbose: true})} ago`, true)
                    embed.addField('Links:', `[Download](${totd.map.fileUrl}) | [Trackmania.io](https://trackmania.io/#/leaderboard/${totd.map.mapUd})${totd.map.exchangeid != 0 ? `| [Trackmania.exchange](https://trackmania.exchange/tracks/view/${totd.map.exchangeid})`:''}`)
                    embed.setFooter(`Map UID: ${totd.map.mapUid}`)

                    sql.query("SELECT * FROM `totd_thumbnail_cache` WHERE mapUid = ?", totd.map.mapUid, (err, res)=>{
                        if (err){
                            client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on getting TOTD thumbnail on cache: \`\`\`${err}\`\`\``)
                            console.error(err)
                            message.channel.send(embed)
                        } else {
                            if (!res[0]){
                                download(totd.map.thumbnailUrl, './data', {filename: totd.map.name+'.jpg'}).then(()=>{
                                    const attachment = new Discord.MessageAttachment('./data/'+totd.map.name+'.jpg')
                                    client.channels.fetch('761520592066707468').then(c=>{
                                        c.send(new Date() + ' - ' + totd.map.name, attachment)
                                        .then(msg=>{
                                            if (msg.attachments.size > 0){
                                                const newEmbed = new Discord.MessageEmbed()
                                                newEmbed.setColor('#00ff00')
                                                newEmbed.setTitle(`Track Of The Day - ${new Date().getDate()} ${months[new Date().getMonth()]} ${new Date().getFullYear()}`)
                                                newEmbed.addField('Name:', totd.map.name, true)
                                                newEmbed.addField('Created by:', totd.map.authordisplayname, true)
                                                newEmbed.addField('Medals:', `Author: ${ms(totd.map.authorScore, {colonNotation: true, secondsDecimalDigits: 3})}\nGold: ${ms(totd.map.goldScore, {colonNotation: true, secondsDecimalDigits: 3})}\nSilver: ${ms(totd.map.silverScore, {colonNotation: true, secondsDecimalDigits: 3})}\nBronze: ${ms(totd.map.bronzeScore, {colonNotation: true, secondsDecimalDigits: 3})}`)
                                                newEmbed.addField('Uploaded:', `${ms(new Date() - new Date(totd.map.timestamp), {compact: true, verbose: true})} ago`, true)
                                                newEmbed.addField('Links:', `[Download](${totd.map.fileUrl}) | [Trackmania.io](https://trackmania.io/#/leaderboard/${totd.map.mapUd})${totd.map.exchangeid != 0 ? `| [Trackmania.exchange](https://trackmania.exchange/tracks/view/${totd.map.exchangeid})`:''}`)
                                                newEmbed.setImage(msg.attachments.array()[0].url)
                                                newEmbed.setTimestamp()
                                                newEmbed.setFooter(`Map UID: ${totd.map.mapUid}`)
                        
                                                message.channel.send(newEmbed)
                        
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
                            } else {
                                embed.setImage(res[0].thumbnail)
                                message.channel.send(embed)
                            }
                        }
                    })
                })
            } else return message.reply(`Month not found, type \`${prefix}totd help\` to get help`)
        }
    }
}