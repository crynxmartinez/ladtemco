const navLink=([id,label,symbol],page)=>`<a class="item" href="#${id}" ${page===id?'aria-current="page"':''}>${ico(symbol)}<span>${label}</span></a>`;
const pageId=()=>{const id=location.hash.slice(1);return Object.hasOwn(screens,id)?id:'dashboard';};
const leaveDemoHref=/^https?:$/.test(location.protocol) && location.pathname.startsWith('/member-demo') ? '/login' : '#welcome';
function updateBell(){
  const count=notices.filter(n=>!preferences.read.includes(n.id)).length;
  const button=document.getElementById('notify');
  button.setAttribute('aria-label',`Notifications, ${count} unread`);
  button.innerHTML=ico('Bell')+(count?`<span class="bell-count">${count}</span>`:'');
}
function render(){
  if(location.hash==='#welcome'){
    document.documentElement.dataset.theme=preferences.theme;
    document.title='Member demo · Ladtemco';
    const signIn=location.pathname==='/member-demo/index.html' && /^https?:$/.test(location.protocol)?'<a class="button" href="/login">Back to sign in</a>':'';
    document.getElementById('app').innerHTML='<main id="main" tabindex="-1" class="welcome"><section class="panel"><p class="kicker">LADTEMCO</p><h1>Member demo</h1><p class="meeting-info">Explore the cooperative from Maria S. Dela Cruz’s sample account.</p><div class="actions"><a class="button primary" href="#dashboard">Open member dashboard</a>'+signIn+'</div></section></main>';
    return;
  }
  const page=pageId(),menu=menus.find(m=>m[0]===page);
  document.documentElement.dataset.theme=preferences.theme;
  document.title=menu[1]+' · Ladtemco Member Portal';
  const side=['Membership','Cooperative','Account'].map(group=>`<section><h2>${group}</h2>${menus.filter(m=>m[3]===group).map(m=>navLink(m,page)).join('')}</section>`).join('');
  const bottom=[['dashboard','Home'],['contributions','Contributions'],['fund-transparency','Funds'],['documents','Documents']];
  const moreActive=!bottom.some(([id])=>id===page);
  document.getElementById('app').innerHTML=`<div class="shell">
    <aside class="nav"><a class="brand" href="#dashboard"><img src="__MEMBER_LOGO__" alt=""><div><b>LADTEMCO</b><span>Member portal</span></div></a>
    <nav aria-label="Member menus">${side}</nav><div class="account"><span class="avatar">MD</span><div><strong>${member.name}</strong><small>Member · ${member.id}</small></div></div><a class="leave" href="${leaveDemoHref}">Leave demo</a></aside>
    <div class="workspace"><header class="topbar"><div class="location"><span>Member portal</span>${ico('ChevronRight')}<b>${menu[1]}</b></div><div class="top-tools">${pill('Demo data','blue')}
    <button class="iconbutton" type="button" data-action="theme" aria-label="Switch to ${preferences.theme==='dark'?'light':'dark'} mode">${ico(preferences.theme==='dark'?'Sun':'Moon')}</button>
    <button class="iconbutton bell" id="notify" type="button" data-action="notifications"></button></div></header>
    <main class="main" id="main" tabindex="-1">${screens[page]()}</main></div></div>
    <nav class="phone-nav" aria-label="Mobile navigation">${bottom.map(([id,label])=>`<a href="#${id}" ${page===id?'aria-current="page"':''}>${ico(menus.find(m=>m[0]===id)[2])}<span>${label}</span></a>`).join('')}
    <button type="button" data-action="more" ${moreActive?'aria-label="More member menus, current section '+menu[1]+'"':''}>${ico('Menu')}<span>More</span></button></nav>`;
  updateBell();
}
function refreshRegister(){
  const key=pageId();if(!Object.hasOwn(registers,key))return;
  const count=visibleRows(key).length;
  document.getElementById('rows').innerHTML=tableRows(key);
  document.getElementById('no-results').hidden=count>0;
  document.getElementById('result-count').textContent=count+' '+(count===1?'record':'records');
}
document.addEventListener('input',e=>{if(e.target.id==='search'){searchText=e.target.value;refreshRegister();}});
document.addEventListener('change',e=>{if(e.target.id==='filter'){filterValue=e.target.value;refreshRegister();}});
window.addEventListener('hashchange',()=>{
  closeDialog();searchText='';filterValue='';render();window.scrollTo(0,0);document.getElementById('main').focus({preventScroll:true});
});
window.addEventListener('storage',e=>{
  if(e.key!==storeKey)return;
  if(!sessionOnly){preferences=readPreferences()||{...defaults};render();}
});
render();
