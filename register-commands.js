// You can run the script individually.
// node src\registerCommands.js -g <guildId> -u <botID>
const args = process.argv.slice(2),
    registerCommands = require('./src/registerCommandsScript');

if (args.includes('-g') && args.includes('-u')) {
    const guildId = args[args.indexOf(args.find(arg => arg.startsWith('-g'))) + 1];
    const userId = args[args.indexOf(args.find(arg => arg.startsWith('-u'))) + 1];
    if (guildId && userId) {
        registerCommands(guildId, userId);
    } else errUsage();
} else errUsage();

function errUsage() {
    console.error('Usage: -g <guildId> -u <userId>');
    process.exit(1);
}