(() => {
  'use strict';

  const ELECTION_DATE = new Date('2026-11-02T00:00:00+08:00');
  const STORAGE_KEY = 'bske2026GuideState_v1';

  const state = loadState();
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[ch]));
  const peso = (n) => `₱${Number(n || 0).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2})}`;

  const calendarEvents = [
    {date:'July 20, 2026', start:'2026-07-20', category:'other', title:'Last day to file petition for exclusion of voters', basis:'RA 8189 / COMELEC Resolution No. 11191', description:'Voter-list exclusion petition deadline.'},
    {date:'July 24, 2026', start:'2026-07-24', category:'other', title:'Last day to file petition for inclusion of voters', basis:'RA 8189 / COMELEC Resolution No. 11191', description:'Voter-list inclusion petition deadline.'},
    {date:'July 29 – September 3, 2026', start:'2026-07-29', category:'other', title:'Constitution of Electoral Boards and BBOC', basis:'COMELEC Resolution No. 11191', description:'Period to constitute the members of the Electoral Board and Barangay Board of Canvassers.'},
    {date:'September 28 – October 5, 2026', start:'2026-09-28', category:'filing', title:'Filing of Certificates of Candidacy', basis:'COMELEC Resolution No. 11191 / 11196', description:'Official COC filing period for the 2026 BSKE.'},
    {date:'September 28 – October 21, 2026', start:'2026-09-28', category:'campaign', title:'Campaigning prohibited before the official campaign period', basis:'COMELEC Resolution No. 11191', description:'Campaigning is listed as a prohibited act during this period.'},
    {date:'October 3 – November 9, 2026', start:'2026-10-03', category:'election', title:'Election period', basis:'COMELEC Resolution No. 11191', description:'Election period under the cited calendar.'},
    {date:'October 22 – October 31, 2026', start:'2026-10-22', category:'campaign', title:'Official campaign period', basis:'COMELEC Resolution No. 11191', description:'Official campaign period for the 2026 BSKE.'},
    {date:'November 2, 2026', start:'2026-11-02', category:'election', title:'ELECTION DAY', basis:'RA 12232 / COMELEC Resolution No. 11191', description:'Regular Barangay and Sangguniang Kabataan elections; voting is listed as 7:00 a.m. to 3:00 p.m. in the cited COMELEC calendar.'},
    {date:'December 2, 2026', start:'2026-12-02', category:'other', title:'Last day to file Statements of Contributions and Expenditures (SOCE)', basis:'COMELEC Resolution No. 11191 / Sec. 14, RA 7166', description:'Last day to file the SOCE.'}
  ];

  const requirements = {
    sk: [
      ['Philippine citizenship','The elected or appointed SK official must be a citizen of the Philippines.','RA 11768, Sec. 10','fa-flag'],
      ['Qualified Katipunan ng Kabataan voter','The candidate must be a qualified voter of the Katipunan ng Kabataan.','RA 11768, Sec. 10','fa-people-group'],
      ['One-year barangay residency','The candidate must be a resident of the barangay for at least one year immediately preceding election day.','RA 11768, Sec. 10','fa-house-user'],
      ['Age 18 through 24 on election day','For the November 2, 2026 BSKE, COMELEC states that aspirants should be born November 2, 2002 to November 2, 2008.','RA 11768, Sec. 10 / COMELEC 11196','fa-cake-candles'],
      ['Able to read and write','The candidate must be able to read and write Filipino, English, or the local dialect.','RA 11768, Sec. 10','fa-book-open'],
      ['Second-degree kinship restriction','The candidate must not be related within the second civil degree of consanguinity or affinity to a covered incumbent elected official in the locality where the SK official seeks election.','RA 11768, Sec. 10','fa-people-arrows'],
      ['No final conviction involving moral turpitude','The candidate must not have been convicted by final judgment of a crime involving moral turpitude.','RA 11768, Sec. 10','fa-scale-balanced'],
      ['COC filing documents','COMELEC Resolution No. 11196 requires, among other items, a passport-size photograph and a birth certificate attached as Annex 1, plus documentary stamp tax.','COMELEC 11196','fa-file-circle-check']
    ],
    barangay: [
      ['Citizenship','An elective local official must be a citizen of the Philippines.','RA 7160, Sec. 39','fa-flag'],
      ['Registered voter and one-year residency','An elective local official must be a registered voter in the political unit where the person intends to be elected and a resident there for at least one year immediately preceding election day.','RA 7160, Sec. 39','fa-house-user'],
      ['Able to read and write','The Local Government Code lists ability to read and write Filipino or another local language/dialect as a qualification for elective local office.','RA 7160, Sec. 39','fa-book-open'],
      ['At least 18 years old for barangay office','Candidates for punong barangay or member of the sangguniang barangay must be at least 18 years old on election day.','RA 7160, Sec. 39','fa-cake-candles'],
      ['Local-office disqualifications','Section 40 of RA 7160 lists disqualifications for elective local positions. The exact current legal effect of a disqualifying fact must be reviewed under the applicable rules.','RA 7160, Sec. 40','fa-scale-balanced'],
      ['Term-limit / incumbency rules','RA 12232 sets four-year terms and provides that incumbent elective barangay officials serving a third consecutive term in the same position are not eligible to run for that same position in the November 2026 BSKE.','RA 12232 / COMELEC 11207','fa-hourglass-half'],
      ['Filing dates','COC filing for the 2026 BSKE is September 28 through October 5, 2026.','COMELEC Resolution No. 11191','fa-calendar-days'],
      ['No filing fee for the COC','COMELEC Resolution No. 11196 states that no filing fee or other fee shall be imposed for COC filing.','COMELEC 11196','fa-peso-sign']
    ]
  };

  const relationships = {
    parent:{label:'Parent / child', degree:1, type:'consanguinity', explanation:'Direct-line relationship separated by one generation.'},
    grandparent:{label:'Grandparent / grandchild', degree:2, type:'consanguinity', explanation:'Direct-line relationship separated by two generations.'},
    sibling:{label:'Brother / sister', degree:2, type:'consanguinity', explanation:'Collateral relationship through a common parent.'},
    uncle:{label:'Uncle / aunt ↔ niece / nephew', degree:3, type:'consanguinity', explanation:'Collateral relationship through a common grandparent.'},
    firstcousin:{label:'First cousin', degree:4, type:'consanguinity', explanation:'Collateral relationship four degrees apart under the Civil Code method.'},
    parentinlaw:{label:'Parent-in-law / child-in-law', degree:1, type:'affinity', explanation:'Affinity follows the degree between the spouse and the spouse’s relative.'}
  };

  const scenarios = [
    {id:'featured',title:'Grandfather is a Barangay Captain aspirant; grandson is an SK Chairperson aspirant',relation:'Grandparent / grandchild',degree:2,status:'Aspirant / candidate',office:'Barangay official',locality:'Same locality',tone:'blue',description:'Featured facts from the supplied infographic. The grandfather is described as an aspirant rather than an incumbent elected official. The Section 10 kinship restriction is framed around a covered incumbent elected official.',detail:'The relationship is second-degree consanguinity, but the status of the relative matters to the specific wording of Section 10.'},
    {id:'inc-grandparent',title:'Grandfather is an incumbent Barangay Captain; grandson seeks SK',relation:'Grandparent / grandchild',degree:2,status:'Incumbent elected official',office:'Barangay official',locality:'Same locality',tone:'red',description:'The relative is within the second civil degree and is an incumbent covered elected barangay official in the locality.',detail:'This combination is directly relevant to the kinship qualification in Section 10 of RA 11768.'},
    {id:'parent',title:'Parent is an incumbent municipal official; child seeks SK',relation:'Parent / child',degree:1,status:'Incumbent elected official',office:'Municipal official',locality:'Same locality',tone:'red',description:'A parent-child relationship is first degree, and the relative is a covered incumbent elected official in the relevant locality.',detail:'This combination is directly relevant to the kinship qualification in Section 10.'},
    {id:'cousin',title:'First cousin is an incumbent barangay official; candidate seeks SK',relation:'First cousin',degree:4,status:'Incumbent elected official',office:'Barangay official',locality:'Same locality',tone:'yellow',description:'First cousins are fourth-degree relatives under the Civil Code method, so they are outside the second-degree threshold used by Section 10.',detail:'Degree matters: the rule is not a general ban on all relatives.'},
    {id:'sibling-outside',title:'Sibling is an incumbent regional official; candidate seeks SK in a different locality',relation:'Brother / sister',degree:2,status:'Incumbent elected official',office:'Regional official',locality:'Different locality',tone:'yellow',description:'A sibling is second degree, but the Section 10 wording also references the locality where the SK official seeks election.',detail:'The locality element should be checked together with the relationship and official status.'}
  ];

  const faqs = [
    ['Are grandfather and grandson second-degree relatives?','Yes. Under the Civil Code method of counting generations in the direct line, a grandparent and grandchild are two degrees apart.'],
    ['Does a grandfather who is only an aspirant automatically trigger the Section 10 kinship restriction?','The wording of RA 11768 refers to a relationship to an incumbent elected regional, provincial, city, municipal, or barangay official in the locality. Being merely an aspirant is a different status. The exact facts still matter.'],
    ['What changes if the grandfather is the incumbent Barangay Captain?','The relationship remains second degree, but the relative is now a covered incumbent elected barangay official. That combination is directly relevant to the Section 10 kinship qualification.'],
    ['What age must an SK aspirant be for the November 2, 2026 election?','COMELEC Resolution No. 11196 states that SK Chairperson and Member aspirants must be at least 18 but not more than 24 on election day, and should be born November 2, 2002 to November 2, 2008 for the 2026 BSKE.'],
    ['When is COC filing?','September 28 through October 5, 2026, according to COMELEC Resolution No. 11191.'],
    ['Is there a filing fee for the COC?','COMELEC Resolution No. 11196 states that no filing fee or any other fee shall be imposed for the filing of the COC. A ₱30 documentary stamp tax is attached as specified in the resolution.'],
    ['What documents does COMELEC list for the COC?','Resolution No. 11196 says the aspirant attaches a passport-size photo and a copy of a PSA or Local Civil Registry birth certificate as Annex 1, along with the documentary stamp tax requirements.'],
    ['What if a COC is incomplete?','Resolution No. 11196 says an incomplete COC is not accepted or stamped as received on time. On the last filing day, an aspirant advised to complete the COC may be given until 11:59 PM that same day to file a complete and proper COC.'],
    ['When is the official campaign period?','COMELEC Resolution No. 11191 sets the official campaign period at October 22 through October 31, 2026.'],
    ['When is election day?','Republic Act No. 12232 and COMELEC Resolution No. 11191 set the next regular Barangay and Sangguniang Kabataan elections for the first Monday of November 2026, which is November 2, 2026.']
  ];

  const sources = [
    {title:'Republic Act No. 11768',id:'May 6, 2022',desc:'Amends the SK Reform Act and contains the Section 10 qualifications, including the second civil degree kinship provision.',url:'https://lawphil.net/statutes/repacts/ra2022/ra_11768_2022.html',icon:'fa-gavel'},
    {title:'Republic Act No. 7160 (Local Government Code)',id:'1991',desc:'Provides core qualifications and disqualifications for elective local officials, including punong barangay and sangguniang barangay candidates.',url:'https://chief5.lawphil.net/statutes/repacts/ra1991/ra_7160_1991.html',icon:'fa-building-columns'},
    {title:'Republic Act No. 12232',id:'August 13, 2025',desc:'Sets four-year terms and the next regular Barangay and SK elections for the first Monday of November 2026.',url:'https://lawphil.net/statutes/repacts/ra2025/ra_12232_2025.html',icon:'fa-calendar-check'},
    {title:'COMELEC Resolution No. 11191',id:'January 28, 2026',desc:'Calendar of activities and periods of certain prohibited acts for the November 2, 2026 BSKE.',url:'https://www.comelec.gov.ph/php-tpls-attachments/2025BSKE/Resolutions/com_res_11191.pdf',icon:'fa-calendar-days'},
    {title:'COMELEC Resolution No. 11196',id:'February 18, 2026',desc:'Amends COC provisions for 2026, including SK age range, birth-certificate attachment, DST and no-filing-fee rules.',url:'https://www.comelec.gov.ph/php-tpls-attachments/2026BSKE/Resolutions/com_res11196.pdf',icon:'fa-file-signature'},
    {title:'COMELEC Resolution No. 11207',id:'2026',desc:'Implementing rules for RA 12232, including transitory provisions for incumbent barangay officials.',url:'https://www.comelec.gov.ph/php-tpls-attachments/2025BSKE/Resolutions/com_res_11207.pdf',icon:'fa-scale-balanced'},
    {title:'Republic Act No. 386 — Civil Code',id:'October 15, 1949',desc:'Contains the civil-law framework used to count degrees of relationship.',url:'https://lawphil.net/statutes/repacts/ra1949/ra_386_1949.html',icon:'fa-people-arrows'}
  ];

  const prohibitedActs = [
    ['Vote-buying / vote-selling','COMELEC lists vote-buying and vote-selling among prohibited acts beginning with the election period.','fa-hand-holding-dollar','red'],
    ['Campaigning outside the official period','Campaigning is listed as a prohibited act before the official campaign period, with the official campaign period set for October 22–31, 2026.','fa-bullhorn','blue'],
    ['Firearms / deadly weapons in public places','The calendar lists carrying or transporting firearms or other deadly weapons in public places as prohibited unless authorized in writing by COMELEC.','fa-shield-halved','red'],
    ['Use of security personnel / bodyguards','COMELEC identifies the use of security personnel or bodyguards by candidates as a prohibited act under the cited rules.','fa-user-shield','yellow'],
    ['Certain use of public funds / public works / appointments','The calendar identifies specified restrictions involving public funds, public works, and certain appointments during the periods stated in Resolution No. 11191.','fa-building-columns','blue'],
    ['Soliciting votes near polling places','The calendar identifies soliciting votes or undertaking propaganda within the polling place or within 30 meters thereof as prohibited.','fa-bullhorn','red'],
    ['Liquor-related election-day restrictions','The calendar identifies selling, furnishing, offering, buying, serving or taking intoxicating liquor during the specified prohibited period.','fa-wine-bottle','yellow'],
    ['Free transportation, food, drinks or things of value','The calendar identifies giving or accepting free transportation, food, drinks and things of value during the prohibited period.','fa-gift','red'],
    ['Wagering on the election result','Wagering upon the result of the election is listed as prohibited from October 3 until proclamation of winning candidates.','fa-dice','blue']
  ];

  const cocItems = [
    ['coc_form','Use the updated 2026 COC form','Use the current COC form applicable to the position sought.'],
    ['coc_oath','COC is under oath','The COC is required to be under oath.'],
    ['coc_photo','Passport-size photograph','COMELEC 11196 specifies a passport-size photo taken within the last six months.'],
    ['coc_birth','Birth certificate as Annex 1','Attach a copy issued by PSA or the concerned Local Civil Registry.'],
    ['coc_dst','₱30 documentary stamp tax','Attach the P30 DST as specified by the 2026 COC rule; electronic DST is accepted under the cited resolution.'],
    ['coc_complete','Complete every required field','Incomplete COCs are not accepted or stamped as received on time.'],
    ['coc_signature','Original or permitted digital signature','The resolution identifies missing signature/digital signature as an example of an incomplete COC.'],
    ['coc_notary','Notarization completed','A missing notarization or notary signature is listed as an example of an incomplete COC.'],
    ['coc_address','Complete address','An incomplete address is listed as an example of an incomplete COC.'],
    ['coc_filedate','File within September 28 – October 5, 2026','COMELEC Resolution No. 11191 establishes the official COC filing period.']
  ];

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {coc:{}, settings:{defaultPage:'dashboard',notifications:true,save:true}, checker:{}, customScenarios:[] , notificationsRead:false};
    } catch { return {coc:{}, settings:{defaultPage:'dashboard',notifications:true,save:true}, checker:{}, customScenarios:[], notificationsRead:false}; }
  }
  function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function toast(msg) { const el=$('#toast'); if(!el) return; $('.toast span',el).textContent=msg; el.classList.add('show'); clearTimeout(window.__toastTimer); window.__toastTimer=setTimeout(()=>el.classList.remove('show'),2200); }

  function setPage(page) {
    const target = document.getElementById(`page-${page}`) || document.getElementById('page-dashboard');
    const pageName = target.id.replace('page-','');
    $$('.page').forEach(p=>p.classList.toggle('active',p===target));
    $$('.nav-item[data-page], .bottom-item[data-page]').forEach(btn=>btn.classList.toggle('active',btn.dataset.page===pageName));
    $('#sidebar')?.classList.remove('open');
    closeModal('quickModal'); closeModal('scenarioModal');
    if(location.hash !== `#${pageName}`) history.replaceState(null,'',`#${pageName}`);
    if(pageName==='requirements') renderRequirements(currentReqTab);
    if(pageName==='kinship') updateDegree();
    if(pageName==='scenarios') renderScenarios();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function openModal(id){ $('#overlay')?.classList.add('open'); $('#'+id)?.classList.add('open'); }
  function closeModal(id){ $('#'+id)?.classList.remove('open'); if(!$('.modal.open')) $('#overlay')?.classList.remove('open'); }

  function initNavigation(){
    $$('.nav-item[data-page], .bottom-item[data-page], [data-page-link]').forEach(el=>el.addEventListener('click',()=>{ const p=el.dataset.page || el.dataset.pageLink; if(p) setPage(p); }));
    $('#quickAddBtn')?.addEventListener('click',()=>openModal('quickModal'));
    $('#bottomQuick')?.addEventListener('click',()=>openModal('quickModal'));
    $('#buildScenarioBtn')?.addEventListener('click',()=>openModal('scenarioModal'));
    $$('.modal [data-close]').forEach(btn=>btn.addEventListener('click',()=>closeModal(btn.dataset.close)));
    $('#overlay')?.addEventListener('click',()=>{$$('.modal.open').forEach(m=>closeModal(m.id));});
    $('#menuBtn')?.addEventListener('click',()=>$('#sidebar')?.classList.toggle('open'));
    $$('.nav-group-title').forEach(btn=>btn.addEventListener('click',()=>{ const sub=document.getElementById(btn.getAttribute('aria-controls')); const expanded=btn.getAttribute('aria-expanded')==='true'; btn.setAttribute('aria-expanded',String(!expanded)); sub?.classList.toggle('is-open',!expanded); sub && (sub.style.display = !expanded ? 'grid' : 'none'); }));
    $('#guideSwitcher')?.addEventListener('click',()=>{const b=$('#guideSwitcher'),m=$('#guideMenu');const ex=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',String(!ex));m.hidden=ex;});
    $('#topAvatar')?.addEventListener('click',()=>setPage('settings'));
    window.addEventListener('hashchange',()=>setPage(location.hash.replace('#','')||state.settings.defaultPage||'dashboard'));
  }

  let currentReqTab='sk';
  function renderRequirements(tab='sk'){
    currentReqTab=tab;
    $$('.info-tab').forEach(b=>b.classList.toggle('active',b.dataset.reqTab===tab));
    const cards=requirements[tab].map(([title,desc,basis,icon])=>`<article class="requirement-card"><div class="req-head"><div class="req-icon"><i class="fa-solid ${icon}"></i></div><strong>${title}</strong></div><p>${desc}</p><span class="legal-tag">${basis}</span></article>`).join('');
    $('#requirementsContent').innerHTML=`<div class="requirements-grid">${cards}</div>`;
  }

  function updateDateTime(){
    const now=new Date();
    const dateText=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Manila',weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(now);
    $('#currentDate').textContent=dateText.toUpperCase();
    const hour=Number(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Manila',hour:'numeric',hour12:false}).format(now));
    const greeting=hour>=5&&hour<12?'Good morning!':hour>=12&&hour<18?'Good afternoon!':'Good evening!';
    $('#greeting').textContent=`${greeting} Here's the BSKE 2026 Guide`;
    const ms=ELECTION_DATE-new Date();
    const days=Math.ceil(ms/86400000);
    $('#countdownText').textContent=days>0?`${days.toLocaleString()} days from now`:(days===0?'Today is election day.':'Election day has passed.');
  }

  function renderMiniTimeline(){
    const items=calendarEvents.filter(e=>['filing','campaign','election'].includes(e.category)).slice(0,5);
    $('#miniTimeline').innerHTML=items.map(e=>`<div class="mini-event"><span class="date">${escapeHtml(e.date)}</span><span class="event">${escapeHtml(e.title)}</span><span class="dot" aria-hidden="true"></span></div>`).join('');
  }

  function updateDegree(){
    const rel=relationships[$('#relationSelect')?.value] || relationships.grandparent;
    const result=$('#degreeResult');
    if(!result) return;
    result.innerHTML=`<div class="degree-number">${rel.degree}${rel.degree===1?'st':rel.degree===2?'nd':rel.degree===3?'rd':'th'} degree</div><strong>${escapeHtml(rel.label)} — ${escapeHtml(rel.type)}</strong><p>${escapeHtml(rel.explanation)}</p>`;
  }

  function renderDegreeCards(){
    const list=[
      ['1st degree','Parent / child','Direct line'],['2nd degree','Grandparent / grandchild','Direct line'],['2nd degree','Brother / sister','Collateral'],['3rd degree','Uncle / niece','Collateral'],['4th degree','First cousin','Collateral']
    ];
    $('#degreeCards').innerHTML=list.map(x=>`<div class="degree-card"><div class="num">${x[0]}</div><strong>${x[1]}</strong><span>${x[2]}</span></div>`).join('');
    $('#relationSelect')?.addEventListener('change',updateDegree);
  }

  function analyzeKinship({relation,status,office,locality}){
    const r=relationships[relation] || relationships.grandparent;
    const covered=['barangay','municipal','city','provincial','regional'].includes((office||'').toLowerCase()) || /Barangay|Municipal|City|Provincial|Regional/i.test(office||'');
    const relevant=r.degree<=2 && status==='incumbent' && locality==='yes' && covered;
    return {r,relevant,covered};
  }

  function renderProhibited(){
    const icons=['fa-ban','fa-bullhorn','fa-shield-halved','fa-user-shield','fa-building-columns','fa-location-dot','fa-wine-bottle','fa-gift','fa-dice'];
    $('#prohibitedGrid').innerHTML=prohibitedActs.map((x,i)=>`<article class="prohibited-card"><div class="prohibited-icon ${x[3]}"><i class="fa-solid ${x[2]||icons[i]}"></i></div><div><h3>${escapeHtml(x[0])}</h3><p>${escapeHtml(x[1])}</p><span class="legal-tag">COMELEC Resolution No. 11191</span></div></article>`).join('');
  }

  function renderScenarios(){
    const all=[...scenarios,...(state.customScenarios||[])];
    $('#scenarioGrid').innerHTML=all.map(s=>`<article class="scenario-card"><div class="scenario-icon"><i class="fa-solid ${s.tone==='red'?'fa-triangle-exclamation':s.tone==='yellow'?'fa-location-dot':'fa-scale-balanced'}"></i></div><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.description)}</p><div class="scenario-meta"><span>${escapeHtml(s.relation)}</span><span>${escapeHtml(s.degree)}° degree</span><span>${escapeHtml(s.status)}</span><span>${escapeHtml(s.office)}</span></div><p><strong>Rule focus:</strong> ${escapeHtml(s.detail)}</p></article>`).join('');
  }

  function initScenarioForm(){
    $('#scenarioForm')?.addEventListener('submit',e=>{
      e.preventDefault();
      const relation=$('#scRelation').value,status=$('#scStatus').value,office=$('#scOffice').value,locality=$('#scLocality').value;
      const {r,relevant}=analyzeKinship({relation,status,office,locality});
      const title=`Custom: ${$('#scPosition').value} with ${r.label.toLowerCase()} relative`;
      const description=relevant?'Second-degree-or-less relationship + incumbent covered official + same locality: this combination is directly relevant to the Section 10 kinship qualification.':`Relationship is ${r.degree} degree; relative status is ${status==='incumbent'?'incumbent':'not incumbent'} and locality is ${locality==='yes'?'the same':'different'}. Review the full Section 10 wording with the complete facts.`;
      state.customScenarios=state.customScenarios||[]; state.customScenarios.unshift({id:'custom-'+Date.now(),title,relation:r.label,degree:r.degree,status:status==='incumbent'?'Incumbent elected official':status==='aspirant'?'Aspirant / candidate':'Former official',office,locality:locality==='yes'?'Same locality':'Different locality',tone:relevant?'red':'blue',description,detail:relevant?'Relevant to the kinship qualification; this tool is not a formal COMELEC determination.':'Not automatically triggered by the selected facts alone; other qualifications may still apply.'});
      saveState(); closeModal('scenarioModal'); renderScenarios(); toast('Scenario analyzed and saved locally');
    });
  }

  function initChecker(){
    const ids=['ecDob','ecVoter','ecResident','ecLiteracy','ecConviction','ecRelated','ecRelation','ecRelativeStatus','ecRelativeOffice','ecSameLocality'];
    if(state.settings.save && state.checker){ ids.forEach(id=>{const el=$('#'+id); if(el && state.checker[id]!=null) el.value=state.checker[id];}); }
    $('#ecRelated')?.addEventListener('change',()=>$('#relationshipDetails')?.classList.toggle('hidden',$('#ecRelated').value!=='yes'));
    ['ecDob','ecVoter','ecResident','ecLiteracy','ecConviction','ecRelated','ecRelation','ecRelativeStatus','ecRelativeOffice','ecSameLocality'].forEach(id=>$('#'+id)?.addEventListener('change',updateCheckerProgress));
    $('#eligibilityForm')?.addEventListener('submit',e=>{e.preventDefault(); runChecker(true);});
    $('#saveChecker')?.addEventListener('click',()=>{saveCheckerInputs();toast('Checker answers saved locally');});
    $('#resetChecker')?.addEventListener('click',()=>{state.checker={};saveState();$('#eligibilityForm').reset();$('#relationshipDetails').classList.add('hidden');$('#checkerResult').innerHTML='<i class="fa-solid fa-clipboard-question"></i><p>No result yet</p><span>Your answers stay in this browser only.</span>';updateCheckerProgress();});
    updateCheckerProgress();
    if(state.checker.ecRelated==='yes') $('#relationshipDetails').classList.remove('hidden');
  }
  function saveCheckerInputs(){ const ids=['ecDob','ecVoter','ecResident','ecLiteracy','ecConviction','ecRelated','ecRelation','ecRelativeStatus','ecRelativeOffice','ecSameLocality']; state.checker={}; ids.forEach(id=>{const el=$('#'+id); if(el) state.checker[id]=el.value;}); saveState(); }
  function answeredCount(){
    const base=['ecDob','ecVoter','ecResident','ecLiteracy','ecConviction','ecRelated'];
    let count=base.filter(id=>$('#'+id)?.value).length;
    if($('#ecRelated')?.value==='yes') count+= ['ecRelation','ecRelativeStatus'].filter(id=>$('#'+id)?.value).length>=2?2:0;
    return Math.min(8,count);
  }
  function updateCheckerProgress(){const c=answeredCount(),pct=Math.round(c/8*100);$('#checkerProgressText').textContent=`${c} / 8 answered`;$('#checkerProgressBar').style.width=`${pct}%`;}
  function runChecker(persist=true){
    const dob=$('#ecDob').value, voter=$('#ecVoter').value,resident=$('#ecResident').value,literacy=$('#ecLiteracy').value,conviction=$('#ecConviction').value,related=$('#ecRelated').value;
    const rows=[]; let fail=false; let missing=false;
    if(!dob){rows.push(['Age on Nov 2, 2026','Needs answer','check-status-review']);missing=true;} else {const d=new Date(`${dob}T00:00:00+08:00`);let age=ELECTION_DATE.getFullYear()-d.getFullYear();const md=ELECTION_DATE.getMonth()-d.getMonth();if(md<0||(md===0&&ELECTION_DATE.getDate()<d.getDate()))age--;const ok=age>=18&&age<=24;rows.push(['Age on election day',`${age} years — ${ok?'within':'outside'} 18–24 range`,ok?'check-status-ok':'check-status-no']);if(!ok)fail=true;}
    const boolChecks=[['Qualified KK voter',voter],['1-year barangay residency',resident],['Read/write requirement',literacy]];
    boolChecks.forEach(([label,val])=>{if(!val){rows.push([label,'Needs answer','check-status-review']);missing=true;}else{const ok=val==='yes';rows.push([label,ok?'Yes':'No',ok?'check-status-ok':'check-status-no']);if(!ok)fail=true;}});
    if(!conviction){rows.push(['Final conviction involving moral turpitude','Needs answer','check-status-review']);missing=true;}else{const ok=conviction==='no';rows.push(['Final conviction involving moral turpitude',ok?'No':'Yes',ok?'check-status-ok':'check-status-no']);if(!ok)fail=true;}
    if(!related){rows.push(['Second-degree relationship question','Needs answer','check-status-review']);missing=true;}else if(related==='no'){rows.push(['Second-degree relationship restriction','No such relationship reported','check-status-ok']);}
    else {
      const relation=$('#ecRelation').value,status=$('#ecRelativeStatus').value,office=$('#ecRelativeOffice').value,locality=$('#ecSameLocality').value; const {r,relevant}=analyzeKinship({relation,status,office,locality});
      rows.push(['Relationship',`${r.label} — ${r.degree}° ${r.type}`,'check-status-review']);
      rows.push(['Relative status',status==='incumbent'?'Incumbent elected official':status,'check-status-review']);
      rows.push(['Covered locality / office',`${office}; ${locality==='yes'?'same locality':'different locality'}`,'check-status-review']);
      if(relevant){rows.push(['Section 10 kinship check','Combination is directly relevant','check-status-no']);fail=true;}
      else rows.push(['Section 10 kinship check','Not automatically triggered by selected facts alone','check-status-ok']);
    }
    if(persist&&state.settings.save) saveCheckerInputs();
    const status=missing?'review':fail?'no':'ok';
    const top=status==='ok'?['All answered checks pass','No listed failure found from the provided facts.','ok']:status==='no'?['One or more listed requirements are not satisfied','Review the red items and the source documents before filing.','no']:['More information is needed','Complete the unanswered items to get a more complete rule summary.','warn'];
    $('#checkerResult').innerHTML=`<div class="result-summary"><div class="result-status ${top[2]}"><i class="fa-solid ${top[2]==='ok'?'fa-circle-check':top[2]==='no'?'fa-circle-xmark':'fa-circle-question'}"></i><div><strong>${top[0]}</strong><p>${top[1]}</p></div></div><div class="result-list">${rows.map(r=>`<div class="result-row"><span>${escapeHtml(r[0])}</span><strong class="${r[2]}">${escapeHtml(r[1])}</strong></div>`).join('')}</div><div class="result-foot">Educational tool only. The checker applies a simplified rule model to the answers entered; it does not issue a COMELEC or court determination.</div><button class="outline-btn full" id="printCheckerResult"><i class="fa-solid fa-print"></i> Print result</button></div>`;
    $('#printCheckerResult')?.addEventListener('click',()=>window.print());
    $('#checkerResultPanel')?.scrollIntoView({behavior:'smooth',block:'nearest'});
    updateCheckerProgress();
  }

  function renderCoc(){
    const html=cocItems.map(([id,title,desc])=>`<label class="coc-item"><input type="checkbox" data-coc="${id}" ${state.coc[id]?'checked':''}><div><strong>${title}</strong><p>${desc}</p></div></label>`).join('');
    $('#cocChecklist').innerHTML=html;
    $$('[data-coc]').forEach(cb=>cb.addEventListener('change',()=>{state.coc[cb.dataset.coc]=cb.checked;saveState();updateCocProgress();}));
    updateCocProgress();
  }
  function updateCocProgress(){const total=cocItems.length;const done=cocItems.filter(x=>state.coc[x[0]]).length;const pct=Math.round(done/total*100);$('#cocProgressText').textContent=`${pct}%`;$('#cocProgressBar').style.width=`${pct}%`;}

  function renderCalendar(){
    const q=($('#calendarSearch')?.value||'').trim().toLowerCase(),filter=$('#calendarFilter')?.value||'all';
    const data=calendarEvents.filter(e=>(filter==='all'||e.category===filter)&&(!q||`${e.title} ${e.description} ${e.basis} ${e.date}`.toLowerCase().includes(q)));
    const now=new Date();
    $('#calendarList').innerHTML=data.map(e=>{const start=new Date(`${e.start}T00:00:00+08:00`);const highlight=Math.abs(start-now)<10*86400000;return `<article class="calendar-event ${highlight?'highlight':''}"><div class="calendar-date">${escapeHtml(e.date)}</div><div><h3>${escapeHtml(e.title)}</h3><p>${escapeHtml(e.description)} • <strong>${escapeHtml(e.basis)}</strong></p></div><span class="calendar-badge">${escapeHtml(e.category)}</span></article>`}).join('')||'<div class="panel"><strong>No calendar events match your search.</strong></div>';
  }

  function renderFaq(){
    const q=($('#faqSearch')?.value||'').trim().toLowerCase();
    $('#faqList').innerHTML=faqs.filter(x=>!q||x[0].toLowerCase().includes(q)||x[1].toLowerCase().includes(q)).map((x,i)=>`<div class="faq-item"><button class="faq-question" type="button"><span>${escapeHtml(x[0])}</span><i class="fa-solid fa-chevron-down"></i></button><div class="faq-answer">${escapeHtml(x[1])}</div></div>`).join('')||'<div class="panel"><strong>No FAQ matched your search.</strong></div>';
    $$('.faq-question').forEach(btn=>btn.addEventListener('click',()=>btn.parentElement.classList.toggle('open')));
  }

  function renderSources(){
    $('#sourceGrid').innerHTML=sources.map(s=>`<article class="source-card"><div class="source-logo"><i class="fa-solid ${s.icon}"></i></div><div><strong>${escapeHtml(s.title)}</strong><div class="source-id">${escapeHtml(s.id)}</div><p>${escapeHtml(s.desc)}</p><a href="${s.url}" target="_blank" rel="noopener noreferrer">Open official source <i class="fa-solid fa-arrow-up-right-from-square"></i></a></div></article>`).join('');
  }

  function renderNotifications(){
    if(!state.settings.notifications){$('#notificationBadge')?.classList.add('hidden');return;}
    const now=new Date(), upcoming=calendarEvents.filter(e=>new Date(`${e.start}T00:00:00+08:00`)>=new Date(now.toDateString())).slice(0,4);
    $('#notificationList').innerHTML=upcoming.map((e,i)=>`<div class="notification-item ${state.notificationsRead?'':'unread'}"><i class="fa-solid ${e.category==='filing'?'fa-file-signature':e.category==='campaign'?'fa-bullhorn':e.category==='election'?'fa-calendar-check':'fa-circle-info'}"></i><div><strong>${escapeHtml(e.title)}</strong><span>${escapeHtml(e.date)}</span></div></div>`).join('');
    const unread=state.notificationsRead?0:Math.min(upcoming.length,9); const badge=$('#notificationBadge'); if(unread){badge.textContent=unread;badge.classList.remove('hidden');}else badge.classList.add('hidden');
  }

  function initNotifications(){
    $('#notifBtn')?.addEventListener('click',()=>{const panel=$('#notificationPanel'),open=panel.classList.toggle('open');$('#notifBtn').setAttribute('aria-expanded',String(open));});
    $('#markNotificationsRead')?.addEventListener('click',()=>{state.notificationsRead=true;saveState();renderNotifications();});
    $('#viewAllNotifications')?.addEventListener('click',()=>setPage('calendar'));
    renderNotifications();
  }

  function initSettings(){
    $('#defaultPage').value=state.settings.defaultPage||'dashboard'; $('#prefNotifications').checked=state.settings.notifications!==false; $('#prefSave').checked=state.settings.save!==false;
    $('#saveSettings')?.addEventListener('click',()=>{state.settings.defaultPage=$('#defaultPage').value;state.settings.notifications=$('#prefNotifications').checked;state.settings.save=$('#prefSave').checked;saveState();renderNotifications();toast('Settings saved locally');});
    $('#exportData')?.addEventListener('click',()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='bske2026-guide-data.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);});
    $('#clearData')?.addEventListener('click',()=>{if(confirm('Clear locally saved checklist, settings, scenarios, and checker answers?')){localStorage.removeItem(STORAGE_KEY);location.reload();}});
  }

  function initSearch(){
    const input=$('#globalSearch'); if(!input) return;
    const index=[
      ...requirements.sk.map(x=>({page:'requirements',label:x[0],desc:x[1]})),
      ...prohibitedActs.map(x=>({page:'prohibited',label:x[0],desc:x[1]})),
      ...faqs.map(x=>({page:'faq',label:x[0],desc:x[1]})),
      ...scenarios.map(x=>({page:'scenarios',label:x.title,desc:x.description})),
      ...calendarEvents.map(x=>({page:'calendar',label:x.title,desc:x.date})),
      ...sources.map(x=>({page:'sources',label:x.title,desc:x.desc}))
    ];
    const wrap=document.createElement('div');wrap.className='global-search-results';document.querySelector('.topbar')?.appendChild(wrap);
    function draw(){const q=input.value.trim().toLowerCase();if(!q){wrap.innerHTML='';wrap.classList.remove('open');return;}const results=index.filter(x=>(x.label+' '+x.desc).toLowerCase().includes(q)).slice(0,7);wrap.innerHTML=results.length?results.map((r,i)=>`<button type="button" data-search-page="${r.page}" data-i="${i}"><strong>${escapeHtml(r.label)}</strong><span>${escapeHtml(r.desc)}</span></button>`).join(''):'<div class="search-empty">No guide result found.</div>';wrap.classList.add('open');$$('[data-search-page]',wrap).forEach(b=>b.addEventListener('click',()=>{setPage(b.dataset.searchPage);input.value='';wrap.classList.remove('open');}));}
    input.addEventListener('input',draw); document.addEventListener('click',e=>{if(!wrap.contains(e.target)&&e.target!==input) wrap.classList.remove('open');});
  }

  function initCoc(){renderCoc();$('#resetCoc')?.addEventListener('click',()=>{if(confirm('Reset the COC checklist?')){state.coc={};saveState();renderCoc();toast('Checklist reset');}});}

  function initPrint(){
    $('#printCalendar')?.addEventListener('click',()=>window.print());
  }

  function initPwa(){
    let deferred=null; const btn=$('#installAppBtn');
    const standalone=()=>window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;
    const isIOS=/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    const isSafari=/Safari/i.test(navigator.userAgent)&&!/Chrome|CriOS|Android|Edg|OPR|FxiOS/i.test(navigator.userAgent);
    const show=(title,body)=>{const el=document.createElement('div');el.className='pwa-modal-shell';el.innerHTML=`<div class="pwa-modal-backdrop"><div class="pwa-modal"><button class="pwa-modal-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button><div class="pwa-modal-icon"><img src="./assets/icon-180.png" alt="BSKE 2026"><i class="fa-solid fa-scale-balanced" style="display:none"></i></div><h2>${title}</h2>${body}<button class="primary-btn pwa-close-btn">Done</button></div></div>`;document.body.appendChild(el);const close=()=>el.remove();$('.pwa-modal-close',el).onclick=close;$('.pwa-close-btn',el).onclick=close;$('.pwa-modal-backdrop',el).onclick=e=>{if(e.target===e.currentTarget)close();};};
    if(standalone()) btn?.style.setProperty('display','none');
    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;});
    btn?.addEventListener('click',async()=>{if(standalone()){show('Already installed','<p class="install-intro">The BSKE 2026 guide is already installed on this device.</p>');return;}if(deferred){deferred.prompt();try{await deferred.userChoice;}catch{}deferred=null;return;}if(isIOS){show('Install on iPhone / iPad','<div class="install-instructions"><div class="install-step"><span>1</span><div>Open this site in <strong>Safari</strong>.</div></div><div class="install-step"><span>2</span><div>Tap <strong>Share</strong>.</div></div><div class="install-step"><span>3</span><div>Select <strong>Add to Home Screen</strong>.</div></div></div>');return;}if(isSafari){show('Install on Safari',`<div class="install-instructions"><div class="install-step"><span>1</span><div>Open Safari's <strong>File</strong> menu.</div></div><div class="install-step"><span>2</span><div>Select <strong>Add to Dock</strong> or the available install option.</div></div></div>`);return;}show('Install BSKE 2026','<p class="install-intro">Use your browser menu and choose <strong>Install</strong> or <strong>Add to Home Screen</strong> when available.</p>');});
    if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  }

  function init(){
    initNavigation(); renderRequirements(); renderDegreeCards(); renderScenarios(); renderProhibited(); initScenarioForm(); initChecker(); initCoc(); renderCalendar(); renderFaq(); renderSources(); initNotifications(); initSettings(); initSearch(); initPrint(); initPwa(); updateDateTime(); renderMiniTimeline(); setInterval(updateDateTime,1000);
    $('#calendarSearch')?.addEventListener('input',renderCalendar);$('#calendarFilter')?.addEventListener('change',renderCalendar);$('#faqSearch')?.addEventListener('input',renderFaq);
    $$('.info-tab').forEach(b=>b.addEventListener('click',()=>renderRequirements(b.dataset.reqTab)));
    const hash=(location.hash||'').replace('#','');setPage(hash||state.settings.defaultPage||'dashboard');
    $('#ecRelated')?.dispatchEvent(new Event('change'));
  }

  document.addEventListener('DOMContentLoaded',init);
})();

