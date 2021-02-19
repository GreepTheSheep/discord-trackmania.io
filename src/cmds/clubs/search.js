const Discord = require('discord.js')
const Trackmania = require('trackmania.io')

module.exports = function (client, message, prefix){
    if (message.content.toLowerCase().startsWith(prefix + 'searchclub')){
        let args = message.content.split(" ").slice(1)
        if (args.length < 1) return message.reply(`Usage: \`${prefix}searchclub [club name]\``)
        const clubs = new Trackmania.Clubs({listener: false})

        clubs.searchClubs(args.join(' ')).then(clubs=>{
            var array = []
            clubs.forEach(club=>{
                array.push(`[${club.name}](https://trackmania.io/#/clubs/${club.id})`)
            })
            let embed = new Discord.MessageEmbed()
            embed.setTitle('Results for ' + args.join(' '))
            .setDescription(`- ${array.join('\n- ')}`)
            message.channel.send(embed)
        })
    }
}