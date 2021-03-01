// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js')
/*
const ms = require('pretty-ms')
const Trackmania = require('trackmania.io')

function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}
*/

module.exports = function(client, config){
    client.user.setActivity(config.prefix+'help', {type: 'LISTENING'})
    /*
    setInterval(()=>{
        const activities = [
            config.prefix+'help',
            'totd name',
            'totd wr'
        ]
        const status = randomItem(activities)
        if (status.startsWith('totd')){
            const totd = new Trackmania.TOTD({listener: false})
            totd.totd().then(totd=>{
                totd.reverse()
                totd = totd[0]
                if (status == 'totd name'){
                    client.user.setActivity(`Today's TOTD is called ${totd.map.name} and it's created by ${totd.map.authordisplayname}`, {type: 'WATCHING'})
                } else if (status == 'totd wr'){
                    Trackmania.leaderboard(totd.map.mapUid).then(leader=>{
                        client.user.setActivity(`TOTD WR is at ${ms(leader[0].time, {colonNotation: true, secondsDecimalDigits: 3})} by ${leader[0].displayname}`, {type: 'WATCHING'})
                    })
                }
            })
        } else client.user.setActivity(status, {type: 'LISTENING'})
    }, 2*60*1000)
    */
}