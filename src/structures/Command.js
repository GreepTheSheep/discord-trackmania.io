class Command {
    constructor(exports, category = null) {
        /**
         * The name of the command
         * @type {string}
         */
        this.name = exports.name;

        /**
         * The description of the command
         * @type {string}
         */
        this.description = exports.description;

        /**
         * The category of the command
         * @type {?string}
         */
        this.category = category;

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
         * The function to execute when the command is called (through message)
         * @type {function}
         */
        this.executeMessage = exports.executeMessage;
    }
}

module.exports = Command;

/**
 * @typedef {Object} commandArgs The arguments of a commaand
 * @property {string} name The name of the argument
 * @property {?string} description The description of the argument
 * @property {commandArgsType} type The type of the argument
 * @property {commandArgsChoice[]} choices The choice of the argument
 * @property {boolean} required Whether the argument is required or not
 */

/**
 * @typedef {Object} commandArgsChoice The type of a command argument
 * @property {string} name The name of the choice
 * @property {string} value The value of the choice
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