if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return r[e]||(s=new Promise((async s=>{if("document"in self){const r=document.createElement("script");r.src=e,document.head.appendChild(r),r.onload=s}else importScripts(e),s()}))),s.then((()=>{if(!r[e])throw new Error(`Module ${e} didn’t register its module`);return r[e]}))},s=(s,r)=>{Promise.all(s.map(e)).then((e=>r(1===e.length?e[0]:e)))},r={require:Promise.resolve(s)};self.define=(s,c,i)=>{r[s]||(r[s]=Promise.resolve().then((()=>{let r={};const n={uri:location.origin+s.slice(1)};return Promise.all(c.map((s=>{switch(s){case"exports":return r;case"module":return n;default:return e(s)}}))).then((e=>{const s=i(...e);return r.default||(r.default=s),r}))})))}}define("./sw.js",["./workbox-0d951683"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"css/app.656bb332.css",revision:"879dec254187ab4bb716dffdd65d3849"},{url:"css/chunk-vendors.cef9cdfc.css",revision:"207b24b13a6d2e891fc4dfa6a57eb8d7"},{url:"index.html",revision:"6909d242cf8da4fe0ea221c16f2b7278"},{url:"js/app.9bc3a88e.js",revision:"3309fde68abe92ce5d5b7367728356be"},{url:"js/chunk-vendors.ef36ca46.js",revision:"1cacd84567e824c910dcb8180fccf72a"},{url:"sql-wasm.js",revision:"eea55d481cf4aeb2bc2d7c90eec64a25"},{url:"sql-wasm.wasm",revision:"ea7edc8cc0702b48cc93bf41e5b6cc61"}],{}),e.cleanupOutdatedCaches()}));