const Discord = require('discord.js')
const Trackmania = require('trackmania.io')

function buildEmbed(club){
    let embed = new Discord.MessageEmbed()
    embed.setTitle(club.name)
    .setDescription(club.description)
    .setThumbnail(club.logoUrl)
    .setImage(club.backgroundUrl)
    .addField('Created by:', club.creatordisplayname, true)
    .addField('Members', club.membercount, true)
    embed.setFooter(`Club ID: ${club.id}`)

    return embed
}

module.exports = function (client, message, prefix){
    if (message.content.toLowerCase().startsWith(prefix + 'club')){
        let args = message.content.split(" ").slice(1)
        const clubs = new Trackmania.Clubs({listener: false})
        if (args.length < 1) return message.reply(`Usage \`${prefix}club [Club name or Club ID]\``)

        clubs.club(args.join(' ')).then(club=>{
            message.channel.send(buildEmbed(club))
        })
        .catch(err=>{
            console.log(err)
            clubs.searchClubs(args.join(' ')).then(club=>{
                clubs.club(club[0].id).then(club=>{
                    message.channel.send(buildEmbed(club))
                })
                .catch(err=>{
                    console.error(err)
                    message.reply('Club not found, use `' + prefix + 'searchclub` if you want to find a specific club')
                })
            })
            .catch(err=>{
                console.error(err)
                message.reply('Club not found, use `' + prefix + 'searchclub` if you want to find a specific club')
            })
        })
    }
}