// Pure rights metadata validator. Never loads or logs private material bytes.
const exact=(v,k)=>v&&typeof v==='object'&&!Array.isArray(v)&&
 Object.keys(v).sort().join(',')===k.slice().sort().join(',');
const sha=/^[a-f0-9]{64}$/,ident=/^[a-z][a-z0-9-]{2,63}$/;
const modes=new Set(['cc0','original-owned','company-owned','client-provided','purchased-license']);
const kinds=new Set(['image','video','audio','font','brand-mark']);
const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&
 !Number.isNaN(Date.parse(value+'T00:00:00Z'))&&
 new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
export function validateLicensedAssetCatalog(catalog){
  if(!exact(catalog,['version','scope','assets'])||catalog.version!==1||
    !['public','private'].includes(catalog.scope)||!Array.isArray(catalog.assets)||
    catalog.assets.length<1||catalog.assets.length>100)
    throw new Error('Invalid asset catalog');
  const ids=new Set();
  for(const asset of catalog.assets){
    if(!exact(asset,['id','kind','sha256','rights_basis','license_evidence_id','commercial_advertising',
        'modification_allowed','credit_required','expires_on'])||
      typeof asset.id!=='string'||!ident.test(asset.id)||ids.has(asset.id)||
      !kinds.has(asset.kind)||typeof asset.sha256!=='string'||!sha.test(asset.sha256)||
      !modes.has(asset.rights_basis)||
      typeof asset.license_evidence_id!=='string'||!ident.test(asset.license_evidence_id)||
      typeof asset.commercial_advertising!=='boolean'||
      typeof asset.modification_allowed!=='boolean'||
      typeof asset.credit_required!=='boolean'||
      (asset.expires_on!==null&&!validDate(asset.expires_on)))
      throw new Error('Invalid asset rights metadata');
    if(catalog.scope==='public'&&!['cc0','original-owned'].includes(asset.rights_basis))
      throw new Error('No private licenses in public catalog');
    ids.add(asset.id);
  }
}
export function authorizeCommercialNoCredit(catalog,ids,{on}){
  validateLicensedAssetCatalog(catalog);
  if(!validDate(on)||!Array.isArray(ids)||ids.length<1||new Set(ids).size!==ids.length||
     !ids.every(id=>typeof id==='string'&&ident.test(id)))
    throw new Error('Invalid advertisement asset selection');
  const assets=[];
  for(const id of ids){
    const item=catalog.assets.find(a=>a.id===id);
    if(!item||!item.commercial_advertising||!item.modification_allowed||
      item.credit_required||(item.expires_on!==null&&item.expires_on<on))
      throw new Error('Asset not cleared for this commercial advertisement');
    assets.push({id:item.id,scope:catalog.scope,kind:item.kind,
      sha256:item.sha256,rights_basis:item.rights_basis,
      license_evidence_id:item.license_evidence_id});
  }
  return {status:'RIGHTS_METADATA_PRECHECK_PASSED',
    requires_human_source_review:true,scope:catalog.scope,assets};
}
