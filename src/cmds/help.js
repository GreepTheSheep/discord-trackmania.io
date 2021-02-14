const Discord = require('discord.js')

module.exports = function(client, message, prefix){
    if (message.content.toLowerCase().startsWith(prefix + ('help' || 'cmds'))){
        const embed = new Discord.MessageEmbed()
        embed.setTitle(`Help of ${client.user.username}`)
        .setColor('RANDOM')
        .addField(prefix + `totd`, 'Gets the TOTD information of today', true)
        .addField(prefix + `totd-(un)sub`, 'Mods and Admins only: Subscribe or unsubscribe to get TOTD notifications on a channel', true)

        message.channel.send(embed)
    }
}