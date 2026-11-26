const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'autotrace.sqlite');
const ADMIN_CONFIG_PATH = path.join(DATA_DIR, 'admin-account.json');
const PORT = Number(process.env.PORT || 4177);
const HOST = process.env.HOST || '127.0.0.1';
const DEVNET_RPC_URL = process.env.AUTOTRACE_DEVNET_RPC || 'https://api.devnet.solana.com';
const AUTOTRACE_PROGRAM_ID = 'DdgCkKAxxCm6jAy5bss4mkCq9djBw9KNHDaqxjmT7ChV';
const COOKIE = 'autotrace_session';
const SESSION_DAYS = 2;
fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec(`
 PRAGMA journal_mode = WAL;
 CREATE TABLE IF NOT EXISTS institutions (
   id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL,
   email TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('approved','pending')),
   created_at TEXT NOT NULL
 );
 CREATE TABLE IF NOT EXISTS users (
   id TEXT PRIMARY KEY, institution_id TEXT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
   password_salt TEXT NOT NULL, password_hash TEXT NOT NULL,
   role TEXT NOT NULL CHECK(role IN ('admin','issuer')),
   status TEXT NOT NULL CHECK(status IN ('approved','pending')),
   created_at TEXT NOT NULL,
   FOREIGN KEY(institution_id) REFERENCES institutions(id)
 );
 CREATE TABLE IF NOT EXISTS sessions (
   token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at INTEGER NOT NULL,
   FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
 );
 CREATE TABLE IF NOT EXISTS applications (
   id TEXT PRIMARY KEY, institution_name TEXT NOT NULL, institution_type TEXT NOT NULL,
   contact_name TEXT NOT NULL, email TEXT NOT NULL, password_salt TEXT NOT NULL,
   password_hash TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('pending','approved','rejected')),
   created_at TEXT NOT NULL
 );
 CREATE TABLE IF NOT EXISTS records (
   record_id TEXT PRIMARY KEY, vin TEXT NOT NULL, body_json TEXT NOT NULL,
   issuer_user_id TEXT NOT NULL, institution_id TEXT NOT NULL, created_at TEXT NOT NULL,
   FOREIGN KEY(issuer_user_id) REFERENCES users(id),
   FOREIGN KEY(institution_id) REFERENCES institutions(id)
 );
 CREATE INDEX IF NOT EXISTS records_vin_idx ON records(vin);
`);

const isoNow = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const password = (value, salt = crypto.randomBytes(16).toString('hex')) => ({
  salt,
  hash: crypto.scryptSync(value, salt, 64).toString('hex')
});

function seedUser(email, pass, name, role, institutionId = null) {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return;
  const pw = password(pass);
  db.prepare(`INSERT INTO users (id,institution_id,name,email,password_salt,password_hash,role,status,created_at)
    VALUES (?,?,?,?,?,?,?,?,?)`).run(id(), institutionId, name, email, pw.salt, pw.hash, role, 'approved', isoNow());
}

function loadAdminConfig() {
  try {
    const config=JSON.parse(fs.readFileSync(ADMIN_CONFIG_PATH,'utf8'));
    if (!config.email || !config.passwordSalt || !config.passwordHash) throw new Error('Invalid admin config');
    return config;
  } catch {
    const pw=password('AutoTraceDemo2026!');
    const config={email:'admin@autotrace.test',passwordSalt:pw.salt,passwordHash:pw.hash};
    fs.writeFileSync(ADMIN_CONFIG_PATH,JSON.stringify(config,null,2),{encoding:'utf8',mode:0o600});
    return config;
  }
}

function ensureAdminAccount() {
  const config=loadAdminConfig();
  const existing=db.prepare("SELECT id,email,password_salt,password_hash FROM users WHERE role='admin' LIMIT 1").get();
  if (existing) {
    if (existing.email!==config.email || existing.password_salt!==config.passwordSalt || existing.password_hash!==config.passwordHash) {
      db.prepare('DELETE FROM sessions WHERE user_id=?').run(existing.id);
      db.prepare(`UPDATE users SET institution_id=NULL,name=?,email=?,password_salt=?,password_hash=?,status='approved' WHERE id=?`)
        .run('AutoTrace Demo Administrator',config.email,config.passwordSalt,config.passwordHash,existing.id);
    }
    return;
  }
  db.prepare(`INSERT INTO users (id,institution_id,name,email,password_salt,password_hash,role,status,created_at) VALUES (?,NULL,?,?,?,?,?,'approved',?)`)
    .run(id(),'AutoTrace Demo Administrator',config.email,config.passwordSalt,config.passwordHash,'admin',isoNow());
}

if (!db.prepare('SELECT 1 FROM institutions LIMIT 1').get()) {
  const orgs = [
    ['org-demo-sigorta', 'Örnek Ufuk Sigorta', 'Sigorta şirketi', 'iletisim@ufuk-sigorta.test'],
    ['org-demo-ekspertiz', 'Örnek Mercek Ekspertiz', 'Ekspertiz firması', 'rapor@mercek-ekspertiz.test'],
    ['org-demo-servis', 'Örnek Rota Servis Merkezi', 'Yetkili servis', 'servis@rota-otomotiv.test']
  ];
  const addOrg = db.prepare('INSERT INTO institutions (id,name,type,email,status,created_at) VALUES (?,?,?,?,?,?)');
  for (const [orgId, name, type, email] of orgs) addOrg.run(orgId, name, type, email, 'approved', isoNow());
  seedUser('sigorta@ufuk-sigorta.test', 'UfukDemo2026!', 'Örnek Sigorta Yetkilisi', 'issuer', orgs[0][0]);
  seedUser('ekspertiz@mercek-ekspertiz.test', 'MercekDemo2026!', 'Örnek Ekspertiz Yetkilisi', 'issuer', orgs[1][0]);
  seedUser('servis@rota-otomotiv.test', 'RotaDemo2026!', 'Örnek Servis Yetkilisi', 'issuer', orgs[2][0]);
}
ensureAdminAccount();
// Public jury credentials are separate from the owner's private administrator account.
seedUser('reviewer@autotrace.test', 'AutoTraceReview2026!', 'AutoTrace Demo Reviewer', 'admin');
function seedSampleApplications() {
  const insert=db.prepare(`INSERT OR IGNORE INTO applications
    (id,institution_name,institution_type,contact_name,email,password_salt,password_hash,status,created_at)
    VALUES(?,?,?,?,?,?,?,'pending',?)`);
  const samples=[
    ['sample-app-blue-harbor','Blue Harbor Insurance (sample)','Sigorta şirketi','Demo Claims Contact','claims@blueharbor-insurance.test'],
    ['sample-app-clearview','Clearview Inspection Group (sample)','Ekspertiz firması','Demo Inspection Contact','applications@clearview-inspection.test'],
    ['sample-app-cedar','Cedar Motor Works (sample)','Yetkili servis','Demo Service Contact','intake@cedar-motorworks.test']
  ];
  for(const [appId,institution,type,contact,email] of samples){
    const pw=password('SampleApproval2026!');
    insert.run(appId,institution,type,contact,email,pw.salt,pw.hash,isoNow());
  }
}
seedSampleApplications();

const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.ico':'image/x-icon' };
function send(res, status, data, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(JSON.stringify(data));
}
function cookieValue(req, name) {
  const raw = req.headers.cookie || '';
  const item = raw.split(';').map(x => x.trim()).find(x => x.startsWith(name + '='));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : '';
}
function userFromRequest(req) {
  const raw = cookieValue(req, COOKIE);
  if (!raw) return null;
  const row = db.prepare(`SELECT u.id,u.name,u.email,u.role,u.status,u.institution_id,
      i.name AS institution_name,i.type AS institution_type,s.expires_at
    FROM sessions s JOIN users u ON u.id=s.user_id
    LEFT JOIN institutions i ON i.id=u.institution_id WHERE s.token_hash=?`).get(crypto.createHash('sha256').update(raw).digest('hex'));
  if (!row || row.expires_at < Date.now() || row.status !== 'approved') return null;
  return row;
}
function publicUser(user) {
  return { id:user.id, name:user.name, email:user.email, role:user.role,
    institutionId:user.institution_id, institutionName:user.institution_name || 'AutoTrace',
    institutionType:user.institution_type || 'Administration' };
}
function decodeBase58(value) {
  const alphabet='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const bytes=[0];
  for (const char of String(value)) {
    let carry=alphabet.indexOf(char);
    if(carry<0)throw new Error('Solana instruction encoding is invalid.');
    for(let i=0;i<bytes.length;i++){carry+=bytes[i]*58;bytes[i]=carry&255;carry>>=8;}
    while(carry){bytes.push(carry&255);carry>>=8;}
  }
  let zeros=0;while(zeros<String(value).length&&String(value)[zeros]==='1')zeros++;
  const body=bytes.reverse();if(body.length===1&&body[0]===0)body.length=0;
  return Buffer.from([...new Array(zeros).fill(0),...body]);
}
function proofInstruction(recordId,digest) {
  const clean=String(recordId||'').replaceAll('-','');
  if(!/^[0-9a-f]{32}$/i.test(clean)||!/^[0-9a-f]{64}$/i.test(String(digest||'')))throw new Error('AutoTrace proof values are invalid.');
  const discriminator=crypto.createHash('sha256').update('global:anchor_report').digest().subarray(0,8);
  return Buffer.concat([discriminator,Buffer.from(clean,'hex'),Buffer.from(String(digest),'hex')]);
}
async function verifyDevnetProgram(signature, recordId, digest) {
  if (!/^[1-9A-HJ-NP-Za-km-z]{80,90}$/.test(String(signature || ''))) throw new Error('The Solana transaction signature format is invalid.');
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
  try {
    const response=await fetch(DEVNET_RPC_URL,{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,
      body:JSON.stringify({jsonrpc:'2.0',id:1,method:'getTransaction',params:[signature,{commitment:'confirmed',encoding:'jsonParsed',maxSupportedTransactionVersion:0}]})});
    if (!response.ok) throw new Error('The Solana Devnet verification service did not respond.');
    const payload=await response.json();
    if (payload.error) throw new Error('Could not verify the Solana transaction on Devnet.');
    const tx=payload.result;
    if (!tx) throw new Error('Transaction not found on Devnet or not yet finalized.');
    if (tx.meta?.err) throw new Error('The Solana transaction failed.');
    if (!tx.transaction?.signatures?.includes(signature)) throw new Error('The signature does not match the Devnet transaction.');
    const instructions=tx.transaction.message?.instructions||[];
    const proofIx=instructions.find(ix=>String(ix.programId)===AUTOTRACE_PROGRAM_ID);
    if(!proofIx)throw new Error('The transaction does not call the AutoTrace program.');
    if(!decodeBase58(proofIx.data||'').equals(proofInstruction(recordId,digest)))throw new Error('AutoTrace program instruction does not match this report.');
    const signer=tx.transaction.message.accountKeys?.find(key=>key.signer);
    if (!signer) throw new Error('Could not identify the wallet that signed the transaction.');
    return String(signer.pubkey);
  } catch (err) {
    if (err.name==='AbortError') throw new Error('Devnet verification timed out. Please try again.');
    throw err;
  } finally { clearTimeout(timeout); }
}
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw='';
    req.on('data', chunk => { raw += chunk; if (raw.length > 1024 * 1024) reject(new Error('The request is too large.')); });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { reject(new Error('Invalid JSON.')); } });
    req.on('error', reject);
  });
}
async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/') && req.method !== 'GET') {
    const origin = req.headers.origin;
    if (origin && new URL(origin).host !== req.headers.host) return send(res, 403, { error:'This origin is not allowed.' });
  }
  try {
    if (url.pathname === '/api/health') return send(res, 200, { ok:true, mode:'local-demo', chainRequired:true, chainProgram:AUTOTRACE_PROGRAM_ID, chainNetwork:'devnet', version:'autotrace-program-v1' });
    if (url.pathname === '/api/verify-proof' && req.method === 'GET') {
      const signature=String(url.searchParams.get('signature')||''),recordId=String(url.searchParams.get('record_id')||''),digest=String(url.searchParams.get('sha256')||'');
      try { const signer=await verifyDevnetProgram(signature,recordId,digest); return send(res,200,{verified:true,network:'devnet',program:AUTOTRACE_PROGRAM_ID,signer,record_id:recordId,sha256:digest,signature}); }
      catch(err) { return send(res,422,{verified:false,error:err.message||'AutoTrace proof verification failed.'}); }
    }
    if (url.pathname === '/api/session' && req.method === 'GET') {
      const user = userFromRequest(req);
      return send(res, 200, { user:user ? publicUser(user) : null });
    }
    if (url.pathname === '/api/login' && req.method === 'POST') {
      const body = await parseBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const row = db.prepare('SELECT * FROM users WHERE email=? AND status=\'approved\'').get(email);
      if (!row || !crypto.timingSafeEqual(Buffer.from(password(String(body.password || ''), row.password_salt).hash, 'hex'), Buffer.from(row.password_hash, 'hex'))) {
        return send(res, 401, { error:'Incorrect email or password. Use an approved demo account.' });
      }
      const token = crypto.randomBytes(32).toString('base64url');
      const expires = Date.now() + SESSION_DAYS * 86400_000;
      db.prepare('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,?)')
        .run(crypto.createHash('sha256').update(token).digest('hex'), row.id, expires);
      return send(res, 200, { user:publicUser(userFromRequest({headers:{cookie:`${COOKIE}=${token}`}})) }, {
        'Set-Cookie':`${COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_DAYS * 86400}`
      });
    }
    if (url.pathname === '/api/logout' && req.method === 'POST') {
      const token = cookieValue(req, COOKIE);
      if (token) db.prepare('DELETE FROM sessions WHERE token_hash=?').run(crypto.createHash('sha256').update(token).digest('hex'));
      return send(res, 200, { ok:true }, { 'Set-Cookie':`${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0` });
    }
    if (url.pathname === '/api/applications' && req.method === 'POST') {
      const b = await parseBody(req);
      const institutionName=String(b.institutionName||'').trim(), institutionType=String(b.institutionType||'').trim();
      const contactName=String(b.contactName||'').trim(), email=String(b.email||'').trim().toLowerCase(), pass=String(b.password||'');
      if (institutionName.length<3 || institutionName.length>100 || contactName.length<2 || contactName.length>80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || pass.length<10 || !['Sigorta şirketi','Ekspertiz firması','Yetkili servis'].includes(institutionType)) return send(res, 400, { error:'Check the fields. The password must be at least 10 characters.' });
      if (db.prepare('SELECT id FROM users WHERE email=?').get(email) || db.prepare('SELECT id FROM applications WHERE email=? AND status=\'pending\'').get(email)) return send(res, 409, { error:'An account or pending application already exists for this email.' });
      const pw=password(pass), appId=id();
      db.prepare(`INSERT INTO applications (id,institution_name,institution_type,contact_name,email,password_salt,password_hash,status,created_at) VALUES (?,?,?,?,?,?,?,?,?)`)
        .run(appId,institutionName,institutionType,contactName,email,pw.salt,pw.hash,'pending',isoNow());
      return send(res, 201, { ok:true, message:'Application submitted for review by the AutoTrace demo administrator.' });
    }
    if (url.pathname === '/api/admin/applications' && req.method === 'GET') {
      const admin=userFromRequest(req);
      if (!admin || admin.role!=='admin') return send(res, 403, { error:'This action requires an AutoTrace administrator account.' });
      const rows=db.prepare(`SELECT id,institution_name,institution_type,contact_name,email,created_at FROM applications WHERE status='pending' ORDER BY created_at`).all();
      return send(res, 200, { applications:rows });
    }
    const approveMatch=url.pathname.match(/^\/api\/admin\/applications\/([\w-]+)\/approve$/);
    if (approveMatch && req.method==='POST') {
      const admin=userFromRequest(req);
      if (!admin || admin.role!=='admin') return send(res, 403, { error:'This action requires an AutoTrace administrator account.' });
      const app=db.prepare(`SELECT * FROM applications WHERE id=? AND status='pending'`).get(approveMatch[1]);
      if (!app) return send(res, 404, { error:'No pending application was found.' });
      if (db.prepare('SELECT id FROM users WHERE email=?').get(app.email)) return send(res, 409, { error:'A user with this email already exists.' });
      const orgId=id(), userId=id();
      db.exec('BEGIN IMMEDIATE');
      try {
        db.prepare('INSERT INTO institutions (id,name,type,email,status,created_at) VALUES (?,?,?,?,?,?)').run(orgId,app.institution_name,app.institution_type,app.email,'approved',isoNow());
        db.prepare(`INSERT INTO users (id,institution_id,name,email,password_salt,password_hash,role,status,created_at) VALUES (?,?,?,?,?,?,?,?,?)`).run(userId,orgId,app.contact_name,app.email,app.password_salt,app.password_hash,'issuer','approved',isoNow());
        db.prepare(`UPDATE applications SET status='approved' WHERE id=?`).run(app.id);
        db.exec('COMMIT');
      } catch (err) { db.exec('ROLLBACK'); throw err; }
      return send(res, 200, { ok:true, message:'The institution was approved and its user account was created.' });
    }
    const ownedRecordMatch=url.pathname.match(/^\/api\/records\/([\w-]+)$/);
    if (ownedRecordMatch && req.method==='GET') {
      const user=userFromRequest(req);
      if (!user || user.role!=='issuer') return send(res,403,{error:'An institution session is required.'});
      const row=db.prepare('SELECT body_json FROM records WHERE record_id=? AND issuer_user_id=?').get(ownedRecordMatch[1],user.id);
      if (!row) return send(res,404,{error:'No record was found for this institution user.'});
      return send(res,200,{record:JSON.parse(row.body_json)});
    }
    if (url.pathname === '/api/records' && req.method === 'GET') {
      const vin=String(url.searchParams.get('vin')||'').trim().toUpperCase();
      if (vin.length!==17) return send(res,400,{error:'A 17-character VIN is required to search vehicle history.'});
      const rows=db.prepare('SELECT body_json FROM records WHERE vin=? ORDER BY created_at').all(vin);
      return send(res, 200, { records:rows.map(r=>JSON.parse(r.body_json)).filter(r=>r.chain_verified===true && !!r.signature) });
    }
    if (url.pathname === '/api/records' && req.method === 'POST') {
      const user=userFromRequest(req);
      if (!user || user.role!=='issuer' || !user.institution_id) return send(res, 403, { error:'Sign in as an institution user approved by AutoTrace to submit a report.' });
      const org=db.prepare(`SELECT id,name,type,status FROM institutions WHERE id=?`).get(user.institution_id);
      if (!org || org.status!=='approved') return send(res, 403, { error:'This institution does not have active AutoTrace approval.' });
      const b=await parseBody(req), record=b.record;
      if (!record || !/^[A-HJ-NPR-Z0-9]{17}$/i.test(String(record.vin||'')) || !(record.reportNo||record.id) || !record.type || !record.details || !record.hash || !record.salt || !record.proofRecord || !record.signature) return send(res, 400, { error:'Required report fields are missing. A Solana Devnet proof is required.' });
      const normalizedVin=String(record.vin).toUpperCase();
      const allowedTypes={
        'Sigorta şirketi':['Accident / damage record','Insurance claim file'],
        'Ekspertiz firması':['Inspection report'],
        'Yetkili servis':['Repair / part replacement','Mileage report']
      };
      if (!allowedTypes[org.type]?.includes(String(record.type))) return send(res,403,{error:`This institution cannot submit this record type.`});
      const proofRecord={schema_version:1,record_id:String(record.record_id||record.recordId||''),report_no:String(record.reportNo||record.id),type:String(record.type),vin:normalizedVin,source:`${org.name} · ${org.type}`,date:String(record.date||''),details:String(record.details),pdf_sha256:record.proofRecord.pdf_sha256||null};
      if (!proofRecord.record_id || !/^\d{4}-\d{2}-\d{2}$/.test(proofRecord.date) || proofRecord.details.length>500 || proofRecord.report_no.length>40) return send(res,400,{error:'The report fields are not in the expected format.'});
      const expectedHash=crypto.createHash('sha256').update(String(record.salt)+'|'+JSON.stringify(proofRecord)).digest('hex');
      if (expectedHash!==String(record.hash) || JSON.stringify(proofRecord)!==JSON.stringify(record.proofRecord)) return send(res,400,{error:'The report proof digest does not match the content, or the institution details have changed.'});
      let chainSigner;
      try { chainSigner=await verifyDevnetProgram(String(record.signature),proofRecord.record_id,expectedHash); }
      catch (err) { return send(res,502,{error:err.message||'Could not verify the Solana Devnet proof.'}); }
      const safe={...record,record_id:proofRecord.record_id,proofRecord,vin:normalizedVin,source:`${org.name} · ${org.type}`,institution_id:org.id,institution_name:org.name,issuer_user_id:user.id,issuer_name:user.name,issuer:chainSigner,chain_verified:true,status:'AutoTrace-authorized institution record · Solana Devnet proof verified',created_at:isoNow(),warn:false};
      const existing=db.prepare('SELECT issuer_user_id FROM records WHERE record_id=?').get(safe.record_id);
      if (existing && existing.issuer_user_id!==user.id) return send(res,409,{error:'This record ID belongs to another institution account.'});
      if (existing) db.prepare('UPDATE records SET vin=?,body_json=?,created_at=? WHERE record_id=? AND issuer_user_id=?').run(safe.vin,JSON.stringify(safe),safe.created_at,safe.record_id,user.id);
      else db.prepare('INSERT INTO records (record_id,vin,body_json,issuer_user_id,institution_id,created_at) VALUES (?,?,?,?,?,?)').run(safe.record_id,safe.vin,JSON.stringify(safe),user.id,org.id,safe.created_at);
      return send(res, 201, { record:safe });
    }
    if (url.pathname === '/api/institutions' && req.method === 'GET') {
      const rows=db.prepare(`SELECT name,type,email,status,created_at FROM institutions ORDER BY name`).all();
      return send(res, 200, { institutions:rows });
    }
    if (url.pathname.startsWith('/api/')) return send(res, 404, { error:'API endpoint not found.' });
    const requested=decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const file=path.resolve(ROOT, '.' + requested);
    if (!file.startsWith(ROOT + path.sep) && file!==path.join(ROOT,'index.html')) return send(res,404,{error:'File not found.'});
    const stat=fs.statSync(file);
    if (!stat.isFile()) return send(res,404,{error:'File not found.'});
    res.writeHead(200, { 'Content-Type':mime[path.extname(file)]||'application/octet-stream', 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'strict-origin-when-cross-origin' });
    fs.createReadStream(file).pipe(res);
  } catch (err) {
    if (err.code==='SQLITE_CONSTRAINT_PRIMARYKEY' || err.code==='SQLITE_CONSTRAINT_UNIQUE') return send(res,409,{error:'This record ID or email is already in use.'});
    console.error(err);
    return send(res,500,{error:'The server could not complete the request.'});
  }
}

const server=http.createServer(handler);
server.listen(PORT,HOST,()=>console.log(`AutoTrace demo sunucusu: http://${HOST}:${PORT}`));
for (const sig of ['SIGINT','SIGTERM']) process.on(sig,()=>{ server.close(()=>{db.close();process.exit(0);}); });
