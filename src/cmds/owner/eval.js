// eslint-disable-next-line no-unused-vars
const Discord = require("discord.js");
const fs = require('fs');
const { MessageAttachment } = require('discord.js');

 function clean(text) {
    if (typeof(text) === "string")
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
}

module.exports = function(client, message, prefix) {
    if (message.content.startsWith(prefix + "eval")) {
        try {
            const args = message.content.split(" ").slice(1);
            if (args.length < 1) return message.react('❌');
            const code = args.join(" ");
            let evaled = eval(code);

             if (typeof evaled !== "string"){
                evaled = require("util").inspect(evaled);
            }
            if (clean(evaled).length > 1024 && clean(evaled).length < 1950) return message.reply(`Output:\n\`\`\`${clean(evaled)}\`\`\``);
            
            if (clean(evaled).length > 1950) return fs.writeFile('./logs/eval.log', `Command: ${args.join(' ')}\nExit code: ${code}\n\n\nOutput:\n\n${clean(evaled)}`, 'utf8', (err) => {
                if (err) return function(){
                    console.log(err);
                    message.reply(`FS error: ${err}`)
                }
                const attachment = new MessageAttachment('./logs/eval.log')
                message.reply('Output is more than 2000 characters, see attachment', attachment)
            })
            
            message.reply(`EVAL:\n\`\`\`javascript\n${code}\`\`\`\nNode Result: \`${clean(evaled)}\``);
        } catch (err) {
            const args = message.content.split(" ").slice(1);
            const code = args.join(" ");
            message.reply(`EVAL **__ERROR__**\n\`\`\`javascript\n${code}\`\`\`\nNode Result: \`${clean(err)}\``);
        }
    }
}