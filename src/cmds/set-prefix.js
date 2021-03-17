// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js')

module.exports = function(client, message, prefix, sql, config){
    if (message.content.toLowerCase().startsWith(prefix + 'prefix')){
        if (message.member.hasPermission('ADMINISTRATOR')){
            let args = message.content.split(" ").slice(1)
            if (args.length < 1) return message.reply(`The prefix for this server is \`${prefix}\`, set a new one with \`${prefix}prefix [new prefix]\``)
            if (args.length > 1) return message.reply(`Your prefix does not contain spaces, because it can corrupt some commands`)
    
            if (args[0].length > 5) return message.reply(`Your prefix must have 5 characters maximum`)
    
            sql.query("UPDATE `prefix` SET `prefix` = ? WHERE `guildId` = ?", [args[0], message.guild.id], (err)=>{
                if (err) {
                    client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on prefix update on database: \`\`\`${err}\`\`\``)
                    console.error(err)
                    message.reply('Error while updating your prefix, this was reported')
                } else {
                    message.reply(`Your new prefix is set to \`${args[0]}\`!`)
                }
            })
        } else message.reply(`:warning: Only administrators on this server can do that.`)
    }
}