// You can run the script individually.
// node registerCommands.js -g <guildId> -u <botID>
const args = process.argv.slice(2),
    registerCommands = require('./src/registerCommandsScript'),
    commands = require('./src/fetchAllCommands')();
    // commands = [];

if (args.includes('-u')) {
    const userId = args[args.indexOf(args.find(arg => arg.startsWith('-u'))) + 1];
    let guildId;
    if (args.includes('-g'))
        guildId = args[args.indexOf(args.find(arg => arg.startsWith('-g'))) + 1];
    else
        guildId = null;
    if (userId) registerCommands(guildId, userId, commands);
    else errUsage();
} else errUsage();

function errUsage() {
    console.error('Usage: -u <userId> [-g <guildId>]');
    process.exit(1);
}