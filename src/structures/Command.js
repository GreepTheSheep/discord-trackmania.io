/** @type {categoryInfo[]} */
const { ChannelType } = require('discord-api-types/v9');
const categoryInfos = require('../commands/categoryInfo.json');

class Command {
    constructor(exports, category = null) {
        /**
         * The name of the command
         * @type {string}
         */
        this.name = exports.name.toLowerCase();

        /**
         * The description of the command
         * @type {string}
         */
        this.description = exports.description;

        /**
         * The category of the command
         * @type {?categoryInfo}
         */
        this.category = category != null ? categoryInfos.find(c=>c.dir.toLowerCase() == category.toLowerCase()) : null;

        /**
         * The arguments of the command
         * @type {?Array<commandArgs>}
         */
        this.args = exports.args;

        /**
         * The function to execute when the command is called (through slash command)
         * @type {function}
         */
        this.execute = exports.execute;

        /**
         * The function to execute when the a button is selected in a message
         * @type {function}
         */
        this.executeButton = exports.executeButton;

        /**
         * The function to execute when the a item is selected in the select menu
         * @type {function}
         */
        this.executeSelectMenu = exports.executeSelectMenu;
    }
}

module.exports = Command;

/**
 * @typedef {Object} commandArgs The arguments of a commaand
 * @property {string} name The name of the argument
 * @property {?string} description The description of the argument
 * @property {commandArgsType} type The type of the argument
 * @property {?commandArgsChoice[]} choices The choice of the argument
 * @property {boolean} required Whether the argument is required or not
 * @property {?Array<string | ChannelType>} channelTypes The channel types of the argument (if argument type is channel)
 */

/**
 * @typedef {Object} commandArgsChoice The type of a command argument
 * @property {string} name The name of the choice
 * @property {string} value The value of the choice
 */

/**
 * @typedef {Object} categoryInfo The information of a category command
 * @property {string} name The full name of the category
 * @property {?string} dir The directory name of this categoty
 * @property {?string} description The description of the category
 * @property {?string} emoji The defined emoji of this category
 */

/**
 * The type of a command argument
 * * `string`
 * * `bool`
 * * `number`
 * * `channel`
 * * `mention`
 * * `role`
 * * `user`
 * @typedef {string} commandArgsType The type of a command argument
 */