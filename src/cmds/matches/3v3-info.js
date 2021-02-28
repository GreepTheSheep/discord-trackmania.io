const Discord = require('discord.js')
const ms = require('pretty-ms')
const Trackmania = require('trackmania.io')
const matches = new Trackmania.Matches({listener: false})

function ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

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
                    .setDescription(`This match started ${ms((match.startdate - new Date().valueOf()), {compact: true, verbose: true})} ago.\nThis match is ${match.status == 'PENDING' ? 'active' : 'completed'}.\n${match.players.length} players where in.\n${match.maps.length} map${match.maps.length > 1 ? 's':''} was played`)
                    var team = []
                    match.players.forEach(player=>{
                        if (!team[player.team]) team[player.team] = []
                        team[player.team].push(player)
                    })
                    for (var i = 0; i < team.length; i++){
                        var teamstr = []
                        team[i].forEach(player=>{
                            teamstr.push(`**${ordinal_suffix_of(player.rank)} - ${player.displayname}** - ${player.score} pts ${player.mvp ? '**(MVP)**':''}`)
                        })
                        embed.addField(`Team ${i+1}${match.status == 'COMPLETED' ? ` - ${match.teams.find(t=>t.index==i).score} pts`:''}` , teamstr.join('\n'), true)
                    }

                    message.channel.send(embed)
                } else return message.reply('This match is not a matchmaking match.')
            }
        })
    }
}