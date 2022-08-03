const Command = require('../../structures/Command'),
    {MessageEmbed, CommandInteraction, SelectMenuInteraction, Message, MessageActionRow, MessageButton} = require('discord.js'),
    MySQL = require('mysql'),
    { execSync } = require('child_process');

/**
 * Set the command here, it's what we'll type in the message
 * @type {string}
 */
exports.name = 'about';


/**
 * Set the description here, this is what will show up when you need help for the command
 * @type {string}
 */
exports.description = 'Bot informations';


/**
 * Set the command arguments here, this is what will show up when you type the command
 * @type {Command.commandArgs[]}
 */
exports.args = [];

/**
 * Set the usage here, this is what will show up when you type the command
 * This part is executed as slash command
 * @param {CommandInteraction} interaction
 * @param {import('trackmania.io').Client} tmio
 * @param {Command[]} commands
 * @param {MySQL.Connection} sql
 */
exports.execute = async (interaction, tmio, commands, sql) => {

    let package = require('../../../package.json'),
        version = package.version,
        tmioVersion = package.dependencies['trackmania.io'].replace('^', ''),
        tmEssentialsVersion = package.dependencies['tm-essentials'].replace('^', ''),
        djsVersion = package.dependencies['discord.js'].replace('^', ''),
        gitCommit = execSync('git rev-parse --short HEAD').toString().trim(),
        gitCommitDate = new Date(execSync('git show -s --format=%ci HEAD').toString().trim()),
        totalGuilds = interaction.client.shard ? (
            await interaction.client.shard.fetchClientValues('guilds.cache.size')
                .then(res=>{
                    return res.reduce((acc, guildCount) => acc + guildCount, 0);
                })
        ) : interaction.client.guilds.cache.size;

    let uptimeTotalSeconds = (interaction.client.uptime) / 1000,
        uptimeWeeks = Math.floor(uptimeTotalSeconds / 604800),
        uptimeDays = Math.floor(uptimeTotalSeconds / 86400),
        uptimeHours = Math.floor(uptimeTotalSeconds / 3600);
    uptimeTotalSeconds %= 3600;
    let uptimeminutes = Math.floor(uptimeTotalSeconds / 60);

    const embed = new MessageEmbed()
        .setColor("#9C01C4")
        .setTitle('About ' + interaction.client.user.tag)
        .addField('Version', `v${version}\nGit commit: \`${gitCommit}\`\nBuilt at: <t:${gitCommitDate.getTime() / 1000}>`, true)
        .addField('Uptime:', `${uptimeWeeks} weeks, ${uptimeDays} days, ${uptimeHours} hours, ${uptimeminutes} minutes`, true)
        .addField('Technical informations', `Bot Library: [Discord.js](https://discord.js.org) (Version ${djsVersion})\n[Trackmania.io Library](https://github.com/GreepTheSheep/node-trackmania.io) (Version ${tmioVersion})\n[Trackmania Essentials Library](https://github.com/GreepTheSheep/node-tm-essentials) (Version ${tmEssentialsVersion})\nNode.js version: ${process.version}\nServing to ${totalGuilds} guilds\n${interaction.client.shard ? `Shard #${interaction.client.shard.ids[0]} (${interaction.client.guilds.cache.size} guilds on this shard). Total shards: ${interaction.client.shard.count}` : 'No shards used.'}`)
        .addField('Thanks to:', `- [Greep#3022](https://github.com/GreepTheSheep) for creating the bot and the API library.\n- [Miss#8888](https://github.com/codecat) for creating Trackmania.io and for helping with the API.\n- [dassschaf](https://github.com/dassschaf) for the text formatting.\n- [jonese1234](https://github.com/jonese1234) for the player dataset`)
        .setThumbnail(interaction.client.user.displayAvatarURL({size:512}))
        .setFooter({
            text: interaction.client.user.tag + ' - click on my avatar to invite me!',
            iconURL: interaction.client.user.displayAvatarURL({size:128})
        });

    const interactionComponentRows = [];
    interactionComponentRows.push(new MessageActionRow());
    interactionComponentRows[0].addComponents(
        new MessageButton()
            .setURL(`https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=397888841808&scope=bot%20applications.commands`)
            .setLabel('Invite the bot to your server!')
            .setStyle('LINK')
    );
    interactionComponentRows[0].addComponents(
        new MessageButton()
            .setURL('https://github.com/GreepTheSheep/discord-trackmania.io')
            .setLabel('See the repository')
            .setStyle('LINK')
    );

    interaction.reply({
        embeds: [embed],
        components: interactionComponentRows,
        ephemeral: true
    });
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
    if (buttonId == 'button-primary') {
        interaction.update('Button primary!');
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
exports.executeSelectMenu = async (interaction, categoryId, argument, tmio, commands, sql) => {
    if (categoryId === 'questions') {
        interaction.update('hey! ' + interaction.values[0]);
    }
};