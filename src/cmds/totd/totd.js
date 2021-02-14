// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js')
const Trackmania = require('trackmania.io')
const ms = require('pretty-ms')

module.exports = function(client, message, prefix, config, sql){
    if (message.content.toLowerCase() == prefix + 'totd'){
        const totd = new Trackmania.TOTD()
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        totd.totd().then(totd=>{
            totd.reverse()
            totd = totd[0]

            const embed = new Discord.MessageEmbed()
            embed.setColor('#00ff00')
            embed.setTitle(`Track Of The Day - ${new Date().getDate()} ${months[new Date().getMonth()]} ${new Date().getFullYear()}`)
            embed.addField('Name:', totd.map.name, true)
            embed.addField('Created by:', totd.map.authordisplayname, true)
            embed.addField('Medals:', `Author: ${ms(totd.map.authorScore, {colonNotation: true, secondsDecimalDigits: 3})}\nGold: ${ms(totd.map.goldScore, {colonNotation: true, secondsDecimalDigits: 3})}\nSilver: ${ms(totd.map.silverScore, {colonNotation: true, secondsDecimalDigits: 3})}\nBronze: ${ms(totd.map.bronzeScore, {colonNotation: true, secondsDecimalDigits: 3})}`)
            embed.addField('Uploaded:', `${ms(new Date() - new Date(totd.map.timestamp), {compact: true, verbose: true})} ago`, true)
            embed.addField('Links:', `[Download](${totd.map.fileUrl}) | [Trackmania.io](https://trackmania.io/#/leaderboard/${totd.map.mapUd})${totd.map.exchangeid != 0 ? `| [Trackmania.exchange](https://trackmania.exchange/tracks/view/${totd.map.exchangeid})`:''}`)
            embed.setTimestamp()
            embed.setFooter(`Map ID: ${totd.map.mapUid}`)

            sql.query("SELECT * FROM `totd_thumbnail_cache` WHERE mapUid = ?", totd.map.mapUid, (err, res)=>{
                if (err){
                    client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on getting TOTD thumbnail on cache: \`\`\`${err}\`\`\``)
                    console.error(err)
                    message.channel.send(embed)
                } else {
                    embed.setImage(res[0].thumbnail)
                    message.channel.send(embed)
                }
            })
        })
    }
}