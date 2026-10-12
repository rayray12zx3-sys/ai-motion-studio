/*
 * Two fictional original product briefs authored in ChatGPT, not generated
 * by a runtime LLM or copied from any third-party films.
 * Same semantic player; only declarative content/layout/color data changes.
 */
const profile={width:1080,height:1920,fps:30,frames:360};
export const boardBrief={
 version:'p2-semantic-scenes-v1',id:'atlas-board-to-date',assetPolicy:'original-only',profile,
 theme:{background:'#EDEEE9',surface:'#FFFFFF',ink:'#1A2630',accent:'#DB653E',muted:'#687479'},
 music:{mode:'licensed-local',licenseGate:'PENDING_PUBLICATION_CREDIT',bpm:120,offsetFrame:0,auditioned:false},
 entities:[{id:'atlas-card',kind:'task',label:'Outline the launch page',status:'Unscheduled'}],
 shots:[
  {id:'make-the-note',start:0,end:120,focusId:'atlas-card',layout:'reading',bridge:'establish',
   reason:'Establish a tangible note as a product object before opening a scheduling decision.',
   title:'A GOOD IDEA',subtitle:'is more useful when it has a place to go.',
   hero:{x:91,y:355,w:817,h:135},context:['Creative notes','Three open tasks','No due date has been chosen']},
  {id:'move-the-work',start:120,end:240,focusId:'atlas-card',layout:'board',bridge:'carry',
   reason:'The same task card travels visibly from inbox toward the date lane as it is dragged.',
   title:'GIVE IT A DAY.',subtitle:'Drag one task into the next open slot.',
   hero:{x:165,y:442,w:670,h:132},context:['MON  /  OPEN','TUE  /  CURRENT','WED  /  OPEN']},
  {id:'see-its-place',start:240,end:360,focusId:'atlas-card',layout:'reading',bridge:'transform',
   reason:'Keep the same card identity while the planning result replaces its former unscheduled state.',
   title:'NOW IT HAS A PLACE.',subtitle:'One move creates an understandable next step.',
   hero:{x:95,y:360,w:810,h:137},context:['TUE  /  NEXT SLOT','Task count: 1 scheduled','One clear action for tomorrow']}
 ],
 operations:[{id:'schedule-task',shotId:'move-the-work',resultShotId:'see-its-place',frame:165,
  trigger:'drag',entityId:'atlas-card',field:'status',from:'Unscheduled',to:'Tuesday / scheduled',
  accent:true,reason:'The drag visibly assigns a date to the original task, not merely an aesthetic change.'}]
};
export const captionBrief={
 version:'p2-semantic-scenes-v1',id:'index-audio-to-caption',assetPolicy:'original-only',profile,
 theme:{background:'#181C2B',surface:'#F2F1EE',ink:'#1D2635',accent:'#E67B48',muted:'#B1BACF'},
 music:{mode:'licensed-local',licenseGate:'PENDING_PUBLICATION_CREDIT',bpm:150,offsetFrame:0,auditioned:false},
 entities:[{id:'spoken-moment',kind:'clip',label:'Make time for the useful part',status:'Not selected'}],
 shots:[
  {id:'hear-the-thread',start:0,end:120,focusId:'spoken-moment',layout:'track',bridge:'establish',
   reason:'Anchor an edit to one discernible timeline region, not anonymous moving sound bars.',
   title:'FIND THE MOMENT.',subtitle:'An original fictional voice-edit workflow.',
   hero:{x:77,y:440,w:845,h:134},context:['00:12  /  VOICE TAKE','SOURCE RANGE  03:20–03:25']},
  {id:'choose-phrase',start:120,end:240,focusId:'spoken-moment',layout:'track',bridge:'carry',
   reason:'Keep the same selected source phrase as the playhead and edit range are chosen.',
   title:'SELECT THE LINE.',subtitle:'One gesture keeps the words tied to the source.',
   hero:{x:148,y:360,w:705,h:150},context:['IN  03:20.0    OUT  03:25.0','TRANSCRIPT SELECTION']},
  {id:'carry-caption',start:240,end:360,focusId:'spoken-moment',layout:'reading',bridge:'transform',
   reason:'The same phrase becomes a legible caption card with provenance to the edit range.',
   title:'WORDS WITH CONTEXT.',subtitle:'The selected phrase is now ready for caption review.',
   hero:{x:80,y:333,w:840,h:155},context:['CAPTION DRAFT  /  READY FOR REVIEW','SOURCE  03:20–03:25','No automatic accuracy claim']}
 ],
 operations:[{id:'select-transcript',shotId:'choose-phrase',resultShotId:'carry-caption',frame:168,
  trigger:'select',entityId:'spoken-moment',field:'status',from:'Not selected',to:'Caption draft ready',
  accent:true,reason:'The source selection yields a visible editable caption candidate, not a generic effect.'}]
};
export const sampleBriefs=[boardBrief,captionBrief];
