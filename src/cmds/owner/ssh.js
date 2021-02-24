const { MessageAttachment } = require('discord.js');
const Discord = require('discord.js');
const shell = require('shelljs');
const fs = require('fs');

function clean(text) {
    if (typeof(text) === "string")
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
}

module.exports = function(client, message, prefix) {
    if (message.content.startsWith(prefix + 'ssh')) {
        try {
            let args = message.content.split(" ")
            args.shift()
            if (args.length < 1) return message.react('❌');
            message.channel.startTyping()
            shell.exec(args.join(' '), {silent:true}, function(code, stdout, stderr) {
                if (stdout.length > 1024 && stdout.length < 1950 || stderr.length > 1024 && stderr.length < 1950) return message.reply(`Output:\n\`\`\`${stdout}${stderr}\`\`\``).then(()=>message.channel.stopTyping(true));
                
                if (stdout.length > 1950 || stderr.length > 1950) return fs.writeFile('./logs/shelleval.log', `Command: ${args.join(' ')}\nExit code: ${code}\n\n\nOutput:\n\n${stdout}${stderr}`, 'utf8', (err) => {
                        if (err) return function(){
                            console.log(err);
                            message.reply(`FS error: ${err}`)
                        }
                        const attachment = new MessageAttachment('./logs/shelleval.log')
                        message.reply('Output is more than 2000 characters, see attachment', attachment)
                        .then(()=>message.channel.stopTyping(true))
                    })
                
                let embed = new Discord.MessageEmbed()
                    embed.addField("Command:", args.join(' '))
                    .addField('Program output:', `\`\`\`${stdout}${stderr}\`\`\``)
                    .setFooter('Exit code: ' + code)
            message.reply(embed)
            .then(()=>message.channel.stopTyping(true));
            });
        } catch (err) {
            const args = message.content.split(" ");
            args.shift();
            message.reply(`EVAL **__ERROR__**\n\`\`\`xl\n${args.join(" ")}\`\`\`\nNode Result: \`${clean(err)}\``);
            message.channel.stopTyping(true)
        }
    }
}
