import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as cors from '@koa/cors';

import loginRouter from './router/loginRouter';
import voteRouter from './router/voteRouter';
import closePollRouter from './router/admin/closePollRouter';
import generateKeysRouter from './router/admin/generateKeysRouter';
import initializePollRouter from './router/admin/initializePollRouter';
import openPollRouter from './router/admin/openPollRouter';
import setAdminPwRouter from './router/admin/setAdminPwRouter';
import statusRouter from './router/admin/statusRouter';

const app = new Koa();
export default app;

app.use(cors());
app.use(bodyParser());
app.use(loginRouter.routes());
app.use(loginRouter.allowedMethods());
app.use(voteRouter.routes());
app.use(voteRouter.allowedMethods());
app.use(closePollRouter.routes());
app.use(closePollRouter.allowedMethods());
app.use(generateKeysRouter.routes());
app.use(generateKeysRouter.allowedMethods());
app.use(initializePollRouter.routes());
app.use(initializePollRouter.allowedMethods());
app.use(openPollRouter.routes());
app.use(openPollRouter.allowedMethods());
app.use(setAdminPwRouter.routes());
app.use(setAdminPwRouter.allowedMethods());
app.use(statusRouter.routes());
app.use(statusRouter.allowedMethods());

if (!module.parent) app.listen(process.env.PORT || '3000');
