const Koa = require('koa');
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');

const service = require('./service');

const app = new Koa();

router.get('/reviews', async (ctx) => {
  const reviews = await service.getReviews();
  ctx.body = reviews;
});

router.post('/reviews', async (ctx) => {
  const aparelhos = ctx.request.body;
  ctx.assert(Array.isArray(aparelhos), 500, 'Entrada precisa ser um array de ids');
  await service.turnOnReview(aparelhos);
  ctx.body = { status: 'OK', mensagem: 'Dados atualizados com sucesso' };
});

router.put('/reviews', async (ctx) => {
  const aparelhos = ctx.request.body;
  ctx.assert(Array.isArray(aparelhos), 500, 'Entrada precisa ser um array de ids');
  await service.turnOffReview(aparelhos);
  ctx.body = { status: 'OK', mensagem: 'Dados atualizados com sucesso' };
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(8080);
