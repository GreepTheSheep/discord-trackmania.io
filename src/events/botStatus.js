const Command = require('../structures/Command'),
    { Time } = require('tm-essentials');
function randomItem(array) {
    return array[Math.floor(Math.random()*array.length)];
}

/**
 * @param {import('discord.js').Client} client
 * @param {import('trackmania.io').Client} tmio
 * @param {Command[]} commands
 */
module.exports = function(client, tmio, commands) {
    const activities = [
        'command',
        'totd name',
        'totd wr',
        'version'
    ];
    let activityIndex = 1;
    client.user.setActivity('/help', {type: 'LISTENING'});

    setInterval(()=>{
        const status = activities[activityIndex];
        if (status == 'command') {
            client.user.setActivity('/'+randomItem(commands).name, {type: 'LISTENING'});
        } else if (status.startsWith('totd')){
            tmio.totd.get(new Date()).then(async totd=>{
                const map = await totd.map();
                if (status == 'totd name'){
                    client.user.setActivity(`Today's TOTD is called ${tmio.stripFormat(map.name)} and it's made by ${map.authorName}`, {type: 'WATCHING'});
                } else if (status == 'totd wr'){
                    let leader = await map.leaderboardGet(1);
                    client.user.setActivity(`TOTD WR is at ${Time.fromMilliseconds(leader.time).toTmString()} by ${leader.playerName}`, {type: 'WATCHING'});
                }
            });
        } else if (status == 'version') {
            const pkg = require('../../package.json');
            client.user.setActivity(`Version ${pkg.version} (lib: ${pkg.dependencies['trackmania.io'].replace('^', '')})`);
        } else client.user.setActivity(status, {type: 'LISTENING'});

        activityIndex = (activityIndex+1)%activities.length;
    }, tmio.options.cache.roomttl*60*1000);
};