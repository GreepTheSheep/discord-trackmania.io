// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js')
const Trackmania = require('trackmania.io')
const ms = require('pretty-ms')

module.exports = function(client, message, prefix){
    if (message.content.toLowerCase() == prefix + 'totd'){
        const totd = new Trackmania.TOTD()
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        totd.totd().then(totd=>{
            totd = totd[0]
            const embed = new Discord.MessageEmbed()
            embed.setColor('#00ff00')
            embed.setTitle(`Track Of The Day - ${new Date().getDate()} ${months[new Date().getMonth()]} ${new Date().getFullYear()}`)
            embed.addField('Name:', totd.map.name, true)
            embed.addField('Created by:', totd.map.authordisplayname, true)
            embed.addField('Medals:', `Author: ${ms(totd.map.authorScore, {colonNotation: true, secondsDecimalDigits: 3})}\nGold: ${ms(totd.map.goldScore, {colonNotation: true, secondsDecimalDigits: 3})}\nSilver: ${ms(totd.map.silverScore, {colonNotation: true, secondsDecimalDigits: 3})}\nBronze: ${ms(totd.map.bronzeScore, {colonNotation: true, secondsDecimalDigits: 3})}`, true)
            embed.addField('Uploaded:', `${ms(new Date(totd.map.timestamp) - new Date(), {compact: true, verbose: true})} ago`, true)
            embed.addField('Links:', `[Download](${totd.map.fileUrl}) | [Trackmania.io](https://trackmania.io/#/totd/leaderboard/${totd.map.mapId}/${totd.map.mapUid}) | [Trackmania.exchange](https://trackmania.exchange/tracks/view/${totd.map.exchangeid})`, true)
            embed.setImage(totd.map.thumbnailUrl)
            embed.setTimestamp()
            embed.setFooter(`Map ID: ${totd.map.mapId}`)
            message.channel.send(embed)
        })
    }
}