function fieldOptions(type,example){
  if(type==='choice')return String(example).split('|').map(x=>[x,x]);
  const map={member:'members',capital:'share-capital',fund:'funds',advance:'expenses'};
  let rows=demo.tables[map[type]];
  if(!rows)return null;
  if(type==='member')rows=rows.filter(r=>r.values[2]==='Active');
  if(type==='capital')rows=rows.filter(r=>valueOfMoney(r.values[3])>0);
  if(type==='advance')rows=rows.filter(r=>r.values[1]==='Cash advance' && r.values[4]==='Released' && !demo.tables.liquidations.some(l=>l.values[1]===r.id));
  return rows.map(r=>[r.id,`${r.values[0]} · ${type==='advance'?r.values[3]+' · ':''}${r.id}`]);
}
function formDialog(title,context,fields,submit,onSubmit,{initial={},description='',back}={}){
  const inputs=fields.map(([label,type,example])=>{
    const options=fieldOptions(type,example),name=esc(label),value=initial[label]??(type==='date'?demoDay:'');
    let control;
    if(options)control=`<select name="${name}" required>${options.length?'':'<option value="">No eligible records</option>'}${options.map(([id,text])=>`<option value="${esc(id)}" ${id===value?'selected':''}>${esc(text)}</option>`).join('')}</select>`;
    else if(type==='long')control=`<textarea rows="2" maxlength="500" name="${name}" placeholder="${esc(example)}" required>${esc(value)}</textarea>`;
    else if(type==='file')control=`<input type="file" name="${name}" accept=".txt,.pdf,text/plain,application/pdf" required><small>PDF or text · up to 256 KB</small>`;
    else {
      const numeric=['money','integer','nonnegative'].includes(type);
      control=`<input type="${numeric?'number':type}" name="${name}" value="${esc(value)}" ${numeric?`min="${type==='nonnegative'?0:type==='integer'?1:.01}" max="999999999" step="${type==='integer'?1:'.01'}"`:'maxlength="120"'} placeholder="${esc(example||'')}" required>`;
    }
    return `<label class="field${['long','file','advance'].includes(type)?' wide-field':''}"><span>${name}</span>${control}</label>`;
  }).join('');
  dialog(title,context,`<p class="form-intro">${esc(description)}</p><form id="record-form">${inputs}<p role="alert" class="form-error" hidden></p></form>`,[textButton(submit,()=>modalHost.querySelector('form').requestSubmit(),true)],{back});
  const form=modalHost.querySelector('form'),error=form.querySelector('[role=alert]');
  if(title==='Start liquidation'||title==='Record capital payment'){
    const summary=document.createElement('output');
    summary.className='form-summary';
    form.insertBefore(summary,error);
    const update=()=>{
      const v=Object.fromEntries(new FormData(form));
      const advance=title==='Start liquidation';
      const row=advance?byId('expenses',v['Released advance']):byId('share-capital',v.Member);
      if(!row){summary.textContent=advance?'No released advances are available.':'No outstanding capital balances.';return;}
      const balance=valueOfMoney(row.values[3]);
      const applied=advance?Number(v['Supported spending'])+Number(v['Cash returned']):Number(v['Amount received']);
      const remaining=Math.round((balance-applied)*100)/100;
      summary.dataset.warning=String(remaining<0);
      summary.textContent=(advance?'Cash released ':'Outstanding balance ')+peso(balance)+' · '+(advance?'Still to account for ':'Balance after payment ')+peso(remaining);
    };
    form.addEventListener('input',update);update();
  }
  form.onsubmit=async e=>{
    e.preventDefault();
    const values=Object.fromEntries(new FormData(form));
    for(const k of Object.keys(values))if(typeof values[k]==='string')values[k]=values[k].trim();
    if(Object.values(values).some(v=>v==='')){error.textContent='Complete the required fields.';error.hidden=false;return;}
    const b=modalHost.querySelector('[data-command]');b.disabled=true;
    try{await onSubmit(values);}
    catch(err){error.textContent=err.message;error.hidden=false;}
    finally{b.disabled=false;}
  };
}
const readFileData=file=>new Promise((resolve,reject)=>{
  const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('The attachment could not be read.'));reader.readAsDataURL(file);
});
function addApproval(r,type,amount){
  add('approvals',record(r.id,[r.values[0],type,amount,'Nov 20','For review'],'Review'));
}
async function createRecord(title,v){
  const [key]=plans[title];let r;
  if(key==='members'){
    r=record(nextRef('MEM'),[v['Member name'],'—','Pending review','—'],'Review',v);
    addApproval(r,'Membership','—');
  }else if(key==='contributions'){
    if(demo.tables[key].some(r=>r.extra['Receipt reference']===v['Receipt reference']))throw new Error('This receipt reference already exists.');
    r=record(nextRef('CON'),[dateText(v['Payment date']),byId('members',v.Member).values[0],v.Category,peso(v['Amount received']),'For verification'],'Verify',v);
    addApproval(r,'Contribution',r.values[3]);
  }else if(key==='share-capital'){
    const member=byId(key,v.Member),amount=Number(v['Amount received']),outstanding=valueOfMoney(member.values[3]);
    if(amount>outstanding)throw new Error('Payment exceeds the outstanding share capital of '+peso(outstanding)+'.');
    if(demo.tables.transactions.some(x=>x.extra['Receipt reference']===v['Receipt reference']))throw new Error('This receipt reference already exists.');
    member.values[2]=peso(valueOfMoney(member.values[2])+amount);member.values[3]=peso(outstanding-amount);
    const directory=byId('members',member.id);if(directory)directory.values[3]=member.values[2];
    r=record(nextRef('CAP'),['Capital installment',member.values[0],dateText(v['Payment date']),peso(amount),'Posted'],'View',v);
    add('transactions',r);
  }else if(key==='funds'){
    if(demo.tables.funds.some(f=>f.values[0].toLowerCase()===v['Fund name'].toLowerCase()))throw new Error('A fund with this name already exists.');
    const amount=peso(v['Approved allocation']);r=record(nextRef('FND'),[v['Fund name'],amount,'₱0',amount,'0%'],'Open',v);
  }else if(key==='expenses'){
    const fund=byId('funds',v.Fund);
    if(Number(v['Amount requested'])>valueOfMoney(fund.values[3]))throw new Error('Requested amount exceeds the available fund balance.');
    r=record(nextRef('REQ'),[v.Purpose,v.Type,fund.values[0],peso(v['Amount requested']),'For approval'],'Review',v);
    addApproval(r,v.Type,r.values[3]);
  }else if(key==='liquidations'){
    const advance=byId('expenses',v['Released advance']),spent=Number(v['Supported spending']),cash=Number(v['Cash returned']);
    if(!advance||demo.tables.liquidations.some(l=>l.values[1]===advance.id))throw new Error('Select an available released advance.');
    if(Math.round((spent+cash)*100)!==Math.round(valueOfMoney(advance.values[3])*100))throw new Error('Receipts plus returned cash must total '+advance.values[3]+'.');
    r=record(nextRef('LIQ'),[advance.values[0],advance.id,advance.values[3],'Nov 20','For verification'],'Review',{...v,lines:[['Supported spending',v['Evidence reference'],peso(spent)],['Cash returned',v['Evidence reference'],peso(cash)]]});
    addApproval(r,'Liquidation',r.values[2]);
  }else if(key==='reports'){
    r=record(nextRef('RPT'),[v['Report type'],v.Period,'CSV','Ready'],'Preview',v);
  }else if(key==='meetings'){
    r=record(nextRef('MTG'),[v['Meeting title'],dateText(v['Meeting date']),v.Time,v.Venue],'Open agenda',{...v,agenda:v.Agenda});
  }else if(key==='meetings-documents'){
    const file=v.Document;
    if(!file?.size || file.size>262144 || !/\.(txt|pdf)$/i.test(file.name))throw new Error('Choose a PDF or text file of up to 256 KB.');
    const content=await readFileData(file);
    r=record(nextRef('DOC'),[v.Title,v.Type,dateText(demoDay),v.Audience,v.Publication],'View',{filename:file.name,content});
  }else if(key==='users-roles'){
    if(demo.tables[key].some(x=>x.extra.Email?.toLowerCase()===v.Email.toLowerCase()))throw new Error('An invitation already exists for this address.');
    r=record(nextRef('STAFF'),[v['Staff name'],v.Role,'Awaiting setup','Invited'],'View invite',v);
  }
  if(key!=='share-capital')add(key,r);
  const page=currentMenu()[0];selections[page]={tab:key==='meetings'?'Meetings':key==='share-capital'?'Transactions':'',filters:{},q:''};
  audit(plans[title][1],r.id,descriptions[title],'New',r.values[0]);
  committed({members:'Application saved',contributions:'Payment recorded','share-capital':'Capital payment posted',funds:'Budget created',expenses:'Request submitted',liquidations:'Liquidation submitted',reports:'Report ready',meetings:'Meeting scheduled','meetings-documents':'Document saved','users-roles':'Demo invitation created'}[key],r.id,key==='users-roles'?'The invitation is visible in Staff accounts. Email delivery is simulated.':`${r.values[0]} is now available in the ${registerInfo[key==='share-capital'?'transactions':key].headers[0].toLowerCase()} register.`);
}
function startForm(title){
  formDialog(title,screens[currentMenu()[0]].title,plans[title][2],plans[title][1],v=>createRecord(title,v),{description:descriptions[title]});
}
function setting(title){
  if(title==='Backup & restore'){
    dialog('Backup & restore','Restricted access',note('Backup and restore require the system owner. You can record a request for review.','amber','ShieldCheck')+kv([['Environment','Local demonstration'],['Latest request',demo.settings.backup||'None']]),[textButton('Request backup review',()=>{
      formDialog('Request backup review','Backup & restore',[['Reason','long','Review archive availability before the annual audit.']],'Submit request',v=>{
        const id=nextRef('BKP');demo.settings.backup=id;audit('Backup review requested',id,v.Reason);committed('Request recorded',id,'The request was added to the local audit trail.');
      },{back:()=>setting(title),description:'Explain why the system owner should review the backup.'});
    },true)]);return;
  }
  const fields=settingsForms[title],initial=demo.settings[title]||Object.fromEntries(fields.map(([label,,def])=>[label,def.split('|')[0]]));
  formDialog(title,'Settings',[...fields,['Reason for change','long','Document the reason for this change.']],'Save settings',v=>{
    const reason=v['Reason for change'];delete v['Reason for change'];
    if(Object.keys(v).every(k=>v[k]===initial[k]))throw new Error('Change a setting before saving.');
    demo.settings[title]=v;audit('Settings updated',title,reason,Object.values(initial).join(' · '),Object.values(v).join(' · '));
    committed('Settings saved',title,'The updated preferences and your reason are recorded in the local audit trail.');
  },{initial,description:'Changes apply to this demonstration workspace.'});
}
