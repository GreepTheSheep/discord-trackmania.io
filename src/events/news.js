const Discord = require('discord.js')


module.exports = function(news, client, sql, config){
    sql.query("SELECT * FROM news_channels", (err, res)=>{
        if (err){
            client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on getting TOTD channels list: \`\`\`${err}\`\`\``)
            console.error(err)
        } else {
            if (res.length<1) return
            console.log('New TM News!', news.headline)
            var fetchedChannels = []
            res.forEach(r=>{
                fetchedChannels.push({
                    guild: r.guildId,
                    channel: r.channelId,
                    role: r.roleId
                })
            })

            let embed = new Discord.MessageEmbed()
            embed.setAuthor('Trackmania™ News')
            embed.setTitle(news.headline)
            embed.setDescription(news.body)
            embed.setImage(news.media)
            embed.setFooter('ID: ' + news.id)

            fetchedChannels.forEach(c=>{
                console.log('News Sending to guild', c.guild)
                client.channels.fetch(c.channel).then(c=>c.send(c.role != null ? `<@&${c.role}>` : '',embed))
            })
        }
    })
}