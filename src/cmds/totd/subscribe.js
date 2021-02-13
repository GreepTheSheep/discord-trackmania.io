// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js')

module.exports = function(client, message, prefix, config, sql){
    if (message.member.hasPermission("MANAGE_MESSAGES")) {
        if (message.content.toLowerCase().startsWith(prefix + 'totd-sub')){

            let args = message.content.split(" ").shift()
            if (args.length < 1) return message.reply(`Usage \`${prefix}totd-sub [channel mention]\``)
            var channel = message.mentions.channels.first()
            if (!channel) return message.reply(`Usage \`${prefix}totd-sub [channel mention]\``)
            
            sql.query('INSERT INTO `totd_channels` (userId, guildId, channelId) VALUES (?, ?, ?)', [message.author.id, message.guild.id, channel.id], (err) =>{
                if (err){
                    console.error(err)
                    message.channel.send('Hmm... There\'s an unattended error while updating the database. This is reported')
                    client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on totd sub event: \`\`\`${err}\`\`\``)
                } else {
                    message.channel.send(`Successfully added #${channel.name} to get TOTD updates.\n*(note that the database is refreshed every 10 minutes so if you ran this command between 18h50 and 19h CET it will not work)*`)
                }
            })
        }
        if (message.content.toLowerCase().startsWith(prefix + 'totd-unsub')){
            sql.query('DELETE FROM `totd_channels` WHERE `guildId` = ?', message.guild.id, (err, res) =>{
                if (err){
                    console.error(err)
                    message.channel.send('Hmm... There\'s an unattended error while updating the database. This is reported')
                    client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on totd sub event: \`\`\`${err}\`\`\``)
                } else {
                    if (res.affectedRows == 0) {
                        message.channel.send(`You have not subscribed on this server to get TOTD updates, please run \`${prefix}totd-sub [channel mention]\` to get updates`)
                    } else {
                        message.channel.send(`Successfully deleted TOTD updates on this server.\n*(note that the database is refreshed every 10 minutes so if you ran this command between 18h50 and 19h CET it will not work)*`)
                    }
                }
            })
        }
    }
}