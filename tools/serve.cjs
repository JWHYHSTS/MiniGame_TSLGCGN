/* Optional dependency-free local server. Opening index.html directly also works. */
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const args=process.argv.slice(2),arg=(key,fallback)=>args.includes(key)?args[args.indexOf(key)+1]:fallback;
const port=Number(arg('--port',process.env.PORT||5173)),host=arg('--host','0.0.0.0');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.md':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://local.test').pathname),file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});fs.createReadStream(file).pipe(res);
  }catch(_){res.writeHead(400);res.end('Bad request');}
}).listen(port,host,()=>console.log(`Mechanical Fortress listening on ${host}:${port}`));
