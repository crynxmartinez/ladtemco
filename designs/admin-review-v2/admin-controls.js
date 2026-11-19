const selections={};
const viewState=page=>selections[page]||=( {tab:'',q:'',filters:{}} );
const templateStatus=(value)=>{
  if(['Active','Posted','Closed','Ready','Published','Enabled','Matched','Approved'].includes(value))return 'green';
  if(['For review','For verification','Pending review','For approval','Awaiting setup','Due today','Needs review','Unmatched','Needs reference'].includes(value))return 'amber';
  if(value==='Returned')return 'red';
  return ['Released','Invited','Corrected','Submitted'].includes(value)?'blue':'';
};
function optionsFor(page,key,label){
  const rows=demo.tables[key],pick=index=>[...new Set(rows.map(r=>r.values[index]))];
  if(label==='All statuses')return {choices:pick(statusColumn[key]),match:(r,v)=>r.values[statusColumn[key]]===v};
  const index={'All roles':1,'All event types':1,'All request types':1,'All audiences':3}[label];
  if(index!==undefined)return {choices:pick(index),match:(r,v)=>r.values[index]===v};
  if(label==='FY 2026')return {choices:['2026','2027'],match:(r,v)=>(r.extra['Fiscal year']||'2026')===v};
  if(key==='reports')return {choices:pick(1),match:(r,v)=>r.values[1]===v};
  const dates=rows.map(r=>new Date(r.values[0])).filter(d=>!isNaN(d)).map(d=>d.toLocaleString('en-US',{month:'long',year:'numeric'}));
  return {choices:[...new Set(dates.concat('October 2026'))],match:(r,v)=>new Date(r.values[0]).toLocaleString('en-US',{month:'long',year:'numeric'})===v};
}
function visibleTable(page){
  const s=viewState(page),tab=s.tab||registerInfo[page]?.tabs[0],key=tableKeyForTab(page,tab);
  let rows=(demo.tables[key]||[]).slice();
  if(tab==='Applications')rows=rows.filter(r=>r.values[2]!=='Active');
  if(page==='expenses'&&['Cash advances','Expenses','Reimbursements'].includes(tab))rows=rows.filter(r=>r.values[1]===({'Cash advances':'Cash advance',Expenses:'Expense',Reimbursements:'Reimbursement'}[tab]));
  if(page==='approvals')rows=rows.filter(r=>Boolean(r.extra.completed)===(tab==='Completed'));
  if(tab==='Resolutions')rows=rows.filter(r=>r.values[1]==='Resolution');
  for(const [label,v] of Object.entries(s.filters))if(v)rows=rows.filter(r=>optionsFor(page,key,label).match(r,v));
  if(s.q)rows=rows.filter(r=>[r.id,...r.values].join(' ').toLowerCase().includes(s.q.trim().toLowerCase()));
  return {rows,key,tab};
}
function drawRegister(page){
  const panel=document.querySelector('.table-wrap')?.closest('.panel');if(!panel)return;
  const {key,tab,rows}=visibleTable(page),info=registerInfo[key],s=viewState(page);
  const table=panel.querySelector('table');
  const altTitles={transactions:'Capital transactions',reconciliation:'Bank reconciliation',meetings:'Scheduled meetings',permissions:'Role permissions'};
  if(altTitles[key])panel.querySelector('h2').textContent=altTitles[key];
  table.innerHTML=`<thead><tr>${info.headers.map((h,i)=>`<th class="${info.numeric[i]?'numeric':''}">${esc(h)}</th>`).join('')}<th>Action</th></tr></thead><tbody>${rows.length?rows.map(r=>{
    const caption=r.extra.caption||r.id;
    return `<tr>${r.values.map((v,i)=>`<td class="${info.numeric[i]?'numeric':''}">${i===0?cell(esc(v),esc(caption)):i===statusColumn[key]||key==='users-roles'&&i===2||key==='audit-trail'&&i===1?badge(esc(v),templateStatus(v)):esc(v)}</td>`).join('')}<td><button type="button" class="row-action" data-ref="${esc(r.id)}">${esc(r.action)} ${icon('ChevronRight')}</button></td></tr>`;
  }).join(''):`<tr><td class="empty" colspan="${info.headers.length+1}"><b>No matching records</b><br>Try another search, filter, or view.</td></tr>`}</tbody>`;
  panel.querySelectorAll('[data-ref]').forEach(b=>b.onclick=()=>detail(key,byId(key,b.dataset.ref)));
  panel.querySelector('.panel-foot').textContent=`${rows.length} ${rows.length===1?'record':'records'} shown`;
  panel.querySelectorAll('.tabs button').forEach(b=>b.setAttribute('aria-pressed',String(b.textContent===tab)));
  panel.querySelectorAll('.filter').forEach(b=>{b.hidden=page!==key;b.innerHTML=esc(s.filters[b.dataset.filter]||({'FY 2026':'Fiscal year','November 2026':'All periods'}[b.dataset.filter]||b.dataset.filter))+icon('ChevronDown');});
}
function enumDialog(label,page){
  const s=viewState(page),{key}=visibleTable(page),{choices}=optionsFor(page,key,label);
  const title=({'All statuses':'Filter by status','All roles':'Filter by role','All event types':'Filter by event','All request types':'Filter by request type','All audiences':'Filter by audience','November 2026':'Filter by period','FY 2026':'Filter by fiscal year'})[label]||label;
  const all=label.startsWith('All')?label:'All periods';
  dialog(title,screens[page].title,`<div class="option-list">${['',...choices].map(v=>`<button data-value="${esc(v)}" aria-pressed="${(s.filters[label]||'')===v}">${esc(v||all)}<span>${(s.filters[label]||'')===v?'✓':''}</span></button>`).join('')}</div>`);
  modalHost.querySelectorAll('[data-value]').forEach(b=>b.onclick=()=>{s.filters[label]=b.dataset.value;closeDialog();drawRegister(page);});
}
function openEntry(page,title,index){
  if(page==='overview'){const row=demo.tables.approvals.filter(r=>!r.extra.completed)[index];return detail('approvals',row);}
  if(page==='settings')return setting(title);
  if(page==='reports'){
    if(index<2){
      const relevant=index===0?demo.tables.reconciliation.slice(0,2):[byId('reconciliation','REC-003')];
      return detail('reconciliation',relevant.find(r=>r.values[3]!=='Matched')||relevant[0]);
    }
    return dialog('Trial balance','Reports & reconciliation',kv([['Total debits','₱1,640,000'],['Total credits','₱1,640,000'],['Difference','₱0']])+note('The demonstration trial balance agrees.','green','CheckCircle2'));
  }
  if(page==='meetings-documents')return dialog('Publication visibility',title,kv([['Audience',title],['Who can read',{'All members':'Signed-in cooperative members','Board only':'Authorized board accounts','Draft':'Authorized document editors'}[title]]]));
}
function refreshSummary(page){
  const metricsEls=[...document.querySelectorAll('.metric strong')],set=(i,v)=>{if(metricsEls[i])metricsEls[i].textContent=v;};
  const calcs=(k,i)=>demo.tables[k].reduce((a,r)=>a+valueOfMoney(r.values[i]),0);
  const approved=calcs('funds',1),used=calcs('funds',2),active=demo.tables.members.filter(r=>r.values[2]==='Active').length;
  const pending=demo.tables.approvals.filter(r=>!r.extra.completed),posted=demo.tables.contributions.filter(r=>r.values[4]==='Posted'&&/^Nov .*2026$/.test(r.values[0])).reduce((v,r)=>v+valueOfMoney(r.values[3]),0);
  if(page==='overview'){
    set(0,284+active);set(1,peso(181750+posted));set(2,pending.length);set(3,(used/approved*100).toFixed(1)+'%');
    const panels=document.querySelectorAll('.panel-body');
    panels[0].innerHTML=pending.length?list(pending.map(r=>[r.values[1]+' review',r.id+' · '+r.values[0],'ListChecks',badge(r.values[4],templateStatus(r.values[4]))])):note('You have reviewed every assigned record.','green');
    panels[2].innerHTML=facts([['Approved',peso(approved)],['Used',peso(used)],['Remaining',peso(approved-used)]])+demo.tables.funds.map(r=>bar(esc(r.values[0]),parseFloat(r.values[4]),r.values[4])).join('');
  }
  if(page==='members'){set(0,284+active);set(1,demo.tables.members.filter(r=>r.values[2]==='Pending review').length);}
  if(page==='contributions'){set(0,peso(181750+posted));set(1,demo.tables.contributions.filter(r=>r.values[4]==='For verification').length);}
  if(page==='funds'){set(0,peso(approved));set(1,peso(used));set(2,peso(approved-used));}
  if(page==='liquidations')['For verification','Returned','Closed'].forEach((v,i)=>set(i,demo.tables.liquidations.filter(r=>r.values[4]===v).length));
  if(page==='approvals'){set(0,pending.length);set(1,pending.filter(r=>r.values[3]==='Nov 20').length);set(2,pending.filter(r=>r.values[3]!=='Nov 20').map(r=>r.values[3]).sort()[0]||'—');}
  if(page==='reports'){set(0,peso(181750+posted));set(2,demo.tables.reconciliation.filter(r=>r.values[3]!=='Matched').length);}
}
function decorate(page){
  const s=viewState(page);
  refreshSummary(page);
  syncPanels(page);
  const acct=document.querySelector('.account');acct.querySelector('b').textContent='Demo administrator';acct.querySelector('small').textContent='Client preview';acct.querySelector('.avatar').textContent='DA';
  document.querySelector('.brand b').textContent=demo.settings['Cooperative profile']?.['Cooperative name']||'LADTEMCO';
  document.querySelectorAll('.tabs span').forEach(span=>{
    const b=document.createElement('button');b.textContent=span.textContent;b.type='button';span.replaceWith(b);
    b.onclick=()=>{s.tab=b.textContent;s.filters={};s.q='';render();};
  });
  document.querySelectorAll('.filter').forEach(span=>{
    const b=document.createElement('button');b.className='filter';b.dataset.filter=span.textContent;b.type='button';span.replaceWith(b);b.onclick=()=>enumDialog(b.dataset.filter,page);
  });
  const search=document.querySelector('input[type=search]');
  if(search){search.value=s.q;search.oninput=()=>{s.q=search.value;drawRegister(page);};}
  if(registerInfo[page])drawRegister(page);
  document.querySelectorAll('button.button').forEach(b=>{
    const label=b.textContent.trim();
    if(plans[label])b.onclick=()=>startForm(label);
    else if(label.startsWith('Export'))b.onclick=()=>exportRegister(page);
    else if(label==='Review evidence')b.onclick=()=>detail('liquidations',byId('liquidations','LIQ-2026-014'));
    else if(label==='Review payment')b.onclick=()=>detail('contributions',byId('contributions','CON-2026-0041'));
    else if(label==='Open member record')b.onclick=()=>detail('members',byId('members','LAD-0241'));
    else if(label==='Open agenda')b.onclick=()=>detail('meetings',byId('meetings','MTG-2026-012'));
  });
  if(['settings','overview','meetings-documents','reports'].includes(page)){
    document.querySelectorAll('.list-entry').forEach((el,index)=>{
      const title=el.querySelector('strong')?.textContent;
      if(!title)return;
      // A button spans the complete row and retains native keyboard behavior.
      const b=document.createElement('button');b.className='list-entry action-entry';b.innerHTML=el.innerHTML;b.type='button';el.replaceWith(b);
      b.onclick=()=>openEntry(page,title,index);
    });
  }
  if(page==='settings')document.querySelectorAll('.action-entry').forEach(b=>{
    const v=demo.settings[b.querySelector('strong').textContent];
    if(v)b.querySelector('small').textContent=Object.values(v).join(' · ');
  });
}
window.decorateAdmin=decorate;
theme=demo.theme;
window.addEventListener('hashchange',closeDialog);
document.addEventListener('click',e=>{if(e.target.closest('#theme')){demo.theme=theme;persist();}});
for(const r of demo.tables.reports)r.values[2]='CSV';
render();
