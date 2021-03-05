const Discord = require('discord.js')

module.exports = function(client, message, prefix){
    if (message.content.toLowerCase().startsWith(prefix + ('help' || 'cmds'))){
        let args = message.content.split(" ").slice(1)
        const embed = new Discord.MessageEmbed()
        embed.setTitle(`Help of ${client.user.username}${args.length >= 1 ? ` - ${args[0]}`:''}`)
        .setColor('RANDOM')
        if (args.length < 1){
            
            embed.addField('🏎 TOTD', 'Informations about the Track Of The Day\n`'+prefix+'help totd`', true)
            .addField('🎮 Players', 'Informations about players / the player\n`'+prefix+'help player`', true)
            .addField('🚩 Clubs', 'Informations about Clubs\n`'+prefix+'help club`', true)
            .addField('🏁 Matches', 'Informations about Official Matches\n`'+prefix+'help match`', true)
            .addField('📧 News', 'Informations about Official News\n`'+prefix+'help news`', true)
            .addField('🤖 Bot', 'Informations about the bot itself\n`'+prefix+'help bot`', true)
            return message.channel.send(embed)
        }
        if (args[0].toLowerCase() == 'totd'){
            embed.addField(prefix + `totd`, 'Gets the TOTD information of today', true)
            .addField(prefix + `totd sub`, 'Subscribe to get the new TOTDs', true)
            .addField(prefix + `totd unsub`, 'Unsubscribes to the TOTDs updates', true)
            .addField(prefix + `totd leaderboard`, 'Gets the leaderboard of the TOTD of today', true)
            .addField(prefix + `totd leaderboard sub`, 'Subscribe to get the World Record updates on your TOTD (checks every 10 minutes)', true)
            .addField(prefix + `totd leaderboard unsub`, 'Unsubscribes to the TOTD WR updates', true)
            .addField(prefix + `totd [3-char month] [day] [year]`, 'Gets the TOTD of a specific day.\n' + `Example: \`${prefix}totd dec 24 2020\` for December, 24 2020. \`${prefix}totd sep 9 2020\` for September, 9 2020 etc...`, true)
            message.channel.send(embed)
        } else if (args[0].toLowerCase() == 'player') {
            embed.addField(prefix + `searchplayer`, 'Search a specific player', true)
            .addField(prefix + `stats`, 'Gets the stats of a player', true)
            .addField(prefix + `register`, 'Registers yourself to get your stats easily', true)
            .addField(prefix + `unregister`, 'Unregisters your account from the bot', true)
            .addField(prefix + `mycotd`, 'Gets your results on your latest Cup of The Day', true)
            message.channel.send(embed)
        } else if (args[0].toLowerCase() == 'club') {
            embed.addField(prefix + `searchclub`, 'Search a specific club', true)
            .addField(prefix + `club`, 'Gets the informations of a club', true)
            message.channel.send(embed)
        } else if (args[0].toLowerCase() == 'match') {
            embed.addField(prefix + `mminfo`, 'Get info on a 3v3 Matchmaking match', true)
            message.channel.send(embed)
        } else if (args[0].toLowerCase() == 'news') {
            embed.addField(prefix + `news-sub`, 'Subscribes to get the latest Trackmania News', true)
            embed.addField(prefix + `news-unsub`, 'Unsubscribes your server', true)
            message.channel.send(embed)
        } else if (args[0].toLowerCase() == 'bot') {
            embed.addField(prefix + `about`, 'About the bot', true)
            embed.addField(prefix + `invite`, 'Gets an invite link to your server', true)
            message.channel.send(embed)
        } else message.channel.send('Category not found, type `'+prefix+'help` to get the categories')
    }
}