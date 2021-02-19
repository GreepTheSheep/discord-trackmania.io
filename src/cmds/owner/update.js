// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const shell = require('shelljs');

module.exports = function(client, message, prefix) {
    if (message.content.startsWith(prefix + 'update')) {
        try {
            message.channel.startTyping()
            if (client.user.id == '569624646475972608') shell.exec('git pull && npm update && pm2 reload ecosystem.config.js', {silent:false}, function(code, stdout, stderr) {
                message.reply(`Output:\n\`\`\`${stdout}${stderr}\`\`\``).then(m=>message.channel.stopTyping(true));
            })
            else return message.reply('Not supported yet, please execute commands `git pull && npm update && pm2 reload ecosystem.config.js` with !ssh command')
        } catch (err) {
            message.reply(`EVAL **__ERROR__**\n\`\`\`xl\n'update'\`\`\``);
            message.channel.stopTyping(true)
        }
    }
}