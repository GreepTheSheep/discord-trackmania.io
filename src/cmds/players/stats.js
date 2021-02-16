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
                        var trophies_str = []
                    player.trophies.counts.forEach(tier=>{
                        if (tier>0) trophies_str.push(`${trophies_str.length+1} : ${tier}`)
                    })
                    var rankNames = [
                        {
                            "name": "Unranked",
                            "abbr": "U",
                            "before": 1000
                        },
                        {
                            "name": "Beginner I",
                            "abbr": "BI",
                            "before": 1250
                        },
                        {
                            "name": "Beginner II",
                            "abbr": "BII",
                            "before": 1500
                        },
                        {
                            "name": "Beginner III",
                            "abbr": "BIII",
                            "before": 2000
                        },
                        {
                            "name": "Challenger I",
                            "abbr": "CI",
                            "before": 2250
                        },
                        {
                            "name": "Challenger II",
                            "abbr": "CII",
                            "before": 2500
                        },
                        {
                            "name": "Challenger III",
                            "abbr": "CIII",
                            "before": 3000
                        },
                        {
                            "name": "Master I",
                            "abbr": "MI",
                            "before": 3500
                        },
                        {
                            "name": "Master II",
                            "abbr": "MII",
                            "before": 4000
                        },
                        {
                            "name": "Master III",
                            "abbr": "MIII",
                            "before": 5000
                        },
                        {
                            "name": "Trackmaster",
                            "abbr": "TM",
                            "before": Infinity
                        }
                    ]
                    var rankName
                    rankNames.reverse()
                    rankNames.forEach(rank=>{
                        if (player.matchmaking.find(m=>m.info.typename == '3v3').info.score < rank.before) rankName = rank.name
                    })
                    let embed = new Discord.MessageEmbed()
                    .setTitle('Statictics of '+ player.displayname)
                    .setDescription(player.displayname + ' has started playing Trackmania on '+ new Date(player.timestamp).getFullYear()+'-'+(new Date(player.timestamp).getMonth()+1)+'-'+new Date(player.timestamp).getDate() +' (' + ms(new Date() - new Date(player.timestamp), {compact: true, verbose: true}) + ' ago).\nThis player was last seen ' + ms(new Date() - new Date(player.trophies.timestamp), {compact: true, verbose: true}) + ' ago.\nIts Trackmania.io URL is ' + player.url)
                    .addField('Ranking:', `${player.trophies.points} points.\nNumber of trophies:\n${trophies_str.join('\n')}`, true)
                    .addField('Matchmaking:', `**__Teams 3v3:__**\nScore: ${player.matchmaking.find(m=>m.info.typename == '3v3').info.score} (${rankName})\nRank: ${player.matchmaking.find(m=>m.info.typename == '3v3').info.rank}/${player.matchmaking.find(m=>m.info.typename == '3v3').total}`, true)
                    if (player.meta.nadeo || player.meta.tmgl || player.meta.team || player.meta.sponsor) embed.addField('Part of', `${player.meta.nadeo ? '- Nadeo Team\n' : ''}${player.meta.tmgl ? '- TMGL Player\n' : ''}${player.meta.team ? '- Trackmania.io Team\n' : ''}${player.meta.sponsor ? '- Trackmania.io Sponsor\n' : ''}`)
                    embed.setFooter(`Account id: ${player.accountid}`)
                    if (player.meta.comment != "") embed.addField('Comment:', player.meta.comment)
                    message.channel.send(embed)
                    })
                }
            })
        } else {
            players.searchPlayer(args.join(' ')).then(player=>{
                players.player(player[0].accountid).then(player=>{
                    var trophies_str = []
                    player.trophies.counts.forEach(tier=>{
                        if (tier>0) trophies_str.push(`${trophies_str.length+1} : ${tier}`)
                    })
                    var rankNames = [
                        {
                            "name": "Unranked",
                            "abbr": "U",
                            "before": 1000
                        },
                        {
                            "name": "Beginner I",
                            "abbr": "BI",
                            "before": 1250
                        },
                        {
                            "name": "Beginner II",
                            "abbr": "BII",
                            "before": 1500
                        },
                        {
                            "name": "Beginner III",
                            "abbr": "BIII",
                            "before": 2000
                        },
                        {
                            "name": "Challenger I",
                            "abbr": "CI",
                            "before": 2250
                        },
                        {
                            "name": "Challenger II",
                            "abbr": "CII",
                            "before": 2500
                        },
                        {
                            "name": "Challenger III",
                            "abbr": "CIII",
                            "before": 3000
                        },
                        {
                            "name": "Master I",
                            "abbr": "MI",
                            "before": 3500
                        },
                        {
                            "name": "Master II",
                            "abbr": "MII",
                            "before": 4000
                        },
                        {
                            "name": "Master III",
                            "abbr": "MIII",
                            "before": 5000
                        },
                        {
                            "name": "Trackmaster",
                            "abbr": "TM",
                            "before": Infinity
                        }
                    ]
                    var rankName
                    rankNames.reverse()
                    rankNames.forEach(rank=>{
                        if (player.matchmaking.find(m=>m.info.typename == '3v3').info.score < rank.before) rankName = rank.name
                    })
                    let embed = new Discord.MessageEmbed()
                    .setTitle('Statictics of '+ player.displayname)
                    .setDescription(player.displayname + ' has started playing Trackmania on '+ new Date(player.timestamp).getFullYear()+'-'+(new Date(player.timestamp).getMonth()+1)+'-'+new Date(player.timestamp).getDate() +' (' + ms(new Date() - new Date(player.timestamp), {compact: true, verbose: true}) + ' ago).\nThis player was last seen ' + ms(new Date() - new Date(player.trophies.timestamp), {compact: true, verbose: true}) + ' ago.\nIts Trackmania.io URL is ' + player.url)
                    .addField('Ranking:', `${player.trophies.points} points.\nNumber of trophies:\n${trophies_str.join('\n')}`, true)
                    .addField('Matchmaking:', `**__Teams 3v3:__**\nScore: ${player.matchmaking.find(m=>m.info.typename == '3v3').info.score} (${rankName})\nRank: ${player.matchmaking.find(m=>m.info.typename == '3v3').info.rank}/${player.matchmaking.find(m=>m.info.typename == '3v3').total}`, true)
                    if (player.meta.nadeo || player.meta.tmgl || player.meta.team || player.meta.sponsor) embed.addField('Part of', `${player.meta.nadeo ? '- Nadeo Team\n' : ''}${player.meta.tmgl ? '- TMGL Player\n' : ''}${player.meta.team ? '- Trackmania.io Team\n' : ''}${player.meta.sponsor ? '- Trackmania.io Sponsor\n' : ''}`)
                    embed.setFooter(`Account id: ${player.accountid}`)
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