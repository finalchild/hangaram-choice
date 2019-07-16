import * as Koa from 'koa';
import * as ipFilter from 'koa-ip-filter';
import * as bodyParser from 'koa-bodyparser';
import * as serve from 'koa-static';
import * as send from 'koa-send';
import * as fs from 'fs';

import loginRouter from './router/loginRouter';
import voteRouter from './router/voteRouter';
import closePollRouter from './router/admin/closePollRouter';
import generateKeysRouter from './router/admin/generateKeysRouter';
import getOldPollRouter from './router/admin/getOldPollRouter';
import initializePollRouter from './router/admin/initializePollRouter';
import listOldPollsRouter from './router/admin/listOldPollsRouter';
import openPollRouter from './router/admin/openPollRouter';
import setAdminPwRouter from './router/admin/setAdminPwRouter';
import statusRouter from './router/admin/statusRouter';
import studentsRouter from './router/admin/studentsRouter';

export let app;

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

app = new Koa();

if (config.filter) {
    app.use(ipFilter({
        forBidden: '403: You shall not. Your IP is blocked by our mighty ip filter.',
        filter: config.filter
    }));
}
app.use(bodyParser());
app.use(loginRouter.routes());
app.use(loginRouter.allowedMethods());
app.use(voteRouter.routes());
app.use(voteRouter.allowedMethods());
app.use(closePollRouter.routes());
app.use(closePollRouter.allowedMethods());
app.use(generateKeysRouter.routes());
app.use(generateKeysRouter.allowedMethods());
app.use(getOldPollRouter.routes());
app.use(getOldPollRouter.allowedMethods());
app.use(initializePollRouter.routes());
app.use(initializePollRouter.allowedMethods());
app.use(listOldPollsRouter.routes());
app.use(listOldPollsRouter.allowedMethods());
app.use(openPollRouter.routes());
app.use(openPollRouter.allowedMethods());
app.use(setAdminPwRouter.routes());
app.use(setAdminPwRouter.allowedMethods());
app.use(statusRouter.routes());
app.use(statusRouter.allowedMethods());
app.use(studentsRouter.routes());
app.use(studentsRouter.allowedMethods());
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
