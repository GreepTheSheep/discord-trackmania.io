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


const Trackmania = require('trackmania.io')
const totd = new Trackmania.TOTD({listener: true})
const news = new Trackmania.News({listener: true})

client.on('ready', async () => {
    try{
        console.log(`Logged in as ${client.user.tag}`)

        require('./events/activites')(client, config)
        require('./events/totd-wr')(client, sql, config)
        require('./events/map-wr')(client, sql, config)
    } catch (err) {
        console.error(err)
        client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on ready event: \`\`\`${err}\`\`\``)
    }
})

client.on('message', async message => {
    try{
        if (message.author.bot) return
        if (message.channel.type != 'text') return
        if (config.dev.enable){
            require('./cmds/cmds_index')(client, message, config.dev.prefix, config, sql)
        } else {
            sql.query("SELECT * FROM `prefix` WHERE guildId = ?", message.guild.id, (err, res)=>{
                if (err) require('./cmds/cmds_index')(client, message, config.prefix, config, sql)
                else {
                    if (res.length >= 1){
                        require('./cmds/cmds_index')(client, message, res[0].prefix, config, sql)
                    } else {
                        require('./cmds/cmds_index')(client, message, config.prefix, config, sql)
                    }
                }
            })
        }
    } catch (err) {
        console.error(err)
        message.channel.send('Hmm... There\'s an unattended error while running this command. This is reported')
        client.users.cache.find(u => u.id == config.owner_id).send(`:warning: Error on message event: \`\`\`${err}\`\`\``)
    }
})

client.on('guildCreate', guild=>{
    sql.query("INSERT INTO `prefix` (guildId, prefix) VALUES (?, ?, ?)", [guild.id, config.prefix], (err)=>{
        if (err) console.error('[SQL] Error on adding prefix on server', err)
        else console.log('Default prefix added for guild ' + guild.id)
    })
})

totd.on('debug', msg=>console.log('TOTD Listener:', msg))

totd.on('new-totd', totd=>{
    require('./events/totd.js')(totd, client, sql, config)
})

news.on('debug', msg=>console.log('News Listener:', msg))

news.on('new-news', news=>{
    require('./events/news.js')(news, client, sql, config)
})

config.dev.enable ? client.login(config.dev.token) : client.login(config.token)