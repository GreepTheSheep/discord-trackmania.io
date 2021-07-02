const Discord = require('discord.js')
const Trackmania = require('trackmania.io')
const ms = require('pretty-ms')

function constructZoneArray(array, obj){
    Object.entries(obj).forEach(entry => {
        const [key, value] = entry;
        if (key == 'name'){
            array.push(value)
        }
        if (key == 'parent' && value != null) constructZoneArray(array, value)
    });
    return array
}

function buildEmbedMessage(player){
    var trophies_str = []
    var totalTrophies = 0
    player.trophies.counts.forEach(tier=>{
        totalTrophies = totalTrophies + tier
        if (tier>0) trophies_str.push(`${trophies_str.length+1} : ${tier}`)
    })
    trophies_str.push(`Total : ${totalTrophies}`)

    var zone_str = []
    zone_str = constructZoneArray(zone_str, player.trophies.zone)

    var top_str = []
    for(var i = 0; i < zone_str.length; i++){
        top_str.push(`Top ${player.trophies.zonepositions[i]} ${zone_str[i]}`)
    }

    let embed = new Discord.MessageEmbed()
    .setThumbnail(player.trophies.echelon.img)
    .setTitle('Statictics of '+ (player.clubtag && player.clubtag != "" ? `[${player.clubtag}] ` : "") + player.displayname)
    .setDescription(player.displayname + ' has started playing Trackmania on '+ new Date(player.timestamp).getFullYear()+'-'+(new Date(player.timestamp).getMonth()+1)+'-'+new Date(player.timestamp).getDate() +' (' + ms(new Date() - new Date(player.timestamp), {compact: true, verbose: true}) + ' ago).\nThis player was last seen ' + ms(new Date() - new Date(player.trophies.timestamp), {compact: true, verbose: true}) + ' ago.\nTheir Trackmania.io URL is ' + player.url)
    .addField('Zone:', zone_str.join(', '))
    .addField('Ranking:', `${player.trophies.points} points (${player.trophies.echelon.name})\n__Number of trophies__:\n${trophies_str.join('\n')}`, true)
    .addField('Top:', top_str.join('\n'), true)
    if (player.clubtag && player.clubtag != "") embed.addField('Club Tag:', `[${player.clubtag}]\n*(Last changed ${ms(new Date() - new Date(player.clubtagtimestamp), {compact: true, verbose: true})} ago)*`)
    if (player.matchmaking.some(m=>m.info.typename == '3v3')) embed.addField('Matchmaking:', `**__Teams 3v3:__**\nScore: ${player.matchmaking.find(m=>m.info.typename == '3v3').info.score}/${player.matchmaking.find(m=>m.info.typename == '3v3').info.rank.endPts} (${player.matchmaking.find(m=>m.info.typename == '3v3').info.rank.name})\nRank: ${player.matchmaking.find(m=>m.info.typename == '3v3').info.place}/${player.matchmaking.find(m=>m.info.typename == '3v3').total}`, player.clubtag && player.clubtag != "")
    if (player.matchmaking.some(m=>m.info.typename == 'Royal')) embed.addField('Royal:', `Wins: ${player.matchmaking.find(m=>m.info.typename == 'Royal').info.progression}/${player.matchmaking.find(m=>m.info.typename == 'Royal').info.rank.endPts} (${player.matchmaking.find(m=>m.info.typename == 'Royal').info.rank.name})\nScore: ${player.matchmaking.find(m=>m.info.typename == 'Royal').info.score} pts\nRank: ${player.matchmaking.find(m=>m.info.typename == 'Royal').info.place}/${player.matchmaking.find(m=>m.info.typename == 'Royal').total}`, true)
    if (player.meta && (player.meta.nadeo || player.meta.tmgl || player.meta.tmwc21 || player.meta.team || player.meta.sponsor || player.accountid == "26d9a7de-4067-4926-9d93-2fe62cd869fc")) embed.addField('Part of', `${player.meta.nadeo ? '- Nadeo Team\n' : ''}${player.meta.tmgl ? '- Trackmania Grand League\n' : ''}${player.meta.tmwc21 ? '- Trackmania Grand League World Cup 2021\n' : ''}${player.meta.team ? '- Openplanet Team\n' : ''}${player.accountid == "26d9a7de-4067-4926-9d93-2fe62cd869fc" ? '- Trackmania.io Discord bot developer\n' : ''}${player.meta.sponsor ? '- Trackmania.io / Openplanet Sponsor\n' : ''}`)
    if (player.meta && (player.meta.twitch || player.meta.youtube || player.meta.twitter)) embed.addField('Links:', `${player.meta.twitch ? `- [Twitch](${player.meta.twitch})\n`:""}${player.meta.youtube ? `- [YouTube](${player.meta.youtube})\n`:""}${player.meta.twitter ? `- [Twitter](${player.meta.twitter})\n`:""}`, true)
    if (player.meta && (player.meta.comment && player.meta.comment != "")) embed.addField('Comment:', player.meta.comment)
    embed.setFooter(`Account id: ${player.accountid}`)

    // Embed color based on echelon
    var embedColors = [
        {
            "echelon": 0,
            "color": "#1BA56A"
        },
        {
            "echelon": 1,
            "color": "#6B3811"
        },
        {
            "echelon": 2,
            "color": "#A65B22"
        },
        {
            "echelon": 3,
            "color": "#F6AB74"
        },
        {
            "echelon": 4,
            "color": "#403F40"
        },
        {
            "echelon": 5,
            "color": "#646664"
        },
        {
            "echelon": 6,
            "color": "#F7F3F7"
        },
        {
            "echelon": 7,
            "color": "#724600"
        },
        {
            "echelon": 8,
            "color": "#C58500"
        },
        {
            "echelon": 9,
            "color": "#F8D34D"
        }
    ]

    embedColors.forEach(r=>{
        if (r.echelon == player.trophies.echelon.echelon) embed.setColor(r.color)
    })

    return embed;
}

module.exports = function (client, message, prefix, config, sql){
    if (message.content.toLowerCase().startsWith(prefix + 'stats')){
        let args = message.content.split(" ").slice(1)
        const players = new Trackmania.Players()
        if (args.length < 1) {
            sql.query("SELECT * FROM `players` WHERE discordId = ?", message.author.id, (err, res) =>{
                if (err){
                    console.error(err)
                    message.reply('There\'s an error while getting your profile, this was reported')
                    client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on getting player on database: \`\`\`${err}\`\`\``)
                } else {
                    if (res.length < 1) return message.reply('Usage: `'+prefix+'stats [Uplay login]`, if you want to get your stats you can register with `'+prefix+'register`')
                    players.player(res[0].accountId).then(player=>{
                        message.channel.send(buildEmbedMessage(player))
                    })
                }
            })
        } else {
            players.player(args[0]).then(player=>{
                message.channel.send(buildEmbedMessage(player))
            })
            .catch(err=>{
                console.log(err)
                players.searchPlayer(args.join(' ')).then(player=>{
                    players.player(player[0].player.id).then(player=>{
                        message.channel.send(buildEmbedMessage(player))
                    })
                    .catch(err=>{
                        console.error(err)
                        message.reply('Player not found, use `' + prefix + 'searchplayer` if you want to find a specific user')
                    })
                })
                .catch(err=>{
                    console.error(err)
                    message.reply('Player not found, use `' + prefix + 'searchplayer` if you want to find a specific user')
                })
            })
        }
    }
}