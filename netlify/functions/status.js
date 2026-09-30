const db=require('./_lib/db');
exports.handler=async e=>{try{const id=(e.queryStringParameters||{}).id;
 if(!/^[0-9a-f-]{36}$/.test(id||''))return{statusCode:400,body:'{}'};
 const j=await db.get('generation_jobs',id);if(!j)return{statusCode:404,body:'{}'};
 const out={status:j.status};if(j.status==='done')out.url=await db.sign(id+'.png');
 return{statusCode:200,headers:{'Cache-Control':'no-store'},body:JSON.stringify(out)};
}catch(err){console.error('status',err);return{statusCode:500,body:'{}'}}};
