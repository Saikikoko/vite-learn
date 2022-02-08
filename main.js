const Koa = require('koa');
const fs = require('fs');
const path = require('path');
const compilerSFC = require('@vue/compiler-sfc')
const compilerDOM = require('@vue/compiler-dom')
const app = new Koa();

app.use(async (ctx) => {
  const { url, query } = ctx.request
  if (url === '/') {
    ctx.type = 'text/html'
    ctx.body = fs.readFileSync('./index.html', 'utf8');
  } else if(url.endsWith('.js')) {
    const p = path.join(__dirname, url)
    // console.log(p)
    ctx.type = 'application/javascript'
    ctx.body = reWriteContent(fs.readFileSync(p, 'utf8'));
  } else if(url.startsWith('/@modules/')) {
    const moduleName = url.replace('/@modules/', '')
    const prefix = path.join(__dirname, 'node_modules', moduleName)
    const module = require(path.join(prefix, 'package.json')).module
    const final = path.join(prefix, module)
    ctx.type = 'application/javascript'
    ctx.body = reWriteContent(fs.readFileSync(final, 'utf8'));
  } else if(url.indexOf('.vue') > -1) {
    const p = path.join(__dirname, url.split('?')[0])
    const sfc = compilerSFC.parse(fs.readFileSync(p, 'utf8'));
    if(!query.type) {
      const scriptContent = sfc.descriptor.script.content
      const script = scriptContent.replace(
        'export default',
        'const __script = '
      )
      ctx.type = 'application/javascript'
      ctx.body = `
        ${reWriteContent(script)}
        // 解析tpl
        import { render as __render } from '${url}?type=template'
        __script.render = __render
        export default __script
      `
      // console.log(url)
    } else if (query.type === 'template') {
      const tpl = sfc.descriptor.template.content
      const render = compilerDOM.compile(tpl, {mode: 'module'}).code 
      ctx.type = 'application/javascript'
      ctx.body = reWriteContent(render)
    }
  }
})


function reWriteContent(content) {
  // console.log(content)
  return content.replace(/ from ['"](.*)['"]/g, (match, s1) => {
    if (s1.startsWith('./') || s1.startsWith('/') || s1.startsWith('../')) {
      return match
    } else {
      return ` from '/@modules/${s1}'`
    }
  })
}

app.listen(3000, () => {
  console.log('app started')
})