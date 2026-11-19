const dialog=document.getElementById('detail');
const dialogBody=dialog.querySelector('.dialog-body');
const dialogFooter=dialog.querySelector('footer');
let returnFocus,noticeTimer;
function announce(message){
  const region=document.getElementById('announcement');
  region.textContent=message;
  region.hidden=false;
  clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{region.hidden=true;},4500);
}
function showDialog(title,kicker,body,buttons=''){
  const wasOpen=dialog.open;
  if(!wasOpen)returnFocus=document.activeElement;
  dialog.querySelector('h2').textContent=title;
  dialog.querySelector('.kicker').textContent=kicker;
  dialogBody.innerHTML=body;
  dialogBody.scrollTop=0;
  dialogFooter.innerHTML=action('Close','close')+buttons;
  if(!wasOpen)dialog.showModal();
  dialog.querySelector('h2').focus();
}
function closeDialog(){
  if(dialog.open)dialog.close();
}
dialog.addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus();});
dialog.addEventListener('click',e=>{
  if(e.target!==dialog)return;
  const b=dialog.getBoundingClientRect();
  if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)closeDialog();
});
function showPayment(id){
  const r=find(contributions,id);
  if(!r)return;
  showDialog(r.receipt?'Contribution receipt':'Payment details',r.id,
    pill(r.status,r.status==='Posted'?'green':r.status==='Reversed'?'red':'amber')+
    `<p class="amount">${money(r.amount)}</p>`+facts([['Member',member.name],['Member ID',member.id],['Payment date',dateLabel(r.date)],['Category','Monthly dues'],['Receipt',r.receipt||'Unavailable']])+
    (r.note?note(r.note):''),r.receipt?action('Download receipt','receipt-pdf',id,'Download',true):'');
}
function showCapital(id){
  const r=find(capital,id);
  if(!r)return;
  const balance=openingCapital+sum(capital.filter(x=>x.date<=r.date),'amount');
  showDialog(r.label,id,pill('Posted')+`<p class="amount">${money(r.amount)}</p>`+facts([['Member ID',member.id],['Date',dateLabel(r.date)],['Shares added',r.amount/member.par],['Paid-up balance after posting',money(balance)]]),action('Capital statement','capital-statement','','Download',true));
}
function showFund(id){
  const f=find(funds,id);if(!f)return;
  const related=projects.filter(p=>p.fund===id);
  showDialog(f.name,id,`<p class="lead">${f.description}</p>`+fundBody(f)+`<h3>Published projects</h3>`+
    (related.length?related.map(p=>recordEntry(p.name,p.status,'ClipboardCheck','project',p.id)).join(''):`<p class="meeting-info">No project summaries have been published for this fund yet.</p>`),action('Fund report','document','PUB-2026-011','FileText'));
}
function showProject(id){
  const p=find(projects,id);if(!p)return;
  const f=find(funds,p.fund);
  let body=pill(p.status,p.status==='Closed'?'green':'amber')+`<p class="meeting-info">${p.summary}</p>`+facts([['Funding source',f.name],['Published',dateLabel(p.date)],['Advance released',money(p.released)]]);
  if(p.status==='Closed')body+=`<h3>Verified liquidation</h3>`+facts([...p.items.map(([label,n])=>[label,money(n)]),['Total supported spending',money(p.spent)],['Cash returned',money(p.returned)],['Unaccounted',money(p.released-p.spent-p.returned)]]);
  showDialog(p.name,id,body,action('View fund','fund',f.id)+(p.document?action('Read published summary','document',p.document,'FileText',true):''));
}
function showDocument(id){
  const d=docFor(id);if(!d)return;
  showDialog(d.title,d.id,facts([['Published',dateLabel(d.date)],['Audience','All members'],['Document type',d.type]])+
    `<article class="paper"><span class="paper-mark">LADTEMCO</span>${d.lines.map(l=>`<p>${escapeText(l)}</p>`).join('')}</article>`,action('Download PDF','document-pdf',id,'Download',true));
}
function agenda(){
  showDialog(meeting.name,'Member meeting',facts([['Date',dateLabel(meeting.date)],['Time',meeting.time],['Location',meeting.venue],['My response',preferences.rsvp]])+
    '<h3>Agenda</h3><ol class="agenda"><li>Membership update</li><li>Published fund utilization and closed projects</li><li>Member questions and next steps</li></ol>',
    action('Agenda document','document','PUB-2026-015','FileText')+action('Respond','respond','','CalendarDays',true));
}
function rsvp(){
  const options=['Attending','Unable to attend','Undecided'];
  showDialog('My attendance',meeting.name,`<form id="rsvp-form"><label class="field"><span>Response for ${dateLabel(meeting.date)}</span><select name="response" required>${preferences.rsvp==='No response'?'<option value="">Choose a response</option>':''}${options.map(o=>`<option ${preferences.rsvp===o?'selected':''}>${o}</option>`).join('')}</select></label></form>`,
    '<button class="button primary" type="submit" form="rsvp-form">Save response</button>');
}
function editContact(){
  showDialog('Edit contact details',member.id,`<form id="contact-form"><label class="field"><span>Email</span><input name="email" type="email" autocomplete="off" required maxlength="120" value="${escapeText(preferences.email)}"></label>
  <label class="field"><span>Philippine mobile number</span><input type="tel" name="mobile" autocomplete="off" required maxlength="18" value="${escapeText(preferences.mobile)}"><small>Use 09 or +639 followed by the remaining digits.</small></label><p class="form-error" role="alert" hidden></p></form>`,
  '<button type="submit" class="button primary" form="contact-form">Save contact details</button>');
}
function applyChange(patch,message){
  const saved=savePreferences(patch);
  closeDialog();render();
  announce(saved?message:message+' Changes are available for this session only.');
}
dialog.addEventListener('submit',event=>{
  event.preventDefault();const form=event.target;
  if(form.id==='rsvp-form')return applyChange({rsvp:form.elements.response.value},'Attendance response saved.');
  if(form.id==='contact-form'){
    const mobile=form.elements.mobile.value.replace(/[ ()-]/g,'');
    if(!/^(09\d{9}|\+639\d{9})$/.test(mobile)){
      const error=form.querySelector('[role=alert]');error.hidden=false;error.textContent='Enter an 11-digit number beginning with 09, or use +639 followed by nine digits.';form.elements.mobile.focus();return;
    }
    applyChange({email:form.elements.email.value.trim(),mobile},'Contact details saved.');
  }
});
function sessions(){
  showDialog('Demo sessions','Profile & security',facts([['This device','Current session'],['Other demo device',preferences.otherSession?'Signed in':'Signed out']])+
    note('Session changes apply to this sample membership on this device.'),preferences.otherSession?action('Sign out other device','confirm-session','','ShieldCheck',true):'');
}
function reset(){
  showDialog(preferences.resetRequested?'Reset request recorded':'Request a demo password reset','Profile & security',
    facts([['Member',member.id],['Contact email',preferences.email],['Status',preferences.resetRequested?'Recorded on this device':'Ready to request']])+
    note('This demonstration records the request locally. Email delivery and live sign-in recovery are simulated.'),preferences.resetRequested?'':action('Record reset request','save-reset','','',true));
}
function notifications(){
  showDialog('Notifications','Member updates',notices.map(n=>recordEntry(n.title,(preferences.read.includes(n.id)?'Read':'Unread')+' · '+dateLabel(n.date),'Bell','notice',n.id)).join(''),
    preferences.read.length<notices.length?action('Mark all as read','read-all'):'');
}
const commands={
  close:closeDialog,payment:showPayment,capital:showCapital,fund:showFund,project:showProject,document:showDocument,agenda,respond:rsvp,'edit-contact':editContact,sessions,reset,notifications,
  'receipt-pdf':receiptPDF,'document-pdf':documentPDF,'capital-statement':capitalPDF,'statement-pdf':statementPDF,export:exportPayments,calendar:calendarFile,
  statement:()=>showDialog('My membership statement',member.id,facts([['Member',member.name],['Statement date','November 20, 2026'],['Posted contributions',money(postedTotal)],['Paid-up capital',money(paidCapital)],['2025 patronage allocation',money(2140)]]),action('Download statement','statement-pdf','','Download',true)),
  'confirm-session':()=>showDialog('Sign out the other device?','Demo session','<p class="lead">Your other sample device will show as signed out. Your current session stays active.</p>',action('Confirm sign-out','end-session','','',true)),
  'end-session':()=>applyChange({otherSession:false},'Other demo device signed out.'),
  'save-reset':()=>applyChange({resetRequested:true},'Demo reset request recorded.'),
  notice:id=>{const n=find(notices,id);if(!n)return;savePreferences({read:[...new Set([...preferences.read,id])]});updateBell();commands[n.action](n.key);},
  'read-all':()=>{savePreferences({read:notices.map(n=>n.id)});updateBell();notifications();},
  clear:()=>{searchText='';filterValue='';render();document.getElementById('search')?.focus();},
  theme:()=>{savePreferences({theme:preferences.theme==='dark'?'light':'dark'});render();document.querySelector('[data-action=theme]').focus();},
  more:()=>showDialog('Member menu','Navigation',`<nav class="more-menu">${menus.map(([id,label,symbol])=>`<a href="#${id}">${ico(symbol)}${label}</a>`).join('')}<a href="${leaveDemoHref}">${ico('ArrowLeft')}Leave demo</a></nav>`),
};
document.addEventListener('click',event=>{
  const button=event.target.closest('button[data-action]');
  if(button)commands[button.dataset.action]?.(button.dataset.id);
  if(event.target.closest('#detail a[href^="#"]'))closeDialog();
});
