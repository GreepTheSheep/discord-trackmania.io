// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js')

module.exports = function(client, message, prefix, config, sql){
    require('./help.js')(client, message, prefix)
    require('./totd/subscribe.js')(client, message, prefix, config, sql)
}