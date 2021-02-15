// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js')

module.exports = function(client, message, prefix, config, sql){
    if (message.author.bot) return
    require('./help.js')(client, message, prefix)
    require('./totd/totd.js')(client, message, prefix, config, sql)

    require('./players/search.js')(client, message, prefix)
    require('./players/register.js')(client, message, prefix, config, sql)
}