const db=require('./_lib/db'),crypto=require('crypto');
const MAX={refs:+process.env.MAX_REFS||6,day:+process.env.MAX_PER_DAY||10,body:5.5e6};
exports.handler=async e=>{try{
 if(e.httpMethod!=='POST'||(e.body||'').length>MAX.body)return{statusCode:400,body:'{}'};
 const b=JSON.parse(e.body),anon=String(b.anon||'').slice(0,64);
 const KINDS=['image','audio','video','file','link','text','application'];
 const refs=(Array.isArray(b.refs)?b.refs:[]).slice(0,MAX.refs).map(r=>({kind:KINDS.includes(r&&r.kind)?r.kind:'file',name:String((r&&r.name)||'').slice(0,120),
  mime:/^[\w.+-]+\/[\w.+-]+$/.test((r&&r.mime)||'')?r.mime:'application/octet-stream',
  data:/^[A-Za-z0-9+\/=]+$/.test((r&&r.data)||'')?r.data:undefined,
  url:/^https?:\/\/[^\s]{1,500}$/.test((r&&r.url)||'')?r.url:undefined})).filter(r=>r.data||r.url);
 if(!anon||(!b.idea&&!refs.length))return{statusCode:400,body:'{}'};
 if(!process.env.INTERNAL_KEY)throw new Error('INTERNAL_KEY ausente');
 if(await db.count(anon,new Date(Date.now()-864e5).toISOString())>=MAX.day)return{statusCode:429,body:'{}'};
 const id=crypto.randomUUID();
 const ip=(e.headers['x-nf-client-connection-ip']||'').slice(0,64);
 if(ip&&await db.count(ip,new Date(Date.now()-864e5).toISOString(),'ip')>=MAX.day*2)return{statusCode:429,body:'{}'};
 await db.insert('generation_jobs',{id,anon_id:anon,ip,status:'queued',idea:String(b.idea||'').slice(0,4000)});
 await db.put('in/'+id+'.json',JSON.stringify({idea:b.idea,refs}),'application/json');
 const base=process.env.URL||('https://'+e.headers.host);
 await fetch(base+'/.netlify/functions/generate-background',{method:'POST',headers:{'Content-Type':'application/json','x-vk':process.env.INTERNAL_KEY||''},body:JSON.stringify({id})});
 return{statusCode:200,body:JSON.stringify({id})};
}catch(err){console.error('generate',err);return{statusCode:500,body:'{}'}}};
