const member = { name: 'Maria S. Dela Cruz', id: 'LAD-0241', joined: '2019-06-12', subscribed: 24000, par: 100 };
const menus = [
  ['dashboard','Dashboard','LayoutDashboard','Membership'],
  ['contributions','My Contributions','Coins','Membership'],
  ['share-capital','Share Capital','WalletCards','Membership'],
  ['fund-transparency','Fund Transparency','Landmark','Cooperative'],
  ['projects','Projects & Liquidations','ClipboardCheck','Cooperative'],
  ['documents','Documents','Files','Cooperative'],
  ['meetings','Meetings','CalendarDays','Cooperative'],
  ['profile','Profile & Security','ShieldCheck','Account'],
];
const contributions = [
  {id:'CON-2026-0041',date:'2026-11-10',amount:500,status:'For verification',note:'The cashier recorded this payment. A receipt will appear once verification is complete.'},
  {id:'CON-2026-0034',date:'2026-10-10',amount:500,status:'Posted',receipt:'OR-2026-1034'},
  {id:'CON-2026-0028',date:'2026-09-10',amount:500,status:'Posted',receipt:'OR-2026-1028'},
  {id:'CON-2026-0022',date:'2026-08-10',amount:500,status:'Posted',receipt:'OR-2026-1022'},
  {id:'CON-2026-0021',date:'2026-08-09',amount:500,status:'Reversed',note:'A duplicate entry was reversed. The posted August payment is CON-2026-0022.'},
];
const openingDues=23000;
const capital=[
  {id:'CAP-2026-021',date:'2026-11-10',label:'Capital installment',amount:2000},
  {id:'CAP-2026-006',date:'2026-01-15',label:'Capital installment',amount:3000},
  {id:'CAP-2025-034',date:'2025-10-10',label:'Patronage capitalization',amount:500},
];
const openingCapital=12500;
const funds=[
  {id:'FND-2026-001',name:'Teacher Development',approved:250000,used:180900,description:'Training and learning materials for cooperative educators.'},
  {id:'FND-2026-002',name:'Member Welfare',approved:400000,used:310000,description:'Member assistance and welfare programs.'},
  {id:'FND-2026-003',name:'Community Outreach',approved:300000,used:220000,description:'Learning materials and community activities in Languyan.'},
  {id:'FND-2026-004',name:'Operations',approved:300000,used:229600,description:'Cooperative services and operating costs.'},
];
const projects=[
  {id:'PRJ-2026-012',name:'Community learning kits',fund:'FND-2026-003',date:'2026-11-18',status:'Closed',released:30000,spent:28500,returned:1500,document:'PUB-2026-012',summary:'Learning kits were distributed to partner classrooms. The verified summary covers materials and delivery.',items:[['Learning materials',24000],['Packing and delivery',4500]]},
  {id:'PRJ-2026-014',name:'Teacher training program',fund:'FND-2026-001',date:'2026-11-12',status:'In progress',released:50000,summary:'The training advance has been released. The final liquidation will be available after verification and publication.'},
];
const documents=[
  {id:'PUB-2026-012',title:'Community learning kits · liquidation summary',type:'Project report',date:'2026-11-18',lines:['Community Outreach Fund | PRJ-2026-012','Advance released: PHP 30,000.','Learning materials: PHP 24,000. Packing and delivery: PHP 4,500.','Supported spending: PHP 28,500. Unused cash returned: PHP 1,500.','Unaccounted amount: PHP 0. Liquidation closed on November 18, 2026.']},
  {id:'PUB-2026-011',title:'Fund utilization report',type:'Financial report',date:'2026-11-18',lines:['Fiscal year 2026 | Member edition','Approved allocations: PHP 1,250,000. Utilized: PHP 940,500. Remaining: PHP 309,500.',...funds.map(f=>`${f.name}: approved PHP ${f.approved.toLocaleString('en-US')}, utilized PHP ${f.used.toLocaleString('en-US')}.`)]},
  {id:'R-2026-001',title:'Annual operating plan',type:'Resolution',date:'2026-03-28',lines:['Annual General Assembly | Resolution R-2026-001','Members adopted the 2026 operating plan and allocations for teacher development, member welfare, community outreach and cooperative operations.','The cooperative will publish fund-level utilization summaries for members.']},
  {id:'PUB-2026-015',title:'Member forum agenda',type:'Agenda',date:'2026-11-19',lines:['December member forum | December 12, 2026, 9:00 to 11:00 AM (Philippine time)','Venue: Ladtemco Hall, Languyan.','9:00 - Welcome and membership update.','9:20 - Review of published fund utilization and closed projects.','10:00 - Member questions. 10:45 - Summary and next steps.']},
];
const meeting={name:'December member forum',date:'2026-12-12',venue:'Ladtemco Hall, Languyan',time:'9:00–11:00 AM · Philippine time'};
const notices=[
  {id:'forum',title:'Member forum agenda is available',date:'2026-11-19',action:'agenda',key:''},
  {id:'kits',title:'Community learning kits summary published',date:'2026-11-18',action:'project',key:'PRJ-2026-012'},
  {id:'capital',title:'Capital installment posted',date:'2026-11-10',action:'capital',key:'CAP-2026-021'},
];
const sum=(records,field)=>records.reduce((total,r)=>total+r[field],0);
const postedTotal=openingDues+sum(contributions.filter(r=>r.status==='Posted'),'amount');
const paidCapital=openingCapital+sum(capital,'amount');
const approvedTotal=sum(funds,'approved'),usedTotal=sum(funds,'used');
const money=n=>'₱'+n.toLocaleString('en-PH');
const dateLabel=d=>new Date(d+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
const percent=(used,total)=>(100*used/total).toFixed(1).replace(/\.0$/,'')+'%';
const find=(rows,id)=>rows.find(row=>row.id===id);
const escapeText=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const storeKey='ladtemco.member-preview.v1.'+member.id;
const defaults={theme:'light',email:'maria@example.org',mobile:'09170004521',rsvp:'No response',otherSession:true,resetRequested:false,read:[]};
function readPreferences(){
  try{
    const raw=localStorage.getItem(storeKey);
    if(!raw)return null;
    const value=JSON.parse(raw);
    return Object.fromEntries(Object.entries(defaults).map(([k,v])=>[k,(Array.isArray(v)?Array.isArray(value[k]):typeof value[k]===typeof v)?value[k]:v]));
  }catch{return null;}
}
let preferences=readPreferences()||{...defaults};
let sessionOnly=false;
function savePreferences(patch){
  const latest=sessionOnly?preferences:(readPreferences()||preferences);
  preferences={...latest,...patch};
  try{localStorage.setItem(storeKey,JSON.stringify(preferences));sessionOnly=false;return true;}
  catch{sessionOnly=true;return false;}
}
