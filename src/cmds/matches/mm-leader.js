// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js')
const Trackmania = require('trackmania.io')
const matches = new Trackmania.Matchmaking({listener:false})
const Table = require('easy-table')

// eslint-disable-next-line no-unused-vars
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
    if (message.content.toLowerCase() == prefix + 'mmranking'){
        matches.ranking("3v3").then(ranks=>{
            if (ranks.error) return message.reply(ranks.error)
            else {
                var t = new Table()
                var i = 1
                ranks.ranks.forEach(top=>{
                    if (i>25) return
                    t.cell("Pos.", ordinal_suffix_of(i))
                    t.cell("Name", top.displayname)
                    t.cell("Division", top.division.rank ? top.division.rank.name : "Error :(")
                    t.cell("Points", top.score)
                    if (i > 1) t.cell("Diff.", `(${top.score - ranks.ranks[0].score})`)
                    t.newRow()
                    i++
                })
                message.channel.send(`${ranks.note != "" ? "⚠ " + ranks.note : ""}\`\`\`${t.toString()}\`\`\``)
            }
        })
    }

    if (message.content.toLowerCase() == prefix + 'royalranking'){
        matches.ranking("Royal").then(ranks=>{
            if (ranks.error) return message.reply(ranks.error)
            else {
                var t = new Table()
                var i = 1
                ranks.ranks.forEach(top=>{
                    if (i>25) return
                    t.cell("Pos.", ordinal_suffix_of(i))
                    t.cell("Name", top.displayname)
                    t.cell("Division", top.division.rank ? top.division.rank.name : "Error :(")
                    t.cell("Wins", top.progression)
                    if (i > 1) t.cell("Diff.", `(${top.progression - ranks.ranks[0].progression})`)
                    t.newRow()
                    i++
                })
                message.channel.send(`${ranks.note != "" ? "⚠ " + ranks.note : ""}\`\`\`${t.toString()}\`\`\``)
            }
        })
    }
}