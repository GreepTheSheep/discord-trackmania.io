exports.name = 'ping';
exports.description = 'Replies with Pong! (in a file!)';

exports.execute = async (interaction) => {
    interaction.reply('Pong! ' + interaction.client.ws.ping + 'ms (Web Socket)');
};

exports.executeMessage = async (message) => {
    message.reply('Pong! '  + message.client.ws.ping + 'ms (Web Socket)');
};