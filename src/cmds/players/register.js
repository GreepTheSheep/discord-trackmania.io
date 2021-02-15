// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js')
const Trackmania = require('trackmania.io')

module.exports = function (client, message, prefix, config, sql){
    if (message.content.toLowerCase().startsWith(prefix + 'register')){
        let args = message.content.split(" ").slice(1)
        if (args.length < 1) return message.reply(`Usage: \`${prefix}register [Uplay login]\``)
        const players = new Trackmania.Players()

        players.searchPlayer(args.join(' ')).then(player=>{
            if (player.length >= 1){
                sql.query("INSERT INTO `players` (accountId, discordId) VALUES (?, ?)", [player[0].accountid, message.author.id], (err) =>{
                    if (err){
                        client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on registering player on database: \`\`\`${err}\`\`\``)
                        console.error(err)
                        message.reply('Error while adding on your account, this was reported')
                    } else {
                        console.log('Successfully registered ' + player[0].displayname + ' on Discord User ID ' + message.author.id)
                        message.reply('Successfully registered ' + player[0].displayname + ' on your account!')
                    }
                })
            } else {
                message.reply('Player not found, please paste your Ubisoft Connect (Uplay) login, if it still fails, check yourself on https://trackmania.io/#/players')
            }
        })
    }
    if (message.content.toLowerCase() == prefix + 'unregister'){
        let args = message.content.split(" ").slice(1)
        if (args.length < 1) return message.reply(`Usage: \`${prefix}register [Uplay login]\``)
        sql.query("DELETE FROM `players` WHERE discordId = ?", message.author.id, (err, res) =>{
            if (err){
                client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on unregistering player on database: \`\`\`${err}\`\`\``)
                console.error(err)
                message.reply('Error while deleting on your account, this was reported')
            } else {
                if (res.affectedRows == 0) {
                    message.channel.send(`You have not registered on here, please run \`${prefix}register [Uplay login]\` to register yourself`)
                } else {
                    message.channel.send(`Successfully unregistered!`)
                }
            }
        })
    }
}