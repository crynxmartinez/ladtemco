const textButton=(label,run,primary=false)=>({label,run,primary});
let dialogReturn, onCloseFocus;
const modalHost=document.createElement('div');
modalHost.id='dialogs';
document.body.append(modalHost);
const announcement=document.createElement('div');
announcement.id='announcement';announcement.setAttribute('role','status');
document.body.append(announcement);
let noticeTimer;
function notify(message){
  announcement.textContent=message;announcement.hidden=false;
  clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{announcement.hidden=true;},4500);
}
function closeDialog(){
  modalHost.replaceChildren();app.inert=false;document.body.classList.remove('modal-open');
  if(onCloseFocus?.isConnected) onCloseFocus.focus();
}
function dialog(title,context,body,buttons=[],opts={}){
  if(!modalHost.firstChild) onCloseFocus=document.activeElement;
  dialogReturn=opts.back;
  modalHost.innerHTML=`<div class="scrim"><section class="dialog" data-size="${opts.compact?'compact':'wide'}" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
    <header><div><div class="kicker">${esc(context)}</div><h2 id="dialog-title">${esc(title)}</h2></div><button class="close-x" aria-label="Close dialog" type="button">×</button></header>
    <div class="dialog-body">${body}</div>
    <footer><button class="button dismiss" type="button">${opts.back?'Back':buttons.length?'Cancel':'Done'}</button>${buttons.map((b,i)=>`<button class="button ${b.primary?'primary':''}" data-command="${i}" type="button">${esc(b.label)}</button>`).join('')}</footer>
  </section></div>`;
  app.inert=true;document.body.classList.add('modal-open');
  const dismiss=()=>opts.back?opts.back():closeDialog();
  modalHost.querySelector('.close-x').onclick=closeDialog;
  modalHost.querySelector('.dismiss').onclick=dismiss;
  modalHost.querySelector('.scrim').onclick=e=>{if(e.target===e.currentTarget) closeDialog();};
  modalHost.querySelectorAll('[data-command]').forEach((b,i)=>b.onclick=buttons[i].run);
  modalHost.querySelector('.close-x').focus();
}
document.addEventListener('keydown',e=>{
  if(!modalHost.firstChild) return;
  if(e.key==='Escape'){e.preventDefault();closeDialog();return;}
  if(e.key!=='Tab') return;
  const items=[...modalHost.querySelectorAll('button,input,textarea,select,a[href]')].filter(x=>!x.disabled);
  if(e.shiftKey && document.activeElement===items[0]){e.preventDefault();items.at(-1)?.focus();}
  if(!e.shiftKey && document.activeElement===items.at(-1)){e.preventDefault();items[0]?.focus();}
});
const kv=rows=>facts(rows.map(([k,v])=>[esc(k),esc(v)]));
const miniTable=(headers,rows)=>`<div class="mini-table"><table><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const sub=(label,body)=>`<section class="detail-block"><h3>${esc(label)}</h3>${body}</section>`;
const defaultRows=(key,r)=>registerInfo[key].headers.map((h,i)=>[h,r.values[i]]);
function audit(event,reference,reason,before='—',after=event){
  const now=new Date();
  const r=record(nextRef('AT'),[now.toLocaleString('en-PH',{timeZone:'Asia/Manila',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}),event,reference,'Demo administrator'],'Inspect',{reason,before,after});
  add('audit-trail',r);demo.changes.push({event,reference});
}
function committed(title,reference,message){
  const saved=persist();render();closeDialog();
  dialog(title,saved?'LOCAL DEMO · SAVED':'LOCAL DEMO · SESSION ONLY',`<div class="result-icon">${icon('CheckCircle2')}</div><p class="lead">${esc(message)}</p>${kv([['Reference',reference],['Saved to',saved?'This demo on this device':'This open session only']])}`,[],{compact:true});
}
function changeStatus(key,r,status,reason){
  const col=statusColumn[key],before=r.values[col];r.values[col]=status;
  r.action=key==='contributions' && status==='Posted'?'Receipt':'Open';
  const queue=byId('approvals',r.id);
  if(queue){queue.values[4]=status;queue.action='View';queue.extra.completed=true;}
  audit(status,r.id,reason,before,status);
  committed(status,r.id,reason);
}
const permissionSets={
  Treasurer:['Verify recorded contributions','Review liquidation evidence','Read financial reports'],
  Cashier:['Record member payments','Issue receipts','Record capital installments'],
  'Audit Committee':['Inspect the activity log','Read reconciliation results','Review financial reports'],
  'Board Approver':['Review assigned requests','Approve budget releases','Read board documents']
};
function reportContent(name){
  if(/budget/i.test(name)) return miniTable(['Fund','Approved','Used','Remaining'],demo.tables.funds.map(r=>r.values.slice(0,4)));
  if(/aging/i.test(name)) return miniTable(['Advance','Released','Due','Status'],demo.tables.liquidations.map(r=>r.values.slice(1,5)));
  if(/collection/i.test(name)) return miniTable(['Member','Category','Amount','Status'],demo.tables.contributions.map(r=>r.values.slice(1,5)));
  if(/condition/i.test(name)) return kv([['Cash and receivables','₱710,000'],['Other assets','₱930,000'],['Total assets','₱1,640,000'],['Liabilities','₱390,000'],['Members’ equity','₱1,250,000']]);
  return kv([['Service income','₱92,400'],['Operating expenses','₱76,100'],['Net surplus','₱16,300']]);
}
function saveFile(filename,blob){
  const a=document.createElement('a');a.download=filename;a.href=URL.createObjectURL(blob);
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500);
}
function csvBlob(rows){
  return new Blob(['\uFEFF'+rows.map(row=>row.map(x=>{
    let s=String(x??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;
    return '"'+s.replaceAll('"','""')+'"';
  }).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});
}
function exportRegister(page){
  const {key,rows}=visibleTable(page), filename=`ladtemco-${key}.csv`;
  dialog('Export '+(page==='audit-trail'?'events':page==='funds'?'balances':'register'),screens[page].title,
    modalSplit(sub('Included records',rows.length?miniTable(['Reference',registerInfo[key].headers[0]],rows.slice(0,4).map(r=>[r.id,r.values[0]])):'<p>No records match the current filters.</p>')+
      (rows.length>4?`<p class="lead">Showing the first 4 of ${rows.length} records.</p>`:''),'Export file',kv([['File',filename],['Rows in export',rows.length],['Format','CSV · spreadsheet compatible']])),
    [textButton('Download CSV',()=>{saveFile(filename,csvBlob([['Reference',...registerInfo[key].headers],...rows.map(r=>[r.id,...r.values])]));closeDialog();notify('CSV downloaded.');},true)]);
}
function review(key,r){
  const titles={members:'Review membership application',contributions:'Verify payment',liquidations:'Review liquidation evidence',expenses:'Review expense request'};
  const valid={members:'Active',contributions:'Posted',liquidations:'Closed',expenses:'Approved'}[key];
  let body=kv(defaultRows(key,r));
  if(key==='liquidations'){
    const lines=r.extra.lines||liquidEvidence;
    const accounted=lines.reduce((a,row)=>a+valueOfMoney(row[2]),0);
    const difference=valueOfMoney(r.values[2])-accounted;
    body=modalStats([['Advance released',r.values[2]],['Accounted for',peso(accounted)],['Difference',peso(difference),difference?'attention':'emphasis']])+
      modalSplit(sub('Supporting evidence',miniTable(['Evidence','Reference','Amount'],lines)),'Advance details',
        kv([['Project',r.values[0]],['Advance',r.values[1]],['Due',r.values[3]],['Status',r.values[4]]]));
  }
  if(key==='contributions')body=modalAmount('Payment to verify',r.values[3],badge(esc(r.values[4]),'amber'))+
    modalSplit(sub('Payment evidence',kv([['Receipt reference',r.extra['Receipt reference']||'OR-1041'],['Amount on receipt',r.values[3]]])),'Payment details',
      kv([['Received from',r.values[1]],['Category',r.values[2]],['Payment date',r.values[0]]]));
  if(key==='expenses'){
    const fund=demo.tables.funds.find(f=>f.values[0]===r.values[2]);
    if(fund)body=modalStats([['Requested',r.values[3]],['Available in fund',fund.values[3]],['After release',peso(valueOfMoney(fund.values[3])-valueOfMoney(r.values[3])),'emphasis']])+body;
  }
  const signOff=()=>{
    if(key==='members') { r.values[1]=dateText(demoDay);r.values[3]='₱0'; }
    changeStatus(key,r,valid,`${r.values[0]} was reviewed and marked ${valid.toLowerCase()}.`);
  };
  dialog(titles[key],r.id,body,[textButton('Return for correction',()=>reasonDialog(key,r)),textButton({members:'Approve membership',contributions:'Verify & post',liquidations:'Verify & close',expenses:'Approve request'}[key],signOff,true)]);
}
function reasonDialog(key,r){
  formDialog('Return for correction',r.id,[['Reason','long','Please attach the original supporting receipt.']],'Return record',v=>{
    r.extra.correction=v.Reason;changeStatus(key,r,'Returned',v.Reason);
  },{back:()=>review(key,r),description:'Tell the preparer what to correct. The reason stays with this record.'});
}
function detail(key,r){
  if(!r)return;
  if(key==='approvals'){
    const target={Liquidation:'liquidations',Contribution:'contributions',Membership:'members',Expense:'expenses','Cash advance':'expenses',Reimbursement:'expenses'}[r.values[1]];
    const linked=byId(target,r.id);
    if(linked)return r.extra.completed?detail(target,linked):review(target,linked);
  }
  const buttons=[];
  let title=r.values[0],body=kv(defaultRows(key,r));
  if(key==='members'){
    title='Member record';body=modalAmount('Member',r.values[0],badge(esc(r.values[2]),r.values[2]==='Active'?'green':'amber'))+
      kv([['Member reference',r.id],['Joined',r.values[1]],['Share capital',r.values[3]],...(r.extra.Email?[['Contact email',r.extra.Email]]:[])]);
    if(r.values[2]==='Pending review') buttons.push(textButton('Review application',()=>review(key,r),true));
    if(byId('share-capital',r.id)) buttons.push(textButton('Open capital ledger',()=>detail('share-capital',byId('share-capital',r.id)),true));
  } else if(key==='contributions'){
    if(r.values[4]==='For verification')return review(key,r);
    title=r.values[4]==='Posted'?'Payment receipt':'Payment record';
    if(r.values[4]==='Posted')body=sub('Payment received',`<div class="amount">${esc(r.values[3])}</div>`)+body+kv([['Receipt reference',r.extra['Receipt reference']||'OR-'+r.id.slice(-4)]]);
  } else if(key==='share-capital'){
    title='Member capital ledger';body+=sub('Recent transactions',miniTable(['Date','Amount','Reference'],demo.tables.transactions.filter(x=>x.values[1]===r.values[0]).map(x=>[x.values[2],x.values[3],x.id])));
  } else if(key==='funds'){
    title='Fund balance';body=modalStats([['Approved budget',r.values[1]],['Amount used',r.values[2]],['Available',r.values[3],'emphasis']])+sub(esc(r.values[0]),kv([['Fund reference',r.id],['Budget utilized',r.values[4]]]))+sub('Linked requests',miniTable(['Purpose','Amount','Status'],demo.tables.expenses.filter(x=>x.values[2]===r.values[0]).map(x=>[x.values[0],x.values[3],x.values[4]])));
  } else if(key==='expenses'){
    if(r.values[4]==='For approval')return review(key,r);
    const liq=demo.tables.liquidations.find(x=>x.values[1]===r.id);
    if(liq) buttons.push(textButton('Open liquidation',()=>detail('liquidations',liq),true));
    if(r.values[4]==='Approved')buttons.push(textButton('Release funds',()=>{
      const fund=demo.tables.funds.find(f=>f.values[0]===r.values[2]),amount=valueOfMoney(r.values[3]);
      if(!fund||valueOfMoney(fund.values[3])<amount){notify('The available balance is too low for release.');return;}
      fund.values[2]=peso(valueOfMoney(fund.values[2])+amount);fund.values[3]=peso(valueOfMoney(fund.values[3])-amount);
      fund.values[4]=(100*valueOfMoney(fund.values[2])/valueOfMoney(fund.values[1])).toFixed(1)+'%';
      changeStatus(key,r,'Released','The payment was released and the fund balance was updated.');
    },true));
  } else if(key==='liquidations'){
    if(r.values[4]==='For verification')return review(key,r);
    title='Liquidation record';body+=note(esc(r.extra.correction||(r.values[4]==='Closed'?'Verification completed. The advance is closed.':'The preparer must correct the evidence references.')),r.values[4]==='Closed'?'green':'amber');
  } else if(key==='reports'){
    title=r.values[0];body=modalSplit(sub('Report preview',reportContent(title)),'Report details',kv([['Period',r.values[1]],['Status',r.values[3]],['Download format','CSV']]));
    buttons.push(textButton('Download report',()=>{
      const el=document.createElement('div');el.innerHTML=reportContent(r.values[0]);
      const rows=[...el.querySelectorAll('tr,dl>div')].map(row=>[...row.children].map(c=>c.textContent));
      saveFile('ladtemco-report.csv',csvBlob([[r.values[0],r.values[1]],...rows]));notify('Report CSV downloaded.');
    },true));
  } else if(key==='reconciliation'){
    title=r.values[3]==='Matched'?'Reconciled bank entry':'Reconcile bank entry';
    body+=sub('Matching ledger entry',kv([['Ledger reference',r.extra.ledger],['Amount',r.values[2]]]));
    if(r.values[3]!=='Matched')buttons.push(textButton('Confirm match',()=>changeStatus(key,r,'Matched',`Matched ${r.id} to ledger reference ${r.extra.ledger}.`),true));
  } else if(key==='meetings'){
    title='Meeting agenda';body+=sub('Agenda',`<ol class="agenda">${esc(r.extra.agenda).split('\n').map(t=>`<li>${t}</li>`).join('')}</ol>`);
  } else if(key==='meetings-documents'){
    const summaries=['The board approved the annual operating plan and the allocation of funds to four cooperative programs.','Annual financial statements submitted for the members’ review.','Review collections, verify outstanding liquidations, and approve the operating plan.'];
    body+=sub('Document summary',`<p>${esc(r.extra.filename||summaries[starter[key].findIndex(x=>x.id===r.id)]||r.values[0])}</p>`);
    if(r.extra.content)buttons.push(textButton('Download attachment',async()=>{const blob=await (await fetch(r.extra.content)).blob();saveFile(r.extra.filename,blob);notify('Attachment downloaded.');},true));
  } else if(key==='audit-trail'){
    title='Audit event';const seed={'AT-2026-00451':['₱550','₱500','Corrected the amount to match the original receipt.'],'AT-2026-00450':['Draft','For verification','Submitted receipts and the cash return slip.'],'AT-2026-00449':['Draft','Published','Released audited financial statements to the member portal.']}[r.id]||[];
    body=modalStats([['Before',r.extra.before||seed[0]],['After',r.extra.after||seed[1],'emphasis'],['Event',r.values[1]]])+
      modalSplit(sub('Reason for change',`<p>${esc(r.extra.reason||seed[2])}</p>`),'Recorded event',kv([['Actor',r.values[3]],['Record',r.values[2]],['Time',r.values[0]]]));
  } else if(key==='users-roles'){
    title=r.values[3]==='Invited'?'Staff invitation':'Staff account';
    body+=sub('Effective permissions',`<ul>${(permissionSets[r.values[1]]||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`);
    if(r.extra.Email)body+=kv([['Invitation email',r.extra.Email]]);
  } else if(key==='permissions'){
    title=r.values[0]+' permissions';body+=sub('Allowed actions',`<ul>${permissionSets[r.id].map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`);
  }
  if(r.extra.correction && key!=='liquidations')body+=sub('Correction requested',`<p>${esc(r.extra.correction)}</p>`);
  dialog(title,r.id,body,buttons);
}
