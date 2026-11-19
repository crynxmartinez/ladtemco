function modalText(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function modalStats(rows) {
  return '<div class="modal-stats">'+rows.map(([label,value,tone])=>
    '<div class="modal-stat '+(tone || '')+'"><span>'+modalText(label)+'</span><strong>'+modalText(value)+'</strong></div>'
  ).join('')+'</div>';
}
function modalSplit(content, title, details) {
  return '<div class="modal-columns"><div>'+content+'</div><aside class="side-facts"><h3>'+modalText(title)+'</h3>'+details+'</aside></div>';
}
function modalAmount(label,value,status) {
  return '<div class="amount-banner"><div><small>'+modalText(label)+'</small><strong>'+modalText(value)+'</strong></div>'+status+'</div>';
}
