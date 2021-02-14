// eslint-disable-next-line no-unused-vars
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
                t.cell('Display name', player.displayName)
                t.cell('ID', player.accountid)
                t.newRow()
            })
            message.reply(`Here's the result for ${args.join(' ')}: \`\`\`${t.toString()}\`\`\``)
        })
    }
}