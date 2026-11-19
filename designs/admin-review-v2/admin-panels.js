function syncPanels(page){
  const preview=document.querySelector('.grid > .stack > .panel');
  const update=(panel,title,description,body)=>{
    if(!panel)return;
    panel.innerHTML=head(title,description)+`<div class="panel-body">${body}</div>`;
  };
  const approvedFund=demo.tables.funds.find(r=>r.id==='FND-2026-001');
  const member=byId('members','LAD-0241'),cap=byId('share-capital','LAD-0241');
  const activeQueue=demo.tables.approvals.filter(r=>!r.extra.completed);
  const liq=byId('liquidations','LIQ-2026-014'),payment=byId('contributions','CON-2026-0041');
  if(page==='members')update(preview,'Member preview',member.id,sub(member.values[0],kv([['Status',member.values[2]],['Member since',member.values[1]],['Paid-up share capital',member.values[3]]]))+button('Open member record','ArrowRight',true));
  if(page==='share-capital'){
    const balance=valueOfMoney(cap.values[2]),out=valueOfMoney(cap.values[3]),percent=100*balance/(balance+out);
    update(preview,'Capital build-up',cap.values[0]+' · '+cap.id,kv([['Subscribed capital',peso(balance+out)],['Paid-up capital',cap.values[2]],['Outstanding',cap.values[3]]])+bar('Paid-up share',percent,Math.round(percent)+'%')+note('Share capital is the member’s ownership contribution.','green','WalletCards'));
  }
  if(page==='funds'){
    update(preview,approvedFund.values[0],approvedFund.id,kv([['Approved',approvedFund.values[1]],['Used',approvedFund.values[2]],['Available',approvedFund.values[3]]])+progress(parseFloat(approvedFund.values[4]))+`<div class="list-entry"><div><strong>Training program advance</strong><small>ADV-2026-0009 · ₱50,000</small></div><a class="link" href="#expenses">Open ${icon('ChevronRight')}</a></div>`);
    document.querySelectorAll('.metric small')[2].textContent='Across '+demo.tables.funds.length+' funds';
  }
  if(page==='contributions'&&payment.values[4]!=='For verification'){
    update(preview,'Payment record',payment.id,kv(defaultRows('contributions',payment))+note('Latest review decision recorded.','green'));
  }
  if(page==='liquidations'&&liq.values[4]!=='For verification'){
    update(preview,'Reviewed liquidation',liq.id,kv(defaultRows('liquidations',liq))+note(esc(liq.extra.correction||'Evidence review completed.'),liq.values[4]==='Closed'?'green':'amber'));
  }
  if(page==='approvals'){
    const first=activeQueue[0];update(preview,'Next decision',first?.id||'',first?kv(defaultRows('approvals',first))+`<button type="button" class="button primary" data-next-decision>${icon('ArrowRight')}Review next item</button>`:note('The queue is clear.','green','CheckCircle2'));
    preview.querySelector('[data-next-decision]')?.addEventListener('click',()=>detail('approvals',first));
    const smalls=document.querySelectorAll('.metric small');smalls[0].textContent='Assigned reviews';smalls[2].textContent='Next scheduled deadline';
  }
  if(page==='reports'){
    preview.querySelectorAll('.list-entry').forEach((el,i)=>{
      const rows=i===0?demo.tables.reconciliation.slice(0,2):i===1?demo.tables.reconciliation.slice(2):[];
      if(!rows.length)return;
      const remaining=rows.filter(r=>r.values[3]!=='Matched').length;
      el.querySelector('small').textContent=remaining+' '+(remaining===1?'item':'items')+' to resolve';
      if(!remaining)el.querySelector('.pill').outerHTML=badge('Matched','green');
    });
  }
  if(page==='overview')document.querySelectorAll('.metric small')[2].textContent=activeQueue.filter(r=>r.values[3]==='Nov 20').length+' due today';
  // A related-record link opens that record directly while the workflow nav changes sections.
  const relation=page==='funds'?['expenses','ADV-2026-0009']:page==='expenses'?['liquidations','LIQ-2026-014']:page==='liquidations'?['expenses','ADV-2026-0009']:null;
  if(relation)preview?.querySelectorAll('a').forEach(a=>a.onclick=e=>{e.preventDefault();detail(relation[0],byId(...relation));});
}
