import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as serve from 'koa-static';
import * as send from 'koa-send';
import rootRouter from './router/rootRouter';

export const app = new Koa();

app.use(bodyParser());
app.use(rootRouter.routes());
app.use(rootRouter.allowedMethods());
app.use(async (ctx, next) => {
    await next();

    if (ctx.method !== 'HEAD' && ctx.method !== 'GET') return;
    // response is already handled
    if (ctx.body != null || ctx.status !== 404) return;

    try {
        await send(ctx, 'public/index.html');
    } catch (err) {
        if (err.status !== 404) {
            throw err
        }
    }
});
app.use(serve('public'));

if (!module.parent) app.listen(process.env.PORT || '80');
