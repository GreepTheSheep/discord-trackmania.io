const Client = require('trackmania.io/typings/client/Client'), // eslint-disable-line no-unused-vars
    Command = require('../../structures/Command'), // eslint-disable-line no-unused-vars
    {MessageEmbed, CommandInteraction, Message} = require('discord.js'); // eslint-disable-line no-unused-vars

/**
 * @type {string}
 */
exports.name = 'help';

/**
 * @type {string}
 */
exports.description = 'Shows the list of commands and their description';

/**
 * @type {Command.commandArgs[]}
 */
exports.args = [
    {
        name: 'category',
        description: 'The category of commands',
        type: 'string',
        required: false,
        choices: [
            {
                name: 'Utilities',
                value: 'utils'
            }
        ]
    }
];

/**
 * @param {CommandInteraction} interaction
 * @param {Client} tmio
 * @param {Command[]} commands 
 */
exports.execute = async (interaction, tmio, commands) => {

    let embed = embedCategories(commands),
        categoryTyped = interaction.options.getString('category');

    if (categoryTyped != null) embed = embedCommands(categoryTyped, commands);

    interaction.reply({embeds: [embed], ephemeral: true});
};

/**
 * @param {Message} message
 * @param {string[]} args
 * @param {Client} tmio
 * @param {Command[]} commands 
 */
exports.executeMessage = async (message, args, tmio, commands) => {
    let embed = embedCategories(commands),
        categoryTyped = args[0];

    if (categoryTyped != null) embed = embedCommands(categoryTyped, commands);

    message.reply({embeds: [embed]});
};

/**
 * Generates an embed of commands categories with the list of commands
 * @param {Commands[]} commands The list of commands
 * @returns {MessageEmbed} The embed to send
 */
function embedCategories(commands){
    const embed = new MessageEmbed();

    //split array into multiple arrays for categories
    const categories = [];
    let nullCommands = false;

    for (const command of commands) {
        if (command.category === null) {
            nullCommands = true;
            continue;
        }
        if (!categories.includes(command.category)) {
            categories.push(command.category);
        }
    }

    if (nullCommands) {
        categories.push('other');
    }

    categories.forEach(category => {
        embed.addField(category, `\`/help ${category}\``, true);
    });

    return embed;
}

/**
 * Generates an embed of commands in a category
 * @param {string} category The category of commands
 * @param {Command[]} commands The full list of commands
 */
function embedCommands(category, commands){
    const embed = new MessageEmbed();

    const commandsInCategory = commands.filter(command => command.category.toLowerCase() === category.toLowerCase());

    if (commandsInCategory.length === 0) embed.setTitle('No commands found');
    else {
        for (const command of commandsInCategory) {
            embed.addField(`\`/${command.name}\``, command.description, true);
        }
    }

    return embed;
}