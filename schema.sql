create table generation_jobs(id uuid primary key,anon_id text not null,ip text,status text not null,idea text,final_prompt text,error text,duration_ms int,model text,cost_estimate numeric,created_at timestamptz default now());
create index on generation_jobs(anon_id,created_at);
alter table generation_jobs enable row level security;
-- crie também o bucket privado "results" em Storage
create index on generation_jobs(ip,created_at);
