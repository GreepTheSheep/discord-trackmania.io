// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const Trackmania = require('trackmania.io');
const campaign = new Trackmania.Campaigns({listener: false})
const Table = require('easy-table')

async function campaignLeader(thisCampaign, client, message, prefix, args, config, sql, clubID, campaignID){
    if (thisCampaign.error) return message.reply('Invalid campaign or club ID, check the campaign\'s page at trackmania.io and copy paste the corresponding IDs.')
    else {
        args.splice(0,2)
        if (args.length < 1){
            campaign.leaderboard(thisCampaign).then(leader=>{
                var t = new Table()
                var i = 1
                leader.forEach(top=>{
                    t.cell("Pos.", i)
                    t.cell("Club Tag", top.player.tag)
                    t.cell("Name", top.player.name)
                    t.cell("Points", top.points)
                    if (i > 1) t.cell("Diff.", `(+${top.points - leader[0].points})`)
                    t.newRow()
                    i++
                })
                message.channel.send('Top 10 of ' + thisCampaign.name +` campaign:\`\`\`${t.toString()}\`\`\``)
            })
        } else if (args[0].toLowerCase() == 'sub'){
            if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply(`:warning: Only administrators on this server can do that.`)
            var channel = message.mentions.channels.first()
            if (!channel) return message.reply(`Usage \`${prefix}campaignleader ${clubID} ${campaignID} sub [channel mention]\``)

            thisCampaign.playlist.forEach(map=>{
                sql.query('INSERT INTO `map-wr_channels` (userId, guildId, channelId, mapUid) VALUES (?, ?, ?, ?)', [message.author.id, message.guild.id, channel.id, map.mapUid], (err) =>{
                    if (err){
                        if (err.code == 'ER_DUP_ENTRY'){
                            sql.query("UPDATE `map-wr_channels` SET channelId = ? WHERE guildId = ? AND `mapUid` = ?", [channel.id, message.guild.id, map.mapUid], (err)=>{
                                if (err){
                                    console.error(err)
                                    client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on campaing map WR sub event: \`\`\`${err}\`\`\``)
                                }
                            })
                        } else {
                            client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on campaign map WR sub event: \`\`\`${err}\`\`\``)
                        }
                    }
                })
            })
            message.channel.send(`Successfully added #${channel.name} to get all maps World Record updates on the campaign ${thisCampaign.name}.`)
        } else if (args[0].toLowerCase().startsWith('unsub')){
            if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply(`:warning: Only administrators on this server can do that.`)
            thisCampaign.playlist.forEach(map=>{
                sql.query('DELETE FROM `map-wr_channels` WHERE `guildId` = ? AND `mapUid` = ?', [message.guild.id, map.mapUid], (err) =>{
                    if (err){
                        console.error(err)
                        client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on map unsub event: \`\`\`${err}\`\`\``)
                    }
                })
            })
            message.channel.send(`Successfully deleted all maps World Record updates for ${thisCampaign.name} on this server.`)
        }
    }
}

module.exports = function(client, message, prefix, config, sql) {
    if (message.content.startsWith(prefix + 'campaignleaderboard') || message.content.startsWith(prefix + 'campaignleader')) {
        let args = message.content.split(" ")
        args.shift()
        if (args.length < 2) return message.reply('Usage: `'+prefix+'campaignleader [Club ID] [Campaign ID] (optional: sub/unsub)`. Use sub to get any map WR updates on the campaign, unsub to unsubscribe.')

        var clubID = Number(args[0])
        var campaignID = Number(args[1])

        if (isNaN(clubID) || isNaN(campaignID)) return message.reply('Club ID or Campaign ID is not numbers. Check your syntax and retry')

        if (clubID == 0) {
            campaign.officialCampaign(campaignID).then(async thisCampaign=>{
                await campaignLeader(thisCampaign, client, message, prefix, args, config, sql, clubID, campaignID)
            })
        } else {
            campaign.campaign(clubID, campaignID).then(async thisCampaign=>{
                await campaignLeader(thisCampaign, client, message, prefix, args, config, sql, clubID, campaignID)
            })
        }
    }
}
