// Two ORIGINAL proposals authored by GPT-6 in this conversation for the
// fictional "clearflow-fictional" brief. They do NOT prove automatic API
// inference, finished animation or user-approved art. No reference film assets.
export const threaded={
 briefId:'clearflow-fictional',
 interpretation:'Make an unformed thought into a single continuous visual thread, then use that thread to explain the next action.',
 designReason:'The position and path of one line remain recognizable as planning UI expands around it; the tool is never just a collection of disconnected effects.',
 treatment:{
  version:'creative-treatment-rnd-v1',id:'thread-to-decision',concept:'An unfinished pencil stroke becomes the path that connects an idea to its next practical action.',
  audience:'Viewers exploring a fictional creative planning workflow',
  message:'A single idea can become an understandable plan without losing its starting meaning.',
  profile:{width:1920,height:1080,fps:60,frames:900},
  visual:{palette:['#F5F1EA','#1B2130','#E76E5B','#5C9F99'],cameraLanguage:'One semantic thread, shallow locked graphic camera and deliberate parallax only when new information appears',exclude:['arbitrary particles','third-party brand layouts','meaningless neon glows']},
  rights:{assetPolicy:'original-only'},audio:{mode:'original-synth'},
  rhythm:{mode:'beat-led',bpm:120,offsetFrame:0,reason:'The line reveals information on deliberate downbeats with two-beat holds for reading.'},
  signature:{shotId:'route-reveals-steps',why:'A single connected stroke becomes a meaningful choice route, with every waypoint already present in the original line.'},
  shots:[
   {id:'single-ink-mark',start:0,end:180,intent:'Give the initial sketch an unmistakable visual identity before expanding into interface elements',heroId:'ink-thread',technique:'svg-gsap',
    camera:{move:'locked',why:'One line is the hero; the opening camera must not compete'},bridge:{kind:'establish'},
    actions:[{kind:'draw',start:0,end:84,accent:true,focal:true,why:'Reveal the main material as one continuing gesture'}],readings:[{text:'START WITH A THOUGHT',start:96,end:160}]},
   {id:'ink-becomes-route',start:180,end:390,intent:'Fold the same stroke into a winding decision route with two meaningful forks',heroId:'ink-thread',technique:'svg-gsap',
    camera:{move:'push-in',why:'Bring the viewer close enough to recognize the line becoming a path'},bridge:{kind:'transform',from:'ink-thread',why:'The original line bends into its own decision route'},
    actions:[{kind:'morph',start:180,end:312,accent:true,focal:true,why:'All resulting branches share the prior material and position'}],readings:[{text:'FIND THE THREAD',start:318,end:370}]},
   {id:'route-reveals-steps',start:390,end:630,intent:'Use each route junction to reveal a planned action and a real, fictional UI state',heroId:'ink-thread',technique:'html-css',
    camera:{move:'track',why:'Follow the active route from idea to next step without jumping to unrelated panels'},bridge:{kind:'transform',from:'ink-thread',why:'The curved path is reused as the baseline for a sequence of planning steps'},
    actions:[{kind:'data-transformation',start:390,end:535,accent:true,focal:true,why:'Reveal the tasks only as their route segments become visible'}],readings:[{text:'NEXT ACTION',start:540,end:612}]},
   {id:'quiet-completion',start:630,end:900,intent:'Return to one calm completed line and a focused product promise, not a crowded dashboard',heroId:'ink-thread',technique:'svg-gsap',
    camera:{move:'locked',why:'Make the conclusion readable with a stable ending composition'},bridge:{kind:'carry',from:'ink-thread',why:'The last route segment becomes the original calm line'},
    actions:[{kind:'morph',start:630,end:760,accent:true,focal:true,why:'Collapse the connected route without destroying its recognizable shape'},{kind:'hold',start:800,end:890,focal:false,why:'Allow final words to settle after purposeful motion'}],readings:[{text:'ONE CLEAR NEXT STEP',start:785,end:880}]}
  ]
 }
};
export const aperture={
 briefId:'clearflow-fictional',
 interpretation:'Present the same imaginary tool through an editorial window that reveals one choice at a time rather than tracing a line.',
 designReason:'The story is about subtracting noise. A reusable aperture and changing text hierarchy make the reduction legible without the preceding proposal\'s path metaphor.',
 treatment:{
  version:'creative-treatment-rnd-v1',id:'quiet-window-of-focus',concept:'A crowded editorial frame narrows into one luminous selection window where an actionable idea remains.',
  audience:'Viewers looking for clarity in a fictional creative workflow',
  message:'An idea can become an understandable plan without losing its starting meaning.',
  profile:{width:1920,height:1080,fps:60,frames:900},
  visual:{palette:['#101826','#F5F4EE','#C5EE6D','#789FC0'],cameraLanguage:'Wide editorial crop and steady mask/aperture moves; avoid camera bouncing and arbitrary speed ramps',exclude:['unlicensed footage','carousel product cards','decorative HUD counters']},
  rights:{assetPolicy:'original-only'},audio:{mode:'original-synth'},
  rhythm:{mode:'beat-led',bpm:120,offsetFrame:0,reason:'Measured changes on downbeats contrast with quiet two-second framing and distinct typographic holds.'},
  signature:{shotId:'one-focus-window',why:'An opening aperture resolves all previously competing forms into one clean, purposeful and legible area of attention.'},
  shots:[
   {id:'too-many-fragments',start:0,end:120,intent:'Establish competing original typographic fragments around a single calm central boundary',heroId:'focus-aperture',technique:'html-css',
    camera:{move:'track',why:'Expose competing priorities without an arbitrary 3D camera'},bridge:{kind:'establish'},
    actions:[{kind:'kinetic-type',start:0,end:72,accent:true,focal:true,why:'A short editorial headline tells the viewer what is overwhelming'}],readings:[{text:'TOO MANY STARTS',start:77,end:114}]},
   {id:'mask-finds-order',start:120,end:300,intent:'Slide the original boundary across fragments until it selects one useful thought',heroId:'focus-aperture',technique:'svg-gsap',
    camera:{move:'locked',why:'The aperture itself conveys movement; a camera push would be redundant'},bridge:{kind:'carry',from:'focus-aperture',why:'Only the position of the established viewing boundary changes'},
    actions:[{kind:'morph',start:120,end:245,accent:true,focal:true,why:'Focus the aperture as visual subtraction rather than a decorative transition'}],readings:[]},
   {id:'thought-becomes-choice',start:300,end:480,intent:'Place a meaningful fictional planning decision within the aperture and reveal two relevant options',heroId:'focus-aperture',technique:'html-css',
    camera:{move:'push-in',why:'Give the selected decision enough scale to be understood'},bridge:{kind:'transform',from:'focus-aperture',why:'The edge of the aperture becomes the border of a concise choice panel'},
    actions:[{kind:'data-transformation',start:300,end:414,accent:true,focal:true,why:'Reframe existing fragments as explicit mutually exclusive next actions'}],readings:[{text:'CHOOSE WHAT MATTERS',start:418,end:467}]},
   {id:'one-focus-window',start:480,end:660,intent:'Resolve the choice as a clearly prioritized working area framed by the same selection window',heroId:'focus-aperture',technique:'html-css',
    camera:{move:'pull-back',why:'Show the result in relation to the full, now-quieter visual space'},bridge:{kind:'transform',from:'focus-aperture',why:'The selected border scales into a clean original workspace window'},
    actions:[{kind:'data-transformation',start:480,end:590,accent:true,focal:true,why:'The chosen option becomes a visibly actionable state, not a generic stats screen'}],readings:[{text:'ROOM TO THINK',start:597,end:642}]},
   {id:'white-space-conclusion',start:660,end:900,intent:'Remove redundant panels, retain the recognizable opening aperture as a typographic signature',heroId:'focus-aperture',technique:'svg-gsap',
    camera:{move:'locked',why:'A deliberate end hold restores visual calm'},bridge:{kind:'carry',from:'focus-aperture',why:'The same focused outline remains on screen through the brand-neutral close'},
    actions:[{kind:'morph',start:660,end:750,accent:true,focal:true,why:'Reduce the prior working window to one compact selected mark'},{kind:'hold',start:780,end:888,focal:false,why:'Leave time for the message rather than filling every beat'}],readings:[{text:'MAKE SPACE FOR ONE IDEA',start:766,end:874}]}
  ]
 }
};
