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
                if (player.meta && player.meta.vanity != ""){
                    array.push(`[${player.displayname}](https://trackmania.io/#/player/${player.meta.vanity})`)
                } else {
                    array.push(`[${player.displayname}](https://trackmania.io/#/player/${player.accountid})`)
                }
            })
            let embed = new Discord.MessageEmbed()
            embed.setTitle('Results for ' + args.join(' '))
            .setDescription(`- ${array.join('\n- ')}`)
            message.channel.send(embed)
        })
    }
}