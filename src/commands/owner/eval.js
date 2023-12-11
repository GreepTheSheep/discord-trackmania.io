const Command = require('../../structures/Command'),
    {EmbedBuilder, CommandInteraction, SelectMenuInteraction, Message, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, MessageAttachment} = require('discord.js'),
    MySQL = require('mysql'),
    fs = require('fs');

/**
 * Set the command here, it's what we'll type in the message
 * @type {string}
 */
exports.name = 'owner-eval';


/**
 * Set the description here, this is what will show up when you need help for the command
 * @type {string}
 */
exports.description = 'Eval code';


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
    let code = interaction.options.getString('code'),
        evaled = eval(code);

    if (typeof evaled !== "string"){
        evaled = require("util").inspect(evaled);
    }

    if (clean(evaled).length > 1950) {
        if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');
        fs.writeFileSync('./logs/eval.txt', `Command: ${code}\n\nOutput: ${clean(evaled)}`);
        interaction.editReply({
            content: 'Output too long, here is the output in a file',
            files: [new MessageAttachment('./logs/eval.txt')]
        });
    } else {
        interaction.editReply({
            content: '```'+clean(evaled)+'```'
        });
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

/**
 * cleanup result
 * @param {string} text
 * @returns {string}
 */
function clean(text) {
    if (typeof(text) === "string")
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
}