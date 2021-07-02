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

module.exports = function(client, message, prefix, config){
    if (message.content.toLowerCase().startsWith(prefix + 'mmranking')){
        var mmType = "3v3"
        let args = message.content.split(" ").slice(1)

        if (args[0] && args[0].toLowerCase() == "royal") mmType = "Royal"

        matches.ranking(mmType).then(ranks=>{
            if (ranks.error) return message.reply(ranks.error)
            else {
                var t = new Table()
                var i = 1
                ranks.ranks.forEach(top=>{
                    if (i>25) return
                    t.cell("Pos.", ordinal_suffix_of(i))
                    t.cell("Name", top.player.name)
                    t.cell("Club Tag", top.player.tag)
                    t.cell("Division", top.division.rank ? top.division.rank.name : "Error :(")

                    if (mmType == "3v3"){
                        t.cell("Points", top.score)
                        if (i > 1) t.cell("Diff.", `(${top.score - ranks.ranks[0].score})`)
                    } else if (mmType == "Royal"){
                        t.cell("Wins", top.progression)
                        if (i > 1) t.cell("Diff.", `(${top.progression - ranks.ranks[0].progression})`)
                    }

                    t.newRow()
                    i++
                })
                message.channel.send(`${args.length < 1 ? `Tip: type \`${prefix}mmranking royal\` to get Royal mode ranking\n`:""}${ranks.note != "" ? "⚠ " + ranks.note : ""}\`\`\`${t.toString()}\`\`\``)
            }
        }).catch(err=>{
            console.error(err)
            message.reply('An error happened, this is reported')
            client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on mm ranking command: \`\`\`${err}\`\`\``)
        })
    }
}