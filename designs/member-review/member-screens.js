const ico=name=>window.previewIcons[name]||'';
const action=(text,command,id='',iconName='',primary=false)=>`<button type="button" class="button${primary?' primary':''}" data-action="${command}" data-id="${escapeText(id)}">${ico(iconName)}${escapeText(text)}</button>`;
const link=(label,route,symbol='ArrowRight',primary=false)=>`<a class="button${primary?' primary':''}" href="#${route}">${ico(symbol)}${escapeText(label)}</a>`;
const pill=(label,tone='green')=>`<span class="pill ${tone}">${escapeText(label)}</span>`;
const facts=pairs=>`<dl>${pairs.map(([k,v])=>`<div><dt>${escapeText(k)}</dt><dd>${escapeText(v)}</dd></div>`).join('')}</dl>`;
const panel=(title,subtitle,body)=>`<section class="panel"><header class="panel-head"><div><h2>${escapeText(title)}</h2>${subtitle?`<p>${escapeText(subtitle)}</p>`:''}</div></header><div class="panel-body">${body}</div></section>`;
const metric=(symbol,label,value,caption,tone='')=>`<article class="metric ${tone}"><span class="symbol">${ico(symbol)}</span><div><span>${label}</span><strong>${value}</strong><small>${caption}</small></div></article>`;
const metrics=(...cards)=>`<div class="metrics" style="--items:${cards.length}">${cards.join('')}</div>`;
const hero=(title,summary,control='')=>`<header class="hero"><div><h1>${title}</h1><p>${summary}</p></div>${control?`<div class="actions">${control}</div>`:''}</header>`;
const progress=(label,value,total)=>`<div class="meter-label"><span>${label}</span><b>${percent(value,total)}</b></div><div class="progress" role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${100*value/total}"><i style="width:${100*value/total}%"></i></div>`;
const note=msg=>`<div class="note">${ico('Info')}<span>${msg}</span></div>`;
const entry=(title,caption,symbol,attributes)=>`<button type="button" class="list-entry action-entry" ${attributes}><span class="entry-left"><span class="entry-icon">${ico(symbol)}</span><span><strong>${escapeText(title)}</strong><small>${escapeText(caption)}</small></span></span>${ico('ChevronRight')}</button>`;
const recordEntry=(title,caption,symbol,command,id='')=>entry(title,caption,symbol,`data-action="${command}" data-id="${escapeText(id)}"`);
const fundBody=f=>progress('Budget used',f.used,f.approved)+facts([['Approved allocation',money(f.approved)],['Utilized',money(f.used)],['Remaining',money(f.approved-f.used)]]);
const docFor=id=>find(documents,id);

function dashboard(){
  return hero('Hello, Maria','Your membership and the latest published cooperative records.',action('My statement','statement','','Download'))+
    metrics(metric('Coins','Posted contributions',money(postedTotal),'Lifetime membership dues'),metric('WalletCards','Paid-up capital',money(paidCapital),`${paidCapital/member.par} shares paid up`),metric('Landmark','Patronage refund','₱2,140','2025 allocation','blue'))+
    `<div class="grid"><div class="stack">${panel('My recent activity','Personal account · LAD-0241',
      recordEntry('November dues received','Nov 10 · ₱500 · For verification','Clock3','payment',contributions[0].id)+
      recordEntry('Capital installment posted','Nov 10 · ₱2,000 · 20 shares','WalletCards','capital',capital[0].id)+
      recordEntry('October dues posted','Oct 10 · ₱500 · Receipt available','Receipt','payment',contributions[1].id))}
    ${panel('Cooperative funds','Published figures · FY 2026',progress('Allocation utilized',usedTotal,approvedTotal)+`<p class="fund-summary">${money(usedTotal)} used of ${money(approvedTotal)} approved.</p>`+link('Explore funds','fund-transparency','Landmark'))}</div>
    <div class="stack">${panel('Next member meeting','December 12, 2026',`<h3>${meeting.name}</h3><p class="meeting-info">${meeting.time}<br>${meeting.venue}</p>`+action('View agenda','agenda','','CalendarDays',true))}
    ${panel('Latest publication','Project report · Nov 18',recordEntry('Community learning kits','Closed liquidation · Member summary','FileText','project',projects[0].id))}</div></div>`;
}
const registers={
  contributions:{
    title:'Contribution history',caption:'Recent ledger entries · August–November 2026',
    placeholder:'Search date, reference, or status',filter:'Status',options:['Posted','For verification','Reversed'],
    headers:['Payment date','Reference','Amount','Status'],rows:()=>contributions.map(r=>({id:r.id,values:[dateLabel(r.date),r.id,money(r.amount),r.status],filter:r.status,button:r.receipt?'View receipt':'View details',command:'payment'}))},
  'share-capital':{
    title:'Capital transactions',caption:'Most recent postings first',placeholder:'Search transaction or reference',filter:'Posting year',options:['2026','2025'],
    headers:['Posting date','Transaction','Shares','Amount'],rows:()=>capital.map(r=>({id:r.id,values:[dateLabel(r.date),r.label,String(r.amount/member.par),money(r.amount)],filter:r.date.slice(0,4),button:'View entry',command:'capital'}))},
  projects:{
    title:'Published projects',caption:'Member-visible updates from the cooperative',placeholder:'Search project, fund, or reference',filter:'Status',options:['In progress','Closed'],
    headers:['Project','Fund','Released','Status'],rows:()=>projects.map(r=>({id:r.id,values:[r.name,find(funds,r.fund).name,money(r.released),r.status],filter:r.status,button:'View project',command:'project'}))},
  documents:{
    title:'Member library',caption:'Published documents available to all members',placeholder:'Search document title or reference',filter:'Document type',options:['Financial report','Project report','Resolution','Agenda'],
    headers:['Document','Reference','Published','Type'],rows:()=>[...documents].sort((a,b)=>b.date.localeCompare(a.date)).map(d=>({id:d.id,values:[d.title,d.id,dateLabel(d.date),d.type],filter:d.type,button:'Preview',command:'document'}))},
};
let searchText='',filterValue='';
function visibleRows(key){
  const q=searchText.trim().toLowerCase();
  return registers[key].rows().filter(r=>(!filterValue||r.filter===filterValue)&&[r.id,...r.values].join(' ').toLowerCase().includes(q));
}
function tableRows(key){
  const reg=registers[key];
  return visibleRows(key).map(r=>`<tr>${r.values.map((v,i)=>`<td data-label="${reg.headers[i]}">${reg.headers[i]==='Status'?pill(v,['Posted','Closed'].includes(v)?'green':v==='Reversed'?'red':'amber'):escapeText(v)}</td>`).join('')}<td>${action(r.button,r.command,r.id)}</td></tr>`).join('');
}
function register(key){
  const r=registers[key];
  return `<section class="panel"><header class="panel-head"><div><h2>${r.title}</h2><p>${r.caption}</p></div></header>
  <div class="toolbar"><label class="search">${ico('Search')}<input id="search" type="search" aria-label="${r.placeholder}" placeholder="${r.placeholder}" value="${escapeText(searchText)}"></label>
  <label class="filter-label">${r.filter}<select id="filter"><option value="">All</option>${r.options.map(o=>`<option ${filterValue===o?'selected':''}>${o}</option>`).join('')}</select></label></div>
  <div class="table-wrap"><table><thead><tr>${r.headers.concat('Action').map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody id="rows">${tableRows(key)}</tbody></table></div>
  <div class="empty" id="no-results" ${visibleRows(key).length?'hidden':''}><b>No matching records</b><p>Try another search or clear your filters.</p>${action('Clear filters','clear')}</div><div class="panel-foot" id="result-count" role="status">${visibleRows(key).length} records</div></section>`;
}
function contributionScreen(){
  return hero('My Contributions','Check your payments, posting status, and receipts.',action('Export visible entries','export','','Download'))+
    metrics(metric('Coins','Lifetime posted',money(postedTotal),'Includes earlier payments'),metric('Clock3','Awaiting verification','₱500','November dues','amber'))+
    `<div class="stack">${register('contributions')}${panel('How the total is calculated','',facts([['Posted before August 2026',money(openingDues)],['Posted in the recent ledger',money(postedTotal-openingDues)]])+note('Only posted payments count toward the lifetime total.'))}</div>`;
}
function shareScreen(){
  return hero('Share Capital','Track your ownership and the balance remaining on your subscription.',action('Download capital statement','capital-statement','','Download'))+
    metrics(metric('WalletCards','Paid-up capital',money(paidCapital),`${paidCapital/member.par} paid-up shares`),metric('Landmark','Subscribed capital',money(member.subscribed),`${member.subscribed/member.par} subscribed shares`),metric('Coins','Remaining balance',money(member.subscribed-paidCapital),`At ${money(member.par)} per share`,'amber'))+
    `<div class="stack">${panel('Capital build-up','',progress('Paid toward subscription',paidCapital,member.subscribed))}${register('share-capital')}${note('The opening paid-up balance before these transactions was '+money(openingCapital)+'.')}</div>`;
}
function fundScreen(){
  return hero('Fund Transparency','Follow approved cooperative budgets and published spending.',action('Open fund report','document','PUB-2026-011','FileText'))+
    metrics(metric('Landmark','Approved budget',money(approvedTotal),'FY 2026'),metric('Coins','Utilized',money(usedTotal),'Published November 18','blue'),metric('WalletCards','Remaining',money(approvedTotal-usedTotal),'Across four funds'))+
    `<div class="fund-grid">${funds.map(f=>panel(f.name,f.id,`<p class="fund-intro">${f.description}</p>`+fundBody(f)+action('View fund','fund',f.id,'ArrowRight'))).join('')}</div>`;
}
function projectsScreen(){
  return hero('Projects & Liquidations','See what was released, spent, and returned for each published project.')+
    `<div class="stack">${register('projects')}${note('Closed projects include verified totals. Personal beneficiary details and individual receipts stay private.')}</div>`;
}
function documentsScreen(){return hero('Documents','Read and download cooperative records published for members.')+register('documents');}
function meetingsScreen(){
  return hero('Meetings','View member agendas, record attendance plans, and revisit published resolutions.')+
    `<div class="grid"><div class="stack">${panel(meeting.name,'Upcoming · Saturday, December 12',facts([['Time',meeting.time],['Venue',meeting.venue],['My response',preferences.rsvp]])+
    `<div class="actions">${action('View agenda','agenda','','CalendarDays',true)}${action('Respond','respond')}${action('Add to calendar','calendar','','Download')}</div>`)}</div>
    ${panel('Past meetings','Published governance records',recordEntry('Annual General Assembly','Mar 28, 2026 · Annual operating plan','Files','document','R-2026-001'))}</div>`;
}
function profileScreen(){
  return hero('Profile & Security','Manage the contact details and sessions for this demo membership.')+
    `<div class="grid even">${panel(member.name,'Individual membership · '+member.id,pill('Active member')+facts([['Member since',dateLabel(member.joined)],['Email',preferences.email],['Mobile',preferences.mobile]])+action('Edit contact details','edit-contact','','User',true))}
    ${panel('Account security','Local demonstration',facts([['Current session','This device'],['Other demo sessions',preferences.otherSession?'1 active':'None'],['Password reset',preferences.resetRequested?'Requested locally':'No pending request']])+
    `<div class="actions">${action('Manage sessions','sessions','','ShieldCheck')}${action(preferences.resetRequested?'View reset request':'Request demo reset','reset')}</div>`)}</div>`;
}
const screens={dashboard,contributions:contributionScreen,'share-capital':shareScreen,'fund-transparency':fundScreen,projects:projectsScreen,documents:documentsScreen,meetings:meetingsScreen,profile:profileScreen};
