const Discord = require('discord.js');
const Trackmania = require('trackmania.io')
const ms = require('pretty-ms')
const campaign = new Trackmania.Campaigns({listener: false})
const club = new Trackmania.Clubs({listener: false})
const Table = require('easy-table')

module.exports = function(client, message, prefix) {
    if (message.content.startsWith(prefix + 'campaign')) {
        let args = message.content.split(" ")
        args.shift()
        if (args.length < 1) return message.reply('Usage: `'+prefix+'campaign [Club ID] [campaign ID]`')
        if (args.length < 2) return message.reply('Usage: `'+prefix+'campaign [Club ID] [campaign ID]`. We need a club ID because of Trackmania.io API')

        var clubID = Number(args[0])
        var campaignID = Number(args[1])

        if (isNaN(clubID) || isNaN(campaignID)) return message.reply('Club ID or Campaign ID is not numbers. Check your syntax and retry')

        if (clubID == 0) return message.reply('Official campaigns are not actually supported. An update will come later, just be patient ;)')

        campaign.campaign(clubID, campaignID).then(async thisCampaign=>{
            if (thisCampaign.error) return message.reply('Invalid campaign or club ID, check the campaign\'s page at trackmania.io and copy paste the corresponding IDs.')
            else {
                var thisClub = await club.club(thisCampaign.clubid)
                let embed = new Discord.MessageEmbed()
                embed.setColor('#9B850E')
                embed.setTitle(thisCampaign.name)
                embed.addField('Created by:', thisClub.name, true)
                embed.addField('Uploaded:', `${ms(new Date() - new Date(thisCampaign.publishtime), {compact: true, verbose: true})} ago`, true)
                embed.addField('Maps number:', `${thisCampaign.playlist.length} maps`, true)
                embed.addField('Links:', `[Trackmania.io](https://trackmania.io/#/campaigns/${thisCampaign.clubid}/${thisCampaign.id})`)
                embed.setImage(thisCampaign.media)
                embed.setFooter(`Leaderboard UID: ${thisCampaign.leaderboarduid}\n\nClick on 🏎 to see the map list`)
                const campaignMsg = await message.channel.send(embed)

                campaignMsg.react('🏎')
                const filter = (reaction, user) => {
                    return reaction.emoji.name == '🏎' && user.id === message.author.id;
                };

                campaignMsg.awaitReactions(filter, {max: 1, time: Infinity}).then(collected=>{
                    const reaction = collected.first();
                    if (reaction.emoji.name == '🏎'){
                        var t = new Table()
                        var i = 1
                        thisCampaign.playlist.forEach(map=>{
                            t.cell("Nb.", i)
                            t.cell("Name", map.name)
                            t.cell("UID", map.mapUid)
                            t.cell("AT.", ms(map.authorScore, {colonNotation: true, secondsDecimalDigits: 3}))
                            t.newRow()
                            i++
                        })
                        campaignMsg.edit('Maps - ' + thisCampaign.name +`\`\`\`${t.toString()}\`\`\``)
                    }
                })
            }
        })
    }
}
