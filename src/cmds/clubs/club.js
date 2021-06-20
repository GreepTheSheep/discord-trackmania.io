const Discord = require('discord.js')
const Trackmania = require('trackmania.io')
const clubs = new Trackmania.Clubs({listener: false})

function buildEmbed(club){
    clubs.clubActivities(club.id).then(activities=>{
        club.activities = activities
    })
    clubs.clubMembers(club.id).then(members=>{
        var management = []
        members.members.forEach(member=>{
            if (member.role != "Member" || (member.role == "Member" && member.vip == true)){
                management.push(member)
            }
        })
        club.management = management
    })

    let embed = new Discord.MessageEmbed()
        embed.setTitle(club.name)
        .setDescription(club.description)
        .setThumbnail(club.logoUrl)
        .setImage(club.backgroundUrl)
        .addField('Created by:', club.creatordisplayname, true)
        .addField('Members', club.membercount, true)
        var arrayMembers = []
        club.management.forEach(member => {
            arrayMembers.push(`${member.name} (${member.role})${member.vip && member.role != 'Creator' ? ' [VIP]' : ''}`)
        });
        embed.addField('Management:', '- ' + arrayMembers.join('\n- '))
        var arrayActivities = []
        club.activities.forEach(activity => {
            if (activity.type == "room"){
                arrayActivities.push(`📚 [${!activity.public ? "🔒 ":""}${activity.password ? "🔑 ":""}${activity.name}](https://trackmania.io/#/rooms/${club.id}/${activity.activityid})`)
            } else if (activity.type == "campaign"){
                arrayActivities.push(`📜 [${!activity.public ? "🔒 ":""}${activity.password ? "🔑 ":""}${activity.name}](https://trackmania.io/#/campaigns/${club.id}/${activity.campaignid})`)
            } else if (activity.type == "news"){
                arrayActivities.push(`📰 [${!activity.public ? "🔒 ":""}${activity.password ? "🔑 ":""}${activity.name}](https://trackmania.io/#/clubs/${club.id}/news/${activity.activityid})`)
            } else if (activity.type == "skin-upload"){
                arrayActivities.push(`🎨 [${!activity.public ? "🔒 ":""}${activity.password ? "🔑 ":""}${activity.name}](https://trackmania.io/#/clubs/${club.id}/skins/${activity.activityid})`)
            } else {
                arrayActivities.push(`${!activity.public ? "🔒 ":""}${activity.password ? "🔑 ":""}${activity.name}`)
            }
        });
        embed.addField('Activities:', '- ' + arrayActivities.join('\n- '))
        embed.setFooter(`Club ID: ${club.id}`)
    
        return embed
}

module.exports = function (client, message, prefix){
    if (message.content.toLowerCase().startsWith(prefix + 'club')){
        let args = message.content.split(" ").slice(1)
        
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