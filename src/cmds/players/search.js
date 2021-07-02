const Discord = require('discord.js')
const Trackmania = require('trackmania.io')

module.exports = function (client, message, prefix){
    if (message.content.toLowerCase().startsWith(prefix + 'searchplayer')){
        let args = message.content.split(" ").slice(1)
        if (args.length < 1) return message.reply(`Usage: \`${prefix}searchplayer [player name]\``)
        const players = new Trackmania.Players()

        players.searchPlayer(args.join(' ')).then(players=>{
            var array = []
            players.forEach(player=>{
                if (player.player.meta && player.player.meta.vanity != ""){
                    array.push(`${player.player.clubtag && player.player.clubtag != "" ? `[${player.player.clubtag}] ` : ""}[${player.player.displayname}](https://trackmania.io/#/player/${player.player.meta.vanity})`)
                } else {
                    array.push(`${player.player.clubtag && player.player.clubtag != "" ? `[${player.player.clubtag}] ` : ""}[${player.player.displayname}](https://trackmania.io/#/player/${player.player.id})`)
                }
            })
            let embed = new Discord.MessageEmbed()
            embed.setTitle('Results for ' + args.join(' '))
            .setDescription(`- ${array.join('\n- ')}`)
            message.channel.send(embed)
        })
    }
}