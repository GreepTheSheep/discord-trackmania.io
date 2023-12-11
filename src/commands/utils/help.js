const Command = require('../../structures/Command'),
    {EmbedBuilder, ButtonBuilder, CommandInteraction, SelectMenuInteraction, ButtonInteraction, Message, ActionRowBuilder, StringSelectMenuBuilder} = require('discord.js'),
    MySQL = require('mysql'),
    categoryInfos = require('../categoryInfo.json');

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
        choices: categoryInfos.map(c=>{
            if (c.dir === "owner") return null;
            return {
                name: c.name,
                value: c.dir
            };
        })
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

        const categoriesSelectMenu = new ActionRowBuilder().addComponents(generateCategorySelectMenu(interaction, commands));

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
 * @param {string} buttonId
 * @param {string} argument
 * @param {import('trackmania.io').Client} tmio
 * @param {Command[]} commands
 * @param {MySQL.Connection} sql
 */
exports.executeButton = async (interaction, buttonId, argument, tmio, commands, sql) => {};

/**
 * @param {SelectMenuInteraction} interaction
 * @param {string} categoryId
 * @param {string} argument
 * @param {import('trackmania.io').Client} tmio
 * @param {Command[]} commands
 * @param {MySQL.Connection} sql
 */
exports.executeSelectMenu = async (interaction, categoryId, argument, tmio, commands, sql) => {
    if (categoryId == 'select-category') {
        let embed = embedCommands(interaction.values[0].toLowerCase(), commands);
        interaction.update({embeds: [embed]});
    }
};


// INTERNAL COMMAND METHODS

/**
 * Generate a StringSelectMenuBuilder of categories of commands
 * @param {CommandInteraction} interaction
 * @param {Command[]} commands The list of commands
 * @returns {StringSelectMenuBuilder}
 */
function generateCategorySelectMenu(interaction, commands){
    const categories = commandsCategories(commands),
        selectOptions = [];

    let hasUncategorized = false;

    categories.forEach(category => {
        if (category) {
            if (category.dir === "owner" && interaction.member.id !== process.env.OWNER_ID) return;

            selectOptions.push({
                label: category.name,
                description: category.description ? category.description : "",
                value: category.dir ? category.dir : category.name.toLowerCase(),
                emoji: category.emoji ? category.emoji : ""
            });
        }
        else hasUncategorized = true;
    });

    if (hasUncategorized) selectOptions.push({
        label: "Uncategorized",
        value: "uncategorized",
        emoji: "❔"
    });

    return new StringSelectMenuBuilder()
        .setCustomId('help_select-category')
        .setPlaceholder('Select a category')
        .addOptions(selectOptions);
}

/**
 * Generates an embed of commands categories with the list of commands
 * @param {Commands[]} commands The list of commands
 * @returns {EmbedBuilder} The embed to send
 */
function embedCategories(commands){
    const embed = new EmbedBuilder().setColor('Random').setTitle('Trackmania.io'),
        categories = commandsCategories(commands);

    categories.forEach(category => {
        if (category) embed.addFields({name:(category.emoji ? category.emoji+" " : "") + category.name, value:`${category.description}\n\`/help ${category.dir}\``, inline:true});
    });

    return embed;
}

/**
 * Generates an embed of commands in a category
 * @param {string} categoryDir The category dirctory name of commands
 * @param {Command[]} commands The full list of commands
 */
function embedCommands(categoryDir, commands){
    if (categoryDir == 'uncategorized') {
        const commandsInCategory = commands.filter(c => c.category == undefined),
            embed = new EmbedBuilder().setColor('Random').setTitle('Uncategorized commands');

        if (commandsInCategory.length === 0) embed.setColor("#FF0000").setTitle('No commands found');
        else {
            for (const command of commandsInCategory) {
                embed.addFields({name:`\`/${command.name}\``, value:command.description, inline:true});
            }
        }

        return embed;
    } else {
        const category = commands.filter(c=>c.category != undefined).find(c=>c.category.dir.toLowerCase() === categoryDir.toLowerCase()).category,
            commandsInCategory = commands.filter(command => command.category === category),
            embed = new EmbedBuilder().setColor('Random').setTitle((category.emoji ? category.emoji + " ": "") + category.name);

        if (commandsInCategory.length === 0) embed.setColor("#FF0000").setTitle('No commands found');
        else {
            let fields = [];
            for (const command of commandsInCategory) {
                fields.push({name:`\`/${command.name}\``, value:command.description, inline:true});
            }
            embed.addFields(fields);
        }

        return embed;
    }
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