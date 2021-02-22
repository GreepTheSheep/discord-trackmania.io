// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js')

module.exports = function(client, message, prefix, config, sql){
    if (message.author.bot) return

    if (message.author.id == config.owner_id){
        require('./owner/update')(client, message, prefix)
    }

    require('./help.js')(client, message, prefix)
    require('./about.js')(client, message, prefix)

    require('./totd/totd.js')(client, message, prefix, config, sql)

    require('./players/search.js')(client, message, prefix)
    require('./players/register.js')(client, message, prefix, config, sql)
    require('./players/stats.js')(client, message, prefix, config, sql)
    require('./players/cotd.js')(client, message, prefix, config, sql)

    require('./clubs/search.js')(client, message, prefix)
    require('./clubs/club.js')(client, message, prefix)

    require('./news/news-sub.js')(client, message, prefix, config, sql)
}