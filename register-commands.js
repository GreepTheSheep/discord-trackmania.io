// You can run the script individually.
// node registerCommands.js -g <guildId> -u <botID>
const args = process.argv.slice(2),
    registerCommands = require('./src/registerCommandsScript'),
    commands = require('./src/fetchAllCommands')();

if (args.includes('-g') && args.includes('-u')) {
    const guildId = args[args.indexOf(args.find(arg => arg.startsWith('-g'))) + 1];
    const userId = args[args.indexOf(args.find(arg => arg.startsWith('-u'))) + 1];
    if (guildId && userId) {
        registerCommands(guildId, userId, commands);
    } else errUsage();
} else errUsage();

function errUsage() {
    console.error('Usage: -g <guildId> -u <userId>');
    process.exit(1);
}