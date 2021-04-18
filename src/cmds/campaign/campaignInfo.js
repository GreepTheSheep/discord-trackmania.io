const Discord = require('discord.js');
const Trackmania = require('trackmania.io')
const ms = require('pretty-ms')
const campaign = new Trackmania.Campaigns({listener: false})
const club = new Trackmania.Clubs({listener: false})
const Table = require('easy-table')

async function generateMessage(campaign, message, clubID){
    if (campaign.error) return message.reply('Invalid campaign or club ID, check the campaign\'s page at trackmania.io and copy paste the corresponding IDs.')
    else {
        var thisClub = {}
        if (clubID != 0) thisClub = await club.club(campaign.clubid)
        let embed = new Discord.MessageEmbed()
        embed.setColor('#9B850E')
        embed.setTitle(campaign.name)
        if (clubID != 0) embed.addField('Club:', thisClub.name, true)
        embed.addField('Created by:', clubID != 0 ? thisClub.creatordisplayname : 'Nadeo', true)
        embed.addField('Maps number:', `${campaign.playlist.length} maps`, true)
        embed.addField('Links:', `[Trackmania.io](https://trackmania.io/#/campaigns/${campaign.clubid}/${campaign.id})`)
        embed.setImage(campaign.media)
        embed.setFooter(`Leaderboard UID: ${campaign.leaderboarduid}\n\nClick on 🏎 to see the map list`)
        const campaignMsg = await message.channel.send(embed)

        campaignMsg.react('🏎')
        const filter = (reaction, user) => {
            return reaction.emoji.name == '🏎' && user.id === message.author.id;
        };

        campaignMsg.awaitReactions(filter, {max: 1, time: 1*60*60*1000}).then(collected=>{
            const reaction = collected.first();
            if (reaction.emoji.name == '🏎'){
                var t = new Table()
                var i = 1
                campaign.playlist.forEach(map=>{
                    t.cell("Nb.", i)
                    t.cell("Name", map.name)
                    t.cell("UID", map.mapUid)
                    t.cell("AT.", ms(map.authorScore, {colonNotation: true, secondsDecimalDigits: 3}))
                    t.newRow()
                    i++
                })
                campaignMsg.edit('Maps - ' + campaign.name +`\`\`\`${t.toString()}\`\`\``)
            }
        })
    }
}

module.exports = function(client, message, prefix) {
    if (message.content.startsWith(prefix + 'campaign ') && !message.content.startsWith(prefix+'campaignleader')) {
        let args = message.content.split(" ")
        args.shift()
        if (args.length < 1) return message.reply('Usage: `'+prefix+'campaign [Club ID] [campaign ID]`')
        if (args.length < 2) return message.reply('Usage: `'+prefix+'campaign [Club ID] [campaign ID]`. We need a club ID because of Trackmania.io API')

        var clubID = Number(args[0])
        var campaignID = Number(args[1])

        if (isNaN(clubID) || isNaN(campaignID)) return message.reply('Club ID or Campaign ID is not numbers. Check your syntax and retry')

        if (clubID == 0) {
            campaign.officialCampaign(campaignID).then(async thisCampaign=>{
                await generateMessage(thisCampaign, message, clubID)
            })
        } else {
            campaign.campaign(clubID, campaignID).then(async thisCampaign=>{
                await generateMessage(thisCampaign, message, clubID)
            })
        }
    }
}
