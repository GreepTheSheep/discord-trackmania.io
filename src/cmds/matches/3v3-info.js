const Discord = require('discord.js')
const ms = require('pretty-ms')
const Trackmania = require('trackmania.io')
const matches = new Trackmania.Matches({listener: false})

module.exports = function(client, message, prefix){
    if (message.content.toLowerCase().startsWith(prefix + 'mminfo')){
        let args = message.content.split(" ").slice(1)
        if (args.length < 1) return message.reply('Usage: `'+prefix+'mminfo [Match ID]`')
        if (!args[0].startsWith('LID-MTCH-')) args[0] = 'LID-MTCH-'+args[0]
        matches.match(args[0]).then(match=>{
            if (match.error) return message.reply(match.error)
            else {
                if (match.group == 'matchmaking'){
                    let embed = new Discord.MessageEmbed()
                    embed.setTitle(match.name)
                    .setFooter(match.lid)
                    .setDescription(`This match started ${ms(new Date() - new Date(match.startdate), {compact: true, verbose: true})} ago.\nThis match is ${match.status == 'PENDING' ? 'active' : 'completed'}.\n${match.players.length} players where in.`)
                    var team = []
                    match.players.forEach(player=>{
                        if (!team[player.team]) team[player.team] = []
                        team[player.team].push(player)
                    })
                    for (var i; i < team.length; i++){
                        var teamstr = []
                        console.log(i)
                        team[i].forEach(player=>{
                            teamstr.push(`${player.rank}. ${player.displayname} - ${player.score} pts ${player.mvp ? '(MVP)':''}`)
                        })
                        embed.addField(`Team ${i+1}${match.status == 'COMPLETED' ? ` - ${match.teams.find(t=>t.index==i).score} pts`:''}` , teamstr.join('\n'), true)
                    }
                    
                    embed.addField('Number of maps:', match.maps.length + ' map(s) on the playlist')

                    message.channel.send(embed)
                } else return message.reply('This match is not a matchmaking match.')
            }
        })
    }
}