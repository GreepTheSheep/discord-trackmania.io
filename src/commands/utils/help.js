const {Client} = require('trackmania.io'),
    Command = require('../../structures/Command'),
    {MessageEmbed, MessageButton, CommandInteraction, SelectMenuInteraction, ButtonInteraction, Message, MessageActionRow, MessageSelectMenu} = require('discord.js'),
    MySQL = require('mysql');

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
        required: false
    }
];

/**
 * @param {CommandInteraction} interaction
 * @param {Client} tmio
 * @param {Command[]} commands 
 */
exports.execute = async (interaction, tmio, commands) => {

    let embed, categoryTyped = interaction.options.getString('category');

    if (categoryTyped == null) {
        embed = embedCategories(commands);

        const categoriesSelectMenu = new MessageActionRow().addComponents(generateCategorySelectMenu(commands));

        interaction.reply({embeds: [embed], ephemeral: true, components: [categoriesSelectMenu]});

    } else {
        embed = embedCommands(categoryTyped, commands);

        interaction.reply({embeds: [embed], ephemeral: true});
    }
};

/**
 * @param {Message} message
 * @param {string[]} args
 * @param {Client} tmio
 * @param {Command[]} commands 
 */
exports.executeMessage = async (message, args, tmio, commands) => {

    let embed, categoryTyped = args[0];

    if (categoryTyped == null){
        embed = embedCategories(commands);

        const categoriesSelectMenu = new MessageActionRow().addComponents(generateCategorySelectMenu(commands));

        message.reply({embeds: [embed], components: [categoriesSelectMenu]});
    } else {
        embed = embedCommands(categoryTyped, commands);

        message.reply({embeds: [embed]});
    }
};

/**
 * @param {ButtonInteraction} interaction
 * @param {Client} tmio
 * @param {Command[]} commands 
 */
exports.executeButton = async (interaction, tmio, commands, sql) => {};

/**
 * @param {SelectMenuInteraction} interaction
 * @param {Client} tmio
 * @param {Command[]} commands 
 */
exports.executeSelectMenu = async (interaction, tmio, commands, sql) => {
    if (interaction.customId.substring(interaction.customId.indexOf('_')+1) == 'select-category') {
        let embed = embedCommands(interaction.values[0].toLowerCase(), commands);
        interaction.update({embeds: [embed]});
    }
};



// INTERNAL COMMAND METHODS

/**
 * Generate a MessageSelectMenu of categories of commands
 * @param {Command[]} commands The list of commands
 * @returns {MessageSelectMenu}
 */
function generateCategorySelectMenu(commands){
    const categories = commandsCategories(commands),
        selectOptions = [];

    categories.forEach(category => {
        selectOptions.push({
            label: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
            description: '',
            value: category.toLowerCase()
        });
    });

    return new MessageSelectMenu()
        .setCustomId('help_select-category')
        .setPlaceholder('Select a category')
        .addOptions(selectOptions);
}

/**
 * Generates an embed of commands categories with the list of commands
 * @param {Commands[]} commands The list of commands
 * @returns {MessageEmbed} The embed to send
 */
function embedCategories(commands){
    const embed = new MessageEmbed().setColor('RANDOM').setTitle('Trackmania.io'),
        categories = commandsCategories(commands);

    categories.forEach(category => {
        embed.addField(category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(), `\`/help ${category.toLowerCase()}\``, true);
    });

    return embed;
}

/**
 * Generates an embed of commands in a category
 * @param {string} category The category of commands
 * @param {Command[]} commands The full list of commands
 */
function embedCommands(category, commands){
    const embed = new MessageEmbed().setColor('RANDOM').setTitle(category.charAt(0).toUpperCase() + category.slice(1).toLowerCase());

    const commandsInCategory = commands.filter(command => command.category.toLowerCase() === category.toLowerCase());

    if (commandsInCategory.length === 0) embed.setColor("#FF0000").setTitle('No commands found');
    else {
        for (const command of commandsInCategory) {
            embed.addField(`\`/${command.name}\``, command.description, true);
        }
    }

    return embed;
}

/**
 * Generate an array of command categories
 * @param {Command[]} commands The list of commands
 * @returns {string[]} The list of categories
 */
function commandsCategories(commands){
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

    return categories;
}