import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {splitK09Text,makePrivateK09Gallery} from './private-k09-layout.mjs';
const UUID='e03912dc-53e3-4b28-8e41-f8de0e0fc32f';
const job=text=>({schema:1,job_id:UUID,effect_id:'K09',text,
  resolution:'1920x1080',fps:24,duration_seconds:2.5});
const html=await readFile(new URL('./gallery.html',import.meta.url),'utf8');
test('semantic punctuation is a motion handoff',()=>{
 assert.deepEqual(splitK09Text('真的嗎？你確定？'),['真的嗎？','你確定？']);
 assert.deepEqual(splitK09Text('先等等！現在開始'),['先等等！','現在開始']);
 assert.deepEqual(splitK09Text('短句測試'),['短句','測試']);
});
test('trusted gallery uses textContent-bound text segments',()=>{
 const out=makePrivateK09Gallery(html,job('真的嗎？你確定？'));
 assert.match(out,/const __k09=\["真的嗎？","你確定？"\]/u);
 assert.match(out,/item\(__k09\[0\]/u);
 assert.match(out,/item\(__k09\[1\]/u);
 assert.match(out,/\.textContent=txt/u);
 assert.doesNotMatch(out,/const old=item\('真的嗎？'/u);
 assert.ok(out.includes('window.renderAt'));
});
test('HTML script payload is escaped before embedding',()=>{
 const input='A</script>？B';
 const out=makePrivateK09Gallery(html,job(input));
 assert.doesNotMatch(out,/A<\/script>？B/u);
 assert.ok(out.includes(String.fromCharCode(92)+'u003C/script'));
});
test('invalid job, one-character or too-long text rejected',()=>{
 for(const str of ['', '只', 'a'.repeat(33), 'ABC\nDEF', 'a'.repeat(72)])
   assert.throws(()=>makePrivateK09Gallery(html,job(str)));
 assert.throws(()=>makePrivateK09Gallery(html,{...job('正常嗎？正常。'),url:'https://example.org'}));
 assert.throws(()=>makePrivateK09Gallery(html,{...job('正常嗎？正常。'),effect_id:'K01'}));
 assert.throws(()=>makePrivateK09Gallery('<html></html>',job('真的嗎？你確定？')));
});
