// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js')

module.exports = function (client, message, prefix, sql, config){
    if (message.content.toLowerCase() == prefix + 'fixguildprefix'){
        var guildsInSQL = []
        sql.query("SELECT * FROM prefix", (err,res)=>{
            if (err) message.reply('Error: ' + err)
            else {
                res.forEach(r => {
                    guildsInSQL.push(r.guildId)
                });

                var affectedGuilds = []
                var errorGuilds = []
                client.guilds.cache.forEach(guild=>{
                    if (!guildsInSQL.includes(guild.id)){
                        sql.query("INSERT INTO `prefix` (guildId, prefix) VALUES (?, ?)", [guild.id, config.prefix], (err)=>{
                            if (err){
                                message.reply('Error for guild `'+guild.id+'`: ' + err)
                                errorGuilds.push(guild.id)
                            }
                            else affectedGuilds.push(guild.id)
                        })
                    }
                })
                
                message.reply(`Done. ${affectedGuilds.length} affected guilds: \`\`\`${affectedGuilds.join('\n')}\`\`\`${errorGuilds.length} guilds with error`)
            }
        })
    }
}