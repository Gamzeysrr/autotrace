const crypto = require('node:crypto');
const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const COOKIE = 'autotrace_session';
const MEMO_PROGRAM = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const makePassword = (value, salt = crypto.randomBytes(16).toString('hex')) => ({ salt, hash: crypto.scryptSync(value, salt, 64).toString('hex') });

let schemaReady;
async function initialize() {
  if (!schemaReady) schemaReady = (async () => {
    await pool.query(`CREATE TABLE IF NOT EXISTS institutions (
      id text PRIMARY KEY, name text NOT NULL, type text NOT NULL, email text NOT NULL,
      status text NOT NULL CHECK(status IN ('approved','pending')), created_at timestamptz NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id text PRIMARY KEY, institution_id text REFERENCES institutions(id), name text NOT NULL,
      email text NOT NULL UNIQUE, password_salt text NOT NULL, password_hash text NOT NULL,
      role text NOT NULL CHECK(role IN ('admin','issuer')), status text NOT NULL CHECK(status IN ('approved','pending')),
      created_at timestamptz NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at bigint NOT NULL
    );
    CREATE TABLE IF NOT EXISTS applications (
      id text PRIMARY KEY, institution_name text NOT NULL, institution_type text NOT NULL,
      contact_name text NOT NULL, email text NOT NULL, password_salt text NOT NULL, password_hash text NOT NULL,
      status text NOT NULL CHECK(status IN ('pending','approved','rejected')), created_at timestamptz NOT NULL
    );
    CREATE TABLE IF NOT EXISTS records (
      record_id text PRIMARY KEY, vin text NOT NULL, body_json jsonb NOT NULL,
      issuer_user_id text NOT NULL REFERENCES users(id), institution_id text NOT NULL REFERENCES institutions(id),
      created_at timestamptz NOT NULL
    );
    CREATE INDEX IF NOT EXISTS records_vin_idx ON records(vin);
    CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);`);
    const count = await pool.query('SELECT 1 FROM institutions LIMIT 1');
    if (!count.rowCount) {
      const orgs = [
        ['org-demo-sigorta','Örnek Ufuk Sigorta','Sigorta şirketi','iletisim@ufuk-sigorta.test','sigorta@ufuk-sigorta.test','UfukDemo2026!','Örnek Sigorta Yetkilisi'],
        ['org-demo-ekspertiz','Örnek Mercek Ekspertiz','Ekspertiz firması','rapor@mercek-ekspertiz.test','ekspertiz@mercek-ekspertiz.test','MercekDemo2026!','Örnek Ekspertiz Yetkilisi'],
        ['org-demo-servis','Örnek Rota Servis Merkezi','Yetkili servis','servis@rota-otomotiv.test','servis@rota-otomotiv.test','RotaDemo2026!','Örnek Servis Yetkilisi']
      ];
      for (const [orgId,name,type,orgEmail,userEmail,password,nameUser] of orgs) {
        await pool.query('INSERT INTO institutions(id,name,type,email,status,created_at) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(id) DO NOTHING',[orgId,name,type,orgEmail,'approved',now()]);
        const pw=makePassword(password);
        await pool.query(`INSERT INTO users(id,institution_id,name,email,password_salt,password_hash,role,status,created_at)
          VALUES($1,$2,$3,$4,$5,$6,'issuer','approved',$7) ON CONFLICT(email) DO NOTHING`,[id(),orgId,nameUser,userEmail,pw.salt,pw.hash,now()]);
      }
    }
  })().catch(error => { schemaReady=null; throw error; });
  await schemaReady;
}
async function ensureAdmin() {
  if (!process.env.AUTOTRACE_ADMIN_EMAIL || !process.env.AUTOTRACE_ADMIN_PASSWORD) return;
  const existing=await pool.query("SELECT id FROM users WHERE role='admin' LIMIT 1");
  if (existing.rowCount) return;
  const pw=makePassword(process.env.AUTOTRACE_ADMIN_PASSWORD);
  await pool.query(`INSERT INTO users(id,institution_id,name,email,password_salt,password_hash,role,status,created_at)
    VALUES($1,NULL,'AutoTrace Yöneticisi',$2,$3,$4,'admin','approved',$5) ON CONFLICT(email) DO NOTHING`,
    [id(),process.env.AUTOTRACE_ADMIN_EMAIL.trim().toLowerCase(),pw.salt,pw.hash,now()]);
}

function json(res,status,data,headers={}) {
  res.statusCode=status; res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store'); for (const [key,value] of Object.entries(headers)) res.setHeader(key,value);
  res.end(JSON.stringify(data));
}
function body(req) { return new Promise((resolve,reject)=>{let s='';req.on('data',c=>{s+=c;if(s.length>1_000_000)reject(new Error('İstek boyutu çok büyük.'))});req.on('end',()=>{try{resolve(JSON.parse(s||'{}'))}catch{reject(new Error('Geçersiz JSON.'))}});req.on('error',reject)}); }
function cookie(req) { return (req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)||''; }
async function currentUser(req) {
  const token=decodeURIComponent(cookie(req)); if(!token)return null;
  const {rows}=await pool.query(`SELECT u.id,u.name,u.email,u.role,u.status,u.institution_id,
    i.name AS institution_name,i.type AS institution_type,s.expires_at
    FROM sessions s JOIN users u ON u.id=s.user_id LEFT JOIN institutions i ON i.id=u.institution_id
    WHERE s.token_hash=$1`,[hash(token)]);
  const user=rows[0]; if(!user||Number(user.expires_at)<Date.now()||user.status!=='approved')return null; return user;
}
function publicUser(u) { return {id:u.id,name:u.name,email:u.email,role:u.role,institutionId:u.institution_id,institutionName:u.institution_name||'AutoTrace',institutionType:u.institution_type||'Yönetim'}; }
async function verifyMemo(signature,recordId,digest) {
  if(!/^[1-9A-HJ-NP-Za-km-z]{80,90}$/.test(String(signature||'')))throw new Error('Solana işlem imzası biçimi geçersiz.');
  const response=await fetch(process.env.AUTOTRACE_DEVNET_RPC||'https://api.devnet.solana.com',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(10000),body:JSON.stringify({jsonrpc:'2.0',id:1,method:'getTransaction',params:[signature,{commitment:'confirmed',encoding:'jsonParsed',maxSupportedTransactionVersion:0}]})});
  if(!response.ok)throw new Error('Solana Devnet doğrulama servisi yanıt vermedi.');
  const payload=await response.json(),tx=payload.result;
  if(payload.error||!tx)throw new Error('Solana işlemi Devnet’te bulunamadı veya kesinleşmedi.');
  if(tx.meta?.err||!tx.transaction?.signatures?.includes(signature))throw new Error('Solana işlemi başarısız veya imza eşleşmiyor.');
  const ix=(tx.transaction.message?.instructions||[]).find(x=>String(x.programId)===MEMO_PROGRAM),parsed=ix?.parsed,text=typeof parsed==='string'?parsed:(parsed?.memo||parsed?.info?.memo);
  let memo; try{memo=JSON.parse(text)}catch{throw new Error('İşlemde okunabilir AutoTrace Memo bulunamadı.');}
  if(memo.app!=='autotrace'||memo.v!==3||memo.record_id!==recordId||memo.sha256!==digest)throw new Error('Devnet Memo rapor özetiyle eşleşmiyor.');
  const signer=tx.transaction.message.accountKeys?.find(key=>key.signer); if(!signer)throw new Error('İşlemi imzalayan cüzdan bulunamadı.'); return String(signer.pubkey);
}

module.exports = async function handler(req,res) {
  try {
    if (!process.env.DATABASE_URL) return json(res,503,{error:'Kalıcı veritabanı bağlı değil. Vercel Marketplace üzerinden Postgres bağlayıp yeniden dağıtın.'});
    await initialize();
    await ensureAdmin();
    const p=new URL(req.url,`https://${req.headers.host||'localhost'}`).pathname.replace(/\/$/,'')||'/';
    if (req.method!=='GET'&&req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host) return json(res,403,{error:'Bu kaynağa izin verilmiyor.'});
    if(p==='/api/health'&&req.method==='GET')return json(res,200,{ok:true,mode:'vercel-postgres',chainRequired:true,version:'solana-required-v1'});
    if(p==='/api/session'&&req.method==='GET'){const u=await currentUser(req);return json(res,200,{user:u?publicUser(u):null});}
    if(p==='/api/login'&&req.method==='POST'){
      const b=await body(req),email=String(b.email||'').trim().toLowerCase(),{rows}=await pool.query("SELECT * FROM users WHERE email=$1 AND status='approved'",[email]),u=rows[0];
      if(!u)return json(res,401,{error:'E-posta veya şifre hatalı.'});
      const candidate=Buffer.from(makePassword(String(b.password||''),u.password_salt).hash,'hex'),expected=Buffer.from(u.password_hash,'hex');
      if(candidate.length!==expected.length||!crypto.timingSafeEqual(candidate,expected))return json(res,401,{error:'E-posta veya şifre hatalı.'});
      const token=crypto.randomBytes(32).toString('base64url'),expires=Date.now()+2*86400_000;
      await pool.query('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,$3)',[hash(token),u.id,expires]);
      const {rows:users}=await pool.query('SELECT u.*,i.name AS institution_name,i.type AS institution_type FROM users u LEFT JOIN institutions i ON i.id=u.institution_id WHERE u.id=$1',[u.id]);
      return json(res,200,{user:publicUser(users[0])},{'Set-Cookie':`${COOKIE}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=172800`});
    }
    if(p==='/api/logout'&&req.method==='POST'){const token=decodeURIComponent(cookie(req));if(token)await pool.query('DELETE FROM sessions WHERE token_hash=$1',[hash(token)]);return json(res,200,{ok:true},{'Set-Cookie':`${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`});}
    if(p==='/api/applications'&&req.method==='POST'){
      const b=await body(req),name=String(b.institutionName||'').trim(),type=String(b.institutionType||''),contact=String(b.contactName||'').trim(),email=String(b.email||'').trim().toLowerCase(),pass=String(b.password||'');
      if(name.length<3||name.length>100||contact.length<2||contact.length>80||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||pass.length<10||!['Sigorta şirketi','Ekspertiz firması','Yetkili servis'].includes(type))return json(res,400,{error:'Alanları kontrol et. Şifre en az 10 karakter olmalı.'});
      const found=await pool.query('SELECT 1 FROM users WHERE email=$1 UNION SELECT 1 FROM applications WHERE email=$1 AND status=$2',[email,'pending']);if(found.rowCount)return json(res,409,{error:'Bu e-posta için hesap veya bekleyen başvuru zaten var.'});
      const pw=makePassword(pass);await pool.query(`INSERT INTO applications(id,institution_name,institution_type,contact_name,email,password_salt,password_hash,status,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,'pending',$8)`,[id(),name,type,contact,email,pw.salt,pw.hash,now()]);return json(res,201,{ok:true,message:'Başvuru AutoTrace yöneticisinin onayına gönderildi.'});
    }
    if(p==='/api/admin/applications'&&req.method==='GET'){
      const u=await currentUser(req);if(!u||u.role!=='admin')return json(res,403,{error:'Bu işlem AutoTrace yöneticisi gerektirir.'});
      const {rows}=await pool.query("SELECT id,institution_name,institution_type,contact_name,email,created_at FROM applications WHERE status='pending' ORDER BY created_at");return json(res,200,{applications:rows});
    }
    const approve=p.match(/^\/api\/admin\/applications\/([\w-]+)\/approve$/);
    if(approve&&req.method==='POST'){
      const u=await currentUser(req);if(!u||u.role!=='admin')return json(res,403,{error:'Bu işlem AutoTrace yöneticisi gerektirir.'});
      const client=await pool.connect();try{await client.query('BEGIN');const {rows}=await client.query("SELECT * FROM applications WHERE id=$1 AND status='pending' FOR UPDATE",[approve[1]]);const a=rows[0];if(!a){await client.query('ROLLBACK');return json(res,404,{error:'Bekleyen başvuru bulunamadı.'});}
        const org=id();await client.query("INSERT INTO institutions(id,name,type,email,status,created_at) VALUES($1,$2,$3,$4,'approved',$5)",[org,a.institution_name,a.institution_type,a.email,now()]);await client.query("INSERT INTO users(id,institution_id,name,email,password_salt,password_hash,role,status,created_at) VALUES($1,$2,$3,$4,$5,$6,'issuer','approved',$7)",[id(),org,a.contact_name,a.email,a.password_salt,a.password_hash,now()]);await client.query("UPDATE applications SET status='approved' WHERE id=$1",[a.id]);await client.query('COMMIT');return json(res,200,{ok:true,message:'Kurum onaylandı ve kullanıcı hesabı açıldı.'});}catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
    }
    const owned=p.match(/^\/api\/records\/([\w-]+)$/);
    if(owned&&req.method==='GET'){const u=await currentUser(req);if(!u||u.role!=='issuer')return json(res,403,{error:'Kurum oturumu gerekli.'});const {rows}=await pool.query('SELECT body_json FROM records WHERE record_id=$1 AND issuer_user_id=$2',[owned[1],u.id]);if(!rows[0])return json(res,404,{error:'Bu kurum kullanıcısına ait kayıt bulunamadı.'});return json(res,200,{record:rows[0].body_json});}
    if(p==='/api/records'&&req.method==='GET'){
      const vin=String(new URL(req.url,`https://${req.headers.host}`).searchParams.get('vin')||'').trim().toUpperCase();if(vin.length!==17)return json(res,400,{error:'Araç geçmişi sorgusu için 17 karakterli şasi numarası gerekli.'});const {rows}=await pool.query("SELECT body_json FROM records WHERE vin=$1 ORDER BY created_at",[vin]);return json(res,200,{records:rows.map(r=>r.body_json).filter(r=>r.chain_verified===true&&!!r.signature)});
    }
    if(p==='/api/records'&&req.method==='POST'){
      const u=await currentUser(req);if(!u||u.role!=='issuer'||!u.institution_id)return json(res,403,{error:'Kayıt eklemek için onaylı kurum kullanıcısı olarak giriş yapmalısın.'});
      const {rows:orgs}=await pool.query('SELECT id,name,type,status FROM institutions WHERE id=$1',[u.institution_id]),org=orgs[0];if(!org||org.status!=='approved')return json(res,403,{error:'Kurum onayı etkin değil.'});
      const b=await body(req),record=b.record;if(!record||!/^[A-HJ-NPR-Z0-9]{17}$/i.test(String(record.vin||''))||!(record.reportNo||record.id)||!record.type||!record.details||!record.hash||!record.salt||!record.proofRecord||!record.signature)return json(res,400,{error:'Rapor alanları eksik. Solana Devnet kanıtı zorunludur.'});
      const vin=String(record.vin).toUpperCase(),allowed={'Sigorta şirketi':['Kaza / hasar kaydı','Sigorta hasar dosyası'],'Ekspertiz firması':['Ekspertiz raporu'],'Yetkili servis':['Onarım / parça değişimi','Kilometre bildirimi']};if(!allowed[org.type]?.includes(String(record.type)))return json(res,403,{error:`${org.type} bu kayıt türünü ekleyemez.`});
      const proof={schema_version:1,record_id:String(record.record_id||record.recordId||''),report_no:String(record.reportNo||record.id),type:String(record.type),vin,source:`${org.name} · ${org.type}`,date:String(record.date||''),details:String(record.details),pdf_sha256:record.proofRecord.pdf_sha256||null};if(!proof.record_id||!/^\d{4}-\d{2}-\d{2}$/.test(proof.date)||proof.details.length>500||proof.report_no.length>40)return json(res,400,{error:'Kayıt alanları beklenen biçimde değil.'});
      const digest=hash(String(record.salt)+'|'+JSON.stringify(proof));if(digest!==String(record.hash)||JSON.stringify(proof)!==JSON.stringify(record.proofRecord))return json(res,400,{error:'Rapor özeti içerikle eşleşmiyor.'});let signer;try{signer=await verifyMemo(String(record.signature),proof.record_id,digest)}catch(e){return json(res,502,{error:e.message||'Devnet kanıtı doğrulanamadı.'})}
      const saved={...record,record_id:proof.record_id,proofRecord:proof,vin,source:proof.source,institution_id:org.id,institution_name:org.name,issuer_user_id:u.id,issuer_name:u.name,issuer:signer,chain_verified:true,status:'AutoTrace yetkili kurum kaydı · Solana Devnet kanıtı doğrulandı',created_at:now(),warn:false};
      const {rows:existing}=await pool.query('SELECT issuer_user_id FROM records WHERE record_id=$1',[saved.record_id]);if(existing[0]&&existing[0].issuer_user_id!==u.id)return json(res,409,{error:'Bu kayıt kodu başka bir kurum hesabına ait.'});
      await pool.query(`INSERT INTO records(record_id,vin,body_json,issuer_user_id,institution_id,created_at) VALUES($1,$2,$3::jsonb,$4,$5,$6)
        ON CONFLICT(record_id) DO UPDATE SET vin=EXCLUDED.vin,body_json=EXCLUDED.body_json,created_at=EXCLUDED.created_at WHERE records.issuer_user_id=EXCLUDED.issuer_user_id`,[saved.record_id,vin,JSON.stringify(saved),u.id,org.id,saved.created_at]);return json(res,201,{record:saved});
    }
    if(p==='/api/institutions'&&req.method==='GET'){const {rows}=await pool.query('SELECT name,type,email,status,created_at FROM institutions ORDER BY name');return json(res,200,{institutions:rows});}
    return json(res,404,{error:'API uç noktası bulunamadı.'});
  } catch(error) { console.error('AutoTrace API error',error); return json(res,500,{error:'Sunucu işlemi tamamlayamadı.'}); }
};
