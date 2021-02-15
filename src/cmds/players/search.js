const Discord = require('discord.js')
const Table = require('easy-table')
const Trackmania = require('trackmania.io')

module.exports = function (client, message, prefix){
    if (message.content.toLowerCase().startsWith(prefix + 'searchplayer')){
        let args = message.content.split(" ").slice(1)
        if (args.length < 1) return message.reply(`Usage: \`${prefix}searchplayer [player name]\``)
        const players = new Trackmania.Players()

        players.searchPlayer(args.join(' ')).then(players=>{
            var t = new Table
            players.forEach(player=>{
                t.cell('Display name', player.displayname)
                t.cell('ID', `\`${player.accountid}\``)
                t.cell('MM 3v3', `3v3: ${player.matchmaking.find(m=>m.typename == "3v3").rank}th - ${player.matchmaking.find(m=>m.typename == "3v3").score} pts`)
                if (player.meta.vanity != ""){
                    t.cell('URL', `[TM.io page](https://trackmania.io/#/player/${player.meta.vanity})`)
                } else {
                    t.cell('URL', `[TM.io page](https://trackmania.io/#/player/${player.accountid})`)
                }
                t.newRow()
            })
            let embed = new Discord.MessageEmbed()
            embed.setTitle('Results for ' + args.join(' '))
            .setDescription(t.print())
            message.channel.send(embed)
        })
    }
}