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
        description: "Your Ubisoft Connect account name.",
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

    await interaction.deferReply({
        ephemeral: true
    });

    if (!typedPlayer) {
        typedPlayer = await new Promise(async (resolve, reject) => {
            sql.query("SELECT * FROM `players` WHERE `discordId` = ?", [interaction.user.id], async (err, result) => {
                if (err) {
                    console.error(err);
                    return reject("An error occured while querying the database.");
                }
                if (result.length < 1) {
                    return reject("You are not registered. Please use `/register` to register yourself.");
                }
                return resolve(result[0].accountId);
            });
        }).catch(err=>{
            return interaction.editReply({
                content: err
            });
        });
    }

    try {
        const players = await tmio.players.search(typedPlayer);

        if (players.length < 1) {
            return interaction.editReply({
                content: "No player found with that name.",
            });
        }

        const player = await players[0].player(),
            embed = renderPlayerInfoEmbed(tmio, player),
            interactionComponentRows = [new MessageActionRow()];

        interactionComponentRows[0].addComponents(
            new MessageButton()
                .setCustomId(this.name+'_'+'cotd_'+typedPlayer)
                .setLabel('COTD stats')
                .setStyle('PRIMARY')
            );
        interactionComponentRows[0].addComponents(
            new MessageButton()
                .setURL(player.meta.displayURL)
                .setLabel('View on Trackmania.io')
                .setStyle('LINK')
            );

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
 * This method is executed when an a button is clicked in the message
 * @param {ButtonInteraction} interaction
 * @param {string} buttonId
 * @param {string} argument
 * @param {import('trackmania.io').Client} tmio
 * @param {Command[]} commands
 * @param {MySQL.Connection} sql
 */
exports.executeButton = async (interaction, buttonId, argument, tmio, commands, sql) => {
    if (buttonId == 'cotd') {
        await interaction.deferReply({
            ephemeral: true
        });
        try {
            const player = await tmio.players.get(argument);
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
 * @param {string} categoryId
 * @param {string} argument
 * @param {import('trackmania.io').Client} tmio
 * @param {Command[]} commands
 * @param {MySQL.Connection} sql
 */
exports.executeSelectMenu = async (interaction, categoryId, argument, tmio, commands, sql) => {};

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
        if (player.trophies.trophies[i] != 0){
            trophiesStr += `\n${i+1}: ${player.trophies.trophies[i]}`
            trophiesTotal += player.trophies.trophies[i];
        }
    }

    const embedColor = ["#1aa468", "#6b3511", "#c77e49", "#e89b6b", "#454545", "#6b6d6b", "#bebbbe", "#8a6100", "#d19500", "#ffd802"][player.trophies.echelon.number];

    embed = new MessageEmbed()
        .setTitle((player.clubTag ? `[${tmio.formatTMText(player.clubTag)}] `:"") + player.name)
        .setColor(embedColor)
        .setThumbnail(player.trophies.echelon.image)
        .addField("Zone", player.zone.map(p=>p.name).join(', '))
        .addField("Trophies Ranking", `${player.trophies.points} points (${player.trophies.echelon.name})\n__Number of trophies:__${trophiesStr}\nTotal: ${trophiesTotal}`, true)
        .addField("Top", player.zone.map(z=>`Top ${z.ranking} ${z.name}`).join('\n'), true)
        .addField("Player login:", `\`${player.login}\``)
        .addField("Matchmaking 3v3:", `Score: **${player.matchmaking(2).progression}**/${player.matchmaking(2).division.maxPoints} pts (${player.matchmaking(2).division.name})\nRank: ${player.matchmaking(2).rank}/${player.matchmaking(2).totalPlayers}`, true)
        .addField("Royal:", `**${player.matchmaking(3).progression}**/${player.matchmaking(3).division.maxPoints} wins (${player.matchmaking(3).division.name})\nRank: ${player.matchmaking(3).rank}/${player.matchmaking(3).totalPlayers}`, true)
        .setFooter({text:player.id});

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
    }).catch(err=>{
        throw err
    });
}