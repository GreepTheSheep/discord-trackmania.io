// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js')

module.exports = function(client, message, prefix, config, sql){
    if (message.content.toLowerCase().startsWith(prefix + 'news-sub')){
        var channel = message.mentions.channels.first()
        if (!channel) return message.reply(`Usage \`${prefix}news-sub [channel mention]\``)
        
        sql.query('INSERT INTO `news_channels` (userId, guildId, channelId) VALUES (?, ?, ?)', [message.author.id, message.guild.id, channel.id], (err) =>{
            if (err){
                console.error(err)
                message.channel.send('Hmm... There\'s an unattended error while updating the database. This is reported')
                client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on news sub event: \`\`\`${err}\`\`\``)
            } else {
                message.channel.send(`Successfully added #${channel.name} to get TM News updates.`)
            }
        })
    }
    if (message.content.toLowerCase() == prefix + 'news-unsub'){
        sql.query('DELETE FROM `news_channels` WHERE `guildId` = ?', message.guild.id, (err, res) =>{
            if (err){
                console.error(err)
                message.channel.send('Hmm... There\'s an unattended error while updating the database. This is reported')
                client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on totd sub event: \`\`\`${err}\`\`\``)
            } else {
                if (res.affectedRows == 0) {
                    message.channel.send(`You have not subscribed on this server to get News updates, please run \`${prefix}news-sub [channel mention]\` to get updates`)
                } else {
                    message.channel.send(`Successfully deleted News updates on this server.`)
                }
            }
        })
    }
}