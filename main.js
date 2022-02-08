const Koa = require('koa');
const fs = require('fs');
const path = require('path');

const app = new Koa();

app.use(async (ctx) => {
  if (ctx.url === '/') {
    ctx.type = 'text/html'
    ctx.body = fs.readFileSync('./index.html', 'utf8');
  } else if(ctx.url.endsWith('.js')) {
    const p = path.join(__dirname, ctx.url)
    console.log(p)
    ctx.type = 'application/javascript'
    ctx.body = reWriteContent(fs.readFileSync(p, 'utf8'));
  } else if(ctx.url.startsWith('/@modules/')) {
    const moduleName = ctx.url.replace('/@modules/', '')
    const prefix = path.join(__dirname, 'node_modules', moduleName)
    const module = require(path.join(prefix, 'package.json')).module
    const final = path.join(prefix, module)
    ctx.type = 'application/javascript'
    ctx.body = reWriteContent(fs.readFileSync(final, 'utf8'));
  }
})


function reWriteContent(content) {
  console.log(content)
  return content.replace(/ from ['"](.*)['"]/g, (match, s1) => {
    if (s1.startsWith('./') || s1.startsWith('/') || s1.startsWith('../')) {
      return s1
    } else {
      return ` from '/@modules/${s1}'`
    }
  })
}

app.listen(3000, () => {
  console.log('app started')
})