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