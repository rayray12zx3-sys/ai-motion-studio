// Only checks the recorded creative assets of a generated movie. This gate
// cannot establish all jurisdictional patent/trademark/personality rights.
const exact=(o,fields)=>o!==null&&typeof o==='object'&&!Array.isArray(o)&&
  Object.keys(o).sort().join(',')===fields.slice().sort().join(',');
export function verifyNoAttributionCreativeAssets(spec){
  if(!spec?.asset_manifest||!Array.isArray(spec.asset_manifest.assets))
    throw new Error('Missing creative asset manifest');
  const audited=[];
  for(const asset of spec.asset_manifest.assets){
    if(!exact(asset,['id','path','type','sha256','width','height','license','source'])||
      asset.license!=='CC0-1.0'||asset.type!=='image/png'||
      typeof asset.source!=='string'||!asset.source.trim()||
      typeof asset.sha256!=='string'||!/^[a-f0-9]{64}$/.test(asset.sha256))
      throw new Error('Creative asset requires CC0, local provenance and a digest; BY/MIT/OFL/GPL art blocked');
    audited.push({id:asset.id,license:asset.license,source:asset.source,sha256:asset.sha256});
  }
  // Fonts: pinned OFL allows text in artwork without attribution; distributing
  // the font software has separate notice obligations.
  return {media_asset_attribution:'NOT_REQUIRED_BY_RECORDED_CC0',
    creative_assets:audited,production_license_clearance:'REQUIRES_HUMAN_REVIEW',
    additional_checks:['actual asset ownership/source','copyright and trademark','portrait/privacy rights',
      'encoder distribution obligations','H.264 patent/territory/platform requirements']};
}
