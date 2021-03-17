// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js')
const Trackmania = require('trackmania.io')

module.exports = function (client, message, prefix, config, sql){
    if (message.content.toLowerCase().startsWith(prefix + 'register')){
        let args = message.content.split(" ").slice(1)
        if (args.length < 1) return message.reply(`Usage: \`${prefix}register [Uplay login]\``)

        sql.query("SELECT * FROM `players` WHERE discordId = ?", message.author.id, (err, res) =>{
            if (err){
                client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on looking player on database: \`\`\`${err}\`\`\``)
                console.error(err)
                message.reply('Error while looking your account, this was reported')
            } else {
                if (res.length > 0) return message.reply('You have already registered an account on your Discord profile, please unregister before with `'+prefix+'unregister`')
            }
        })

        const players = new Trackmania.Players()

        players.player(args[0]).then(player=>{
            sql.query("INSERT INTO `players` (accountId, discordId) VALUES (?, ?)", [player.accountid, message.author.id], (err) =>{
                if (err){
                    console.error(err)
                    if (err.code == 'ER_DUP_ENTRY'){
                        sql.query("UPDATE `players` SET accountId = ? WHERE discordId = ?", [player.accountid, message.author.id], (err)=>{
                            if (err){
                                console.error(err)
                                client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on updating player on database: \`\`\`${err}\`\`\``)
                                message.reply('Error while adding on your account, this was reported')
                            } else {
                                console.log('Successfully updated ' + player.displayname + ' on Discord User ID ' + message.author.id)
                                message.reply('Successfully updated ' + player.displayname + ' on your account!')
                            }
                        })
                    } else {
                        client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on registering player on database: \`\`\`${err}\`\`\``)
                        message.reply('Error while adding on your account, this was reported')
                    }
                } else {
                    console.log('Successfully registered ' + player.displayname + ' on Discord User ID ' + message.author.id)
                    message.reply('Successfully registered ' + player.displayname + ' on your account!')
                }
            })
        })
        .catch(()=>{
            players.searchPlayer(args.join(' ')).then(player=>{
                if (player.length >= 1){
                    sql.query("INSERT INTO `players` (accountId, discordId) VALUES (?, ?)", [player[0].accountid, message.author.id], (err) =>{
                        if (err){
                            console.error(err)
                            if (err.code == 'ER_DUP_ENTRY'){
                                sql.query("UPDATE `players` SET accountId = ? WHERE discordId = ?", [player[0].accountid, message.author.id], (err)=>{
                                    if (err){
                                        console.error(err)
                                        client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on updating player on database: \`\`\`${err}\`\`\``)
                                        message.reply('Error while adding on your account, this was reported')
                                    } else {
                                        console.log('Successfully updated ' + player[0].displayname + ' on Discord User ID ' + message.author.id)
                                        message.reply('Successfully updated ' + player[0].displayname + ' on your account!')
                                    }
                                })
                            } else {
                                client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on registering player on database: \`\`\`${err}\`\`\``)
                                message.reply('Error while adding on your account, this was reported')
                            }
                        } else {
                            console.log('Successfully registered ' + player[0].displayname + ' on Discord User ID ' + message.author.id)
                            message.reply('Successfully registered ' + player[0].displayname + ' on your account!')
                        }
                    })
                } else {
                    message.reply('Player not found, please paste your Ubisoft Connect (Uplay) login, if it still fails, check yourself on https://trackmania.io/#/players')
                }
            }).catch(err=>{
                console.error(err)
                message.reply('Player not found, please paste your Ubisoft Connect (Uplay) login, if it still fails, check yourself on https://trackmania.io/#/players')
            })
        })
    }
    if (message.content.toLowerCase() == prefix + 'unregister'){
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