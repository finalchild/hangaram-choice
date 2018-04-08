import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as serve from 'koa-static';
import * as cors from '@koa/cors';

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

export const app = new Koa();

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
app.use(serve('./public'));

if (!module.parent) app.listen(process.env.PORT || '80');
