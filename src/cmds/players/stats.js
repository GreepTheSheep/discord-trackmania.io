const Discord = require('discord.js')
const Trackmania = require('trackmania.io')
const ms = require('pretty-ms')

module.exports = function (client, message, prefix, config, sql){
    if (message.content.toLowerCase().startsWith(prefix + 'stats')){
        let args = message.content.split(" ").slice(1)
        const players = new Trackmania.Players()
        if (args.length < 1) {
            sql.query("SELECT * FROM `players` WHERE discordId = ?", message.author.id, (err, res) =>{
                if (err){
                    console.error(err)
                    message.reply('There\'s an error while getting your profile, this was reported')
                    client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on getting player on database: \`\`\`${err}\`\`\``)
                } else {
                    players.player(res[0].accountId).then(player=>{
                        let embed = new Discord.MessageEmbed()
                        .setTitle('Statictics of '+ player.displayName)
                        .setDescription(player.displayName + ' has started playing Trackmania ' + ms(player.timestamp, {compact: true, verbose: true}) + ' ago.\nThis player was last seen ' + ms(player.trophies.timestamp, {compact: true, verbose: true}) + ' ago.\nIts Trackmania.io URL is ' + player.url)
                        .addField('Trophies:', `${player.trophies.points} points.\n\nTiers:\n1: ${player.trophies.counts[0]}\n2: ${player.trophies.counts[1]}\n3: ${player.trophies.counts[2]}\n4: ${player.trophies.counts[3]}\n5: ${player.trophies.counts[4]}\n6: ${player.trophies.counts[5]}\n7: ${player.trophies.counts[6]}\n8: ${player.trophies.counts[7]}\n9: ${player.trophies.counts[8]}`)
                        .addField('Matchmaking:', `**__Teams 3v3:__**\nScore: ${player.matchmaking.find(m=>m.info.typename == '3v3').info.score}\nRank: ${player.matchmaking.find(m=>m.info.typename == '3v3').info.rank}/${player.matchmaking.find(m=>m.info.typename == '3v3').total}`)
                        .addField('Nadeo:', player.meta.nadeo ? 'Yes' : 'No', true)
                        .addField('TMGL player:', player.meta.tmgl ? 'Yes' : 'No', true)
                        .addField('Tm.io team:', player.meta.team ? 'Yes' : 'No', true)
                        .addField('Tm.io sponsor:', player.meta.sponsor ? 'Yes' : 'No', true)
                        .setFooter(`Account id: ${player.accountId}`)
                        if (player.meta.comment != "") embed.addField('Comment:', player.meta.comment)
                        message.channel.send(embed)
                    })
                }
            })
        } else {
            players.searchPlayer(args.join(' ')).then(player=>{
                players.player(player[0].accountid).then(player=>{
                    let embed = new Discord.MessageEmbed()
                    .setTitle('Statictics of '+ player.displayName)
                    .setDescription(player.displayName + ' has started playing Trackmania ' + ms(player.timestamp, {compact: true, verbose: true}) + ' ago.\nThis player was last seen ' + ms(player.trophies.timestamp, {compact: true, verbose: true}) + ' ago.\nIts Trackmania.io URL is ' + player.url)
                    .addField('Trophies:', `${player.trophies.points} points.\n\nTiers:\n1: ${player.trophies.counts[0]}\n2: ${player.trophies.counts[1]}\n3: ${player.trophies.counts[2]}\n4: ${player.trophies.counts[3]}\n5: ${player.trophies.counts[4]}\n6: ${player.trophies.counts[5]}\n7: ${player.trophies.counts[6]}\n8: ${player.trophies.counts[7]}\n9: ${player.trophies.counts[8]}`)
                    .addField('Matchmaking:', `**__Teams 3v3:__**\nScore: ${player.matchmaking.find(m=>m.info.typename == '3v3').info.score}\nRank: ${player.matchmaking.find(m=>m.info.typename == '3v3').info.rank}/${player.matchmaking.find(m=>m.info.typename == '3v3').total}`)
                    .addField('Nadeo:', player.meta.nadeo ? 'Yes' : 'No', true)
                    .addField('TMGL player:', player.meta.tmgl ? 'Yes' : 'No', true)
                    .addField('Tm.io team:', player.meta.team ? 'Yes' : 'No', true)
                    .addField('Tm.io sponsor:', player.meta.sponsor ? 'Yes' : 'No', true)
                    .setFooter(`Account id: ${player.accountId}`)
                    if (player.meta.comment != "") embed.addField('Comment:', player.meta.comment)
                    message.channel.send(embed)
                })
                .catch(err=>{
                    console.error(err)
                    message.reply('Player not found, use `' + prefix + 'searchplayer` if you want to find a specific user')
                })
            })
        }
    }
}