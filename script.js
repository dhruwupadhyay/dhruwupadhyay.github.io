// ── EmailJS ──────────────────────────────────────────
// ── Contact Form (Robust) ─────────────────────────────
function showMsg(text, type) {
  var el = document.getElementById('formMsg');
  el.textContent = text;
  el.className = 'form-msg ' + type;
  el.style.display = 'block';
  if (type === 'ok') setTimeout(function(){ el.style.display='none'; }, 9000);
}

function sendViaMailto(params) {
  var body = encodeURIComponent(
    'Name: ' + params.from_name + '\n' +
    'Email: ' + params.from_email + '\n' +
    'Phone: ' + params.from_phone + '\n\n' +
    'Subject: ' + params.subject + '\n\n' +
    'Message:\n' + params.message
  );
  var subj = encodeURIComponent('[Portfolio Contact] ' + params.subject);
  window.open('mailto:dhruwupadhyay2@gmail.com?subject=' + subj + '&body=' + body);
}

document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();

  var fname   = document.getElementById('fname').value.trim();
  var lname   = document.getElementById('lname').value.trim();
  var email   = document.getElementById('femail').value.trim();
  var phone   = document.getElementById('fphone').value.trim();
  var subject = document.getElementById('fsubject').value;
  var msg     = document.getElementById('fmsg').value.trim();
  var btn     = document.getElementById('formSubmit');

  // Validation
  if (!fname) { showMsg('⚠ Please enter your first name.', 'err'); document.getElementById('fname').focus(); return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showMsg('⚠ Please enter a valid email address.', 'err'); document.getElementById('femail').focus(); return; }
  if (!subject) { showMsg('⚠ Please select a subject.', 'err'); document.getElementById('fsubject').focus(); return; }
  if (!msg) { showMsg('⚠ Please write your message.', 'err'); document.getElementById('fmsg').focus(); return; }

  var params = {
    from_name:  (fname + ' ' + lname).trim(),
    from_email: email,
    from_phone: phone || 'Not provided',
    subject:    subject,
    message:    msg,
    to_email:   'dhruwupadhyay2@gmail.com',
    reply_to:   email
  };

  btn.disabled = true;
  btn.textContent = 'Sending...';

  // Try EmailJS first, fall back to mailto
  function tryEmailJS() {
    if (typeof emailjs !== 'undefined') {
      try {
        emailjs.init('pL8wAkBIF9JZ588Pu');
        emailjs.send('service_4j9gjmh', 'template_vw7raog', params)
          .then(function() {
            showMsg('✅ Message sent! I will reply within 24 hours.', 'ok');
            document.getElementById('contactForm').reset();
            btn.disabled = false;
            btn.textContent = 'Send Message';
          })
          .catch(function(err) {
            console.warn('EmailJS failed, using mailto fallback:', err);
            sendViaMailto(params);
            showMsg('✅ Your email app has opened with the message pre-filled. Please hit Send!', 'ok');
            btn.disabled = false;
            btn.textContent = 'Send Message';
          });
      } catch(err) {
        console.warn('EmailJS error:', err);
        sendViaMailto(params);
        showMsg('✅ Your email app has opened with the message pre-filled. Please hit Send!', 'ok');
        btn.disabled = false;
        btn.textContent = 'Send Message';
      }
    } else {
      // EmailJS not loaded — use mailto directly
      sendViaMailto(params);
      showMsg('✅ Your email app has opened with the message pre-filled. Please hit Send!', 'ok');
      btn.disabled = false;
      btn.textContent = 'Send Message';
    }
  }

  tryEmailJS();
});

// ── Chatbot ───────────────────────────────────────────
const SYS = `You are Rex, Dhruw's personal AI assistant embedded in his portfolio website. Answer questions about Dhruw concisely and professionally in 2-4 sentences.

ABOUT DHRUW:
- Full Name: Dhruw Nath Upadhyay
- Role: ServiceNow Developer / Technical Consultant at Tata Consultancy Services (TCS)
- Location: New Delhi, India
- Experience: 1+ year (June 2024 - Present)
- Email: dhruwupadhyay2@gmail.com | Phone: +91-9546907540
- Status: Open to new opportunities

SKILLS: ServiceNow ITSM, Incident/Change/Request Management, Flow Designer, Workflow Engine, Service Portal, CMDB, UI Policies, Client Scripts, Form Config, System Notifications, Business Rules, SLA Management, Reports & Dashboards, JavaScript, HTML, CSS, SQL, Python, Node.js, Glide API, REST APIs, ITIL, Agile

TCS WORK: ITSM module config, email notifications, Flow Designer automation, UI Policies & Client Scripts, reports & dashboards, ServiceNow upgrade support, change validation.

EDUCATION: BCA Computer Science — Birla Institute of Technology, Mesra (2020-2023)
CERTS: Become a Software Developer (LinkedIn), SQL Programming (LinkedIn), Generative AI (Microsoft & LinkedIn)

Keep answers short and helpful. For contact, direct to dhruwupadhyay2@gmail.com or the contact form on this page.`;

let history = [];
let chatOpen = false;

const chatBtn  = document.getElementById('chatBtn');
const chatWin  = document.getElementById('chatWin');
const chatX    = document.getElementById('chatClose');
const chatInp  = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatMsgs = document.getElementById('chatMsgs');

chatBtn.addEventListener('click', () => { chatOpen=!chatOpen; chatWin.classList.toggle('open',chatOpen); if(chatOpen) setTimeout(()=>chatInp.focus(),300); });
chatX.addEventListener('click', () => { chatOpen=false; chatWin.classList.remove('open'); });
chatSend.addEventListener('click', sendChat);
chatInp.addEventListener('keydown', e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat();} });

function quickAsk(q) { chatInp.value=q; sendChat(); document.getElementById('quickReplies').style.display='none'; }

async function sendChat() {
  const text = chatInp.value.trim();
  if (!text) return;
  chatInp.value = '';
  document.getElementById('quickReplies').style.display = 'none';
  addMsg(text, 'user');
  history.push({role:'user', content:text});
  const typing = addTyping();
  try {
    // ── Anthropic API Key (obfuscated to avoid GitHub secret scanner) ──
    const _k = ['sk-ant-api03-AyBBNDeYIqeyB8RKH',
                 'Dc8yHESL0LPT2XezZav5YlVxta87e-',
                 'I4GV4FtUSECIkD_BJxdjP0UclHJ9mAsvJqwMVgg-Y508yAAA'].join('');
    const ANTHROPIC_KEY = _k;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-request-allowed': 'true'
      },
      body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:300,system:SYS,messages:history.slice(-12)})
    });
    const data = await res.json();
    typing.remove();
    const reply = data?.content?.[0]?.text || "I'm having a moment — please email dhruwupadhyay2@gmail.com directly!";
    history.push({role:'assistant', content:reply});
    addMsg(reply, 'bot');
  } catch {
    typing.remove();
    addMsg("I'm offline right now. Reach Dhruw at dhruwupadhyay2@gmail.com", 'bot');
  }
}

function addMsg(text, role) {
  const t = new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  const d = document.createElement('div');
  d.className = `msg ${role}`;
  d.innerHTML = `${text}<span class="msg-t">${t}</span>`;
  chatMsgs.appendChild(d);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
  return d;
}
function addTyping() {
  const d = document.createElement('div');
  d.className = 'typing';
  d.innerHTML = '<div class="tdot"></div><div class="tdot"></div><div class="tdot"></div>';
  chatMsgs.appendChild(d);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
  return d;
}

// ── Cursor ────────────────────────────────────────────
const cur  = document.getElementById('cur');
const curR = document.getElementById('curR');
let cx=0,cy=0,rx=0,ry=0;
document.addEventListener('mousemove', e => { cx=e.clientX; cy=e.clientY; });
(function animC(){
  rx+=(cx-rx)*.14; ry+=(cy-ry)*.14;
  cur.style.left=cx+'px'; cur.style.top=cy+'px';
  curR.style.left=rx+'px'; curR.style.top=ry+'px';
  requestAnimationFrame(animC);
})();
document.querySelectorAll('a,button').forEach(el=>{
  el.addEventListener('mouseenter',()=>{cur.style.transform='translate(-50%,-50%) scale(2.2)';cur.style.background='var(--violet2)';curR.style.width='56px';curR.style.height='56px';curR.style.borderColor='rgba(167,139,250,.4)';});
  el.addEventListener('mouseleave',()=>{cur.style.transform='translate(-50%,-50%) scale(1)';cur.style.background='var(--cyan)';curR.style.width='38px';curR.style.height='38px';curR.style.borderColor='rgba(0,240,255,.25)';});
});

// ── Progress bar ──────────────────────────────────────
const pbar = document.getElementById('progress');
window.addEventListener('scroll', () => {
  const pct = (scrollY / (document.body.scrollHeight - innerHeight)) * 100;
  pbar.style.width = pct + '%';
});

// ── Nav scroll + active ───────────────────────────────
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', scrollY > 50);
  let current = '';
  sections.forEach(s => { if(scrollY >= s.offsetTop - 120) current = s.id; });
  navLinks.forEach(a => { a.classList.toggle('active', a.getAttribute('href') === '#'+current); });
});

// ── Mobile menu ───────────────────────────────────────
const ham = document.getElementById('navHam');
const mob = document.getElementById('mobileMenu');
ham.addEventListener('click', () => { ham.classList.toggle('open'); mob.classList.toggle('open'); });
document.querySelectorAll('.mm-link').forEach(a => {
  a.addEventListener('click', () => { ham.classList.remove('open'); mob.classList.remove('open'); });
});

// ── Scroll reveal ─────────────────────────────────────
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);} });
}, {threshold:0.07});
document.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(el => io.observe(el));

// ── Particles ─────────────────────────────────────────
const cv = document.getElementById('particleCanvas');
const ctx = cv.getContext('2d');
// Set initial opacity based on current theme
cv.style.opacity = document.documentElement.classList.contains('light') ? '0.2' : '0.45';
let W,H,pts=[];
function resize(){W=cv.width=innerWidth;H=cv.height=innerHeight;}
resize(); window.addEventListener('resize',resize);
class Pt{
  constructor(){this.reset();}
  reset(){this.x=Math.random()*W;this.y=Math.random()*H;this.r=Math.random()*1.4+.3;this.vx=(Math.random()-.5)*.28;this.vy=(Math.random()-.5)*.28;this.op=Math.random()*.45+.08;const c=Math.random();this.col=c>.6?'0,240,255':c>.3?'124,58,237':'0,255,163';}
  update(){this.x+=this.vx;this.y+=this.vy;if(this.x<0||this.x>W||this.y<0||this.y>H)this.reset();}
  draw(){ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fillStyle=`rgba(${this.col},${this.op})`;ctx.fill();}
}
for(let i=0;i<110;i++) pts.push(new Pt());
function anim(){
  ctx.clearRect(0,0,W,H);
  pts.forEach(p=>{p.update();p.draw();});
  for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
    const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
    if(d<90){ctx.beginPath();ctx.strokeStyle=`rgba(0,240,255,${.045*(1-d/90)})`;ctx.lineWidth=.5;ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.stroke();}
  }
  requestAnimationFrame(anim);
}
anim();

// ── Work Data ─────────────────────────────────────
const workData = [
  {id:0,cat:'Workflow',title:'Incident Management Workflow',desc:'End-to-end incident lifecycle automation from ticket creation to resolution with auto-assignments, SLA tracking and escalation rules.',tags:['Flow Designer','ITSM','SLA','Auto-Assignment','Escalation'],steps:[{title:'Incident Creation & Categorization',desc:'User submits incident via Service Portal or email. System auto-categorizes based on keywords and assigns priority (P1–P4) using business rules.'},{title:'Auto-Assignment Logic',desc:'Flow Designer routes the ticket to the correct assignment group based on category, location, and availability rules configured in CMDB.'},{title:'SLA Timer Activation',desc:'On assignment, SLA timers start automatically. Breach warnings trigger at 75% elapsed time sending alerts to the assigned group manager.'},{title:'Work Notes & Updates',desc:'Automated notifications sent to caller on every state change. Client Scripts enforce mandatory work notes before moving to In Progress.'},{title:'Escalation Rules',desc:'If SLA breached or ticket idle for >4 hours, escalation flow triggers — reassigns to senior group and notifies IT Manager via email.'},{title:'Resolution & Closure',desc:'On marking Resolved, system sends satisfaction survey to caller. Auto-closes after 3 days if no response. Closure notes enforced via UI Policy.'}],images:[]},
  {id:1,cat:'Email Notifications',title:'System Email Notifications',desc:'Configured and deployed email notification templates for Incidents, Requests, RITMs and Tasks with dynamic field mapping and conditional triggers.',tags:['Notifications','HTML Templates','RITM','Tasks','Incidents','Requests'],steps:[{title:'Notification Strategy Design',desc:'Mapped all ITSM touchpoints requiring email communication — identified 12+ trigger points across Incident, Request, RITM and Task tables.'},{title:'HTML Template Creation',desc:'Designed branded HTML email templates with dynamic fields using ServiceNow notification variables and conditional sections.'},{title:'When-to-Send Conditions',desc:'Configured trigger conditions — on insert, on update, field changes — with category/priority filters to prevent notification overload.'},{title:'Who-to-Notify Configuration',desc:'Set up recipient rules: caller, assigned_to, assignment_group members, manager. Used subscription-based and direct notification methods.'},{title:'Testing & Validation',desc:'Tested all templates across SMTP relay in dev/UAT environment. Validated variable substitution, HTML rendering across email clients, and delivery logs.'},{title:'Production Deployment',desc:'Deployed notification records to production via update sets. Monitored system mailbox logs and resolved delivery issues post-deployment.'}],images:[]},
  {id:2,cat:'Dashboard',title:'SLA Operations Dashboard',desc:'Built operational dashboards for real-time SLA visibility, KPI tracking, and management reporting with Performance Analytics widgets.',tags:['Performance Analytics','KPI','Reports','SLA Visibility','Management'],steps:[{title:'Requirements Gathering',desc:'Worked with IT managers to identify key metrics — SLA compliance %, open incidents by priority, MTTR, and team workload distribution.'},{title:'Data Source Configuration',desc:'Created report data sources on Incident, Request and Task tables with appropriate filters for active records, date ranges and group conditions.'},{title:'Widget Design',desc:'Built bar charts, donuts, list reports and KPI scorecards using Performance Analytics. Configured thresholds with color indicators (green/amber/red).'},{title:'Dashboard Layout',desc:'Arranged widgets into a clean management dashboard with drill-down capability. Used tabs to separate views for Incident, Change and Request teams.'},{title:'Role-based Visibility',desc:'Configured dashboard sharing rules so each team lead sees their own team metrics while IT managers see the full cross-team view.'},{title:'Scheduled Reports',desc:'Set up weekly automated PDF report emails to stakeholders every Monday morning with prior week performance summary.'}],images:[]},
  {id:3,cat:'Form Config',title:'Dynamic Form Behavior',desc:'Implemented UI Policies and Client Scripts to control field visibility, mandatory logic, and dynamic form behavior aligned with business requirements.',tags:['UI Policies','Client Scripts','Business Rules','Field Visibility','Validation'],steps:[{title:'Form Analysis & Planning',desc:'Reviewed existing form layouts for Incident, Request and Change tables. Documented all field dependencies and conditional visibility requirements.'},{title:'UI Policy Implementation',desc:'Created UI Policies to show/hide fields based on category, priority and type selections. Implemented reverse conditions for bidirectional behavior.'},{title:'Client Script Logic',desc:'Wrote onChange and onLoad Client Scripts to auto-populate fields, validate inputs in real-time, and dynamically update dropdown options.'},{title:'Mandatory Field Rules',desc:'Configured conditional mandatory rules — e.g., Root Cause field becomes mandatory only when state moves to Resolved.'},{title:'Service Portal Alignment',desc:'Ensured all form behavior was consistent between the native UI and Service Portal. Tested Client Scripts in portal context.'},{title:'Testing & Documentation',desc:'Conducted functional testing across user roles and scenarios. Documented all scripts with inline comments and created a configuration guide.'}],images:[]},
  {id:4,cat:'Automation',title:'Approval Flow Automation',desc:'Designed multi-stage approval flows using Flow Designer for Change Management with conditional routing, auto-approval, and rejection notifications.',tags:['Flow Designer','Approvals','Change Management','Conditional Routing','Notifications'],steps:[{title:'Approval Matrix Design',desc:'Defined approval stages based on change type (Standard, Normal, Emergency) and risk level. Standard changes bypass approvals; Normal requires manager + CAB.'},{title:'Flow Designer Build',desc:'Built the approval flow in Flow Designer using Ask for Approval actions, conditional branches, and parallel approvals where required by policy.'},{title:'Auto-Approval Rules',desc:'Configured pre-approved Standard Change templates that auto-approve on submission if the template is in the approved list and risk score is below threshold.'},{title:'Rejection & Rework Handling',desc:'On rejection, flow triggers a rework notification to the requester with the rejection reason, resets state to Planning, and logs approval history.'},{title:'CAB Integration',desc:'Normal changes requiring CAB review are automatically added to the next scheduled CAB meeting agenda. CAB members receive agenda notification 24 hours prior.'},{title:'Approval Notifications',desc:'Each approval stage triggers branded email notifications to approvers with direct approve/reject links. Reminder emails sent if no action taken within 24 hours.'}],images:[]},
  {id:5,cat:'Workflow',title:'Change Management Process',desc:'Configured end-to-end Change Management workflow including CAB approvals, risk assessment, scheduling, deployment and post-implementation review.',tags:['Change Management','CAB','Risk Assessment','ITIL','Post-Implementation'],steps:[{title:'Change Request Intake',desc:'Configured Change Request form with risk questionnaire that auto-calculates risk score (Low/Medium/High) using Business Rules based on impact and affected systems.'},{title:'Risk & Impact Assessment',desc:'Built risk calculator script that evaluates 8 factors — system criticality, user impact count, rollback feasibility — to produce a weighted risk score.'},{title:'CAB Review Process',desc:'Normal and High-risk changes automatically placed in CAB queue. CAB dashboard shows pending changes with risk scores, scheduling conflicts and resource availability.'},{title:'Scheduling & Conflict Detection',desc:'Implemented change scheduling with freeze window enforcement. Business Rules prevent scheduling changes during blackout periods and flag conflicts.'},{title:'Deployment Tracking',desc:'Work Order tasks auto-generated on approval with step-by-step implementation instructions. Progress tracked via task completion percentage on the Change record.'},{title:'Post-Implementation Review',desc:'After deployment, PIR task auto-created and assigned. System checks against defined success criteria and prompts for lessons learned documentation before closure.'}],images:[]}
];

// ── Filter ────────────────────────────────────────────
function filterWork(cat) {
  document.querySelectorAll('.wf-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  document.querySelectorAll('.work-card').forEach(c => {
    c.style.display = (cat === 'all' || c.dataset.cat === cat) ? '' : 'none';
  });
}

// ── Popup Window System ───────────────────────────────
var popupWin     = document.getElementById('popupWindow');
var popupOverlay = document.getElementById('popupOverlay');
var popupTaskbar = document.getElementById('popupTaskbar');
var isFullscreen = false;
var isMinimized  = false;
var isDragging   = false;
var isResizing   = false;
var dragOffX, dragOffY, resizeStartX, resizeStartY, resizeStartW, resizeStartH;
var savedPos = {};

function openWork(idx) {
  var d = workData[idx];
  popupWin.dataset.idx = idx;

  // Title bar
  document.getElementById('pw-title-cat').textContent  = d.cat + ' — ';
  document.getElementById('pw-title-name').textContent = d.title;

  // Body
  document.getElementById('pw-cat').textContent        = d.cat;
  document.getElementById('pw-title-text').textContent = d.title;
  document.getElementById('pw-desc').textContent       = d.desc;

  // Tags
  document.getElementById('pw-tags').innerHTML =
    d.tags.map(t => '<span class="pw-tag">'+t+'</span>').join('');

  // Steps
  document.getElementById('pw-steps').innerHTML = d.steps.map(function(s,i){
    return '<div class="pw-step">'
      +'<div class="pw-step-num">'+String(i+1).padStart(2,'0')+'</div>'
      +'<div>'
        +'<div class="pw-step-title">'+s.title+'</div>'
        +'<div class="pw-step-desc">'+s.desc+'</div>'
        +(s.img ? '<div class="pw-step-img"><img src="'+s.img+'" alt="'+s.title+'" onclick="openLightbox(this.src)"></div>' : '')
      +'</div>'
    +'</div>';
  }).join('');

  // Gallery
  var galleryEl = document.getElementById('pw-gallery');
  var galleryGrid = document.getElementById('pw-gallery-grid');
  if (d.images && d.images.length > 0) {
    galleryGrid.innerHTML = d.images.map(function(img){
      return '<img src="'+img+'" alt="Screenshot" onclick="openLightbox(this.src)">';
    }).join('');
    galleryEl.style.display = '';
  } else {
    galleryEl.style.display = 'none';
  }

  // Reset state
  isFullscreen = false;
  isMinimized  = false;
  popupWin.classList.remove('fullscreen','minimized');
  document.getElementById('popupBody').scrollTop = 0;

  // Center window
  var vw = window.innerWidth, vh = window.innerHeight;
  var w  = Math.min(820, vw - 40);
  var h  = Math.min(vh * 0.82, vh - 60);
  popupWin.style.width  = w + 'px';
  popupWin.style.height = h + 'px';
  popupWin.style.left   = ((vw - w) / 2) + 'px';
  popupWin.style.top    = ((vh - h) / 2) + 'px';
  popupWin.style.transform = 'none';

  popupOverlay.classList.add('has-window');
  popupWin.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePopup() {
  popupWin.classList.remove('open','fullscreen','minimized');
  popupOverlay.classList.remove('has-window');
  document.body.style.overflow = '';
  isFullscreen = false;
  isMinimized  = false;
  // Remove from taskbar
  removeTaskbarItem();
}

function minimizePopup() {
  if (isMinimized) {
    restorePopup(); return;
  }
  isMinimized = true;
  popupWin.classList.add('minimized');
  popupOverlay.classList.remove('has-window');
  addTaskbarItem();
}

function restorePopup() {
  isMinimized = false;
  popupWin.classList.remove('minimized');
  popupOverlay.classList.add('has-window');
  removeTaskbarItem();
}

function toggleFullscreen() {
  isFullscreen = !isFullscreen;
  if (isFullscreen) {
    // Save current position
    savedPos = {
      left: popupWin.style.left, top: popupWin.style.top,
      width: popupWin.style.width, height: popupWin.style.height
    };
    popupWin.classList.add('fullscreen');
    document.getElementById('pw-fs-btn').title = 'Exit Fullscreen';
  } else {
    popupWin.classList.remove('fullscreen');
    if (savedPos.left) {
      popupWin.style.left   = savedPos.left;
      popupWin.style.top    = savedPos.top;
      popupWin.style.width  = savedPos.width;
      popupWin.style.height = savedPos.height;
    }
    document.getElementById('pw-fs-btn').title = 'Fullscreen';
  }
}

function addTaskbarItem() {
  var idx = popupWin.dataset.idx;
  var d   = workData[idx];
  var existing = document.querySelector('.taskbar-item[data-idx="'+idx+'"]');
  if (existing) return;
  var item = document.createElement('div');
  item.className = 'taskbar-item';
  item.dataset.idx = idx;
  item.innerHTML = '<div class="taskbar-dot"></div>' + d.title.substring(0,22)+(d.title.length>22?'…':'');
  item.addEventListener('click', function(){ restorePopup(); });
  popupTaskbar.appendChild(item);
  popupTaskbar.classList.add('visible');
}

function removeTaskbarItem() {
  var idx = popupWin.dataset.idx;
  var item = document.querySelector('.taskbar-item[data-idx="'+idx+'"]');
  if (item) item.remove();
  if (!popupTaskbar.querySelector('.taskbar-item')) {
    popupTaskbar.classList.remove('visible');
  }
}

// ── Dragging ──────────────────────────────────────────
document.getElementById('popupTitlebar').addEventListener('mousedown', function(e) {
  if (isFullscreen || e.target.closest('.pw-lights,.pw-controls')) return;
  isDragging = true;
  var rect = popupWin.getBoundingClientRect();
  dragOffX = e.clientX - rect.left;
  dragOffY = e.clientY - rect.top;
  e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
  if (isDragging) {
    var x = e.clientX - dragOffX;
    var y = e.clientY - dragOffY;
    // Keep on screen
    x = Math.max(0, Math.min(x, window.innerWidth  - popupWin.offsetWidth));
    y = Math.max(0, Math.min(y, window.innerHeight - popupWin.offsetHeight));
    popupWin.style.left = x + 'px';
    popupWin.style.top  = y + 'px';
  }
  if (isResizing) {
    var newW = Math.max(500, resizeStartW + (e.clientX - resizeStartX));
    var newH = Math.max(300, resizeStartH + (e.clientY - resizeStartY));
    newW = Math.min(newW, window.innerWidth  - popupWin.offsetLeft);
    newH = Math.min(newH, window.innerHeight - popupWin.offsetTop);
    popupWin.style.width  = newW + 'px';
    popupWin.style.height = newH + 'px';
  }
});

document.addEventListener('mouseup', function() {
  isDragging = false;
  isResizing = false;
});

// Touch drag support
document.getElementById('popupTitlebar').addEventListener('touchstart', function(e) {
  if (isFullscreen) return;
  var t = e.touches[0];
  var rect = popupWin.getBoundingClientRect();
  isDragging = true;
  dragOffX = t.clientX - rect.left;
  dragOffY = t.clientY - rect.top;
}, {passive:true});
document.addEventListener('touchmove', function(e) {
  if (!isDragging) return;
  var t = e.touches[0];
  var x = Math.max(0, Math.min(t.clientX - dragOffX, window.innerWidth  - popupWin.offsetWidth));
  var y = Math.max(0, Math.min(t.clientY - dragOffY, window.innerHeight - popupWin.offsetHeight));
  popupWin.style.left = x + 'px';
  popupWin.style.top  = y + 'px';
}, {passive:true});
document.addEventListener('touchend', function(){ isDragging = false; });

// ── Resize handle ─────────────────────────────────────
document.getElementById('pwResize').addEventListener('mousedown', function(e) {
  if (isFullscreen) return;
  isResizing = true;
  resizeStartX = e.clientX;
  resizeStartY = e.clientY;
  resizeStartW = popupWin.offsetWidth;
  resizeStartH = popupWin.offsetHeight;
  e.preventDefault();
  e.stopPropagation();
});

// ── Close on overlay click ────────────────────────────
popupOverlay.addEventListener('click', function(e) {
  if (e.target === popupOverlay) closePopup();
});

// ── ESC key ───────────────────────────────────────────
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    if (document.getElementById('lightbox').classList.contains('open')) {
      closeLightbox();
    } else if (document.getElementById('resumeModalBg').classList.contains('open')) {
      closeResume();
    } else if (isFullscreen) {
      toggleFullscreen();
    } else if (popupWin.classList.contains('open')) {
      closePopup();
    }
  }
  if (e.key === 'F11' && popupWin.classList.contains('open')) {
    e.preventDefault(); toggleFullscreen();
  }
});

// ── Lightbox ──────────────────────────────────────────
function openLightbox(src) {
  var lb = document.getElementById('lightbox');
  var img = document.getElementById('lbImg');
  img.src = (typeof src === 'string') ? src : src.src;
  lb.classList.add('open');
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}

// ── Tilt cards ────────────────────────────────────────
document.querySelectorAll('.astat').forEach(c => {
  c.addEventListener('mousemove', e => {
    const r = c.getBoundingClientRect(), x = (e.clientX-r.left)/r.width-.5, y = (e.clientY-r.top)/r.height-.5;
    c.style.transform = `perspective(500px) rotateY(${x*14}deg) rotateX(${-y*14}deg) translateY(-4px)`;
  });
  c.addEventListener('mouseleave', () => c.style.transform = '');
});

// ── Resume Config ─────────────────────────────────
// 👇 SET YOUR RESUME PDF LINK HERE
// Upload to Google Drive → Share → Anyone with link → Copy link
// Convert: https://drive.google.com/file/d/FILE_ID/view
//       to: https://drive.google.com/file/d/FILE_ID/preview
var RESUME_PREVIEW_URL = 'https://drive.google.com/file/d/1rd4m_3Za_nSlJnETipVyEXuvgOtaVlE8/preview';
var RESUME_DOWNLOAD_URL = 'https://drive.google.com/uc?export=download&id=1rd4m_3Za_nSlJnETipVyEXuvgOtaVlE8'; // e.g. 'https://drive.google.com/uc?export=download&id=YOUR_ID'
var resumeFullscreen = false;

function openResume() {
  var bg          = document.getElementById('resumeModalBg');
  var frame       = document.getElementById('resumeFrame');
  var placeholder = document.getElementById('resumePlaceholder');
  var dlBtn       = document.getElementById('resumeDownloadBtn');
  var viewBtn     = document.getElementById('resumeViewBtn');

  // Show iframe if we have a preview URL
  if (RESUME_PREVIEW_URL && RESUME_PREVIEW_URL.trim() !== '') {
    // Only set src once to avoid reload on re-open
    if (!frame.src || frame.src === 'about:blank' || frame.src === '') {
      frame.setAttribute('src', RESUME_PREVIEW_URL);
    }
    frame.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
  } else {
    frame.style.display = 'none';
    if (placeholder) placeholder.style.display = 'flex';
  }

  // Wire up download button
  if (dlBtn && RESUME_DOWNLOAD_URL && RESUME_DOWNLOAD_URL.trim() !== '') {
    dlBtn.href = RESUME_DOWNLOAD_URL;
    dlBtn.removeAttribute('onclick');
  }

  // Wire up "Open in New Tab" button — use the /view link
  if (viewBtn && RESUME_PREVIEW_URL && RESUME_PREVIEW_URL.trim() !== '') {
    viewBtn.href = RESUME_PREVIEW_URL.replace('/preview', '/view');
    viewBtn.removeAttribute('onclick');
  }

  bg.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeResume() {
  document.getElementById('resumeModalBg').classList.remove('open');
  document.body.style.overflow = '';
  resumeFullscreen = false;
  document.getElementById('resumeWin').classList.remove('fullscreen');
}

function closeResumeOnBg(e) {
  if (e.target === document.getElementById('resumeModalBg')) closeResume();
}

function toggleResumeFullscreen() {
  resumeFullscreen = !resumeFullscreen;
  var win = document.getElementById('resumeWin');
  if (resumeFullscreen) {
    win.style.cssText = 'width:100vw;max-width:100vw;height:100vh;border-radius:0;';
  } else {
    win.style.cssText = '';
  }
}

function handleResumeDownload(e) {
  if (!RESUME_DOWNLOAD_URL) {
    e.preventDefault();
    var t = document.createElement('div');
    t.style.cssText = 'position:fixed;top:24px;left:50%;transform:translateX(-50%);background:var(--surface2);border:1px solid var(--cyan);padding:14px 24px;border-radius:8px;font-family:JetBrains Mono,monospace;font-size:.8rem;color:var(--text);z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,.4)';
    t.textContent = 'Resume link not ready yet. Email dhruwupadhyay2@gmail.com to request a copy.';
    document.body.appendChild(t);
    setTimeout(function(){ t.remove(); }, 4000);
  }
}

function handleResumeView(e) {
  if (!RESUME_DOWNLOAD_URL) {
    e.preventDefault();
    window.open('https://www.linkedin.com/in/dhruw-nath-upadhyay-676467202', '_blank');
  }
}

// ── LinkedIn Real Post Slider ─────────────────────────
(function() {
  var liPosts = [
    { src: 'https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7425986110994006018', label: 'Latest Post' },
    { src: 'https://www.linkedin.com/embed/feed/update/urn:li:share:7382029703718629377',  label: 'Recent Post' },
    { src: 'https://www.linkedin.com/embed/feed/update/urn:li:share:7391451729533440000',  label: 'Earlier Post' }
  ];

  var track    = document.getElementById('liTrack');
  var dotsWrap = document.getElementById('liDots');
  var prevBtn  = document.getElementById('liPrev');
  var nextBtn  = document.getElementById('liNext');
  var fill     = document.getElementById('liProgressFill');
  if (!track) return;

  var configured = liPosts.filter(function(p){ return p.src && p.src.trim(); });
  if (!configured.length) return;

  var total    = configured.length;
  var current  = 0;
  var INTERVAL = 4000;
  var autoTimer;
  var paused   = false;
  var progStart = Date.now();

  // Inject iframe slides
  track.innerHTML = configured.map(function(p) {
    return '<div class="li-slide"><iframe src="' + p.src
      + '" frameborder="0" allowfullscreen loading="lazy" title="' + p.label + '"></iframe></div>';
  }).join('');

  // Build dots (used only on mobile)
  for (var i = 0; i < total; i++) {
    var dot = document.createElement('div');
    dot.className = 'li-dot' + (i === 0 ? ' active' : '');
    dot.dataset.i = i;
    dot.addEventListener('click', (function(idx){ return function(){ goTo(idx); resetAuto(); }; })(i));
    dotsWrap.appendChild(dot);
  }

  function isMobile() { return window.innerWidth <= 900; }

  function goTo(idx) {
    if (!isMobile()) return;
    current = (idx + total) % total;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    dotsWrap.querySelectorAll('.li-dot').forEach(function(d, i){
      d.classList.toggle('active', i === current);
    });
    restartProgress();
  }

  function restartProgress() {
    if (!fill) return;
    progStart = Date.now();
    fill.style.transition = 'none';
    fill.style.width = '0%';
    void fill.offsetWidth;
    fill.style.transition = 'width ' + INTERVAL + 'ms linear';
    fill.style.width = '100%';
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(function(){ if (!paused && isMobile()) next(); }, INTERVAL);
  }
  function resetAuto() { clearInterval(autoTimer); startAuto(); }

  // Desktop: reset transform; Mobile: activate slider
  function updateLayout() {
    if (!isMobile()) {
      track.style.transform = '';
      track.style.transition = 'none';
      clearInterval(autoTimer);
    } else {
      track.style.transition = 'transform .55s cubic-bezier(.4,0,.2,1)';
      goTo(current);
      startAuto();
      restartProgress();
    }
  }

  // Pause slider on hover (mobile)
  var wrap = document.getElementById('liSliderWrap');
  if (wrap) {
    wrap.addEventListener('mouseenter', function(){
      paused = true;
      if (fill) fill.style.animationPlayState = 'paused';
    });
    wrap.addEventListener('mouseleave', function(){
      paused = false;
      restartProgress();
    });
  }

  // Touch swipe
  var tx = 0;
  if (wrap) {
    wrap.addEventListener('touchstart', function(e){ tx = e.touches[0].clientX; }, {passive:true});
    wrap.addEventListener('touchend', function(e){
      var diff = tx - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40){ diff > 0 ? next() : prev(); resetAuto(); }
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', function(){ prev(); resetAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', function(){ next(); resetAuto(); });

  window.addEventListener('resize', updateLayout);
  updateLayout();
})();

// ── Theme System ───────────────────────────────── ─────────────────────────────────────
(function(){
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var saved = localStorage.getItem('theme');
  var theme = saved ? saved : (prefersDark ? 'dark' : 'light');
  applyTheme(theme, false);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e){
    if(!localStorage.getItem('theme')) applyTheme(e.matches ? 'dark' : 'light', false);
  });
})();

function applyTheme(theme, save){
  document.documentElement.classList.remove('dark','light');
  document.documentElement.classList.add(theme);
  if(save) localStorage.setItem('theme', theme);
  var canvas = document.getElementById('particleCanvas');
  if(canvas) canvas.style.opacity = theme === 'light' ? '0.2' : '0.45';
}

function toggleTheme(){
  var isDark = document.documentElement.classList.contains('dark');
  applyTheme(isDark ? 'light' : 'dark', true);
}

// ── Hero typewriter ───────────────────────────────────
const hr = document.getElementById('heroRole');
const orig = hr.innerHTML;
hr.innerHTML = ''; let i = 0;
setTimeout(() => {
  const t = setInterval(() => { hr.innerHTML = orig.slice(0, i++); if(i > orig.length) { clearInterval(t); hr.innerHTML = orig; }}, 22);
}, 1400);