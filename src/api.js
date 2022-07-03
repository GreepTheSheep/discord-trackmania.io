const express = require('express'),
    createError = require('http-errors'),
    bosyParser = require('body-parser'),
    cors = require('cors'),
    logger = require('morgan');

class API {
    constructor() {
        /** @type {Express} */
        this.app = express();
        /** @type {number} */
        this.port = Number(process.env.PORT) || 5000;
        /** @type {Array} */
        this.shards = [];

        this.app.use(bosyParser.json());
        this.app.use(logger('API Request: :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));
        this.app.use(cors());

        this.app.use((req, res, next) => {
            if (process.env.API_TOKEN == undefined) next(createError(401, 'API Token not set'));

            let auth = req.get('Authorization');
            if (!auth) return next(createError(403, 'No Authorization header'));

            if (!auth.startsWith('Token ')) return next(createError(403, 'Invalid Authorization header'));

            let token = auth.substring('Token '.length);
            if (token !== process.env.API_TOKEN) return next(createError(403, 'Invalid Authorization token'));

            next();
        });

        this.routes();

        // catch 404 and forward to error handler
        this.app.use(function(req, res, next) {
            next(createError(404, 'Not found'));
        });

        // error handler
        this.app.use(function(err, req, res, next) {
            // set locals, only providing error in development
            res.locals.message = err.message;
            res.locals.error = err;

            // render the error page
            res.status(err.status || 500).json({
                error: {
                    code: err.status || 500,
                    message: err.message
                }
            });
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`✅ API Listening on port ${this.port}`);
        });
    }

    routes() {
        this.app.get('/', (req, res)=>{
            res.json({
                resTimeMs: (Date.now() - req.startTime),
                message: 'Bot is running',
                shards: this.shards
            });
        });
    }

    registerShard(shard) {
        this.shards.push(shard.ids[0]);
        console.log('☑ API: Added shard #' + shard.ids[0]);
    }
}

module.exports = API;