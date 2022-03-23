const Command = require('../../structures/Command'),
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
 * @param {import('trackmania.io').Client} tmio
 * @param {Command[]} commands
 * @param {MySQL.Connection} sql
 */
exports.execute = async (interaction, tmio, commands, sql) => {

    let embed, categoryTyped = interaction.options.getString('category');

    if (categoryTyped == null) {
        embed = embedCategories(commands);

        const categoriesSelectMenu = new MessageActionRow().addComponents(generateCategorySelectMenu(commands));

        interaction.reply({
            embeds: [embed],
            ephemeral: true,
            components: [categoriesSelectMenu]
        });

    } else {
        embed = embedCommands(categoryTyped, commands);

        interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};

/**
 * @param {ButtonInteraction} interaction
 * @param {import('trackmania.io').Client} tmio
 * @param {Command[]} commands 
 * @param {MySQL.Connection} sql
 */
exports.executeButton = async (interaction, tmio, commands, sql) => {};

/**
 * @param {SelectMenuInteraction} interaction
 * @param {import('trackmania.io').Client} tmio
 * @param {Command[]} commands 
 * @param {MySQL.Connection} sql
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
            label: category.name,
            description: category.description ? category.description : "",
            value: category.dir ? category.dir : category.name.toLowerCase(),
            emoji: category.emoji ? category.emoji : ""
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
        embed.addField((category.emoji ? category.emoji+" " : "") + category.name, `${category.description}\n\`/help ${category.dir}\``, true);
    });

    return embed;
}

/**
 * Generates an embed of commands in a category
 * @param {string} categoryDir The category dirctory name of commands
 * @param {Command[]} commands The full list of commands
 */
function embedCommands(categoryDir, commands){
    const category = commands.find(c=>c.category.dir.toLowerCase() === categoryDir.toLowerCase()).category,
        commandsInCategory = commands.filter(command => command.category === category),
        embed = new MessageEmbed().setColor('RANDOM').setTitle((category.emoji ? category.emoji + " ": "") + category.name);

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
 * @returns {Command.categoryInfo[]} The list of categories
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
        categories.push({
            name: "Others"
        });
    }

    return categories;
}