// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const shell = require('shelljs');

module.exports = function(client, message, prefix) {
    if (message.content.startsWith(prefix + 'update')) {
        try {
            message.channel.startTyping()
            shell.exec('git pull && npm update && pm2 reload ecosystem.config.js', {silent:false}, function(code, stdout, stderr) {
                message.reply(`Output:\n\`\`\`${stdout}${stderr}\`\`\``).then(()=>message.channel.stopTyping(true));
            })
        } catch (err) {
            message.reply(`EVAL **__ERROR__**\n\`\`\`xl\n'update'\`\`\``);
            message.channel.stopTyping(true)
        }
    }
}