// Local-only PNG alpha overlay audit against a user-supplied RGBA platform
// screenshot. Neither private bytes nor local filenames are uploaded/logged.
import {readFileSync} from 'node:fs';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {auditOverlayMask} from '../src/creative/mask-collision.mjs';

const paths=process.argv.slice(2);
if(paths.length!==2)throw new Error('Usage: check-alpha-mask <local-mask.png> <local-overlay.png>');
function readPng(path){
 const bytes=readFileSync(path);
 if(bytes.length>30*1024*1024||bytes.length<32||
   bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')
   throw new Error('Input must be a bounded local PNG');
 return bytes;
}
const read=async path=>{
 const image=await loadImage(readPng(path));
 if(image.width<1||image.height<1||image.width*image.height>8_294_400)
   throw new Error('Oversized or invalid image');
 const canvas=createCanvas(image.width,image.height);
 const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
 return {width:image.width,height:image.height,
   data:ctx.getImageData(0,0,image.width,image.height).data};
};
const [mask,overlay]=await Promise.all(paths.map(read));
const report=auditOverlayMask(overlay,mask);
console.log(JSON.stringify({status:report.status,
  covered_pixels:report.collision_pixels,visible_pixels:report.overlay_pixels,
  fraction:report.collision_ratio,
  technical_geometry_pass:report.collision_pixels===0&&report.overlay_pixels>0,
  platform_final_approval:'PENDING_HUMAN_REVIEW'}));
if(report.collision_pixels||!report.overlay_pixels)process.exitCode=2;
