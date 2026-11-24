import {useEffect, useRef, useState} from 'react';

const endpoint = '/api/inquiries';
const attemptKey = 'mh-inquiry-attempt-v1';

// Keep the key across a reload after an interrupted network response. Only a
// digest lives here. The contact page owns the editable values in its draft.
async function submissionKey(body, memory) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
  const digest = Array.from(new Uint8Array(bytes), n=>n.toString(16).padStart(2,'0')).join('');
  let previous = memory.current;
  if (!previous) {
    try { previous = JSON.parse(sessionStorage.getItem(attemptKey)); } catch {}
  }
  if (previous?.digest === digest && typeof previous.key === 'string') return previous.key;
  const next = {digest, key:crypto.randomUUID()};
  memory.current = next;
  try { sessionStorage.setItem(attemptKey, JSON.stringify(next)); } catch {}
  return next.key;
}

export function useInquiryDelivery() {
  const [channel, setChannel] = useState('checking');
  const [result, setResult] = useState({state:'idle'});
  const busy = useRef(false), memory = useRef(null);

  useEffect(()=>{
    let live = true;
    fetch(endpoint, {headers:{Accept:'application/json'}, cache:'no-store', signal:AbortSignal.timeout(4500)})
      .then(response=>response.ok ? response.json() : null)
      .then(data=>{if(live) setChannel(data?.available === true ? 'online' : 'email');})
      .catch(()=>{if(live) setChannel('email');});
    return ()=>{live = false;};
  },[]);

  async function submit(payload) {
    if (busy.current) return;
    busy.current = true;
    setResult({state:'sending'});
    try {
      const body = JSON.stringify(payload);
      const key = await submissionKey(body,memory);
      const response = await fetch(endpoint, {
        method:'POST', headers:{'Content-Type':'application/json','Idempotency-Key':key},
        body, signal:AbortSignal.timeout(13000),
      });
      const receipt = await response.json();
      if (response.status === 202 && receipt.status === 'accepted' && /^MH-[0-9A-F]{12}$/.test(receipt.reference)) {
        setResult({state:'accepted',reference:receipt.reference});
      } else {
        if (response.status === 503) setChannel('email');
        setResult({state:response.status === 422 ? 'invalid' : response.status === 429 ? 'busy' : 'unconfirmed'});
      }
    } catch { setResult({state:'unconfirmed'}); }
    finally { busy.current = false; }
  }

  return {channel, result, submit, reset:()=>setResult({state:'idle'})};
}
