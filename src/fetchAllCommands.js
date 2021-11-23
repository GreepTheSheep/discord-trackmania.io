const fs = require('fs');
const Command = require('./structures/Command');

/**
 * Fetch all commands from the commands folder
 * @returns {Command[]} The list of commands
 */
module.exports = function(){
    const arr=[];
    const commandFiles = fs.readdirSync('./src/commands');
    for (const file of commandFiles) {
        // if file is a directory, take as category
        if (fs.statSync(`./src/commands/${file}`).isDirectory()) {
            const categoryCommands = fs.readdirSync(`./src/commands/${file}`);
            for (const categoryCommand of categoryCommands) {
                // take only if file is a JS file
                if (categoryCommand.endsWith('.js')) {
                    const command = require(`./commands/${file}/${categoryCommand}`);
                    arr.push(new Command(command, file));
                }
            }
        } else {
            if (file.endsWith('.js')) {
                const command = require(`./commands/${file}`);
                arr.push(new Command(command));
            }
        }
    }
    console.log(`⌨️  ${arr.length} commands loaded`);
    return arr;
};