const menus = [
  ['overview', 'Overview', 'LayoutDashboard', 'Workspace'],
  ['members', 'Members', 'Users', 'Membership'],
  ['contributions', 'Contributions', 'Coins', 'Membership'],
  ['share-capital', 'Share Capital', 'WalletCards', 'Membership'],
  ['funds', 'Funds & Budgets', 'Landmark', 'Finance'],
  ['expenses', 'Expenses & Advances', 'Receipt', 'Finance'],
  ['liquidations', 'Liquidations', 'ClipboardCheck', 'Finance'],
  ['approvals', 'Approvals', 'ListChecks', 'Governance'],
  ['reports', 'Reports', 'ChartNoAxesCombined', 'Governance'],
  ['meetings-documents', 'Meetings & Documents', 'Files', 'Governance'],
  ['audit-trail', 'Audit Trail', 'History', 'Governance'],
  ['users-roles', 'Users & Roles', 'ShieldCheck', 'System'],
  ['settings', 'Settings', 'Settings', 'System'],
];

const icon = (name) => window.previewIcons?.[name] || '';
const badge = (label, tone = '') => `<span class="pill ${tone}">${label}</span>`;
const button = (label, pictogram, primary = false) => `<button class="button${primary ? ' primary' : ''}" type="button">${icon(pictogram)}${label}</button>`;
const rowAction = (label) => `<span class="row-action">${label} ${icon('ChevronRight')}</span>`;
const cell = (title, caption) => `<strong>${title}</strong><small>${caption}</small>`;
const head = (title, detail = '', right = '') => `<header class="panel-head"><div><h2>${title}</h2>${detail ? `<p>${detail}</p>` : ''}</div>${right}</header>`;
const panel = (title, detail, html, right = '') => `<section class="panel">${head(title, detail, right)}<div class="panel-body">${html}</div></section>`;
const note = (message, tone = '', shape = 'Info') => `<div class="note ${tone}">${icon(shape)}<span>${message}</span></div>`;
const facts = (rows) => `<dl>${rows.map(([key, value]) => `<div><dt>${key}</dt><dd>${value}</dd></div>`).join('')}</dl>`;
const tabs = (...labels) => `<div class="tabs">${labels.map((label, i) => `<span class="${i === 0 ? 'selected' : ''}">${label}</span>`).join('')}</div>`;
const filter = (label) => `<span class="filter">${label}${icon('ChevronDown')}</span>`;
const tools = (search, ...filters) => `<div class="toolbar"><label class="search">${icon('Search')}<input type="search" aria-label="${search}" placeholder="${search}"></label>${filters.map(filter).join('')}</div>`;
const metrics = (...rows) => `<div class="metrics" style="--items:${rows.length}">${rows.map(([label,value,detail,symbol,tone='']) => `<div class="metric ${tone}"><span class="symbol">${icon(symbol)}</span><div><span>${label}</span><strong>${value}</strong><small>${detail}</small></div></div>`).join('')}</div>`;
const grid = (first, second, equal = false) => `<div class="grid${equal ? ' even' : ''}">${first}<div class="stack">${second}</div></div>`;
const list = (rows) => rows.map(([title,sub,symbol,right]) => `<div class="list-entry"><div class="entry-left"><span class="entry-icon">${icon(symbol)}</span><div><strong>${title}</strong><small>${sub}</small></div></div>${right ?? icon('ChevronRight')}</div>`).join('');
const progress = (pct) => `<div class="progress" role="progressbar" aria-label="Utilization" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>`;
const bar = (label, pct, value) => `<div class="barline"><span>${label}</span>${progress(pct)}<strong>${value}</strong></div>`;
const workflow = (current) => `<nav class="workflow" aria-label="Finance workflow">${[['funds','Approved budget'],['expenses','Expense or advance'],['approvals','Approval & release'],['liquidations','Liquidation'],['reports','Reporting']].map(([id,label]) => id===current ? `<strong>${label}</strong>` : `<a href="#${id}">${label}</a>`).join(icon('ChevronRight'))}</nav>`;

function table(title, detail, headers, rows, { controls = '', selected = -1, foot = `${rows.length} sample records` } = {}) {
  const numeric = (index) => headers[index].startsWith('!');
  return `<section class="panel">${head(title, detail)}${controls}<div class="table-wrap"><table aria-label="${title}">
    <thead><tr>${headers.map((header, i) => `<th scope="col" class="${numeric(i) ? 'numeric' : ''}">${header.replace(/^!/, '')}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((row, i) => `<tr class="${i === selected ? 'selected' : ''}">${row.map((value, j) => `<td class="${numeric(j) ? 'numeric' : ''}">${value}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div><footer class="panel-foot">${foot}</footer></section>`;
}

const funds = [
  ['Teacher Development','FND-2026-001','₱250,000','₱180,900','₱69,100',72.4],
  ['Member Welfare','FND-2026-002','₱400,000','₱310,000','₱90,000',77.5],
  ['Community Outreach','FND-2026-003','₱300,000','₱220,000','₱80,000',73.3],
  ['Operations','FND-2026-004','₱300,000','₱229,600','₱70,400',76.5],
];

const screens = {
  overview: {
    title: 'Administration Overview', description: 'See what needs attention and how the cooperative’s funds are being used.',
    actions: () => `<a class="button primary" href="#approvals">${icon('ListChecks')}Open approvals</a>`,
    render: () => metrics(
      ['Active members','286','Current membership','Users'], ['Collections','₱184,750','November 2026','Coins','blue'],
      ['Assigned reviews','3','1 due today','Clock3','amber'], ['Budget used','75.2%','2026 fiscal year','Landmark'],
    ) + grid(
      `<div class="stack">${panel('Action required','Assigned to you · sorted by due date', list([
        ['Review training program liquidation','LIQ-2026-014 · ₱50,000 advance','ClipboardCheck',badge('Due today','amber')],
        ['Verify monthly contribution','CON-2026-0041 · Maria S. Dela Cruz','Coins',badge('Due Nov 23','blue')],
        ['Review membership application','MEM-2026-019 · Carla P. Villanueva','Users',badge('Due Nov 25')],
      ]))}${panel('Follow a fund from budget to report','Open a stage to find the related records.',workflow(''))}</div>`,
      panel('Fund utilization','2026 fiscal year · approved budgets',facts([
        ['Approved','₱1,250,000'],['Used','₱940,500'],['Remaining','₱309,500'],
      ]) + funds.map(([label,,,,,pct]) => bar(label,pct,`${pct}%`)).join('')),
    ),
  },
  members: {
    title: 'Members', description: 'Find a member record, check membership status, or review an application.',
    actions: () => button('Add member', 'UserPlus', true),
    render: () => metrics(['Active members','286','In good standing or active','Users'], ['Pending applications','3','Awaiting membership review','Clock3','amber']) + grid(
      table('Member directory','Search by member name or ID.', ['Member','Joined','Membership status','!Share capital','Action'], [
        [cell('Maria S. Dela Cruz','LAD-0241'),'Jun 12, 2019',badge('Active','green'),'₱18,000',rowAction('Open')],
        [cell('Jose M. Reyes','LAD-0198'),'Feb 08, 2018',badge('Active','green'),'₱15,000',rowAction('Open')],
        [cell('Carla P. Villanueva','MEM-2026-019'),'—',badge('Pending review','amber'),'—',rowAction('Review')],
      ], {controls:tabs('All members','Applications') + tools('Search name or member ID','All statuses'),selected:0}),
      panel('Member preview','', `<div class="list-entry"><div class="entry-left"><span class="avatar">MD</span><div><strong>Maria S. Dela Cruz</strong><small>LAD-0241</small></div></div>${badge('Active','green')}</div>` + facts([
        ['Member since','June 12, 2019'],['Latest contribution','₱500 · Nov 10'],['Paid-up share capital','₱18,000'],
      ]) + button('Open member record','ArrowRight',true)),
    ),
  },
  contributions: {
    title: 'Contributions', description: 'Record member payments, check posting status, and find receipts.',
    actions: () => button('Export register','Download') + button('Record payment','Plus',true),
    render: () => metrics(['Posted this month','₱184,750','November 2026','Coins'], ['Awaiting verification','1','November 2026 sample queue','Clock3','amber']) + grid(
      table('Contribution register','November 2026', ['Payment','Member','Category','!Amount','Status','Action'], [
        [cell('Nov 10, 2026','CON-2026-0041'),'Maria S. Dela Cruz','Monthly dues','₱500',badge('For verification','amber'),rowAction('Verify')],
        [cell('Nov 10, 2026','CON-2026-0040'),'Jose M. Reyes','Monthly dues','₱500',badge('Posted','green'),rowAction('Receipt')],
        [cell('Nov 06, 2026','CON-2026-0039'),'Elena G. Cruz','Special assessment','₱2,500',badge('Posted','green'),rowAction('Receipt')],
      ], {controls:tools('Search member or payment reference','November 2026','All statuses'),selected:0}),
      panel('Payment to verify','CON-2026-0041',facts([
        ['Member','Maria S. Dela Cruz'],['Category','Monthly dues'],['Amount received','₱500'],['Received on','November 10, 2026'],['Payment evidence','1 attachment'],
      ]) + note('Confirm the payment evidence before posting.','amber','Clock3') + `<div class="full">${button('Review payment','ArrowRight',true)}</div>`),
    ),
  },
  'share-capital': {
    title: 'Share Capital', description: 'Track each member’s subscribed shares, paid-up capital, and remaining balance.',
    actions: () => button('Export register','Download') + button('Record capital payment','Plus',true),
    render: () => grid(
      table('Member capital register','Paid-up balances by member', ['Member','Subscribed shares','!Paid-up capital','!Remaining','Action'], [
        [cell('Maria S. Dela Cruz','LAD-0241'),'240 shares','₱18,000','₱6,000',rowAction('Open ledger')],
        [cell('Jose M. Reyes','LAD-0198'),'150 shares','₱15,000','₱0',rowAction('Open ledger')],
        [cell('Elena G. Cruz','LAD-0281'),'100 shares','₱7,000','₱3,000',rowAction('Open ledger')],
      ], {controls:tabs('Member balances','Transactions') + tools('Search name or member ID'),selected:0}),
      panel('Capital build-up','Maria S. Dela Cruz · LAD-0241',facts([
        ['Subscribed capital','₱24,000'],['Paid-up capital','₱18,000'],['Outstanding','₱6,000'],
      ]) + bar('Paid-up share',75,'75%') + note('Share capital is the member’s ownership contribution.','green','WalletCards')),
    ),
  },
  funds: {
    title: 'Funds & Budgets', description: 'Compare approved allocations with spending and remaining balances.',
    actions: () => button('Export balances','Download') + button('Create budget','Plus',true),
    render: () => workflow('funds') + metrics(['Approved budget','₱1,250,000','2026 fiscal year','Landmark'], ['Amount used','₱940,500','75.2% of approved budget','Receipt','blue'], ['Remaining','₱309,500','Across 4 approved funds','WalletCards']) + grid(
      table('Budget balances','Fiscal year 2026', ['Fund','!Approved','!Amount used','!Remaining','!Used','Action'], funds.map(([name,id,approved,used,left,pct]) => [cell(name,id),approved,used,left,`${pct}%`,rowAction('Open')]),{controls:tools('Search fund or budget ID','FY 2026'),selected:0}),
      panel('Teacher Development','FND-2026-001', facts([
        ['Approved','₱250,000'],['Used','₱180,900'],['Available','₱69,100'],
      ]) + progress(72.4) + `<div class="list-entry"><div><strong>Training program advance</strong><small>ADV-2026-0009 · ₱50,000</small></div><a class="link" href="#expenses">Open ${icon('ChevronRight')}</a></div>`),
    ),
  },
  expenses: {
    title: 'Expenses & Advances', description: 'See the funding source and track each request through release.',
    actions: () => button('New request','Plus',true),
    render: () => workflow('expenses') + grid(
      table('Requests & releases','Expense claims, cash advances, and reimbursements', ['Request','Type','Fund','!Amount','Status','Action'], [
        [cell('Training program','ADV-2026-0009'),'Cash advance','Teacher Development','₱50,000',badge('Released','blue'),rowAction('Open')],
        [cell('Office supplies','EXP-2026-0032'),'Expense','Operations','₱7,800',badge('For approval','amber'),rowAction('Review')],
        [cell('Travel claim','REI-2026-0018'),'Reimbursement','Member Welfare','₱4,250',badge('Returned','red'),rowAction('Open')],
      ], {controls:tabs('All requests','Cash advances','Expenses','Reimbursements') + tools('Search request or fund','All statuses'),selected:0}),
      panel('Training program advance','ADV-2026-0009',facts([
        ['Budget','Teacher Development'],['Amount approved','₱50,000'],['Amount released','₱50,000'],['Released','Nov 12, 2026'],['Liquidation due','Nov 20, 2026'],
      ]) + `<a class="button primary" href="#liquidations">${icon('ClipboardCheck')}Open LIQ-2026-014</a>`),
    ),
  },
  liquidations: {
    title: 'Liquidations', description: 'Match released cash to receipts and money returned before closing an advance.',
    actions: () => button('Export register','Download') + button('Start liquidation','Plus',true),
    render: () => workflow('liquidations') + metrics(['For verification','1','Submitted and ready to review','ClipboardCheck','amber'], ['Returned for correction','1','Waiting for updated evidence','History','blue'], ['Verified and closed','1','Within the sample register','CheckCircle2']) + grid(
      table('Liquidation register','Track evidence, due dates, and verification.', ['Liquidation','Related advance','!Released','Due date','Status','Action'], [
        [cell('Training program','LIQ-2026-014'),'ADV-2026-0009','₱50,000','Nov 20',badge('For verification','amber'),rowAction('Review')],
        [cell('Member welfare','LIQ-2026-013'),'ADV-2026-0008','₱25,000','Nov 24',badge('Returned','red'),rowAction('Open')],
        [cell('Community outreach','LIQ-2026-012'),'ADV-2026-0007','₱30,000','Nov 18',badge('Closed','green'),rowAction('Open')],
      ], {controls:tools('Search liquidation or advance','All statuses'),selected:0}),
      panel('Training program','LIQ-2026-014 · due Nov 20',facts([
        ['Related advance','<a class="link" href="#expenses">ADV-2026-0009</a>'],['Cash released','₱50,000'],['Spending supported by receipts','₱46,800'],['Unused cash returned','₱3,200'],['Unaccounted amount','₱0'],['Evidence','4 receipts · 1 return slip'],
      ]) + note('Amounts balance. Review the evidence before closing.','green','CheckCircle2') + `<div class="full">${button('Review evidence','ArrowRight',true)}</div>`),
    ),
  },
  approvals: {
    title: 'Approvals', description: 'See what is assigned to you and which decisions are due first.',
    render: () => metrics(['Assigned to me','3','Treasurer queue','ListChecks'], ['Due today','1','Review by Nov 20','Clock3','amber'], ['Next due','Nov 23','Contribution verification','CalendarDays','blue']) + grid(
      table('My approval queue','Sorted by due date', ['Item','Request type','!Amount','Due','Status','Action'], [
        [cell('Training program','LIQ-2026-014'),'Liquidation','₱50,000','Nov 20',badge('Due today','amber'),rowAction('Review')],
        [cell('Maria S. Dela Cruz','CON-2026-0041'),'Contribution','₱500','Nov 23',badge('For verification','blue'),rowAction('Verify')],
        [cell('Carla P. Villanueva','MEM-2026-019'),'Membership','—','Nov 25',badge('For review'),rowAction('Review')],
      ],{controls:tabs('Assigned to me','Completed') + tools('Search assigned items','All request types'),selected:0}),
      panel('Next decision','Liquidation · LIQ-2026-014', facts([
        ['Assigned to','Ana R. Santos'],['Due date','Nov 20, 2026'],['Evidence submitted','4 receipts · 1 return slip'],['Unaccounted amount','₱0'],
      ]) + `<a class="button primary" href="#liquidations">${icon('ArrowRight')}Open liquidation</a>`),
    ),
  },
  reports: {
    title: 'Reports & Reconciliation', description: 'Review period totals, resolve discrepancies, and prepare reports for release.',
    actions: () => button('Generate report','FilePlus2',true),
    render: () => metrics(['Collections posted','₱184,750','November 2026','Coins'], ['Trial balance','Balanced','As of Nov 20, 2026','CheckCircle2'], ['Unmatched items','3','Need reconciliation','CircleAlert','amber']) + grid(
      table('Report library','November 2026 · amounts shown in PHP', ['Report','Period','Format','Status','Action'], [
        [cell('Statement of Financial Condition','Financial statements'),'Nov 2026','PDF / XLSX',badge('Ready','green'),rowAction('Preview')],
        [cell('Statement of Operations','Financial statements'),'Nov 2026','PDF / XLSX',badge('Draft'),rowAction('Open draft')],
        [cell('Liquidation aging','Finance operations'),'Nov 2026','PDF / XLSX',badge('Needs review','amber'),rowAction('Open aging')],
        [cell('Budget utilization','Member transparency'),'FY 2026','PDF',badge('Ready','green'),rowAction('Preview')],
      ],{controls:tabs('Reports','Reconciliation') + tools('Search reports','November 2026')}),
      panel('Reconciliation checklist','November 2026', list([
        ['Review unmatched deposits','2 items to match','Coins',badge('Open','amber')],
        ['Check a missing ledger reference','1 item to resolve','Receipt',badge('Open','amber')],
        ['Confirm trial balance','Debits and credits agree','CheckCircle2',badge('Passed','green')],
      ])),
    ),
  },
  'meetings-documents': {
    title: 'Meetings & Documents', description: 'Organize meetings, resolutions, and records shared with members.',
    actions: () => button('Upload document','Upload') + button('Schedule meeting','CalendarDays',true),
    render: () => `<div class="callout" style="margin-bottom:16px"><div><div class="subhead">Next meeting</div><h2>Board meeting</h2><p>December 5, 2026 · 9:00 AM · Ladtemco Hall, Languyan</p></div>${button('Open agenda','ArrowRight')}</div>` + grid(
      table('Governance records','Manage publication and verify who can see each document.', ['Document','Type','Date','Audience','Status','Action'], [
        [cell('Annual operating plan','R-2026-001'),'Resolution','Mar 28, 2026','All members',badge('Published','green'),rowAction('View')],
        [cell('Audited financial statements','DOC-2026-008'),'Financial report','May 14, 2026','All members',badge('Published','green'),rowAction('View')],
        [cell('December board agenda','DOC-2026-019'),'Agenda','Dec 05, 2026','Board only',badge('Draft'),rowAction('Preview')],
      ],{controls:tabs('Documents','Meetings','Resolutions') + tools('Search title or reference','All audiences')}),
      panel('Publishing check','Preview visibility before sharing.',list([
        ['All members','Published to the member portal','Users'],['Board only','Restricted to authorized board accounts','ShieldCheck'],['Draft','Visible to authorized editors','FileText'],
      ])),
    ),
  },
  'audit-trail': {
    title: 'Audit Trail', description: 'Trace who changed a record, what changed, and why.',
    actions: () => button('Export events','Download'),
    render: () => grid(
      table('Activity log','Times shown in Asia/Manila', ['Time','Event','Record','Actor','Action'], [
        [cell('Nov 20 · 10:42 AM','AT-2026-00451'),badge('Corrected','blue'),'CON-2026-0040','Ana R. Santos',rowAction('Inspect')],
        [cell('Nov 20 · 09:15 AM','AT-2026-00450'),badge('Submitted','green'),'LIQ-2026-014','Jose Ramos',rowAction('Inspect')],
        [cell('Nov 18 · 03:10 PM','AT-2026-00449'),badge('Published','green'),'DOC-2026-008','Elena Reyes',rowAction('Inspect')],
      ], {controls:tools('Search record, event, or actor','All event types'),selected:0}),
      panel('Contribution corrected','AT-2026-00451 · read-only event',facts([
        ['Record','CON-2026-0040'],['Actor','Ana R. Santos · Treasurer'],['Time','Nov 20, 2026 · 10:42 AM'],
      ]) + `<div class="before-after"><div><small>Before</small><strong>₱550</strong></div>${icon('ArrowRight')}<div><small>After</small><strong>₱500</strong></div></div>` + note('Reason: corrected the amount to match the original receipt.','', 'FileText')),
    ),
  },
  'users-roles': {
    title: 'Users & Roles', description: 'Manage staff accounts, assigned permissions, and access status.',
    actions: () => button('Invite staff user','UserPlus',true),
    render: () => grid(
      table('Staff accounts','Each officer has an individual account.', ['User','Role','Two-factor authentication','Access status','Action'], [
        [cell('Ana R. Santos','STAFF-001'),'Treasurer',badge('Enabled','green'),badge('Active','green'),rowAction('View')],
        [cell('Jose Ramos','STAFF-002'),'Cashier',badge('Enabled','green'),badge('Active','green'),rowAction('View')],
        [cell('Elena Reyes','STAFF-003'),'Audit Committee',badge('Enabled','green'),badge('Active','green'),rowAction('View')],
        [cell('Ramon Alcantara','STAFF-004'),'Board Approver',badge('Awaiting setup','amber'),badge('Invited','blue'),rowAction('View invite')],
      ],{controls:tabs('Staff accounts','Role permissions') + tools('Search staff name or role','All roles'),selected:0}),
      panel('Treasurer permissions','Ana R. Santos · STAFF-001',list([
        ['Review contributions','Verify recorded payments','Coins',badge('Allowed','green')],
        ['Review liquidations','Inspect receipts and returned cash','ClipboardCheck',badge('Allowed','green')],
        ['Manage system roles','System administrator permission','ShieldCheck',badge('Restricted')],
      ])),
    ),
  },
  settings: {
    title: 'Settings', description: 'Find cooperative-wide preferences, financial rules, and security controls.',
    render: () => grid(
      `<div class="stack">${panel('Cooperative & accounting','',list([
        ['Cooperative profile','Name, logo, and office contact details','Landmark'],
        ['Fiscal year & currency','Calendar year · PHP · Asia/Manila','CalendarDays'],
        ['Contribution categories','Payment categories and posting rules','Coins'],
        ['Receipt numbering','Prefix and number sequence','Receipt'],
      ]))}${panel('Notifications','',list([['Notification rules','Reminders for approvals and due dates','Bell']]))}</div>`,
      `<div class="stack">${panel('Security & data','',list([
        ['Account security','Sign-in and session policies','ShieldCheck'],
        ['Data retention','Record retention and archival rules','History'],
        ['Backup & restore','Backups and restore requests','Database',badge('Restricted access','amber')],
      ]))}${note('Changes to financial or security settings require a reason and are recorded in the audit trail.','amber','ShieldCheck')}</div>`,
      true,
    ),
  },
};

const app = document.getElementById('app');
let theme = 'light';
const currentMenu = () => menus.find(([id]) => id === location.hash.slice(1)) || menus[0];

function render() {
  const [id,label] = currentMenu();
  const screen = screens[id];
  document.documentElement.dataset.theme = theme;
  document.title = `${label} · Ladtemco design preview`;
  const groups = [...new Set(menus.map(([, , ,group]) => group))];
  app.innerHTML = `<div class="shell"><aside class="nav" id="admin-menu"><div class="brand"><img src="../../public/logo.jpg" alt="Ladtemco cooperative seal"><div><b>LADTEMCO</b><span>Cooperative administration</span></div></div>
    <nav aria-label="Admin menu">${groups.map((group) => `<section><h2>${group}</h2>${menus.filter(([, , , section]) => section === group).map(([key,text,symbol]) => `<a class="item" ${key === id ? 'aria-current="page"' : ''} href="#${key}">${icon(symbol)}${text}</a>`).join('')}</section>`).join('')}</nav>
    <div class="account"><span class="avatar">AS</span><div><b>Ana R. Santos</b><small>Treasurer</small></div></div></aside>
    <div><header class="topbar"><div class="location"><button class="iconbutton mobile-nav" id="menu" aria-label="Open admin menu">${icon('Menu')}</button><span>Administration</span>${icon('ChevronRight')}<strong>${label}</strong></div>
    <div class="utils">${badge('Demo data','blue')}${/^https?:$/.test(location.protocol) && location.pathname.startsWith('/admin-demo') ? '<a class="button" href="/login">Leave demo</a>' : ''}<button class="iconbutton" id="theme" type="button" aria-label="Toggle color theme">${icon(theme === 'light' ? 'Moon' : 'Sun')}</button></div></header>
    <main class="main"><header class="hero"><div><h1>${screen.title}</h1><p>${screen.description}</p></div><div class="actions">${screen.actions?.() || ''}</div></header>${screen.render()}</main></div></div>`;
  document.getElementById('theme').onclick = toggleTheme;
  document.getElementById('menu').onclick = () => document.getElementById('admin-menu').classList.toggle('opened');
  window.decorateAdmin?.(id);
}

function toggleTheme() {
  theme = theme === 'light' ? 'dark' : 'light';
  render();
}

window.addEventListener('hashchange', () => { render(); window.scrollTo(0,0); });
window.addEventListener('keydown', (event) => {
  if (document.querySelector('[role="dialog"]') || event.metaKey || event.altKey || event.ctrlKey || event.target.matches('input, select, textarea')) return;
  const index = menus.indexOf(currentMenu());
  if (event.key === 'ArrowRight') location.hash = menus[(index + 1) % menus.length][0];
  if (event.key === 'ArrowLeft') location.hash = menus[(index + menus.length - 1) % menus.length][0];
  if (event.key.toLowerCase() === 't') toggleTheme();
});
render();
