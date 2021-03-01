// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js')
const Trackmania = require('trackmania.io')
const ms = require('pretty-ms')
const fs = require('fs')
const download = require('download')
const Table = require('easy-table')

function arrayMove(array, from, to) {
	const startIndex = from < 0 ? array.length + from : from;

	if (startIndex >= 0 && startIndex < array.length) {
		const endIndex = to < 0 ? array.length + to : to;

		const [item] = array.splice(from, 1);
		array.splice(endIndex, 0, item);
    }
    return array
}

module.exports = function(client, message, prefix, config, sql){
    if (message.content.toLowerCase().startsWith(prefix + 'totd')){
        const totd = new Trackmania.TOTD({listener: false})
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        let args = message.content.split(" ").slice(1)
        if (args.length < 1){
            totd.totd().then(totd=>{
                totd.reverse()
                totd = totd[0]
    
                const embed = new Discord.MessageEmbed()
                embed.setColor('#00ff00')
                embed.setTitle(`Track Of The Day - ${new Date().getDate()} ${months[new Date().getMonth()]} ${new Date().getFullYear()}`)
                embed.addField('Name:', totd.map.name, true)
                embed.addField('Created by:', totd.map.authordisplayname, true)
                embed.addField('Medals:', `Author: **${ms(totd.map.authorScore, {colonNotation: true, secondsDecimalDigits: 3})}**\nGold: ${ms(totd.map.goldScore, {colonNotation: true, secondsDecimalDigits: 3})}\nSilver: ${ms(totd.map.silverScore, {colonNotation: true, secondsDecimalDigits: 3})}\nBronze: ${ms(totd.map.bronzeScore, {colonNotation: true, secondsDecimalDigits: 3})}`)
                embed.addField('Uploaded:', `${ms(new Date() - new Date(totd.map.timestamp), {compact: true, verbose: true})} ago`, true)
                embed.addField('Links:', `[Download](${totd.map.fileUrl}) | [Trackmania.io](https://trackmania.io/#/totd/leaderboard/${totd.leaderboarduid}/${totd.map.mapUid})${totd.map.exchangeid != 0 ? ` | [Trackmania.exchange](https://trackmania.exchange/tracks/view/${totd.map.exchangeid})`:''}`)
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
                                    c.send(`TOTD - ${new Date().getDate()} ${months[new Date().getMonth()]} ${new Date().getFullYear()} - ${totd.map.name} by ${totd.map.authordisplayname}`, attachment)
                                    .then(msg=>{
                                        if (msg.attachments.size > 0){
                                            embed.setImage(msg.attachments.array()[0].url)
                                            message.channel.send(embed)
                    
                                            sql.query("INSERT INTO `totd_thumbnail_cache` (mapUid, date, thumbnail) VALUES (?, ?, ?)", [totd.map.mapUid, new Date().getFullYear()+'-'+new Date().getMonth()+'-'+new Date().getDate(), msg.attachments.array()[0].url], (err) =>{
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
        } else {
            if (args[0].toLowerCase() == 'help'){
                const embed = new Discord.MessageEmbed()
                embed.setTitle(`TOTD help`)
                .setColor('RANDOM')
                .addField(prefix + `totd`, 'Gets the TOTD information of today', true)
                .addField(prefix + `totd sub`, 'Subscribe to get the new TOTDs', true)
                .addField(prefix + `totd unsub`, 'Unsubscribes to the TOTDs updates', true)
                .addField(prefix + `totd leaderboard`, 'Gets the leaderboard of the TOTD of today', true)
                .addField(prefix + `totd leaderboard sub`, 'Subscribe to get the World Record updates on your TOTD (checks every 10 minutes)', true)
                .addField(prefix + `totd leaderboard unsub`, 'Unsubscribes to the TOTD WR updates', true)
                .addField(prefix + `totd [3-char month] [day] [year]`, 'Gets the TOTD of a specific day.\n' + `Example: \`${prefix}totd dec 24 2020\` for December, 24 2020. \`${prefix}totd sep 9 2020\` for September, 9 2020 etc...`, true)
                message.channel.send(embed)
            } else if (args[0].toLowerCase() == 'leaderboard' || args[0].toLowerCase() == 'leader'){
                args.shift()
                if (args.length < 1) return totd.totd().then(totd=>{
                    totd.reverse()
                    totd = totd[0]

                    Trackmania.leaderboard(totd.map.mapUid).then(leader=>{
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

                        message.channel.send('Top 15 of ' + totd.map.name +`\`\`\`${t.toString()}\`\`\``)
                    })
                })
                if (args[0].toLowerCase().startsWith('sub')){
                    var channel = message.mentions.channels.first()
                    if (!channel) return message.reply(`Usage \`${prefix}totd leader sub [channel mention]\``)
                
                    sql.query('INSERT INTO `totd-wr_channels` (userId, guildId, channelId) VALUES (?, ?, ?)', [message.author.id, message.guild.id, channel.id], (err) =>{
                        if (err){
                            console.error(err)
                            message.channel.send('Hmm... There\'s an unattended error while updating the database. This is reported')
                            client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on totd sub event: \`\`\`${err}\`\`\``)
                        } else {
                            message.channel.send(`Successfully added #${channel.name} to get TOTD World Record updates.`)
                        }
                    })
                } else if (args[0].toLowerCase().startsWith('unsub')){
                    sql.query('DELETE FROM `totd-wr_channels` WHERE `guildId` = ?', message.guild.id, (err, res) =>{
                        if (err){
                            console.error(err)
                            message.channel.send('Hmm... There\'s an unattended error while updating the database. This is reported')
                            client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on totd sub event: \`\`\`${err}\`\`\``)
                        } else {
                            if (res.affectedRows == 0) {
                                message.channel.send(`You have not subscribed on this server to get TOTD updates, please run \`${prefix}totd sub [channel mention]\` to get updates`)
                            } else {
                                message.channel.send(`Successfully deleted TOTD World Record updates on this server.`)
                            }
                        }
                    })
                }
            } else if (args[0].toLowerCase() == 'sub'){
                // eslint-disable-next-line no-redeclare
                var channel = message.mentions.channels.first()
                if (!channel) return message.reply(`Usage \`${prefix}totd sub [channel mention]\``)
                
                sql.query('INSERT INTO `totd_channels` (userId, guildId, channelId) VALUES (?, ?, ?)', [message.author.id, message.guild.id, channel.id], (err) =>{
                    if (err){
                        console.error(err)
                        message.channel.send('Hmm... There\'s an unattended error while updating the database. This is reported')
                        client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on totd sub event: \`\`\`${err}\`\`\``)
                    } else {
                        message.channel.send(`Successfully added #${channel.name} to get TOTD updates.`)
                    }
                })
            } else if (args[0].toLowerCase() == 'unsub'){
                sql.query('DELETE FROM `totd_channels` WHERE `guildId` = ?', message.guild.id, (err, res) =>{
                    if (err){
                        console.error(err)
                        message.channel.send('Hmm... There\'s an unattended error while updating the database. This is reported')
                        client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on totd sub event: \`\`\`${err}\`\`\``)
                    } else {
                        if (res.affectedRows == 0) {
                            message.channel.send(`You have not subscribed on this server to get TOTD updates, please run \`${prefix}totd sub [channel mention]\` to get updates`)
                        } else {
                            message.channel.send(`Successfully deleted TOTD updates on this server.`)
                        }
                    }
                })
            } else {
                const monthsShort = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
                const monthsShort2 = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
                if (monthsShort.includes(args[0].toLowerCase())){
                    if (isNaN(Number(args[1])) || isNaN(Number(args[2]))) return message.reply(`Date or year isn't a numeric value, type \`${prefix}totd help\` to get help`)
                    var yearBefore = new Date().getFullYear() - Number(args[2])
                    var yearsBack = 0
                    if (yearBefore > 1) yearsBack = yearBefore * 12
                    var monthsBack
                    var i = 0
                    for (var p = 0 ; p < new Date().getMonth()+1 ; p++){
                        arrayMove(monthsShort2, 0, -1)
                    }
                    monthsShort2.reverse()
                    monthsShort2.forEach(m=>{
                        if (args[0].toLowerCase() == m){
                            monthsBack = i
                        } 
                        else i++
                    })

                    totd.totd(monthsBack + yearsBack).then(totd=>{
                        totd = totd[Number(args[1])-1]
                        if (!totd) return message.reply('This was not found')

                        const embed = new Discord.MessageEmbed()
                        embed.setColor('#00ff00')
                        embed.setTitle(`Track Of The Day - ${Number(args[1])} ${months[monthsShort.indexOf(args[0].toLowerCase())]} ${Number(args[2])}`)
                        embed.addField('Name:', totd.map.name, true)
                        embed.addField('Created by:', totd.map.authordisplayname, true)
                        embed.addField('Medals:', `Author: **${ms(totd.map.authorScore, {colonNotation: true, secondsDecimalDigits: 3})}**\nGold: ${ms(totd.map.goldScore, {colonNotation: true, secondsDecimalDigits: 3})}\nSilver: ${ms(totd.map.silverScore, {colonNotation: true, secondsDecimalDigits: 3})}\nBronze: ${ms(totd.map.bronzeScore, {colonNotation: true, secondsDecimalDigits: 3})}`)
                        embed.addField('Uploaded:', `${ms(new Date() - new Date(totd.map.timestamp), {compact: true, verbose: true})} ago`, true)
                        embed.addField('Links:', `[Download](${totd.map.fileUrl}) | [Trackmania.io](https://trackmania.io/#/totd/leaderboard/${totd.leaderboarduid}/${totd.map.mapUid})${totd.map.exchangeid != 0 ? ` | [Trackmania.exchange](https://trackmania.exchange/tracks/view/${totd.map.exchangeid})`:''}`)
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
                                            c.send(`TOTD - ${Number(args[1])} ${months[monthsShort.indexOf(args[0].toLowerCase())]} ${Number(args[2])} - ${totd.map.name} by ${totd.map.authordisplayname}`, attachment)
                                            .then(msg=>{
                                                if (msg.attachments.size > 0){
                                                    embed.setImage(msg.attachments.array()[0].url)
                                                    message.channel.send(embed)
                            
                                                    sql.query("INSERT INTO `totd_thumbnail_cache` (mapUid, date, thumbnail) VALUES (?, ?, ?)", [totd.map.mapUid, Number(args[2])+'-'+(monthsShort.indexOf(args[0].toLowerCase())+1)+'-'+(Number(args[1])), msg.attachments.array()[0].url], (err) =>{
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
                    }).catch(err=>{
                        console.error(err)
                        message.channel.send('No TOTDs are found for this month.')
                    })
                } else return message.reply(`Month not found, type \`${prefix}totd help\` to get help`)
            }
        }
    }
}