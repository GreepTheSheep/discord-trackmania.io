const Discord = require('discord.js')
const fs = require('fs')
const package = JSON.parse(fs.readFileSync('./package.json', "utf8"));
const shell = require('shelljs');
const os = require('os')

module.exports = function(client, message, prefix){
    if (message.content.toLowerCase() == prefix + 'about'){
        message.channel.send('Fetching versions, please wait...').then(m=>{
            var discordjsver = shell.exec('npm view discord.js version', {silent:true}).stdout.replace('\n','')
            if (!discordjsver) discordjsver = 'not found'
            var tmver = shell.exec('npm view trackmania.io version', {silent:true}).stdout.replace('\n','')
            if (!discordjsver) tmver = 'not found'
            var nodever = shell.exec('node -v', {silent:true}).stdout.replace('v','').replace('\n','')
            if (!nodever) nodever = 'not found'
            var sysuptime = shell.exec('uptime --pretty', {silent:true}).stdout.replace('up ','').replace('\n','')
            if (!nodever) sysuptime = 'not found'

            let totalSeconds = (client.uptime) / 1000;
            let weeks = Math.floor(totalSeconds / 604800)
            let days = Math.floor(totalSeconds / 86400);
            let hours = Math.floor(totalSeconds / 3600);
            totalSeconds %= 3600;
            let minutes = Math.floor(totalSeconds / 60);

            let aboutembed = new Discord.MessageEmbed()
            aboutembed.setColor("#9C01C4")
            .setTitle('About ' + client.user.tag)
            .addField('Version', package.version)
            .addField('Uptime:', `🤖: ${weeks} weeks, ${days} days, ${hours} hours, ${minutes} minutes\n💻: ${sysuptime}`)
            .addField('Technical informations', `Bot Library: [Discord.js](https://discord.js.org) (Version ${discordjsver})\nTrackmania.io Library: [Trackmania.io](https://github.com/GreepTheSheep/node-trackmania.io) (Version ${tmver})\nNode.js version: ${nodever}\nShard ${client.shard.ids[0]}. Total shards: ${client.shard.count}\nMemory used: ${Math.round(os.freemem() / 1024 / 1000)}/${Math.round(os.totalmem() / 1024 / 1000)} MB [${(((Math.round(os.totalmem() / 1024 / 1000)).toFixed(0) - Math.round(os.freemem() / 1024 / 1000)) * 100 / Math.round(os.totalmem() / 1024 / 1000)).toFixed(0)}%] (${client.user.username} : ${Math.round(process.memoryUsage().rss / 1024 / 1000)} MB [${(Math.round(process.memoryUsage().rss / 1024 / 1000) * 100 / Math.round(os.totalmem() / 1024 / 1000)).toFixed(0)}%])`)
            .addField('Links', `**__[Invite ${client.user.username}](https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=604367952)__**\n[Github repository](https://github.com/GreepTheSheep/discord-trackmania.io)`)
            .addField('Thanks to:', `- [Greep#3022](https://github.com/GreepTheSheep) for creating the bot and the API library.\n- [Miss#8888](https://github.com/codecat) for creating Trackmania.io and for helping with the API.\n- [dassschaf](https://github.com/dassschaf) for the text formatting.\n- [Flirno](https://github.com/Flirno) for the COTD results.\n- [jonese1234](https://github.com/jonese1234) for the player dataset`)
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter(client.user.username, client.user.displayAvatarURL())
            message.channel.send(aboutembed).then(m.delete())
        })
    }
    if (message.content.toLowerCase() == prefix + 'invite'){
        let embed = new Discord.MessageEmbed()
        embed.setColor("#9C01C4")
        .setDescription(`**__[Invite ${client.user.tag} to your server!](https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=604367952)__**`)
        message.channel.send(embed)
    }
}