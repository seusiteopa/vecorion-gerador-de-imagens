const db=require('./_lib/db'),{run}=require('./_lib/pipeline');
exports.handler=async e=>{let id;const t0=Date.now();try{
 if(!process.env.INTERNAL_KEY||e.headers['x-vk']!==process.env.INTERNAL_KEY)return{statusCode:403};
 id=JSON.parse(e.body).id;const b=await db.read('in/'+id+'.json');
 await db.update('generation_jobs',id,{status:'running'});
 const o=await run(b);await db.put(id+'.png',o.buf,o.type);await db.del('in/'+id+'.json');
 await db.update('generation_jobs',id,{status:'done',final_prompt:o.prompt,duration_ms:Date.now()-t0});
}catch(err){console.error('job',id,err);
 if(id){await db.del('in/'+id+'.json').catch(()=>{});await db.update('generation_jobs',id,{status:'failed',error:String(err.message).slice(0,500),duration_ms:Date.now()-t0})}}};
