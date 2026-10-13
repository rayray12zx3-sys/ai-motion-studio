/*
 * Two fictional original product briefs authored in ChatGPT, not generated
 * by a runtime LLM or copied from any third-party films.
 * Same semantic player; only declarative content/layout/color data changes.
 */
const profile={width:1080,height:1920,fps:30,frames:360};
export const boardBrief={
 version:'p2-semantic-scenes-v1',id:'atlas-board-to-date',assetPolicy:'original-only',profile,
 theme:{background:'#EDEEE9',surface:'#FFFFFF',ink:'#1A2630',accent:'#DB653E',muted:'#536169',onBackground:'#1A2630',surfaceMuted:'#536169',accentText:'#9E3E1C'},
 music:{mode:'licensed-local',licenseGate:'PENDING_PUBLICATION_CREDIT',bpm:120,offsetFrame:0,auditioned:false},
 entities:[{id:'atlas-card',kind:'task',label:'Outline the launch page',status:'Unscheduled'}],
 shots:[
  {id:'make-the-note',start:0,end:120,focusId:'atlas-card',layout:'reading',bridge:'establish',
   reason:'Establish a tangible note as a product object before opening a scheduling decision.',
   title:'A GOOD IDEA',subtitle:'is more useful when it has a place to go.',
   hero:{x:91,y:355,w:817,h:135},context:['Creative notes','Three open tasks','No due date has been chosen'],
   layers:[{id:'calendar-space',kind:'spatial-grid',depth:'rear',tone:'accent',purpose:'Establish a physical planning surface behind the first task.',bounds:{x:90,y:485,w:820,h:370},opacity:27,drift:{x:7,y:6}}]},
  {id:'move-the-work',start:120,end:240,focusId:'atlas-card',layout:'board',bridge:'carry',
   reason:'The same task card travels visibly from inbox toward the date lane as it is dragged.',
   title:'GIVE IT A DAY.',subtitle:'Drag one task into the next open slot.',
   hero:{x:165,y:442,w:670,h:132},context:['MON  /  OPEN','TUE  /  CURRENT','WED  /  OPEN'],
   layers:[{id:'calendar-space',kind:'spatial-grid',depth:'rear',tone:'accent',purpose:'Move the calendar perspective toward the task landing lane.',bounds:{x:75,y:475,w:850,h:400},opacity:30,drift:{x:9,y:4}},
     {id:'date-target',kind:'orbit-markers',depth:'front',tone:'accent',purpose:'Focus the destination chosen by the visible task drag.',bounds:{x:625,y:655,w:210,h:185},opacity:27,drift:{x:2,y:0}}]},
  {id:'see-its-place',start:240,end:360,focusId:'atlas-card',layout:'reading',bridge:'transform',
   reason:'Keep the same card identity while the planning result replaces its former unscheduled state.',
   title:'NOW IT HAS A PLACE.',subtitle:'One move creates an understandable next step.',
   hero:{x:95,y:360,w:810,h:137},context:['TUE  /  NEXT SLOT','Task count: 1 scheduled','One clear action for tomorrow'],
   layers:[{id:'calendar-space',kind:'spatial-grid',depth:'rear',tone:'accent',purpose:'Hold calendar depth while the scheduling result becomes dominant.',bounds:{x:80,y:505,w:830,h:390},opacity:25,drift:{x:9,y:4}},
     {id:'date-target',kind:'orbit-markers',depth:'front',tone:'accent',purpose:'Retain the same spatial target through the result reveal.',bounds:{x:655,y:660,w:185,h:170},opacity:21,drift:{x:1,y:0}}]}
 ],
 operations:[{id:'schedule-task',shotId:'move-the-work',resultShotId:'see-its-place',frame:165,
  trigger:'drag',entityId:'atlas-card',field:'status',from:'Unscheduled',to:'Tuesday / scheduled',
  gesture:{start:133,from:{x:480,y:477},to:{x:610,y:720}},
  resultLabel:'DROPPED INTO TUESDAY',
  accent:true,reason:'The drag visibly assigns a date to the original task, not merely an aesthetic change.'}]
};
export const captionBrief={
 version:'p2-semantic-scenes-v1',id:'index-audio-to-caption',assetPolicy:'original-only',profile,
 theme:{background:'#181C2B',surface:'#F2F1EE',ink:'#1D2635',accent:'#E67B48',muted:'#B1BACF',onBackground:'#F2F1EE',surfaceMuted:'#52606B',accentText:'#973612'},
 music:{mode:'licensed-local',licenseGate:'PENDING_PUBLICATION_CREDIT',bpm:150,offsetFrame:0,auditioned:false},
 entities:[{id:'spoken-moment',kind:'clip',label:'Make time for the useful part',status:'Not selected'}],
 shots:[
  {id:'hear-the-thread',start:0,end:120,focusId:'spoken-moment',layout:'track',bridge:'establish',
   reason:'Anchor an edit to one discernible timeline region, not anonymous moving sound bars.',
   title:'FIND THE MOMENT.',subtitle:'An original fictional voice-edit workflow.',
   hero:{x:77,y:440,w:845,h:134},context:['00:12  /  VOICE TAKE','SOURCE RANGE  03:20–03:25'],
   layers:[{id:'source-signal',kind:'signal-ribbon',depth:'rear',tone:'accent',purpose:'Convey the audible source flow before a caption is extracted.',bounds:{x:65,y:505,w:850,h:245},opacity:34,drift:{x:8,y:4}}]},
  {id:'choose-phrase',start:120,end:240,focusId:'spoken-moment',layout:'track',bridge:'carry',
   reason:'Keep the same selected source phrase as the playhead and edit range are chosen.',
   title:'SELECT THE LINE.',subtitle:'One gesture keeps the words tied to the source.',
   hero:{x:148,y:360,w:705,h:150},context:['IN  03:20.0    OUT  03:25.0','TRANSCRIPT SELECTION'],
   layers:[{id:'source-signal',kind:'signal-ribbon',depth:'rear',tone:'accent',purpose:'Track the source flow while the user selects a bounded phrase.',bounds:{x:74,y:490,w:845,h:295},opacity:39,drift:{x:12,y:0}},
     {id:'selection-focus',kind:'orbit-markers',depth:'front',tone:'accent',purpose:'Give the selected original audio phrase a spatial focal marker.',bounds:{x:560,y:615,w:235,h:192},opacity:20,drift:{x:4,y:2}}]},
  {id:'carry-caption',start:240,end:360,focusId:'spoken-moment',layout:'reading',bridge:'transform',
   reason:'The same phrase becomes a legible caption card with provenance to the edit range.',
   title:'WORDS WITH CONTEXT.',subtitle:'The selected phrase is now ready for caption review.',
   hero:{x:80,y:333,w:840,h:155},context:['CAPTION DRAFT  /  READY FOR REVIEW','SOURCE  03:20–03:25','No automatic accuracy claim'],
   layers:[{id:'source-signal',kind:'signal-ribbon',depth:'rear',tone:'accent',purpose:'Carry source audio identity into the caption drafting result.',bounds:{x:69,y:515,w:855,h:278},opacity:23,drift:{x:7,y:2}},
     {id:'selection-focus',kind:'orbit-markers',depth:'front',tone:'accent',purpose:'Carry the same phrase-selection focus into the editable caption.',bounds:{x:570,y:629,w:220,h:176},opacity:16,drift:{x:3,y:1}}]}
 ],
 operations:[{id:'select-transcript',shotId:'choose-phrase',resultShotId:'carry-caption',frame:168,
  trigger:'select',entityId:'spoken-moment',field:'status',from:'Not selected',to:'Caption draft ready',
  gesture:{start:132,from:{x:420,y:465},to:{x:645,y:665}},
  resultLabel:'CAPTION READY FOR REVIEW',
  accent:true,reason:'The source selection yields a visible editable caption candidate, not a generic effect.'}]
};
export const sampleBriefs=[boardBrief,captionBrief];
