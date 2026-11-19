function downloadFile(filename,blob){
  const url=URL.createObjectURL(blob),anchor=document.createElement('a');
  anchor.href=url;
  anchor.download=filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
  announce(`Download started · ${filename}`);
}
// All text is converted to the PDF's single-byte font before computing file offsets.
function samplePDF(title,lines){
  const plain=text=>String(text).replaceAll('₱','PHP ').replace(/[–—]/g,'-').replaceAll('·','|').replace(/[^\x20-\x7e]/g,'');
  const literal=text=>plain(text).replace(/([\\()])/g,'\\$1');
  const wrap=text=>{
    const rows=[''];
    for(const word of plain(text).split(/\s+/)){
      const i=rows.length-1,joined=(rows[i]+' '+word).trim();
      if(joined.length>79 && rows[i])rows.push(word);else rows[i]=joined;
    }
    return rows;
  };
  const bodyLines=lines.flatMap(line=>[...wrap(line),'']);
  const pages=[];
  for(let i=0;i<Math.max(1,bodyLines.length);i+=34)pages.push(bodyLines.slice(i,i+34));
  const objects=['<< /Type /Catalog /Pages 2 0 R >>',`<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_,i)=>`${4+2*i} 0 R`).join(' ')}] >>`,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
  pages.forEach((rows,i)=>{
    const stream=`0.07 0.24 0.18 rg 0 746 612 46 re f\nBT /F1 14 Tf 1 1 1 rg 40 763 Td (LADTEMCO  |  Member edition) Tj ET\nBT /F1 17 Tf 0.08 0.17 0.13 rg 40 711 Td (${literal(title)}) Tj ET\nBT /F1 11 Tf 40 677 Td 15 TL\n${rows.map(s=>`(${literal(s)}) Tj T*`).join('\n')}\nET\nBT /F1 9 Tf 40 35 Td (Demonstration record  |  Page ${i+1} of ${pages.length}) Tj ET`;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${5+2*i} 0 R >>`,`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });
  let pdf='%PDF-1.4\n';const offsets=[0];
  objects.forEach((obj,i)=>{offsets.push(pdf.length);pdf+=`${i+1} 0 obj\n${obj}\nendobj\n`;});
  const start=pdf.length;
  pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n${offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')}trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`;
  return new Blob([pdf],{type:'application/pdf'});
}
function documentPDF(id){
  const d=docFor(id);
  downloadFile(d.id+'.pdf',samplePDF(d.title,[`${d.id} | Published ${dateLabel(d.date)}`,...d.lines]));
}
function receiptPDF(id){
  const r=find(contributions,id);
  if(!r?.receipt || r.status!=='Posted')return;
  downloadFile(r.receipt+'.pdf',samplePDF('Member contribution receipt',[`${member.name} | ${member.id}`,`Receipt ${r.receipt}`,`Payment reference ${r.id}`,`Posted on ${dateLabel(r.date)}`,`Monthly dues received: ${money(r.amount)}.`]));
}
function capitalPDF(){
  const lines=[`${member.name} | ${member.id}`,'As of November 20, 2026',
    `Subscribed: ${money(member.subscribed)}. Paid up: ${money(paidCapital)}. Outstanding: ${money(member.subscribed-paidCapital)}.`,
    `Opening balance before listed transactions: ${money(openingCapital)}.`,
    ...capital.map(r=>`${dateLabel(r.date)} | ${r.id} | ${r.label} | ${money(r.amount)}`)];
  downloadFile(member.id+'-capital.pdf',samplePDF('Share capital statement',lines));
}
function statementPDF(){
  downloadFile(member.id+'-statement.pdf',samplePDF('Membership statement',[`${member.name} | ${member.id} | November 20, 2026`,
    `Lifetime posted contributions: ${money(postedTotal)}.`, `Opening dues before August 2026: ${money(openingDues)}.`,
    ...contributions.map(r=>`${dateLabel(r.date)} | ${r.id} | ${money(r.amount)} | ${r.status}`),
    `Paid-up share capital: ${money(paidCapital)} of ${money(member.subscribed)} subscribed.`,`2025 patronage refund allocation: PHP 2,140.`]));
}
function exportPayments(){
  const headers=['Payment date','Reference','Amount (PHP)','Status','Receipt'];
  const rows=visibleRows('contributions').map(({id})=>{const r=find(contributions,id);return [r.date,r.id,r.amount,r.status,r.receipt||''];});
  const content=[headers,...rows].map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');
  downloadFile(member.id+'-contributions.csv',new Blob(['\ufeff'+content],{type:'text/csv;charset=utf-8'}));
}
function calendarFile(){
  const event=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Ladtemco//Member Demo//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',
    'UID:member-forum-20261212@ladtemco.example','DTSTAMP:20261119T010000Z','DTSTART:20261212T010000Z','DTEND:20261212T030000Z',
    'SUMMARY:December member forum','LOCATION:Ladtemco Hall\\, Languyan','DESCRIPTION:Review published fund utilization and closed projects.','END:VEVENT','END:VCALENDAR',''];
  downloadFile('december-member-forum.ics',new Blob([event.join('\r\n')],{type:'text/calendar;charset=utf-8'}));
}
