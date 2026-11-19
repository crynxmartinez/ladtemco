// The review prototype keeps a private local copy of the sample registers.
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const peso = v => '₱' + Number(v).toLocaleString('en-PH',{maximumFractionDigits:2});
const valueOfMoney = v => Number(String(v).replace(/[₱,]/g,''));
const dateText = v => new Date(v+'T12:00:00').toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'});
const demoDay = '2026-11-20';
const registerInfo = {};
const record = (id, values, action='Open', extra={}) => ({id, values, action, extra});
const starter = {};
for (const [key] of menus) {
  const el = document.createElement('div');
  el.innerHTML = screens[key].render();
  const tableEl = el.querySelector('table');
  if (!tableEl) continue;
  registerInfo[key] = {
    headers: [...tableEl.querySelectorAll('th')].slice(0,-1).map(el=>el.textContent.trim()),
    filters:[...el.querySelectorAll('.filter')].map(x=>x.textContent.trim()),
    tabs:[...el.querySelectorAll('.tabs span')].map(x=>x.textContent.trim()),
    numeric:[...tableEl.querySelectorAll('th')].map(th=>th.classList.contains('numeric')),
  };
  starter[key] = [...tableEl.tBodies[0].rows].map((tr,i)=>{
    const td=[...tr.cells], first=td[0], caption=first.querySelector('small')?.textContent || '';
    const values=td.slice(0,-1).map((c,j)=>j===0 ? (first.querySelector('strong')?.textContent || first.textContent).trim() : c.textContent.trim());
    const id=/^[A-Z]{2,}-/.test(caption) ? caption : key+'-'+(i+1);
    return record(id,values,td.at(-1).textContent.trim(),{caption});
  });
}
const auxReg = (key,headers,rows) => {
  registerInfo[key]={headers,filters:[],tabs:[],numeric:headers.map(h=>/Amount/.test(h))};
  starter[key]=rows;
};
auxReg('transactions',['Transaction','Member','Date','Amount','Status'],[
  record('CAP-2026-021',['Capital installment','Maria S. Dela Cruz','Nov 10, 2026','₱2,000','Posted'],'View'),
  record('CAP-2026-020',['Capital installment','Jose M. Reyes','Nov 06, 2026','₱1,000','Posted'],'View')
]);
auxReg('reconciliation',['Bank entry','Reference','Amount','Status'],[
  record('REC-001',['Counter deposit','Bank slip 5019','₱500','Unmatched'],'Match',{ledger:'CON-2026-0040'}),
  record('REC-002',['Assessment deposit','Bank slip 5016','₱2,500','Unmatched'],'Match',{ledger:'CON-2026-0039'}),
  record('REC-003',['Office expense','Missing ledger reference','₱7,800','Needs reference'],'Resolve',{ledger:'EXP-2026-0032'})
]);
auxReg('meetings',['Meeting','Date','Time','Venue'],[
  record('MTG-2026-012',['Board meeting','Dec 05, 2026','09:00','Ladtemco Hall, Languyan'],'Open agenda',{agenda:'Review November collections\nApprove training program liquidation\nReview the annual operating plan'})
]);
auxReg('permissions',['Role','Responsibilities','Scope'],[
  record('Treasurer',['Treasurer','Verify payments, review liquidations','Finance'],'Inspect'),
  record('Cashier',['Cashier','Record receipts and collections','Membership finance'],'Inspect'),
  record('Audit Committee',['Audit Committee','Inspect events and reports','Read-only oversight'],'Inspect'),
  record('Board Approver',['Board Approver','Review assigned requests','Governance'],'Inspect')
]);
const plans = {
  'Add member': ['members','Save application',[
    ['Member name','text','Lina M. Flores'],['Email','email','lina@example.org'],['Application date','date',demoDay]
  ]],
  'Record payment':['contributions','Save payment',[
    ['Member','member'],['Category','choice','Monthly dues|Special assessment'],['Amount received','money','500'],['Payment date','date',demoDay],['Receipt reference','text','OR-1051']
  ]],
  'Record capital payment':['share-capital','Post capital payment',[
    ['Member','capital'],['Amount received','money','1000'],['Payment date','date',demoDay],['Receipt reference','text','OR-1052']
  ]],
  'Create budget':['funds','Create budget',[
    ['Fund name','text','School supplies'],['Approved allocation','money','45000'],['Fiscal year','choice','2026|2027'],['Purpose','long','Purchase classroom supplies for partner schools.']
  ]],
  'New request':['expenses','Submit request',[
    ['Purpose','text','Classroom materials'],['Type','choice','Expense|Cash advance|Reimbursement'],['Fund','fund'],['Amount requested','money','3500'],['Justification','long','Materials for the November teacher workshop.']
  ]],
  'Start liquidation':['liquidations','Submit for review',[
    ['Released advance','advance'],['Supported spending','nonnegative','2800'],['Cash returned','nonnegative','700'],['Evidence reference','text','OR-1120 / deposit slip 37']
  ]],
  'Generate report':['reports','Generate report',[
    ['Report type','choice','Budget utilization|Collections summary|Liquidation aging'],['Period','choice','FY 2026|November 2026']
  ]],
  'Upload document':['meetings-documents','Save document',[
    ['Title','text','November board minutes'],['Type','choice','Minutes|Resolution|Financial report|Agenda'],['Audience','choice','Board only|All members'],['Document','file'],['Publication','choice','Draft|Published']
  ]],
  'Schedule meeting':['meetings','Schedule meeting',[
    ['Meeting title','text','Finance committee meeting'],['Meeting date','date','2026-12-08'],['Time','time','09:00'],['Venue','text','Ladtemco Hall'],['Agenda','long','Review outstanding cash advances.']
  ]],
  'Invite staff user':['users-roles','Create demo invitation',[
    ['Staff name','text','Mila A. Santos'],['Email','email','mila@example.org'],['Role','choice','Cashier|Treasurer|Audit Committee|Board Approver']
  ]]
};
const settingsForms = {
  'Cooperative profile':[['Cooperative name','text','Ladtemco Cooperative'],['Office','text','Languyan, Tawi-Tawi'],['Contact email','email','office@example.org']],
  'Fiscal year & currency':[['Fiscal year starts','choice','January|April|July|October'],['Reporting currency','choice','PHP'],['Time zone','choice','Asia/Manila']],
  'Contribution categories':[['Standard category','text','Monthly dues'],['Posting rule','choice','Verify before posting|Officer review required']],
  'Receipt numbering':[['Receipt prefix','text','OR'],['Next number','integer','1051']],
  'Notification rules':[['Approval reminders','choice','Daily|Weekly|Off'],['Due date reminder','choice','1 day before|3 days before|7 days before']],
  'Account security':[['Idle session limit','choice','15 minutes|30 minutes|60 minutes'],['Staff verification','choice','Two-factor required|Two-factor recommended']],
  'Data retention':[['Archive review interval','choice','Annually|Every six months'],['Archive approval','choice','Board approval|Audit committee review']]
};
const storeKey='ladtemco-admin-design-demo-v3';
const cleanState=()=>({tables:structuredClone(starter),settings:{},seq:100,changes:[],theme:'light'});
let demo=cleanState();
const isolated=new URLSearchParams(location.search).has('capture');
if(!isolated) {try {const saved=JSON.parse(localStorage.getItem(storeKey));if(saved?.tables?.permissions) demo=saved;} catch {}}
function persist(){
  if(isolated)return true;
  try{localStorage.setItem(storeKey,JSON.stringify(demo));return true;}
  catch{notify('Device storage is unavailable. Changes are available for this session.');return false;}
}
const nextRef=prefix=>`${prefix}-DEMO-${++demo.seq}`;
const byId=(key,id)=>demo.tables[key]?.find(r=>r.id===id);
const add=(key,row)=>{demo.tables[key].unshift(row);return row;};
const tableKeyForTab = (page,tab) => ({Transactions:'transactions',Reconciliation:'reconciliation',Meetings:'meetings','Role permissions':'permissions'}[tab] || page);
const statusColumn={'members':2,contributions:4,expenses:4,liquidations:4,approvals:4,reports:3,'meetings-documents':4,'users-roles':3,reconciliation:3};
const descriptions={
  'Add member':'Create a membership application for review.',
  'Record payment':'Record the receipt now. Verification posts it to the register.',
  'Record capital payment':'Credit a member’s paid-up shares and update the outstanding balance.',
  'Create budget':'Set an approved allocation and identify its purpose.',
  'New request':'Send a request against an available cooperative fund.',
  'Start liquidation':'Account for a released advance and identify the supporting evidence.',
  'Generate report':'Build a report using the local demonstration records.',
  'Upload document':'Choose a small text or PDF file to attach to the local demo.',
  'Schedule meeting':'Add the meeting time, venue, and agenda to the calendar.',
  'Invite staff user':'Create a local invitation record for the selected staff role.'
};
const liquidEvidence=[
  ['Training materials','OR-0801','₱14,000'],['Venue and equipment','OR-0802','₱12,800'],['Facilitator fees','OR-0803','₱15,000'],['Participant travel','OR-0804','₱5,000'],['Unused cash returned','DEP-032','₱3,200']
];
// This advance is available for the client to liquidate without altering an existing case.
starter.expenses.push(record('ADV-2026-0010',['School visit','Cash advance','Community Outreach','₱3,500','Released'],'Open',{caption:'ADV-2026-0010'}));
if(!demo.tables.expenses.some(r=>r.id==='ADV-2026-0010')) demo.tables.expenses.push(structuredClone(starter.expenses.at(-1)));
