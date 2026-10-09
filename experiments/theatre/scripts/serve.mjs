import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {dirname,join,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=join(dirname(fileURLToPath(import.meta.url)),'..','public');
const server=createServer((req,res)=>{
  const path=req.url==='/'?'/index.html':req.url;
  if(!['/index.html','/bundle.js'].includes(path)){res.writeHead(404);res.end('Not found');return;}
  try{
    const body=readFileSync(join(root,path.slice(1)));
    res.writeHead(200,{'Content-Type':extname(path)==='.js'?'text/javascript':'text/html',
      'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(body);
  }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(4178,'127.0.0.1',()=>console.log('Open http://127.0.0.1:4178'));
