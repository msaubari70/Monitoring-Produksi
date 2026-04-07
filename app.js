'use strict';
const MONTHS_ID=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const state={currentPage:'dashboard',bloks:[],produksi:[],editingId:null};
const Storage={
  save(k,d){localStorage.setItem('sawitpro_'+k,JSON.stringify(d))},
  load(k,f=[]){try{const r=localStorage.getItem('sawitpro_'+k);return r?JSON.parse(r):f}catch{return f}}
};
function formatDate(d){return(d instanceof Date?d:new Date(d)).toISOString().split('T')[0]}
function formatDD(s){if(!s)return'-';const d=new Date(s+'T00:00:00');return d.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})}
function fNum(n){return Number(n).toLocaleString('id-ID')}
function fDT(s){const d=new Date(s);return d.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})+' '+d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}
function getB(id){return state.bloks.find(b=>b.id===id)}
function today(){return formatDate(new Date())}
function mRange(off=0){const n=new Date(),y=n.getFullYear(),m=n.getMonth()+off;return{start:formatDate(new Date(y,m,1)),end:formatDate(new Date(y,m+1,0))}}
function yRange(){const n=new Date();return{start:formatDate(new Date(n.getFullYear(),0,1)),end:formatDate(new Date(n.getFullYear(),11,31))}}
function uid(){return'P'+Date.now()+Math.random().toString(36).substr(2,4)}
function mk(){return MONTHS_ID[new Date().getMonth()]}
function getTarget(b){return b&&b.tp?b.tp[mk()]||0:0}
function getSPH(b){return b&&b.luas>0?b.jumlahPohon/b.luas:0}
function calcBJR(kg,jjg){return jjg>0?(kg/jjg).toFixed(2):'-'}
function calcAKP(jjg,luas,sph){return luas>0&&sph>0?((jjg/(luas*sph))*100).toFixed(1):'-'}

// ===== HARI LIBUR NASIONAL INDONESIA =====
const HOLIDAYS={
  '2025-01-01':true,'2025-01-27':true,'2025-01-29':true,
  '2025-02-12':true,'2025-03-14':true,'2025-03-28':true,'2025-03-29':true,
  '2025-03-30':true,'2025-03-31':true,'2025-04-01':true,
  '2025-04-18':true,'2025-05-01':true,'2025-05-12':true,
  '2025-05-29':true,'2025-06-01':true,'2025-06-06':true,'2025-06-07':true,
  '2025-06-27':true,'2025-07-27':true,'2025-08-17':true,
  '2025-09-05':true,'2025-09-22':true,'2025-12-25':true,'2025-12-26':true,
  // 2026
  '2026-01-01':true,'2026-01-19':true,'2026-02-01':true,'2026-03-19':true,
  '2026-03-20':true,'2026-03-21':true,'2026-03-22':true,'2026-03-23':true,
  '2026-04-03':true,'2026-05-01':true,'2026-05-14':true,'2026-05-16':true,
  '2026-05-27':true,'2026-06-01':true,'2026-06-17':true,'2026-08-17':true,
  '2026-08-27':true,'2026-12-25':true,
  // 2027
  '2027-01-01':true,'2027-02-06':true,'2027-02-20':true,'2027-03-09':true,
  '2027-03-10':true,'2027-03-11':true,'2027-03-26':true,'2027-05-01':true,
  '2027-05-06':true,'2027-05-16':true,'2027-05-17':true,'2027-06-01':true,
  '2027-06-07':true,'2027-08-16':true,'2027-08-17':true,'2027-12-25':true
};
function isHoliday(dateStr){return HOLIDAYS[dateStr]===true}
function isSunday(dateStr){return new Date(dateStr+'T00:00:00').getDay()===0}
function isWorkDay(dateStr){return !isSunday(dateStr)&&!isHoliday(dateStr)}
function getWorkDaysInMonth(year,month){
  const first=new Date(year,month,1),last=new Date(year,month+1,0);let c=0;
  for(let d=new Date(first);d<=last;d.setDate(d.getDate()+1)){if(isWorkDay(formatDate(d)))c++}
  return c;
}
function getWorkDaysUntilToday(year,month){
  const first=new Date(year,month,1),now=new Date(),last=new Date(year,month,now.getDate());let c=0;
  for(let d=new Date(first);d<=last;d.setDate(d.getDate()+1)){if(isWorkDay(formatDate(d)))c++}
  return c;
}

function init(){
  const VER='3.0';
  if(localStorage.getItem('sawitpro_ver')!==VER){localStorage.removeItem('sawitpro_bloks');localStorage.removeItem('sawitpro_produksi');localStorage.setItem('sawitpro_ver',VER)}
  state.bloks=Storage.load('bloks',[]);state.produksi=Storage.load('produksi',[]);
  const dT=()=>({Jan:80000,Feb:75000,Mar:85000,Apr:88000,Mei:90000,Jun:92000,Jul:95000,Agu:93000,Sep:90000,Okt:88000,Nov:85000,Des:82000});
  if(!state.bloks.length){
    state.bloks=[
      {id:'B1',nama:'Field A',luas:45.5,jumlahPohon:1200,tp:dT()},
      {id:'B2',nama:'Field B',luas:38,jumlahPohon:980,tp:{...dT(),Jan:70000,Feb:68000,Mar:72000,Apr:74000,Mei:76000,Jun:78000,Jul:80000,Agu:79000,Sep:77000,Okt:75000,Nov:72000,Des:70000}},
      {id:'B3',nama:'Field C',luas:52,jumlahPohon:1400,tp:{...dT(),Jan:95000,Feb:90000,Mar:100000,Apr:105000,Mei:108000,Jun:110000,Jul:115000,Agu:112000,Sep:108000,Okt:105000,Nov:100000,Des:96000}}
    ];Storage.save('bloks',state.bloks)
  } else {
    state.bloks=state.bloks.map(b=>{if(!b.tp){const t=b.targetBulanan||b.targetPerBulan||{};b.tp=typeof t==='number'?MONTHS_ID.reduce((o,m)=>{o[m]=t;return o},{}):t;delete b.targetBulanan;delete b.targetPerBulan;delete b.kode}return b});
    Storage.save('bloks',state.bloks)
  }
  if(!state.produksi.length){
    const ms=['Pak Aris','Pak Budi','Pak Catur'],tks=['SKU','SPK'],now=new Date();
    for(let i=30;i>=0;i--){const d=new Date(now);d.setDate(d.getDate()-i);const ds=formatDate(d);
      state.bloks.forEach(b=>{if(Math.random()>0.25){
        const jjg=Math.floor(Math.random()*80+80),kg=+(jjg*(Math.random()*5+18)).toFixed(1),lp=+(Math.random()*8+3).toFixed(2);
        state.produksi.push({id:uid(),tanggal:ds,blokId:b.id,beratTBS:kg,jumlahJanjang:jjg,luasPanen:lp,restanKg:+(Math.random()*300).toFixed(1),restanJjg:Math.floor(Math.random()*15),jenisTK:tks[Math.floor(Math.random()*2)],mandor:ms[Math.floor(Math.random()*3)],jumlahPemanen:Math.floor(Math.random()*8+6),catatan:'',createdAt:new Date(d).toISOString()})
      }})
    }
    Storage.save('produksi',state.produksi)
  }
  setupEvents();updateSidebarDate();startClock();
  navigate(location.hash.replace('#','')||'dashboard')
}
function updateSidebarDate(){const e=document.getElementById('sidebarDate');if(e)e.textContent=new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
function startClock(){const e=document.getElementById('topbarTime');function t(){if(e)e.textContent=new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}t();setInterval(t,1000)}
function navigate(p){
  const pages=['dashboard','input','master','laporan','entri','riwayat'];
  const titles={dashboard:'Dashboard',input:'Input Produksi',master:'Master Data',laporan:'Laporan',entri:'Entri Terbaru',riwayat:'Riwayat'};
  if(!pages.includes(p))p='dashboard';state.currentPage=p;
  pages.forEach(x=>{const n=document.getElementById('nav-'+x),s=document.getElementById('page-'+x);if(n)n.classList.toggle('active',x===p);if(s)s.classList.toggle('active',x===p)});
  document.querySelectorAll('.bottom-nav-item').forEach(el=>{if(el.dataset.page) el.classList.toggle('active',el.dataset.page===p)});
  document.getElementById('topbarTitle').textContent=titles[p]||p;location.hash=p;renderPage(p);closeSidebar()
}
function renderPage(p){
  if(p==='dashboard')renderDashboard();if(p==='input')renderInputPage();if(p==='master')renderMasterPage();
  if(p==='laporan')renderLaporanPage();if(p==='entri')renderEntriPage();if(p==='riwayat')renderRiwayatPage()
}
function openSidebar(){document.getElementById('sidebar').classList.add('open');document.getElementById('overlay').classList.add('active')}
function closeSidebar(){document.getElementById('sidebar').classList.remove('open');document.getElementById('overlay').classList.remove('active')}

function setupEvents(){
  document.getElementById('menuBtn').addEventListener('click',openSidebar);
  document.getElementById('sidebarClose').addEventListener('click',closeSidebar);
  document.getElementById('overlay').addEventListener('click',closeSidebar);
  document.querySelectorAll('.nav-item').forEach(l=>l.addEventListener('click',e=>{e.preventDefault();navigate(l.dataset.page)}));
  window.addEventListener('hashchange',()=>{const p=location.hash.replace('#','');if(p&&p!==state.currentPage)navigate(p)});
  document.getElementById('chartFilter').addEventListener('change',renderTrendChart);
  document.getElementById('modalClose').addEventListener('click',closeModal);
  document.getElementById('modalOverlay').addEventListener('click',e=>{if(e.target===document.getElementById('modalOverlay'))closeModal()});
  document.getElementById('filterPeriode').addEventListener('change',function(){const c=this.value==='custom';document.getElementById('customDateRange').style.display=c?'block':'none';document.getElementById('customDateRangeTo').style.display=c?'block':'none'});
  document.getElementById('filterBtn').addEventListener('click',renderLaporanTable);
  document.getElementById('printBtn').addEventListener('click',()=>window.print());
  document.getElementById('searchInput').addEventListener('input',function(){renderRiwayatTable(this.value.toLowerCase())});
  document.getElementById('entriSearchInput').addEventListener('input',function(){renderEntriTable(this.value.toLowerCase())});
  const rsf=document.getElementById('reportSearchFilter'); if(rsf) rsf.addEventListener('input',function(){if(state.currentPage==='dashboard') renderReportTable(getDashFilter())});
  const sa=document.getElementById('selectAllRiwayat');if(sa)sa.addEventListener('change',function(){document.querySelectorAll('.cb-riwayat').forEach(c=>c.checked=this.checked);checkRiwayatSel()});
  const bh=document.getElementById('btnHapusTerpilih');if(bh)bh.addEventListener('click',deleteSelectedRiwayat);
  document.getElementById('dashPeriode').addEventListener('change',function(){const c=this.value==='custom';document.getElementById('dashDateFrom').style.display=c?'block':'none';document.getElementById('dashDateTo').style.display=c?'block':'none'});
  document.getElementById('dashFilterBtn').addEventListener('click',renderDashboard);
  document.getElementById('dashPrintBtn').addEventListener('click',()=>window.print());
}

// ===== DASHBOARD =====
let chartTren=null,chartBlok=null,chartYTD=null,chartYPH=null;
function getDashFilter(){
  const p=document.getElementById('dashPeriode').value;let s,e;const yr=new Date().getFullYear();
  if(p==='mtd')({start:s,end:e}=mRange(0));else if(p==='ytd')({start:s,end:e}=yRange());
  else if(!isNaN(p)&&p!=='custom'){const m=parseInt(p);s=formatDate(new Date(yr,m,1));e=formatDate(new Date(yr,m+1,0))}
  else{s=document.getElementById('dashFrom').value;e=document.getElementById('dashTo').value}
  const bid=document.getElementById('dashBlokFilter').value;return{start:s,end:e,blokId:bid,periode:p}
}
function renderDashboard(){
  const sel=document.getElementById('dashBlokFilter'),cv=sel.value;
  sel.innerHTML='<option value="">Semua Field</option>';
  state.bloks.forEach(b=>{const o=document.createElement('option');o.value=b.id;o.textContent=b.nama;sel.appendChild(o)});if(cv)sel.value=cv;
  const f=getDashFilter();let data=state.produksi.filter(p=>p.tanggal>=f.start&&p.tanggal<=f.end);
  if(f.blokId)data=data.filter(p=>p.blokId===f.blokId);
  const todayD=state.produksi.filter(p=>p.tanggal===today()),todayTBS=todayD.reduce((s,p)=>s+p.beratTBS,0);
  const filtTBS=data.reduce((s,p)=>s+p.beratTBS,0),filtJjg=data.reduce((s,p)=>s+p.jumlahJanjang,0),filtLuas=data.reduce((s,p)=>s+(p.luasPanen||0),0);
  const totalFieldLuas=f.blokId?((getB(f.blokId)||{}).luas||0):state.bloks.reduce((s,b)=>s+b.luas,0);
  const cmk=new Date().getMonth();const getBTarget=(b,idx)=>b.tp?b.tp[MONTHS_ID[idx]]||0:0;
  const budgetBloks=f.blokId?[getB(f.blokId)].filter(Boolean):state.bloks;let periodBudget=0;
  if(f.periode==='ytd'){for(let i=0;i<=cmk;i++)budgetBloks.forEach(b=>{periodBudget+=getBTarget(b,i)})}
  else if(f.periode==='mtd'){budgetBloks.forEach(b=>{periodBudget+=getBTarget(b,cmk)})}
  else if(!isNaN(f.periode)&&f.periode!=='custom'){budgetBloks.forEach(b=>{periodBudget+=getBTarget(b,parseInt(f.periode))})}
  else{periodBudget=budgetBloks.reduce((s,b)=>s+getBTarget(b,cmk),0)}
  const pct=periodBudget>0?Math.round(filtTBS/periodBudget*100):0;
  document.getElementById('stat-today').textContent=fNum(todayTBS)+' kg';
  document.getElementById('stat-month').textContent=fNum(filtTBS)+' kg';
  document.getElementById('stat-blok').textContent=state.bloks.length;
  document.getElementById('stat-target').textContent=pct+'%';
  document.getElementById('stat-target-change').textContent=fNum(filtTBS)+' / '+fNum(periodBudget)+' kg';
  const yd=new Date();yd.setDate(yd.getDate()-1);const yds=formatDate(yd);
  const ydTBS=state.produksi.filter(p=>p.tanggal===yds).reduce((s,p)=>s+p.beratTBS,0);
  if(ydTBS>0){const d=todayTBS-ydTBS;document.getElementById('stat-today-change').textContent=(d>=0?'+':'')+fNum(d)+' kg vs kemarin';document.getElementById('stat-today-change').style.color=d>=0?'var(--green-light)':'#f87171'}
  const yphAktual=totalFieldLuas>0?(filtTBS/1000/totalFieldLuas).toFixed(3):'0';
  const yphBudget=totalFieldLuas>0?(periodBudget/1000/totalFieldLuas).toFixed(3):'0';
  const roundP=totalFieldLuas>0?(filtLuas/totalFieldLuas).toFixed(2):'0';
  document.getElementById('kpi-yph-aktual').textContent=yphAktual+' t/ha';
  document.getElementById('kpi-yph-budget-txt').textContent='Budget: '+yphBudget+' t/ha';
  document.getElementById('kpi-round').textContent=roundP+'x';
  document.getElementById('kpi-bjr').textContent=calcBJR(filtTBS,filtJjg)+' kg';
  document.getElementById('kpi-akp').textContent=(filtLuas>0&&filtJjg>0?calcAKP(filtJjg,filtLuas,totalFieldLuas>0?state.bloks.reduce((s,b)=>s+b.jumlahPohon,0)/totalFieldLuas:0):'-')+'%';
  const lbl=f.periode==='ytd'?'YTD':f.periode==='mtd'?'MTD':(!isNaN(f.periode)&&f.periode!=='custom')?MONTHS_ID[parseInt(f.periode)]+' '+new Date().getFullYear():'Custom';
  document.getElementById('reportPeriodeLabel').textContent=lbl;document.getElementById('chartBlokLabel').textContent=lbl;
  const now=new Date(),yB=now.getFullYear(),mB=now.getMonth();
  const wDaysM=getWorkDaysInMonth(yB,mB),wDaysTd=getWorkDaysUntilToday(yB,mB);
  const totalBudM=state.bloks.reduce((s,b)=>s+getBTarget(b,mB),0);
  const dailyBud=wDaysM>0?totalBudM/wDaysM:0;const budUpToTd=dailyBud*wDaysTd;
  const actMtdStart=formatDate(new Date(yB,mB,1));
  const allActMtdData=state.produksi.filter(p=>p.tanggal>=actMtdStart&&p.tanggal<=today());
  const allActMtdTBS=allActMtdData.reduce((s,p)=>s+p.beratTBS,0);
  const allTodayD=state.produksi.filter(p=>p.tanggal===today());
  const allTodayTBS=allTodayD.reduce((s,p)=>s+p.beratTBS,0);
  const allYdTBS=state.produksi.filter(p=>p.tanggal===yds).reduce((s,p)=>s+p.beratTBS,0);
  const varMtd=allActMtdTBS-budUpToTd;
  const actYtdStart=formatDate(new Date(yB,0,1));
  const actYtdData=state.produksi.filter(p=>p.tanggal>=actYtdStart&&p.tanggal<=today());
  const actYtdTBS=actYtdData.reduce((s,p)=>s+p.beratTBS,0);
  let budYtd=0;for(let i=0;i<=mB;i++){budYtd+=state.bloks.reduce((s,b)=>s+getBTarget(b,i),0)}
  document.getElementById('dbWorkDaysLabel').textContent=wDaysM+' HRK';
  document.getElementById('dbMonthLabel').textContent=MONTHS_ID[mB]+' '+yB;
  document.getElementById('db-budget-daily').textContent=fNum(Math.round(dailyBud))+' kg';
  document.getElementById('db-budget-formula').textContent=`${fNum(totalBudM)} / ${wDaysM} hr`;
  document.getElementById('db-aktual-today').textContent=fNum(allTodayTBS)+' kg';
  const diffToday=allTodayTBS-dailyBud;const todayVsEl=document.getElementById('db-today-vs');
  todayVsEl.textContent=(diffToday>=0?'+':'')+fNum(Math.round(diffToday))+' vs Target';
  todayVsEl.style.color=diffToday>=0?'var(--green-light)':'#f87171';
  document.getElementById('db-aktual-yesterday').textContent=fNum(allYdTBS||0)+' kg';
  const diffYd=(allYdTBS||0)-dailyBud;const ydVsEl=document.getElementById('db-yesterday-vs');
  ydVsEl.textContent=(diffYd>=0?'+':'')+fNum(Math.round(diffYd))+' vs Target';
  ydVsEl.style.color=diffYd>=0?'var(--green-light)':'#f87171';
  document.getElementById('db-varian-mtd').textContent=(varMtd>=0?'+':'')+fNum(Math.round(varMtd))+' kg';
  document.getElementById('db-varian-mtd').style.color=varMtd>=0?'var(--green-light)':'#f87171';
  document.getElementById('db-aktual-ytd').textContent=fNum(actYtdTBS)+' kg';
  const varYTD=actYtdTBS-budYtd;
  document.getElementById('db-ytd-vs').textContent=(varYTD>=0?'+':'')+fNum(Math.round(varYTD))+' vs Budget';
  document.getElementById('db-ytd-vs').style.color=varYTD>=0?'var(--green-light)':'#f87171';
  document.getElementById('db-budget-ytd').textContent=fNum(budYtd)+' kg';
  const pctYTD=budYtd>0?Math.round(actYtdTBS/budYtd*100):0;
  document.getElementById('db-ytd-pct').textContent=pctYTD+'% dari Target';
  document.getElementById('db-ytd-pct').style.color=pctYTD>=100?'var(--green-light)':'var(--gold-light)';
  const pctMtd=budUpToTd>0?Math.round(allActMtdTBS/budUpToTd*100):0;
  document.getElementById('db-mtd-pct').textContent=pctMtd+'%';
  document.getElementById('db-mtd-pct').style.color=pctMtd>=100?'var(--green-light)':'var(--gold-light)';
  document.getElementById('db-mtd-fill').style.width=Math.min(pctMtd,100)+'%';
  document.getElementById('db-mtd-fill').style.background=pctMtd>=100?'var(--green-mid)':'var(--gold-mid)';
  document.getElementById('db-mtd-aktual-label').textContent='Aktual s/d: '+fNum(allActMtdTBS)+' kg';
  document.getElementById('db-mtd-budget-label').textContent='Budget s/d: '+fNum(Math.round(budUpToTd))+' kg';
  renderTrendChart();renderBlokChart(f);renderReportTable(f);renderYTDChart();renderYPHChart(f)
}
function renderTrendChart(){
  const days=parseInt(document.getElementById('chartFilter').value)||7;const labels=[],d=[];const n=new Date();
  for(let i=days-1;i>=0;i--){const x=new Date(n);x.setDate(x.getDate()-i);const ds=formatDate(x);
    d.push(state.produksi.filter(p=>p.tanggal===ds).reduce((s,p)=>s+p.beratTBS,0));
    labels.push(x.toLocaleDateString('id-ID',{day:'2-digit',month:'short'}))}
  const ctx=document.getElementById('chartTren').getContext('2d');if(chartTren)chartTren.destroy();
  chartTren=new Chart(ctx,{type:'line',data:{labels,datasets:[{label:'Produksi (kg)',data:d,borderColor:'#10b981',backgroundColor:'rgba(16,185,129,0.1)',borderWidth:2.5,fill:true,tension:0.4,pointBackgroundColor:'#10b981',pointBorderColor:'#0a0f1a',pointBorderWidth:2,pointRadius:4,pointHoverRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#64748b',font:{size:11}}},y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#64748b',font:{size:11},callback:v=>fNum(v)},beginAtZero:true}}}})
}
function renderBlokChart(f){
  const labels=state.bloks.map(b=>b.nama);
  const d=state.bloks.map(b=>state.produksi.filter(p=>p.blokId===b.id&&p.tanggal>=f.start&&p.tanggal<=f.end).reduce((s,p)=>s+p.beratTBS,0));
  const ctx=document.getElementById('chartBlok').getContext('2d');if(chartBlok)chartBlok.destroy();
  const c=['#10b981','#f59e0b','#3b82f6','#8b5cf6','#ef4444','#06b6d4'];
  chartBlok=new Chart(ctx,{type:'doughnut',data:{labels,datasets:[{data:d,backgroundColor:c.slice(0,labels.length).map(x=>x+'99'),borderColor:c.slice(0,labels.length),borderWidth:2,hoverOffset:8}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#94a3b8',font:{size:11},padding:12,boxWidth:12}}},cutout:'60%'}})
}
function renderReportTable(f){
  const tbody=document.getElementById('reportTbody'),tfoot=document.getElementById('reportTfoot');
  const searchText=document.getElementById('reportSearchFilter')?document.getElementById('reportSearchFilter').value.toLowerCase().trim():'';
  let bloks=f.blokId?[getB(f.blokId)].filter(Boolean):state.bloks;
  if(searchText)bloks=bloks.filter(b=>b.nama.toLowerCase().includes(searchText));

  const cmk=new Date().getMonth();const getBTarget=(b,idx)=>b.tp?b.tp[MONTHS_ID[idx]]||0:0;
  let tProd=0,tBud=0,tLuas=0,tLP=0,tJjg=0,tProdY=0,tBudY=0;const yB=new Date().getFullYear();const actYStart=formatDate(new Date(yB,0,1));

  const rows=bloks.map(b=>{
    const bd=state.produksi.filter(p=>p.blokId===b.id&&p.tanggal>=f.start&&p.tanggal<=f.end);
    const prod=bd.reduce((s,p)=>s+p.beratTBS,0),jjg=bd.reduce((s,p)=>s+p.jumlahJanjang,0),lp=bd.reduce((s,p)=>s+(p.luasPanen||0),0);
    
    let bud=0;
    if(f.periode==='ytd'){for(let i=0;i<=cmk;i++)bud+=getBTarget(b,i)}else if(f.periode==='mtd'){bud=getBTarget(b,cmk)}else if(!isNaN(f.periode)&&f.periode!=='custom'){bud=getBTarget(b,parseInt(f.periode))}else{bud=getBTarget(b,cmk)}
    
    const bdY=state.produksi.filter(p=>p.blokId===b.id&&p.tanggal>=actYStart&&p.tanggal<=today());
    const prodY=bdY.reduce((s,p)=>s+p.beratTBS,0);let budY=0;for(let i=0;i<=cmk;i++)budY+=getBTarget(b,i);

    const pct=bud>0?Math.round(prod/bud*100):0,pctY=budY>0?Math.round(prodY/budY*100):0;
    const yA=b.luas>0?(prod/1000/b.luas).toFixed(3):'-',yBv=b.luas>0?(bud/1000/b.luas).toFixed(3):'-';
    const rp=b.luas>0?(lp/b.luas).toFixed(2):'-',bjr=calcBJR(prod,jjg),sph=getSPH(b),akp=lp>0&&sph>0?calcAKP(jjg,lp,sph):'-';
    tProd+=prod;tBud+=bud;tLuas+=b.luas;tLP+=lp;tJjg+=jjg;tProdY+=prodY;tBudY+=budY;
    
    return `<tr><td><strong>${b.nama}</strong></td><td class="text-center">${b.luas}</td><td class="text-center">${fNum(prod)}</td><td class="text-center">${fNum(bud)}</td><td class="text-center"><span class="badge ${pct>=100?'badge-green':'badge-gold'}">${pct}%</span></td><td class="text-center">${fNum(prodY)}</td><td class="text-center">${fNum(budY)}</td><td class="text-center"><span class="badge ${pctY>=100?'badge-green':'badge-gold'}">${pctY}%</span></td><td class="text-center">${yA}</td><td class="text-center">${yBv}</td><td class="text-center">${rp}</td><td class="text-center">${bjr}</td><td class="text-center">${akp}</td></tr>`
  });
  tbody.innerHTML=rows.length?rows.join(''):'<tr><td colspan="13" class="empty-row">Tidak ada data</td></tr>';
  const tPct=tBud>0?Math.round(tProd/tBud*100):0,tPctY=tBudY>0?Math.round(tProdY/tBudY*100):0;
  tfoot.innerHTML=`<tr><td><strong>TOTAL</strong></td><td class="text-center">${tLuas.toFixed(1)}</td><td class="text-center"><strong>${fNum(tProd)}</strong></td><td class="text-center">${fNum(tBud)}</td><td class="text-center"><span class="badge ${tPct>=100?'badge-green':'badge-gold'}">${tPct}%</span></td><td class="text-center"><strong>${fNum(tProdY)}</strong></td><td class="text-center">${fNum(tBudY)}</td><td class="text-center"><span class="badge ${tPctY>=100?'badge-green':'badge-gold'}">${tPctY}%</span></td><td class="text-center">${tLuas>0?(tProd/1000/tLuas).toFixed(3):'-'}</td><td class="text-center">${tLuas>0?(tBud/1000/tLuas).toFixed(3):'-'}</td><td class="text-center">${tLuas>0?(tLP/tLuas).toFixed(2):'-'}</td><td class="text-center">${calcBJR(tProd,tJjg)}</td><td class="text-center">${tLP>0?calcAKP(tJjg,tLP,tLuas>0?state.bloks.reduce((s,x)=>s+x.jumlahPohon,0)/tLuas:0):'-'}</td></tr>`
}
function renderYTDChart(){
  const labels=[],aktual=[],budget=[];const yr=new Date().getFullYear(),cm=new Date().getMonth();
  for(let i=0;i<=cm;i++){
    labels.push(MONTHS_ID[i]);
    const s=formatDate(new Date(yr,i,1)),e=formatDate(new Date(yr,i+1,0));
    aktual.push(state.produksi.filter(p=>p.tanggal>=s&&p.tanggal<=e).reduce((s,p)=>s+p.beratTBS,0));
    budget.push(state.bloks.reduce((s,b)=>s+(b.tp?b.tp[MONTHS_ID[i]]||0:0),0))
  }
  const ctx=document.getElementById('chartYTD').getContext('2d');if(chartYTD)chartYTD.destroy();
  chartYTD=new Chart(ctx,{type:'bar',data:{labels,datasets:[{label:'Aktual (kg)',data:aktual,backgroundColor:'rgba(16,185,129,0.7)',borderRadius:6},{label:'Budget (kg)',data:budget,backgroundColor:'rgba(245,158,11,0.5)',borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#94a3b8'}}},scales:{x:{grid:{display:false},ticks:{color:'#64748b'}},y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#64748b',callback:v=>fNum(v)}}}}})
}
function renderYPHChart(f){
  const labels=state.bloks.map(b=>b.nama);
  const aktual=state.bloks.map(b=>{const d=state.produksi.filter(p=>p.blokId===b.id&&p.tanggal>=f.start&&p.tanggal<=f.end).reduce((s,p)=>s+p.beratTBS,0);return b.luas>0?+(d/1000/b.luas).toFixed(3):0});
  const cmk=new Date().getMonth();
  const bud=state.bloks.map(b=>{let bg=0;if(f.periode==='ytd'){for(let i=0;i<=cmk;i++)bg+=(b.tp?b.tp[MONTHS_ID[i]]||0:0)}else if(f.periode==='mtd'){bg=(b.tp?b.tp[MONTHS_ID[cmk]]||0:0)}else if(!isNaN(f.periode)&&f.periode!=='custom'){bg=(b.tp?b.tp[MONTHS_ID[parseInt(f.periode)]]||0:0)}else{bg=(b.tp?b.tp[MONTHS_ID[cmk]]||0:0)}
    return b.luas>0?+(bg/1000/b.luas).toFixed(3):0});
  
  const tProd=state.produksi.filter(p=>p.tanggal>=f.start&&p.tanggal<=f.end).reduce((s,p)=>s+p.beratTBS,0);
  const tLuas=state.bloks.reduce((s,b)=>s+b.luas,0);
  const totalYph=tLuas>0?(tProd/1000/tLuas).toFixed(3):'0';
  if(document.getElementById('chartYPHTotal')) document.getElementById('chartYPHTotal').textContent='Total Yield: '+totalYph+' t/ha';

  const ctx=document.getElementById('chartYPH').getContext('2d');if(chartYPH)chartYPH.destroy();
  chartYPH=new Chart(ctx,{type:'bar',data:{labels,datasets:[{label:'YPH Aktual',data:aktual,backgroundColor:'rgba(16,185,129,0.7)',borderRadius:6},{label:'YPH Budget',data:bud,backgroundColor:'rgba(245,158,11,0.5)',borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{labels:{color:'#94a3b8'}}},scales:{x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#64748b'}},y:{grid:{display:false},ticks:{color:'#64748b'}}}}})
}
// ===== INPUT PAGE =====
function renderInputPage(){
  populateBlokSelect('inputBlok');document.getElementById('inputTanggal').value=today();updateHintDay();updateTodayStats();
  document.getElementById('inputBlok').addEventListener('change',updateBlokInfo);
  document.getElementById('previewBtn').addEventListener('click',showPreview);
  document.getElementById('resetFormBtn').addEventListener('click',resetForm);
  document.getElementById('inputTanggal').addEventListener('change',updateHintDay);
  ['inputBerat','inputJanjang','inputLuasPanen','inputRestanKg','inputRestanJjg'].forEach(id=>document.getElementById(id).addEventListener('input',calcLiveFields));
  document.getElementById('inputBlok').addEventListener('change',calcLiveFields);
  document.querySelectorAll('input[name="jenisTK"]').forEach(r=>r.addEventListener('change',()=>{document.querySelectorAll('.tk-radio-option').forEach(e=>e.classList.remove('selected'));r.closest('.tk-radio-option').classList.add('selected')}));
  const f=document.getElementById('produksiForm');f.removeEventListener('submit',handleSubmit);f.addEventListener('submit',handleSubmit)
}
function updateHintDay(){const v=document.getElementById('inputTanggal').value;if(v){const d=new Date(v+'T00:00:00');document.getElementById('hintHariTanggal').textContent=d.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}}
function calcLiveFields(){
  const kg=parseFloat(document.getElementById('inputBerat').value)||0;
  const jjg=parseInt(document.getElementById('inputJanjang').value)||0;
  const lp=parseFloat(document.getElementById('inputLuasPanen').value)||0;
  const rkg=parseFloat(document.getElementById('inputRestanKg').value)||0;
  const rjjg=parseInt(document.getElementById('inputRestanJjg').value)||0;
  document.getElementById('displayBJR').textContent=calcBJR(kg,jjg)+' kg/jjg';
  document.getElementById('displayBJRRestan').textContent=calcBJR(rkg,rjjg)+' kg/jjg';
  const blok=getB(document.getElementById('inputBlok').value);
  const sph=blok?getSPH(blok):0;
  document.getElementById('displayAKP').textContent=calcAKP(jjg,lp,sph)+' %'
}
function populateBlokSelect(sid){const s=document.getElementById(sid),c=s.value;s.innerHTML='<option value="">- Pilih Field -</option>';state.bloks.forEach(b=>{const o=document.createElement('option');o.value=b.id;o.textContent=b.nama;s.appendChild(o)});if(c)s.value=c}
function updateBlokInfo(){
  const bid=document.getElementById('inputBlok').value,el=document.getElementById('blokInfo');
  if(!bid){el.innerHTML='<p class="empty-info">Pilih field untuk melihat informasi</p>';return}
  const b=getB(bid);if(!b)return;
  const{start:s,end:e}=mRange(0);const mTBS=state.produksi.filter(p=>p.blokId===bid&&p.tanggal>=s&&p.tanggal<=e).reduce((s,p)=>s+p.beratTBS,0);
  const mLP=state.produksi.filter(p=>p.blokId===bid&&p.tanggal>=s&&p.tanggal<=e).reduce((s,p)=>s+(p.luasPanen||0),0);
  const t=getTarget(b),sph=getSPH(b).toFixed(1),pct=t>0?Math.round(mTBS/t*100):0;
  const round=b.luas>0?(mLP/b.luas).toFixed(2):'-';
  el.innerHTML=`
    <div class="blok-info-item"><span class="blok-info-key">Nama Field</span><span class="blok-info-val">${b.nama}</span></div>
    <div class="blok-info-item"><span class="blok-info-key">Luas</span><span class="blok-info-val">${b.luas} Ha</span></div>
    <div class="blok-info-item"><span class="blok-info-key">Jml Pohon</span><span class="blok-info-val">${fNum(b.jumlahPohon)}</span></div>
    <div class="blok-info-item"><span class="blok-info-key">SPH</span><span class="blok-info-val">${sph} phon/Ha</span></div>
    <div class="blok-info-item"><span class="blok-info-key">Target Bulan Ini</span><span class="blok-info-val">${fNum(t)} kg</span></div>
    <div class="blok-info-item"><span class="blok-info-key">Realisasi</span><span class="blok-info-val">${fNum(mTBS)} kg</span></div>
    <div class="blok-info-item"><span class="blok-info-key">Round Panen</span><span class="blok-info-val">${round}x</span></div>
    <div style="margin-top:8px"><div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:4px"><span>Pencapaian</span><span style="color:${pct>=100?'var(--green-light)':'var(--gold-light)'}">${pct}%</span></div><div class="progress-bar"><div class="progress-fill" style="width:${Math.min(pct,100)}%"></div></div></div>`;
  calcLiveFields()
}
function updateTodayStats(){
  const td=state.produksi.filter(p=>p.tanggal===today());
  document.getElementById('tstat-entri').textContent=td.length;
  const tbs=td.reduce((s,p)=>s+p.beratTBS,0),jjg=td.reduce((s,p)=>s+p.jumlahJanjang,0),lp=td.reduce((s,p)=>s+(p.luasPanen||0),0);
  document.getElementById('tstat-tbs').textContent=fNum(tbs)+' kg';
  document.getElementById('tstat-janjang').textContent=fNum(jjg)+' jjg';
  document.getElementById('tstat-luas').textContent=lp.toFixed(2)+' Ha';
  document.getElementById('tstat-bjr').textContent=calcBJR(tbs,jjg)+' kg'
}
function showPreview(){
  const tgl=document.getElementById('inputTanggal').value,bid=document.getElementById('inputBlok').value;
  const kg=parseFloat(document.getElementById('inputBerat').value),jjg=parseInt(document.getElementById('inputJanjang').value);
  const lp=parseFloat(document.getElementById('inputLuasPanen').value)||0;
  const rkg=parseFloat(document.getElementById('inputRestanKg').value)||0,rjjg=parseInt(document.getElementById('inputRestanJjg').value)||0;
  const tkEl=document.querySelector('input[name="jenisTK"]:checked'),tk=tkEl?tkEl.value:'-';
  const mandor=document.getElementById('inputMandor').value,b=getB(bid),bjr=calcBJR(kg,jjg);
  const sph=b?getSPH(b):0,akp=calcAKP(jjg,lp,sph);
  const pv=document.getElementById('previewCard'),g=document.getElementById('previewGrid');
  if(!tgl&&!bid&&!kg){toast('Isi form terlebih dahulu','warning');return}
  g.innerHTML=`<div class="preview-item"><span class="preview-key">Tanggal</span><span class="preview-val">${tgl?formatDD(tgl):'-'}</span></div><div class="preview-item"><span class="preview-key">Field</span><span class="preview-val">${b?b.nama:'-'}</span></div><div class="preview-item"><span class="preview-key">Produksi</span><span class="preview-val">${kg?fNum(kg)+' kg':'-'}</span></div><div class="preview-item"><span class="preview-key">Janjang</span><span class="preview-val">${jjg?fNum(jjg)+' jjg':'-'}</span></div><div class="preview-item"><span class="preview-key">BJR</span><span class="preview-val">${bjr} kg/jjg</span></div><div class="preview-item"><span class="preview-key">Luas Panen</span><span class="preview-val">${lp} Ha</span></div><div class="preview-item"><span class="preview-key">AKP</span><span class="preview-val">${akp}%</span></div><div class="preview-item"><span class="preview-key">Restan</span><span class="preview-val">${fNum(rkg)} kg / ${rjjg} jjg</span></div><div class="preview-item"><span class="preview-key">BJR Restan</span><span class="preview-val">${calcBJR(rkg,rjjg)} kg/jjg</span></div><div class="preview-item"><span class="preview-key">Jenis TK</span><span class="preview-val">${tk}</span></div><div class="preview-item"><span class="preview-key">Mandor</span><span class="preview-val">${mandor||'-'}</span></div>`;
  pv.style.display='block'
}
function handleSubmit(e){
  e.preventDefault();
  const tgl=document.getElementById('inputTanggal').value,bid=document.getElementById('inputBlok').value;
  const kg=parseFloat(document.getElementById('inputBerat').value),jjg=parseInt(document.getElementById('inputJanjang').value);
  const lp=parseFloat(document.getElementById('inputLuasPanen').value)||0;
  const rkg=parseFloat(document.getElementById('inputRestanKg').value)||0,rjjg=parseInt(document.getElementById('inputRestanJjg').value)||0;
  const tkEl=document.querySelector('input[name="jenisTK"]:checked'),tk=tkEl?tkEl.value:'';
  const mandor=document.getElementById('inputMandor').value.trim(),pem=parseInt(document.getElementById('inputPemanen').value)||0,cat=document.getElementById('inputCatatan').value.trim();
  if(!tgl||!bid||isNaN(kg)||kg<=0||isNaN(jjg)||jjg<=0||!tk||!mandor||lp<=0){
    toast('Harap isi semua field wajib (*)','error');return
  }
  if(state.editingId){
    const i=state.produksi.findIndex(p=>p.id===state.editingId);
    if(i!==-1){state.produksi[i]={...state.produksi[i],tanggal:tgl,blokId:bid,beratTBS:kg,jumlahJanjang:jjg,luasPanen:lp,restanKg:rkg,restanJjg:rjjg,jenisTK:tk,mandor,jumlahPemanen:pem,catatan:cat};Storage.save('produksi',state.produksi);toast('Data diperbarui! ✏“','success');state.editingId=null;document.getElementById('submitBtn').querySelector('.btn-text').textContent='💾 Simpan Data'}
  }else{
    state.produksi.push({id:uid(),tanggal:tgl,blokId:bid,beratTBS:kg,jumlahJanjang:jjg,luasPanen:lp,restanKg:rkg,restanJjg:rjjg,jenisTK:tk,mandor,jumlahPemanen:pem,catatan:cat,createdAt:new Date().toISOString()});
    Storage.save('produksi',state.produksi);toast('Data tersimpan! ✏“','success')
  }
  resetForm();updateTodayStats()
}
function resetForm(){document.getElementById('produksiForm').reset();document.getElementById('inputTanggal').value=today();document.getElementById('previewCard').style.display='none';document.getElementById('blokInfo').innerHTML='<p class="empty-info">Pilih field</p>';document.getElementById('inputJenisTK').style.outline='';document.querySelectorAll('.tk-radio-option').forEach(e=>e.classList.remove('selected'));document.getElementById('displayBJR').textContent='- kg/jjg';document.getElementById('displayBJRRestan').textContent='- kg/jjg';document.getElementById('displayAKP').textContent='- %';state.editingId=null;document.getElementById('submitBtn').querySelector('.btn-text').textContent='💾 Simpan Data';updateHintDay()}

function renderMasterPage(){renderMasterTable();document.getElementById('addBlokBtn').onclick=()=>openBlokModal(null);setupCSVImport()}
function renderMasterTable(){
  const tb=document.getElementById('masterTbody');if(!state.bloks.length){tb.innerHTML='<tr><td colspan="6" class="empty-row">Belum ada data field.</td></tr>';return}
  const m=mk();
  tb.innerHTML=state.bloks.map(b=>{const sph=b.luas>0?(b.jumlahPohon/b.luas).toFixed(1):'-';const t=(b.tp&&b.tp[m])||0;
    return`<tr><td><strong>${b.nama}</strong></td><td>${b.luas} Ha</td><td>${fNum(b.jumlahPohon)}</td><td><span class="badge badge-green">${sph}</span></td><td>${fNum(t)} kg</td><td><div class="action-btns"><button class="btn-edit" onclick="openBlokModal('${b.id}')">✏Edit</button><button class="btn-delete" onclick="deleteBlok('${b.id}')">🗑</button></div></td></tr>`}).join('')
}
function openBlokModal(id){
  const b=id?getB(id):null;const tp=b?b.tp:{};const sphV=b&&b.luas>0?(b.jumlahPohon/b.luas).toFixed(1):'-';
  document.getElementById('modalTitle').textContent=b?'Edit Field':'Tambah Field Baru';
  const mg=MONTHS_ID.map(m=>`<div class="form-group"><label class="form-label">${m}</label><div class="input-with-icon"><input type="number" id="mT_${m}" class="form-control" value="${tp[m]||''}" placeholder="0" min="0"/><span class="input-suffix" style="font-size:10px">kg</span></div></div>`).join('');
  document.getElementById('modalBody').innerHTML=`<div class="form-grid" style="grid-template-columns:1fr 1fr;margin-bottom:8px"><div class="form-group"><label class="form-label">Nama Field *</label><input type="text" id="mNama" class="form-control" value="${b?b.nama:''}" placeholder="Field A"/></div><div class="form-group"><label class="form-label">Luas (Ha) *</label><input type="number" id="mLuas" class="form-control" value="${b?b.luas:''}" placeholder="45.5" min="0" step="0.01" oninput="updSPH()"/></div><div class="form-group"><label class="form-label">Jumlah Pohon *</label><input type="number" id="mPohon" class="form-control" value="${b?b.jumlahPohon:''}" placeholder="1200" min="0" oninput="updSPH()"/></div><div class="form-group"><label class="form-label">SPH (otomatis)</label><div class="form-control" id="sphP" style="background:var(--bg-primary);color:var(--green-light);font-weight:700">${sphV} pohon/Ha</div></div></div><div style="margin-bottom:12px;padding:12px;background:var(--bg-input);border-radius:var(--radius-sm);border:1px solid var(--border)"><div style="font-size:13px;font-weight:700;color:var(--text-secondary);margin-bottom:12px">🎯 Target per Bulan (kg)</div><div class="form-grid" style="grid-template-columns:repeat(3,1fr);gap:10px">${mg}</div></div>`;
  document.getElementById('modalFooter').innerHTML=`<button class="btn btn-outline" onclick="closeModal()">Batal</button><button class="btn btn-primary" onclick="saveBlok('${id||''}')">💾 Simpan</button>`;
  document.getElementById('modal').classList.add('modal-wide');openModal()
}
function updSPH(){const l=parseFloat(document.getElementById('mLuas')?.value)||0,p=parseInt(document.getElementById('mPohon')?.value)||0;const e=document.getElementById('sphP');if(e)e.textContent=(l>0?(p/l).toFixed(1):'-')+' pohon/Ha'}
function saveBlok(id){
  const n=document.getElementById('mNama').value.trim(),l=parseFloat(document.getElementById('mLuas').value),p=parseInt(document.getElementById('mPohon').value);
  if(!n||isNaN(l)||isNaN(p)){toast('Isi nama, luas, pohon','error');return}
  const tp={};MONTHS_ID.forEach(m=>{tp[m]=parseInt(document.getElementById('mT_'+m)?.value)||0});
  if(id){const i=state.bloks.findIndex(b=>b.id===id);if(i!==-1)state.bloks[i]={...state.bloks[i],nama:n,luas:l,jumlahPohon:p,tp};toast('Field diperbarui','success')}
  else{state.bloks.push({id:'B'+Date.now(),nama:n,luas:l,jumlahPohon:p,tp});toast('Field ditambahkan','success')}
  Storage.save('bloks',state.bloks);closeModal();renderMasterTable()
}
function deleteBlok(id){const b=getB(id);if(!b)return;showConfirmModal('Hapus Field',`Hapus <strong>${b.nama}</strong>?`,()=>{state.bloks=state.bloks.filter(x=>x.id!==id);Storage.save('bloks',state.bloks);renderMasterTable();toast('Field dihapus','success');closeModal()})}

// ===== CSV IMPORT =====
let csvParsedData = [];

function setupCSVImport() {
  const uploadArea = document.getElementById('csvUploadArea');
  const fileInput = document.getElementById('csvFileInput');
  const guideBtn = document.getElementById('csvToggleGuideBtn');
  const templateBtn = document.getElementById('csvTemplateBtn');
  const removeBtn = document.getElementById('csvRemoveBtn');
  const cancelBtn = document.getElementById('csvCancelBtn');
  const importBtn = document.getElementById('csvImportBtn');

  uploadArea.onclick = () => fileInput.click();
  fileInput.onchange = (e) => { if (e.target.files[0]) handleCSVFile(e.target.files[0]); };

  uploadArea.ondragover = (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); };
  uploadArea.ondragleave = () => uploadArea.classList.remove('dragover');
  uploadArea.ondrop = (e) => {
    e.preventDefault(); uploadArea.classList.remove('dragover');
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.csv') || f.name.endsWith('.txt'))) handleCSVFile(f);
    else toast('Hanya file .csv atau .txt yang diterima', 'error');
  };

  guideBtn.onclick = () => {
    const g = document.getElementById('csvGuide');
    g.style.display = g.style.display === 'none' ? 'block' : 'none';
    guideBtn.textContent = g.style.display === 'none' ? 'â“ Panduan' : '✏• Tutup Panduan';
  };

  templateBtn.onclick = downloadCSVTemplate;
  removeBtn.onclick = resetCSVImport;
  cancelBtn.onclick = resetCSVImport;
  importBtn.onclick = executeCSVImport;
}

function downloadCSVTemplate() {
  const header = 'nama,luas,pohon,' + MONTHS_ID.join(',');
  const row1 = 'Field D,40.5,1100,80000,75000,85000,88000,90000,92000,95000,93000,90000,88000,85000,82000';
  const row2 = 'Field E,55,1500,95000,90000,100000,105000,108000,110000,115000,112000,108000,105000,100000,96000';
  const csv = header + '\n' + row1 + '\n' + row2 + '\n';
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'template_master_data.csv';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('Template CSV berhasil didownload', 'success');
}

function handleCSVFile(file) {
  document.getElementById('csvFileName').textContent = file.name;
  document.getElementById('csvFileSize').textContent = formatFileSize(file.size);
  document.getElementById('csvFileInfo').style.display = 'block';
  document.getElementById('csvUploadArea').style.display = 'none';

  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    parseCSV(text);
  };
  reader.readAsText(file, 'UTF-8');
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) {
    toast('CSV harus memiliki minimal header + 1 baris data', 'error');
    resetCSVImport();
    return;
  }

  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  const namaIdx = headers.findIndex(h => h === 'nama' || h === 'name' || h === 'field');
  const luasIdx = headers.findIndex(h => h === 'luas' || h === 'area' || h === 'ha');
  const pohonIdx = headers.findIndex(h => h === 'pohon' || h === 'tree' || h === 'jumlah_pohon' || h === 'jumlahpohon');

  if (namaIdx === -1 || luasIdx === -1 || pohonIdx === -1) {
    toast('CSV harus memiliki kolom: nama, luas, pohon', 'error');
    resetCSVImport();
    return;
  }

  const monthIdx = {};
  MONTHS_ID.forEach(m => {
    const idx = headers.findIndex(h => h === m.toLowerCase());
    if (idx !== -1) monthIdx[m] = idx;
  });

  csvParsedData = [];
  let errorCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 3) continue;

    const nama = (cols[namaIdx] || '').trim();
    const luas = parseFloat(cols[luasIdx]);
    const pohon = parseInt(cols[pohonIdx]);
    const valid = nama && !isNaN(luas) && luas > 0 && !isNaN(pohon) && pohon > 0;

    const tp = {};
    MONTHS_ID.forEach(m => {
      if (monthIdx[m] !== undefined && cols[monthIdx[m]]) {
        tp[m] = parseInt(cols[monthIdx[m]]) || 0;
      } else {
        tp[m] = 0;
      }
    });

    if (!valid) errorCount++;

    csvParsedData.push({
      nama, luas: isNaN(luas) ? 0 : luas, jumlahPohon: isNaN(pohon) ? 0 : pohon,
      tp, valid, raw: cols
    });
  }

  renderCSVPreview(headers, errorCount);
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else current += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',' || ch === ';') { result.push(current); current = ''; }
      else current += ch;
    }
  }
  result.push(current);
  return result;
}

function renderCSVPreview(headers, errorCount) {
  const wrapper = document.getElementById('csvPreviewWrapper');
  const thead = document.getElementById('csvPreviewThead');
  const tbody = document.getElementById('csvPreviewTbody');
  const status = document.getElementById('csvPreviewStatus');
  const countEl = document.getElementById('csvRowCount');
  const importCountEl = document.getElementById('csvImportCount');

  const validCount = csvParsedData.filter(r => r.valid).length;

  countEl.textContent = csvParsedData.length;
  importCountEl.textContent = validCount;

  if (errorCount > 0) {
    status.innerHTML = `<span class="csv-status-error">⚠️${errorCount} baris error</span><span class="csv-status-ok">✏“ ${validCount} valid</span>`;
  } else {
    status.innerHTML = `<span class="csv-status-ok">✏“ Semua ${validCount} baris valid</span>`;
  }

  thead.innerHTML = '<tr><th>Status</th><th>Nama</th><th>Luas (Ha)</th><th>Pohon</th><th>SPH</th>' +
    MONTHS_ID.map(m => `<th>${m}</th>`).join('') + '</tr>';

  tbody.innerHTML = csvParsedData.map((row, i) => {
    const cls = row.valid ? 'csv-row-ok' : 'csv-row-error';
    const sph = row.luas > 0 ? (row.jumlahPohon / row.luas).toFixed(1) : '-';
    const statusIcon = row.valid ? '<span class="status-badge status-ok">✏“</span>' : '<span class="status-badge status-warn">⚠️</span>';
    return `<tr class="${cls}">
      <td>${statusIcon}</td>
      <td><strong>${row.nama || '-'}</strong></td>
      <td>${row.luas || '-'}</td>
      <td>${row.jumlahPohon ? fNum(row.jumlahPohon) : '-'}</td>
      <td><span class="badge badge-green">${sph}</span></td>
      ${MONTHS_ID.map(m => `<td>${row.tp[m] ? fNum(row.tp[m]) : '-'}</td>`).join('')}
    </tr>`;
  }).join('');

  wrapper.style.display = 'block';
}

function executeCSVImport() {
  const validRows = csvParsedData.filter(r => r.valid);
  if (!validRows.length) {
    toast('Tidak ada data valid untuk diimport', 'error');
    return;
  }
  const replaceMode = document.getElementById('csvReplaceMode').checked;

  if (replaceMode) {
    showConfirmModal(
      'Ganti Semua Data?',
      `Mode Replace aktif. Semua <strong>${state.bloks.length}</strong> field yang ada akan dihapus dan diganti dengan <strong>${validRows.length}</strong> field baru. Lanjutkan?`,
      () => {
        state.bloks = [];
        importCSVRows(validRows);
        closeModal();
      }
    );
    setTimeout(() => {
      const btn = document.getElementById('cfmOk');
      if (btn) { btn.textContent = '🔄 Ganti Semua'; btn.className = 'btn btn-primary'; }
    }, 50);
  } else {
    importCSVRows(validRows);
  }
}

function importCSVRows(rows) {
  let added = 0, skipped = 0;
  rows.forEach(row => {
    const exists = state.bloks.find(b => b.nama.toLowerCase() === row.nama.toLowerCase());
    if (exists) {
      exists.luas = row.luas;
      exists.jumlahPohon = row.jumlahPohon;
      exists.tp = row.tp;
      skipped++;
    } else {
      state.bloks.push({
        id: 'B' + Date.now() + Math.random().toString(36).substr(2, 3),
        nama: row.nama,
        luas: row.luas,
        jumlahPohon: row.jumlahPohon,
        tp: row.tp
      });
      added++;
    }
  });

  Storage.save('bloks', state.bloks);
  renderMasterTable();
  resetCSVImport();

  let msg = `✏“ ${added} field baru ditambahkan`;
  if (skipped > 0) msg += `, ${skipped} diperbarui`;
  toast(msg, 'success');
}

function resetCSVImport() {
  csvParsedData = [];
  document.getElementById('csvFileInput').value = '';
  document.getElementById('csvFileInfo').style.display = 'none';
  document.getElementById('csvPreviewWrapper').style.display = 'none';
  document.getElementById('csvUploadArea').style.display = 'flex';
  document.getElementById('csvReplaceMode').checked = false;
}

// ===== LAPORAN =====
function renderLaporanPage(){populateBlokSelect('filterBlok');renderLaporanTable()}
function getLapFilter(){
  const p=document.getElementById('filterPeriode').value;let s,e;
  if(p==='bulan')({start:s,end:e}=mRange(0));else if(p==='bulan-lalu')({start:s,end:e}=mRange(-1));
  else{s=document.getElementById('filterDari').value;e=document.getElementById('filterSampai').value}
  return{start:s,end:e,blokId:document.getElementById('filterBlok').value}
}
function renderLaporanTable(){
  const f=getLapFilter();let d=state.produksi.filter(p=>p.tanggal>=f.start&&p.tanggal<=f.end);
  if(f.blokId)d=d.filter(p=>p.blokId===f.blokId);
  d=[...d].sort((a,b)=>a.tanggal.localeCompare(b.tanggal));
  const tTBS=d.reduce((s,p)=>s+p.beratTBS,0),tJjg=d.reduce((s,p)=>s+p.jumlahJanjang,0),tR=d.reduce((s,p)=>s+(p.restanKg||0),0);
  const days=new Set(d.map(p=>p.tanggal)).size,avg=days>0?Math.round(tTBS/days):0;
  document.getElementById('lap-tbs').textContent=fNum(tTBS)+' kg';
  document.getElementById('lap-janjang').textContent=fNum(tJjg)+' jjg';
  document.getElementById('lap-hari').textContent=days;
  document.getElementById('lap-rata').textContent=fNum(avg)+' kg';
  const tb=document.getElementById('laporanTbody'),tf=document.getElementById('laporanTfoot');
  if(!d.length){tb.innerHTML='<tr><td colspan="12" class="empty-row">Tidak ada data</td></tr>';tf.innerHTML='';return}
  tb.innerHTML=d.map((p,i)=>{const b=getB(p.blokId);const bjr=calcBJR(p.beratTBS,p.jumlahJanjang);const sph=b?getSPH(b):0;const akp=calcAKP(p.jumlahJanjang,p.luasPanen||0,sph);const tkB=p.jenisTK?`<span class="badge ${p.jenisTK==='SKU'?'badge-blue':'badge-gold'}">${p.jenisTK}</span>`:'-';return`<tr><td>${i+1}</td><td>${formatDD(p.tanggal)}</td><td>${b?b.nama:'-'}</td><td><strong>${fNum(p.beratTBS)}</strong></td><td>${fNum(p.jumlahJanjang)}</td><td>${p.luasPanen||'-'}</td><td>${bjr}</td><td>${akp}%</td><td>${fNum(p.restanKg||0)}</td><td>${tkB}</td><td>${p.mandor}</td><td>${p.catatan||'-'}</td></tr>`}).join('');
  tf.innerHTML=`<tr><td colspan="3"><strong>TOTAL</strong></td><td><strong>${fNum(tTBS)} kg</strong></td><td><strong>${fNum(tJjg)}</strong></td><td></td><td><strong>${calcBJR(tTBS,tJjg)}</strong></td><td></td><td><strong>${fNum(tR)} kg</strong></td><td colspan="3"></td></tr>`
}

// ===== ENTRI TERBARU =====
function renderEntriPage(){renderEntriTable('')}
function renderEntriTable(q){
  const tb=document.getElementById('entriTbody');
  let d=[...state.produksi].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,20);
  if(q)d=d.filter(p=>{const b=getB(p.blokId);return(b&&b.nama.toLowerCase().includes(q))||p.mandor.toLowerCase().includes(q)||p.tanggal.includes(q)});
  if(!d.length){tb.innerHTML='<tr><td colspan="11" class="empty-row">Tidak ada data</td></tr>';return}
  tb.innerHTML=d.map(p=>{const b=getB(p.blokId);const bjr=calcBJR(p.beratTBS,p.jumlahJanjang);const sph=b?getSPH(b):0;const akp=calcAKP(p.jumlahJanjang,p.luasPanen||0,sph);const ok=p.beratTBS>=1000;const tkB=p.jenisTK?`<span class="badge ${p.jenisTK==='SKU'?'badge-blue':'badge-gold'}">${p.jenisTK}</span>`:'-';return`<tr><td>${formatDD(p.tanggal)}</td><td>${b?b.nama:'-'}</td><td><strong>${fNum(p.beratTBS)} kg</strong></td><td>${fNum(p.jumlahJanjang)}</td><td>${p.luasPanen||'-'}</td><td>${bjr}</td><td>${akp}%</td><td>${fNum(p.restanKg||0)}</td><td>${tkB}</td><td>${p.mandor}</td><td><span class="status-badge ${ok?'status-ok':'status-warn'}">${ok?'✏“':'⚠️'}</span></td></tr>`}).join('')
}

// ===== RIWAYAT =====
function renderRiwayatPage(){renderRiwayatTable('')}
function renderRiwayatTable(q){
  const tb=document.getElementById('riwayatTbody');
  let d=[...state.produksi].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  if(q)d=d.filter(p=>{const b=getB(p.blokId);return(b&&b.nama.toLowerCase().includes(q))||p.mandor.toLowerCase().includes(q)||p.tanggal.includes(q)});
  if(!d.length){tb.innerHTML='<tr><td colspan="14" class="empty-row">Tidak ada data</td></tr>';return}
  tb.innerHTML=d.map((p,i)=>{const b=getB(p.blokId);const bjr=calcBJR(p.beratTBS,p.jumlahJanjang);const sph=b?getSPH(b):0;const akp=calcAKP(p.jumlahJanjang,p.luasPanen||0,sph);const tkB=p.jenisTK?`<span class="badge ${p.jenisTK==='SKU'?'badge-blue':'badge-gold'}">${p.jenisTK}</span>`:'-';return`<tr><td style="text-align:center"><input type="checkbox" class="cb-riwayat" value="${p.id}" onchange="checkRiwayatSel()"></td><td>${i+1}</td><td>${formatDD(p.tanggal)}</td><td>${b?b.nama:'-'}</td><td><strong>${fNum(p.beratTBS)} kg</strong></td><td>${fNum(p.jumlahJanjang)}</td><td>${p.luasPanen||'-'}</td><td>${bjr}</td><td>${akp}%</td><td>${fNum(p.restanKg||0)}</td><td>${tkB}</td><td>${p.mandor}</td><td style="font-size:11px;color:var(--text-muted)">${fDT(p.createdAt)}</td><td><div class="action-btns"><button class="btn-edit" onclick="editProduksi('${p.id}')">✏</button><button class="btn-delete" onclick="deleteProduksi('${p.id}')">🗑</button></div></td></tr>`}).join('')
  const sa=document.getElementById('selectAllRiwayat');if(sa)sa.checked=false;
  checkRiwayatSel();
}
function checkRiwayatSel(){
  const cbs=document.querySelectorAll('.cb-riwayat'),chk=document.querySelectorAll('.cb-riwayat:checked');
  const sa=document.getElementById('selectAllRiwayat');if(sa)sa.checked=(cbs.length>0&&chk.length===cbs.length);
  const btn=document.getElementById('btnHapusTerpilih');
  if(btn){btn.style.display=chk.length>0?'inline-flex':'none';btn.textContent=`🗑️ Hapus Terpilih (${chk.length})`}
}
function deleteSelectedRiwayat(){
  const chk=document.querySelectorAll('.cb-riwayat:checked');if(!chk.length)return;
  const ids=Array.from(chk).map(c=>c.value);
  showConfirmModal('Hapus Massal',`Hapus <strong>${ids.length}</strong> data produksi terpilih?`,()=>{
    state.produksi=state.produksi.filter(x=>!ids.includes(x.id));
    Storage.save('produksi',state.produksi);
    renderRiwayatTable(document.getElementById('searchInput').value.toLowerCase());
    toast(ids.length+' data berhasil dihapus','success');
    closeModal();
  });
}
function editProduksi(id){
  const p=state.produksi.find(x=>x.id===id);if(!p)return;navigate('input');
  setTimeout(()=>{state.editingId=id;document.getElementById('inputTanggal').value=p.tanggal;populateBlokSelect('inputBlok');document.getElementById('inputBlok').value=p.blokId;updateBlokInfo();document.getElementById('inputBerat').value=p.beratTBS;document.getElementById('inputJanjang').value=p.jumlahJanjang;document.getElementById('inputLuasPanen').value=p.luasPanen||'';document.getElementById('inputRestanKg').value=p.restanKg||'';document.getElementById('inputRestanJjg').value=p.restanJjg||'';if(p.jenisTK){const r=document.querySelector(`input[name="jenisTK"][value="${p.jenisTK}"]`);if(r){r.checked=true;r.closest('.tk-radio-option').classList.add('selected')}}document.getElementById('inputMandor').value=p.mandor;document.getElementById('inputPemanen').value=p.jumlahPemanen||'';document.getElementById('inputCatatan').value=p.catatan||'';document.getElementById('submitBtn').querySelector('.btn-text').textContent='✏” Perbarui Data';calcLiveFields();toast('Mode edit aktif','warning')},100)
}
function deleteProduksi(id){const p=state.produksi.find(x=>x.id===id);if(!p)return;const b=getB(p.blokId);showConfirmModal('Hapus Data',`Hapus data ${formatDD(p.tanggal)}, ${b?b.nama:'-'}, ${fNum(p.beratTBS)} kg?`,()=>{state.produksi=state.produksi.filter(x=>x.id!==id);Storage.save('produksi',state.produksi);renderRiwayatTable(document.getElementById('searchInput').value.toLowerCase());toast('Data dihapus','success');closeModal()})}

// ===== MODAL =====
function openModal(){document.getElementById('modalOverlay').classList.add('active')}
function closeModal(){document.getElementById('modalOverlay').classList.remove('active');document.getElementById('modal').classList.remove('modal-wide')}
function showConfirmModal(t,m,cb){document.getElementById('modalTitle').textContent=t;document.getElementById('modalBody').innerHTML=`<p style="color:var(--text-secondary);line-height:1.7">${m}</p>`;document.getElementById('modalFooter').innerHTML=`<button class="btn btn-outline" onclick="closeModal()">Batal</button><button class="btn btn-danger" id="cfmOk">🗑 Hapus</button>`;document.getElementById('cfmOk').onclick=cb;openModal()}

// ===== TOAST =====
function toast(m,t='success'){const ic={success:'✏…',error:'❌',warning:'⚠️'};const c=document.getElementById('toastContainer');const e=document.createElement('div');e.className=`toast toast-${t}`;e.innerHTML=`<span class="toast-icon">${ic[t]}</span><span class="toast-msg">${m}</span>`;c.appendChild(e);e.addEventListener('click',()=>e.remove());setTimeout(()=>{e.style.opacity='0';e.style.transform='translateX(20px)';e.style.transition='0.3s';setTimeout(()=>e.remove(),300)},3500)}

document.addEventListener('DOMContentLoaded',init);
