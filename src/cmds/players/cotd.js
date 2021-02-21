const Discord = require('discord.js')
const Trackmania = require('trackmania.io')

module.exports = function (client, message, prefix, config, sql){
    if (message.content.toLowerCase() == prefix + 'mycotd'){
        const players = new Trackmania.Players()
        sql.query("SELECT * FROM `players` WHERE discordId = ?", message.author.id, (err, res) =>{
            if (err){
                console.error(err)
                message.reply('There\'s an error while getting your profile, this was reported')
                client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on getting player on database: \`\`\`${err}\`\`\``)
            } else {
                if (res.length < 1) return message.reply('You are not registered, if you want to get your stats you can register with `'+prefix+'register`')
                players.player(res[0].accountId).then(player=>{
                    players.COTDResults(res[0].accountId).then(cotdRes=>{
                        var cotd = cotdRes[0]
                        let embed = new Discord.MessageEmbed()
                        embed.setTitle('Cup of the day of '+ cotd.date+', results of ' + player.displayname)
                        embed.setDescription(`${player.displayname} was on match ${cotd.server}.`)
                        embed.addField('Rank:', `Server: ${cotd.serverRank}\n\nGlobal: ${cotd.globalRank}/${cotd.totalPlayer}`)
                        message.channel.send(embed)
                    })
                })
            }
        })
    }
}