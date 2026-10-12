import test from "node:test";
import assert from "node:assert/strict";
import {preflightCreativeTreatment as validate} from "../src/treatment.mjs";
import {kinetic,spatial} from "../examples/two-original-briefs.mjs";
const clone=v=>structuredClone(v);
test("two unlike real briefs with different rhythm and techniques pass without art approval",()=>{
 const a=validate(kinetic),b=validate(spatial);
 assert.equal(a.pass,true);assert.equal(a.mode,"beat-led");assert.equal(a.fps,60);
 assert.equal(b.pass,true);assert.equal(b.mode,"cinematic");assert.equal(b.fps,30);
 assert.equal(a.seconds,15);assert.equal(b.seconds,20);
 assert.equal(a.quality,"PENDING_HUMAN");assert.equal(b.quality,"PENDING_HUMAN");
 assert.notDeepEqual(a.shots.map(s=>s.camera),b.shots.map(s=>s.camera));
});
test("meaningful concept, signature and palette required",()=>{
 const a=clone(kinetic);a.concept="";assert.throws(()=>validate(a),/concept/);
 const b=clone(kinetic);b.signature.shotId="lost";assert.throws(()=>validate(b),/Signature/);
 const c=clone(kinetic);c.visual.palette=["#000000"];assert.throws(()=>validate(c),/palette/);
});
test("continuity must preserve objects, and whole-film timeline must be complete",()=>{
 const a=clone(spatial);a.shots[1].bridge.from="random-new-card";assert.throws(()=>validate(a),/Lost persistent/);
 const b=clone(kinetic);b.shots[1].start=181;assert.throws(()=>validate(b),/gap/);
 const c=clone(kinetic);c.shots.at(-1).end=890;assert.throws(()=>validate(c),/Incomplete/);
});
test("rhythm cannot be blindly imposed across different film types",()=>{
 const a=clone(kinetic);a.shots[1].actions[0].start=187;assert.throws(()=>validate(a),/off the authored beat/);
 const b=clone(spatial);b.rhythm.bpm=120;assert.throws(()=>validate(b),/mandatory music beat/);
 const c=clone(kinetic);c.audio.mode="silent";assert.throws(()=>validate(c),/original sound/);
});
test("focal conflict, unreadably short text and private-media shortcuts fail closed",()=>{
 const a=clone(kinetic);
 a.shots[1].actions.push({kind:"morph",start:200,end:260,focal:true,why:"Secondary animation"});
 a.shots[1].actions.push({kind:"draw",start:200,end:260,focal:true,why:"Third competing animation"});
 assert.throws(()=>validate(a),/simultaneous/);
 const b=clone(spatial);b.shots[3].readings[0].end=540;assert.throws(()=>validate(b),/text reading/);
 const c=clone(kinetic);c.rights.assetPolicy="download-anything";assert.throws(()=>validate(c),/not approved/);
});
test("unsupported engines or unmotivated cuts do not pass",()=>{
 const a=clone(kinetic);a.shots[2].technique="secret-engine";assert.throws(()=>validate(a),/technique/);
 const b=clone(spatial);b.shots[2].bridge.kind="random";assert.throws(()=>validate(b),/transition logic/);
});
