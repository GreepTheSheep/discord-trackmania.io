module.exports = {
    apps : [{
      name: 'Trackmania.io Discord',
      script: require('./data/config.json').dev.enable ? 'src/index.js' : 'shard.js',
  
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      autorestart: true,
      watch: true,
      ignore_watch : ["node_modules", "data", "logs", ".git"],
      max_memory_restart: '500M',
      log_file: 'logs/bot.log'
    }]
  };