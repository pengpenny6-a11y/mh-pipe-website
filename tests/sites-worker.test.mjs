import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import worker from "../worker/index.js";

test("serves existing static assets without a fallback", async () => {
  const calls = [];
  const response = await worker.fetch(new Request("https://example.test/assets/app.js"), {
    ASSETS: {
      fetch: async (request) => {
        calls.push(new URL(request.url).pathname);
        return new Response("asset", { status: 200 });
      },
    },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/assets/app.js"]);
});

test("falls back to index.html for an unknown app route", async () => {
  const calls = [];
  const response = await worker.fetch(
    new Request("https://example.test/flow/step-two?source=share", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async (request) => {
          const url = new URL(request.url);
          calls.push(url.pathname + url.search);
          return new Response(url.pathname === "/index.html" ? "app" : "missing", {
            status: url.pathname === "/index.html" ? 200 : 404,
          });
        },
      },
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/flow/step-two?source=share", "/index.html"]);
});

test("does not turn missing API or write requests into the app shell", async () => {
  for (const request of [
    new Request("https://example.test/api/missing", { headers: { accept: "application/json" } }),
    new Request("https://example.test/flow", { method: "POST", headers: { accept: "text/html" } }),
  ]) {
    let calls = 0;
    const response = await worker.fetch(request, {
      ASSETS: {
        fetch: async () => {
          calls += 1;
          return new Response("missing", { status: 404 });
        },
      },
    });

    assert.equal(response.status, 404);
    assert.equal(calls, 1);
  }
});

test("emits the files required by Sites packaging", async () => {
  await access(new URL("../dist/client/index.html", import.meta.url));
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/.openai/hosting.json", import.meta.url));
});

import {handleInquiry} from '../worker/inquiries.js';
import {businessEmail} from '../worker/contact-address.js';

const origin='https://example.test';
const deliverySettings={RESEND_API_KEY:'isolated-test',INQUIRY_FROM:'site@sender.test'};
const requestId='40f98d54-8cc7-40ab-9980-36acd5ff27cf';
const brief={kind:'distribution',company:'Example',email:'buyer@example.test',market:'UK',products:'Ring-press couplings',details:'Please share the range.'};
function inquiry(body=brief,extra={}) {
  return new Request(origin+'/api/inquiries',{method:'POST',headers:{
    'content-type':'application/json',origin,'idempotency-key':requestId,...extra,
  },body:JSON.stringify(body)});
}

test('unconfigured inquiries disclose the email fallback before data entry and never send',async()=>{
  const response=await worker.fetch(new Request(origin+'/api/inquiries'),{});
  assert.deepEqual(await response.json(),{available:false});
  assert.match(response.headers.get('cache-control'),/no-store/);
  assert.equal((await worker.fetch(inquiry(),{})).status,503);
});

test('accepted inquiries use the fixed mailbox and an idempotent provider request',async()=>{
  const calls=[];
  const capture=async(url,init)=>{
    calls.push({url,body:JSON.parse(init.body),key:init.headers['Idempotency-Key']});
    return Response.json({id:'provider-test-id'});
  };
  const injected={...brief,to:'another@example.test',from:'another@example.test',model:'different intent'};
  for(let i=0;i<2;i++){
    const res=await handleInquiry(inquiry(injected),deliverySettings,capture);
    assert.equal(res.status,202);
    assert.deepEqual(await res.json(),{status:'accepted',reference:'MH-40F98D548CC7'});
  }
  assert.deepEqual(calls[0],calls[1]);
  assert.equal(calls[0].key,'mh-site/'+requestId);
  assert.equal(calls[0].url,'https://api.resend.com/emails');
  assert.deepEqual(calls[0].body.to,[businessEmail]);
  assert.equal(calls[0].body.from,deliverySettings.INQUIRY_FROM);
  assert.equal(calls[0].body.reply_to,brief.email);
  assert.match(calls[0].body.text,/Ring-press couplings/);
  assert.doesNotMatch(calls[0].body.text,/different intent/);
});

test('invalid origin, email, intent and overlong input fail before mail submission',async()=>{
  let called=false;
  const blocked=async()=>{called=true;throw new Error('unexpected send')};
  for(const [req,code] of [
    [inquiry(brief,{origin:'https://third-party.test'}),403],
    [inquiry({...brief,email:'invalid'}),422],
    [inquiry({...brief,kind:'other'}),422],
    [inquiry({...brief,details:' '}),422],
    [inquiry({...brief,details:'x'.repeat(40000)}),422],
  ]) assert.equal((await handleInquiry(req,deliverySettings,blocked)).status,code);
  assert.equal(called,false);
});

test('a rejection, network failure or malformed upstream receipt never confirms submission',async()=>{
  for(const [send,expectedCode] of [
    [async()=>Response.json({}, {status:429}),429],
    [async()=>Response.json({}),502],
    [async()=>{throw new Error('offline')},502],
  ]) {
    const res=await handleInquiry(inquiry(brief,{'cf-connecting-ip':'192.0.2.17'}),deliverySettings,send);
    assert.equal(res.status,expectedCode);
    assert.equal((await res.json()).reference,undefined);
  }
});

test('repeated inquiries from the same edge address are throttled',async()=>{
  let sent=0;
  const capture=async()=>{sent++;return Response.json({id:'test'})};
  for(let i=0;i<9;i++) {
    const res=await handleInquiry(inquiry(brief,{'cf-connecting-ip':'192.0.2.18'}),deliverySettings,capture);
    assert.equal(res.status,i<8?202:429);
  }
  assert.equal(sent,8);
});
