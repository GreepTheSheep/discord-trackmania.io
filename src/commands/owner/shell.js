const Command = require('../../structures/Command'),
    {MessageEmbed, CommandInteraction, SelectMenuInteraction, Message, MessageActionRow, MessageButton, MessageSelectMenu, MessageAttachment} = require('discord.js'),
    MySQL = require('mysql'),
    { exec } = require('child_process'),
    fs = require('fs');

/**
 * Set the command here, it's what we'll type in the message
 * @type {string}
 */
exports.name = 'owner-shell';


/**
 * Set the description here, this is what will show up when you need help for the command
 * @type {string}
 */
exports.description = 'Eval code but shell';


/**
 * Set the command arguments here, this is what will show up when you type the command
 * @type {Command.commandArgs[]}
 */
exports.args = [
    {
        name: 'code',
        description: 'The code to evaluate',
        type: 'string',
        required: true
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
    if (interaction.member.id !== process.env.OWNER_ID) return interaction.reply({
        content: '⛔ You are not the owner of this bot',
        ephemeral: true
    });
    await interaction.deferReply({ephemeral:true});
    let code = interaction.options.getString('code');

    exec(code, (err, stdout, stderr) => {
        let outCode = err ? err.code : 0,
            resStr = stdout + stderr;

        if (resStr.length > 1950) {
            if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');
            fs.writeFileSync('./logs/shell.txt', `Command: ${code}\nOutput code: ${outCode}\n\nOutput: ${resStr}`);
            interaction.editReply({
                content: 'Output too long, here is the output in a file',
                files: [new MessageAttachment('./logs/shell.txt')]
            });
        } else {
            interaction.editReply({
                content: 'Code: '+outCode+'```'+resStr+'```'
            });
        }
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