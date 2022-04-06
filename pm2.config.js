require('dotenv').config();
var package = require('./package.json');

module.exports = {
    apps : [{
        name: 'Trackmania.io Discord',
        script: 'src/index.js',

        // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
        autorestart: true,
        max_memory_restart: '500M',
        out_file: 'logs/out.log',
        error_file: 'logs/errors.log',
    }],

    deploy: {
        production: {
            user: process.env.SERVER_USER,
            host: process.env.SERVER_IP,
            ssh_options: `-p ${process.env.SERVER_PORT}`,
            key: 'deploy.key',
            ref: 'origin/main',
            repo: package.repository.url,
            path: process.env.SERVER_PATH,
            'post-deploy': 'npm i && pm2 reload pm2.config.js --env production && pm2 save'
        }
    }
};