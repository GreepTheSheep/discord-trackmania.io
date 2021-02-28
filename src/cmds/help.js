const Discord = require('discord.js')

module.exports = function(client, message, prefix){
    if (message.content.toLowerCase().startsWith(prefix + ('help' || 'cmds'))){
        const embed = new Discord.MessageEmbed()
        embed.setTitle(`Help of ${client.user.username}`)
        .setColor('RANDOM')
        .setDescription(`
\`${prefix}totd\`: Gets the TOTD information of today
\`${prefix}(un)register\`: (Un)registers yourself to get your stats in one command
\`${prefix}searchplayer\`: Search a specific player
\`${prefix}stats\`: Gets the stats of a player
\`${prefix}searchclub\`: Search a specific club
\`${prefix}club\`: Gets the information of a club
\`${prefix}news-(un)sub\`: (Un)subscribe to get the latest Trackmania News
\`${prefix}mminfo\`: Get info on a Matchmaking match


\`${prefix}about\`: About the bot
\`${prefix}invite\`: Gets an invite link to your server
`)
        message.channel.send(embed)
    }
}