const i=new Map,l=1440*60*1e3;async function p(t){const n="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",o="https://api.perplexity.ai/chat/completions";try{console.log("🤖 Используем Perplexity AI для разворачивания короткой ссылки:",t);const e=await fetch(o,{method:"POST",headers:{Authorization:`Bearer ${n}`,"Content-Type":"application/json"},body:JSON.stringify({model:"sonar",messages:[{role:"system",content:"You are a URL expander. When given a short URL, you need to access it and return the FULL expanded URL. Only return the URL, nothing else."},{role:"user",content:`Please expand this short Google Maps URL and return ONLY the full URL (nothing else, no explanation):

${t}

Important: 
- Visit the URL and get the final destination
- Return ONLY the full URL starting with https://
- The URL should contain coordinates like @6.0135,80.2410 or similar
- Do not add any explanation, just the URL`}],temperature:.2,max_tokens:500})});if(!e.ok)throw new Error(`Perplexity API error: ${e.status}`);const a=(await e.json()).choices[0].message.content.trim();console.log("🤖 AI ответ:",a);const r=a.match(/https:\/\/[^\s]+/);if(r){const s=r[0];return console.log("✅ Perplexity AI развернул ссылку:",s),s}return console.warn("⚠️ AI не вернул валидный URL"),null}catch(e){return console.error("❌ Ошибка Perplexity AI при разворачивании URL:",e),null}}function c(){const t=Date.now();for(const[n,o]of i.entries())t-o.timestamp>l&&i.delete(n)}setInterval(c,3600*1e3);export{c as clearExpiredCache,p as expandShortUrlWithAI};
