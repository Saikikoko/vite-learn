const Koa = require('koa');
const fs = require('fs');

const app = new Koa();

app.use(async (ctx) => {
  if (ctx.url === '/') {
    ctx.type = 'html'
    ctx.body = fs.readFileSync('./index.html')
  } else {
    ctx.body = 'test'
  }
})

app.listen(3000)