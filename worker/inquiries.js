import {businessEmail} from './contact-address.js';

const labels = {
  distribution: {'products':'Products of interest', 'channel':'Sales channels'},
  project: {'application':'Application', 'timing':'Preferred delivery window'},
  technical: {'model':'Product / model', 'reference':'Order / batch'},
};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const email = /^[^\s@<>\x00-\x1f]+@[^\s@<>\x00-\x1f]+\.[^\s@<>\x00-\x1f]+$/;
const bodyLimit = 32 * 1024;
const recent = new Map();

// A small burst budget per Worker instance, in addition to the mail provider's
// account limits. The edge supplies the client address; the form cannot set it.
function maySend(address) {
  const now=Date.now();
  const bucket=recent.get(address);
  if (bucket && bucket.until>now) {
    if (bucket.count>=8) return false;
    bucket.count++;
    return true;
  }
  if (recent.size>=2048) {
    for (const [key,value] of recent) if (value.until<=now) recent.delete(key);
    if (recent.size>=2048) return false;
  }
  recent.set(address,{until:now+60000,count:1});
  return true;
}

function json(data, status = 200) {
  return Response.json(data, {status, headers:{'Cache-Control':'no-store'}});
}

async function readBody(request) {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let text = '', bytes = 0;
  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > bodyLimit) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, {stream:true});
  }
  return JSON.parse(text + decoder.decode());
}

export async function handleInquiry(request, env, send = fetch) {
  const available = Boolean(env.RESEND_API_KEY && env.INQUIRY_FROM);
  if (request.method === 'GET') return json({available});
  if (request.method !== 'POST') return json({error:'method'},405);
  if (request.headers.get('origin') !== new URL(request.url).origin) return json({error:'origin'},403);
  if (!available) return json({error:'unavailable'},503);
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') return json({error:'format'},415);
  const key = request.headers.get('idempotency-key') || '';
  if (!uuid.test(key)) return json({error:'request-key'},400);

  let body;
  try { body = await readBody(request); } catch { return json({error:'invalid-input'},422); }
  if (!body || typeof body.kind !== 'string' || !Object.hasOwn(labels,body.kind)) return json({error:'invalid-input'},422);
  const fields = {company:'Company',email:'Email',market:'Country / region',...labels[body.kind],details:'Requirements'};
  const values = {};
  for (const key of Object.keys(fields)) {
    const value = body[key] ?? '';
    if (typeof value !== 'string' || value.length > (key === 'details' ? 5000 : 240)) return json({error:'invalid-input'},422);
    values[key] = value.trim();
  }
  if (!values.company || !email.test(values.email) || !values.details) return json({error:'invalid-input'},422);
  if (!maySend(request.headers.get('cf-connecting-ip') || 'shared')) return json({error:'busy'},429);

  const reference = 'MH-' + key.replaceAll('-','').slice(0,12).toUpperCase();
  const text = Object.entries(fields).filter(([name])=>values[name])
    .map(([name,label])=>label + ': ' + values[name]).join('\n');
  try {
    const response = await send('https://api.resend.com/emails', {
      method:'POST',
      headers:{
        'Authorization':'Bearer '+env.RESEND_API_KEY,
        'Content-Type':'application/json',
        'Idempotency-Key':'mh-site/'+key,
      },
      signal:AbortSignal.timeout(9000),
      body:JSON.stringify({
        from:env.INQUIRY_FROM, to:[businessEmail], reply_to:values.email,
        subject:'MH PIPE · '+body.kind+' inquiry · '+reference,
        text,
      }),
    });
    if (response.status === 429) return json({error:'busy'},429);
    if (!response.ok || !(await response.json())?.id) return json({error:'unconfirmed'},502);
    return json({status:'accepted',reference},202);
  } catch {
    return json({error:'unconfirmed'},502);
  }
}
