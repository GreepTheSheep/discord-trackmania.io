const Command = require('../../structures/Command'),
    {MessageEmbed, MessageActionRow, MessageButton, ButtonInteraction, CommandInteraction, SelectMenuInteraction, Message} = require('discord.js'),
    MySQL = require('mysql');

/**
 * Set the command here, it's what we'll type in the message
 * @type {string}
 */
exports.name = 'player';


/**
 * Set the description here, this is what will show up when you need help for the command
 * @type {string}
 */
exports.description = 'Informations and stats about a player';


/**
 * Set the command arguments here, this is what will show up when you type the command
 * @type {Command.commandArgs[]}
 */
exports.args = [
    {
        name: 'player',
        description: "Player's account ID or its TM.io vanity name",
        type: 'string',
        required: false
    }
];

/**
 * Set the usage here, this is what will show up when you type the command
 * This part is executed as slash command
 * @param {CommandInteraction} interaction
 * @param {import('trackmania.io').Client} tmio
 * @param {Command[]} commands 
 * @param {MySQL.Connection} sql
 */
exports.execute = async (interaction, tmio, commands, sql) => {
    let typedPlayer = interaction.options.getString('player');

    if (!typedPlayer) return interaction.reply({content: "Please enter a player.", ephemeral: true});

    await interaction.deferReply();

    const interactionComponentRows = [new MessageActionRow()];

    // Add 2 button to the message in the first row
    interactionComponentRows[0].addComponents(
            new MessageButton()
                .setCustomId(this.name+'_'+'cotd_'+typedPlayer)
                .setLabel('COTD stats')
                .setStyle('PRIMARY')
        );
    try {
        const player = await tmio.players.get(typedPlayer),
            embed = renderPlayerInfoEmbed(tmio, player);

        interaction.editReply({
            embeds: [embed],
            components: interactionComponentRows
        });
    } catch(err) {
        interaction.editReply("This interaction failed");
        console.error(err)
    }
};

/**
 * This part is executed as a normal message command
 * @param {Message} message
 * @param {string[]} args
 * @param {import('trackmania.io').Client} tmio
 * @param {Command[]} commands 
 * @param {MySQL.Connection} sql
 */
exports.executeMessage = async (message, args, tmio, commands, sql) => {
    let typedPlayer = args[0];

    if (!typedPlayer) return message.reply("Please enter a player.");

    try {
        const player = await tmio.players.get(typedPlayer),
            embed = renderPlayerInfoEmbed(tmio, player);

        message.reply({
            embeds: [embed]
        });
    } catch(err) {
        interaction.reply("This interaction failed");
        console.error(err)
    }
};

/**
 * This method is executed when an a button is clicked in the message
 * @param {ButtonInteraction} interaction
 * @param {import('trackmania.io').Client} tmio
 * @param {Command[]} commands 
 * @param {MySQL.Connection} sql
 */
exports.executeButton = async (interaction, tmio, commands, sql) => {
    if (interaction.customId.substring(interaction.customId.indexOf('_')+1, interaction.customId.lastIndexOf('_')) == 'cotd') {
        const playerId = interaction.customId.substring(interaction.customId.lastIndexOf('_')+1);
        await interaction.deferReply({ephemeral: true})
        try {
            const player = await tmio.players.get(playerId);
            renderPlayerCOTDStats(tmio, player).then(embed=>{
                interaction.editReply({
                    embeds: [embed]
                });
            });
        } catch (err) {
            interaction.editReply("This interaction failed");
            console.error(err);
        }
    }
};

/**
 * This method is executed when an update is made in a selectMenu
 * @param {SelectMenuInteraction} interaction
 * @param {import('trackmania.io').Client} tmio
 * @param {Command[]} commands 
 * @param {MySQL.Connection} sql
 */
exports.executeSelectMenu = async (interaction, tmio, commands, sql) => {};

/**
 * Generates an Embed of the Player Info
 * @param {import('trackmania.io').Client} tmio
 * @param {import('trackmania.io/typings/structures/Player')} player
 * @returns {MessageEmbed}
 */
function renderPlayerInfoEmbed(tmio, player){
    let trophiesStr = "";
    let trophiesTotal = 0;
    for (var i = 0; i < player.trophies.trophies.length; i++){
        trophiesStr += `\n${i+1}: ${player.trophies.trophies[i]}`
        trophiesTotal += player.trophies.trophies[i];
    }

    embed = new MessageEmbed()
        .setTitle((player.clubTag ? `[${tmio.formatTMText(player.clubTag)}] `:"") + player.name)
        .setThumbnail(player.trophies.echelon.image)
        .addField("Zone", player.zone.map(p=>p.name).join(', '))
        .addField("Trophies Ranking", `${player.trophies.points} points (${player.trophies.echelon.name})\n__Number of trophies:__${trophiesStr}\nTotal: ${trophiesTotal}`, true)
        .addField("Top", player.zone.map(z=>`Top ${z.ranking} ${z.name}`).join('\n'), true)
        .addField("Player login:", `\`${player.login}\``)
        .addField("Matchmaking 3v3:", `Score: **${player.matchmaking(2).progression}**/${player.matchmaking(2).division.maxPoints} pts (${player.matchmaking(2).division.name})\nRank: ${player.matchmaking(2).rank}/${player.matchmaking(2).totalPlayers}`, true)
        .addField("Royal:", `**${player.matchmaking(3).progression}**/${player.matchmaking(3).division.maxPoints} wins (${player.matchmaking(3).division.name})\nRank: ${player.matchmaking(3).rank}/${player.matchmaking(3).totalPlayers}`, true)
        .setFooter(player.id);

    if (player.meta.inNadeo || player.meta.inTMGL || player.meta.inTMIOTeam || player.meta.inTMWC21 || player.meta.isSponsor || player.id == "26d9a7de-4067-4926-9d93-2fe62cd869fc")
        embed.addField("Part of:", `${player.meta.inNadeo ? '- Nadeo Team\n' : ''}${player.meta.inTMGL ? '- Trackmania Grand League\n' : ''}${player.meta.inTMWC21 ? '- Trackmania Grand League World Cup 2021\n' : ''}${player.meta.inTMIOTeam ? '- Openplanet Team\n' : ''}${player.id == "26d9a7de-4067-4926-9d93-2fe62cd869fc" ? '- Trackmania.io Discord bot developer\n' : ''}${player.meta.isSponsor ? '- Trackmania.io / Openplanet Sponsor\n' : ''}`)
    
    if (player.meta.twitch || player.meta.youtube || player.meta.twitter)
        embed.addField("Links:", (player.meta.twitch?`- [Twitch](${player.meta.twitch})\n`:"")+(player.meta.youtube?`- [Youtube](${player.meta.youtube})\n`:"")+(player.meta.twitter?`- [Twitter](${player.meta.twitter})`:""));

    return embed;
}

/**
 * Generates an Embed of the Player COTD Stats
 * @param {import('trackmania.io').Client} tmio
 * @param {import('trackmania.io/typings/structures/Player')} player
 * @returns {MessageEmbed}
 */
function renderPlayerCOTDStats(tmio, player){
    return player.cotd().then(cotd=>{
        return new MessageEmbed()
            .setTitle('Cup Of The Day stats of ' + player.name)
            .addField('Total played', ''+cotd.count, true)
            .addField('Total Wins', `${cotd.stats.totalWins != 0 ? `**In division 1**: ${cotd.stats.totalWins}\n`: ''}**In any division**: ${cotd.stats.totalDivWins}`, true)
            .addField('Win streak', `${cotd.stats.winStreak != 0 ? `**In division 1**: ${cotd.stats.winStreak}\n`: ''}**In any division**: ${cotd.stats.divWinStreak}`, true)
            .addField('Average Rank', `**Average Div Rank**: ${Math.round(cotd.stats.averageDivRank * 64)} ||*(the position, with a base of 64 players in a div.)*||\n**Overall**: ${(cotd.stats.averageRank * 100).toFixed(0)}% ||*('top percentage', lower is better)*||`)
            .addField('Average Division', ''+Math.round(cotd.stats.averageDiv), true)
            .addField('Primary COTD', `**Best rank** (position): ${cotd.stats.bestPrimary.rank} (<t:${cotd.stats.bestPrimary.rankDate.getTime() / 1000}:R>)\n**Best division**: ${cotd.stats.bestPrimary.division} (Rank: ${cotd.stats.bestPrimary.divRank}, <t:${cotd.stats.bestPrimary.divisionDate.getTime() / 1000}:R>)\n**Best Div Rank**: ${cotd.stats.bestPrimary.rankInDivision} (Division ${cotd.stats.bestPrimary.divisionOfRankInDivision}, <t:${cotd.stats.bestPrimary.rankDate.getTime() / 1000}:R>)`)
            .addField('Overall COTD', `**Best rank** (position): ${cotd.stats.bestOverall.rank} (<t:${cotd.stats.bestOverall.rankDate.getTime() / 1000}:R>)\n**Best division**: ${cotd.stats.bestOverall.division} (Rank: ${cotd.stats.bestOverall.divRank}, <t:${cotd.stats.bestOverall.divisionDate.getTime() / 1000}:R>)\n**Best Div Rank**: ${cotd.stats.bestOverall.rankInDivision} (Division ${cotd.stats.bestOverall.divisionOfRankInDivision}, <t:${cotd.stats.bestOverall.rankDate.getTime() / 1000}:R>)`)
    });
}