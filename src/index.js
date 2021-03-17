const Discord = require('discord.js')
const client = new Discord.Client({fetchAllMembers:false})
const fs = require('fs')
const config = JSON.parse(fs.readFileSync('./data/config.json'))
const MySQL = require('mysql')
const sql = MySQL.createConnection({
    host     : config.mysql.host,
    user     : config.mysql.user,
    password : config.mysql.password,
    database : config.mysql.database
})
sql.connect((err)=>{
    if (err){
        console.error('Impossible to connect to MySQL server. Code: ' + err.code)
        process.exit(99)
    } else {
        console.log('[SQL] Connected to the MySQL server! Connexion ID: ' + sql.threadId)
    }
})

function getGuildPrefix(message) {
    sql.query("SELECT * FROM `prefix` WHERE guildId = ?", message.guild.id, (err, res)=>{
        if (err) return config.prefix
        else {
            if (res.length<1){
                sql.query("INSERT INTO `prefix` (guildID, prefix, ownerID) VALUES (?, ?, ?)", [message.guild.id, config.prefix, message.guild.owner.id], ()=>{
                    return config.prefix
                })
            } else return res[0].prefix
        }
    })
}

const Trackmania = require('trackmania.io')
const totd = new Trackmania.TOTD({listener: true})
const news = new Trackmania.News({listener: true})

client.on('ready', async () => {
    try{
        console.log(`Logged in as ${client.user.tag}`)

        require('./events/activites')(client, config)
        require('./events/totd-wr')(client, sql, config)
    } catch (err) {
        console.error(err)
        client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on ready event: \`\`\`${err}\`\`\``)
    }
})

client.on('message', message => {
    try{
        var prefix = getGuildPrefix(message)
        require('./cmds/cmds_index')(client, message, prefix, config, sql)
    } catch (err) {
        console.error(err)
        message.channel.send('Hmm... There\'s an unattended error while runnding this command. This is reported')
        client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on message event: \`\`\`${err}\`\`\``)
    }
})

totd.on('debug', msg=>console.log('TOTD Listener:', msg))

totd.on('new-totd', totd=>{
    require('./events/totd.js')(totd, client, sql, config)
})

news.on('debug', msg=>console.log('News Listener:', msg))

news.on('new-news', news=>{
    require('./events/news.js')(news, client, sql, config)
})

client.login(config.token)