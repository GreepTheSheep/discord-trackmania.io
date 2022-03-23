const Command = require('../../structures/Command'),
    {MessageEmbed, CommandInteraction, SelectMenuInteraction, Message} = require('discord.js'),
    MySQL = require('mysql');

/**
 * Set the command here, it's what we'll type in the message
 * @type {string}
 */
exports.name = 'register';


/**
 * Set the description here, this is what will show up when you need help for the command
 * @type {string}
 */
exports.description = 'Registers yourself to get your stats easily';


/**
 * Set the command arguments here, this is what will show up when you type the command
 * @type {Command.commandArgs[]}
 */
exports.args = [
    {
        name: 'player',
        description: "Your Ubisoft Connect account name.",
        type: 'string',
        required: true,
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

    if (!typedPlayer) return interaction.reply({
        content: "Please enter a player.",
        ephemeral: true
    });

    await interaction.deferReply({
        ephemeral: true
    });

    const players = await tmio.players.search(typedPlayer);

    if (players.length < 1) {
        return interaction.editReply({
            content: "No player found with that name.",
            ephemeral: true
        });
    }

    const player = await players[0].player()
        .catch(err=>{
            console.error(err);
            return interaction.editReply({
                content: "Player not found or invalid account ID."
            });
        });

    sql.query("INSERT INTO `players` (accountId, discordId) VALUES (?, ?) ON DUPLICATE KEY UPDATE accountId = ?", [player.login, interaction.user.id, player.login], (err, result) => {
        if (err) {
            console.error(err);
            return interaction.editReply({
                content: "An error occurred.",
            });
        }

        interaction.editReply({
            content: "✅ You have been registered.",
        });
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
exports.executeButton = async (interaction, buttonId, argument, tmio, commands, sql) => {};

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