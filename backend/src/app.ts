import * as Koa from 'koa';
import * as ipFilter from 'koa-ip-filter';
import * as bodyParser from 'koa-bodyparser';
import * as serve from 'koa-static';
import * as send from 'koa-send';
import * as fs from 'fs';

import rootRouter from './router/apiRouter';

export let app;

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

app = new Koa();

if (config.filter) {
    app.use(ipFilter({
        forBidden: '403: You shall not. Your IP is blocked by our mighty ip filter.',
        filter: config.filter
    }));
}

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.status || 500;
        ctx.type = 'application/json';
        ctx.body = {
            error: err.message
        };
        ctx.app.emit('error', err, ctx);
    }
});

app.use(bodyParser());
app.use(rootRouter.routes());
app.use(rootRouter.allowedMethods());
app.use(async (ctx, next) => {
    await next();

    if (ctx.method !== 'HEAD' && ctx.method !== 'GET') return;
    // response is already handled
    if (ctx.body != null || ctx.status !== 404) return;

    try {
        await send(ctx, 'public/admin/index.html');
    } catch (err) {
        if (err.status !== 404) {
            throw err;
        }
    }
});

app.use(serve('public', {
    index: 'login.html'
}));

if (!module.parent) app.listen(config.port);
