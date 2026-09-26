const initialSongs = [
"うまぴょい伝説","Make debut!","グロウアップ・シャイン！","ENDLESS DREAM!!","Special Record!","Find My Only Way","七色の景色","ありがとう、神様","Silent Star","SEVEN","恋はダービー☆","わたしの印は大本命◎","CATCH THE VICTORY!","Rising Girl","Goal To My SHIP","Waiting for Tomorrow","禁断 Burning Heart","鳥かごのロンリーバード","DREAM JACK","EMPRESS GAME","シャドーロールの誓い","手綱と絆","L's Surprise!!","UNLIMITED IMPACT","winning the soul","本能スピード","ENDLESS DREAM!! (Game Size)","NEXT FRONTIER","彩 Phantasia","恋せよ乙女","ぴょいっと♪はれるや！","ユメヲカケル！","木漏れ日のエール","ささやかな祈り","BLAZE","Never Looking Back","We are DREAMERS!!","GIRLS' LEGEND U","DRAMATIC JOURNEY","Ms. VICTORIA","Everlasting BEATS","トレセン音頭","ソシテミンナノ","Ready!! Steady!! Derby!!","アコガレChallenge Dash!!","Glorious Moment！","光の後ろ姿","爆熱マイソウル","winning the soul (アニメVer.)","Overrunner!","L'Arc de gloire","U.M.A. NEW WORLD!!","UMA Summer","Legend-Changer","うまぴょい伝説 (アニメVer.)"
];
const $=id=>document.getElementById(id);
let catalog=[...new Set(initialSongs)].map((name,i)=>({id:i,name}));
let selected=new Set(catalog.map(x=>x.id));
let state=null;
const saved=()=>localStorage.setItem("umaSortState",JSON.stringify({catalog,selected:[...selected],state}));
function renderSongs(){const q=$("search").value.trim().toLowerCase();const list=$("songList");list.innerHTML="";catalog.filter(s=>s.name.toLowerCase().includes(q)).forEach(s=>{const label=document.createElement("label");label.className="song";const cb=document.createElement("input");cb.type="checkbox";cb.checked=selected.has(s.id);cb.onchange=()=>{cb.checked?selected.add(s.id):selected.delete(s.id);saved()};const span=document.createElement("span");span.textContent=s.name;label.append(cb,span);list.append(label)})}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function show(id){["setup","game","result"].forEach(x=>$(x).classList.toggle("hidden",x!==id))}
function start(){const chosen=catalog.filter(s=>selected.has(s.id));if(chosen.length<2){$("setupError").textContent="2曲以上選んでください。";return}const n=Number($("finalSize").value);if(chosen.length<=n){state={phase:"final",pool:shuffle(chosen),ranked:[],cursor:0,history:[]};}else{state={phase:"prelim",pool:shuffle(chosen),winners:[],next:[],target:Math.min(n,chosen.length),ranked:[],cursor:0,history:[]};}saved();nextMatch()}
function makeMatch(){
 if(state.phase==="prelim"){
  if(state.pool.length===1)state.winners.push(state.pool.shift());
  if(state.pool.length===0){
   if(state.winners.length<=state.target){state.phase="final";state.pool=shuffle(state.winners);state.winners=[];state.ranked=[];state.cursor=0;return makeMatch()}
   state.pool=shuffle(state.winners);state.winners=[];return makeMatch()
  }
  state.current=[state.pool.shift(),state.pool.shift()];
 } else {
  if(state.cursor>=state.pool.length){showResults();return}
  if(!state.ranked.length){state.ranked.push(state.pool[state.cursor++]);return makeMatch()}
  if(state.low===undefined){state.low=0;state.high=state.ranked.length}
  if(state.low>=state.high){state.ranked.splice(state.low,0,state.pool[state.cursor]);state.cursor++;delete state.low;delete state.high;return makeMatch()}
  const mid=Math.floor((state.low+state.high)/2);
  state.current=[state.pool[state.cursor],state.ranked[mid]];state.mid=mid;
 }
}
function renderMatch(){show("game");$("phase").textContent=state.phase==="prelim"?"ROUND 1 · 予選":"FINAL · 順位決定戦";const total=state.phase==="prelim"?Math.max(1,state.pool.length+state.next.length+2):Math.max(1,state.pool.length);const done=state.phase==="prelim"?state.winners.length+state.next.length:state.cursor;$("progressBar").style.width=Math.min(100,done/total*100)+"%";$("roundInfo").textContent=state.phase==="prelim"?`予選通過 ${state.winners.length+state.next.length} / 目標 ${state.target} 曲`:`ランキング作成中 · ${state.ranked.length} 曲確定`;$("choices").innerHTML="";const a=state.current[0],b=state.current[1];[a,b].forEach((s,i)=>{const btn=document.createElement("button");btn.className="choice";btn.innerHTML=`<small>${i===0?"A":"B"} を選ぶ</small>`;const name=document.createElement("div");name.textContent=s.name;btn.append(name);btn.onclick=()=>pick(i);$("choices").append(btn)});$("undo").disabled=!state.history.length}
function pick(which){
 state.history.push(JSON.parse(JSON.stringify({phase:state.phase,pool:state.pool,winners:state.winners,next:state.next,ranked:state.ranked,cursor:state.cursor,current:state.current,low:state.low,high:state.high,mid:state.mid})));
 if(state.phase==="prelim"){
  state.winners.push(state.current[which]);
  if(state.pool.length===0){
   if(state.winners.length<=state.target){state.phase="final";state.pool=shuffle(state.winners);state.winners=[];state.ranked=[];state.cursor=0;}
   else {state.pool=shuffle(state.winners);state.winners=[];}
  }
 } else {
  if(which===0)state.high=state.mid;else state.low=state.mid+1;
 }
 state.current=null;nextMatch()
}
function showResults(){show("result");const list=$("ranking");list.innerHTML="";state.ranked.forEach((s,i)=>{const li=document.createElement("li");li.textContent=`${s.name}`;list.append(li)});saved()}
function undo(){if(!state?.history.length)return;const h=state.history.pop();Object.assign(state,h);nextMatch()}
$("search").oninput=renderSongs;$("selectVisible").onclick=()=>{const q=$("search").value.trim().toLowerCase();catalog.filter(s=>s.name.toLowerCase().includes(q)).forEach(s=>selected.add(s.id));renderSongs();saved()};$("clearSelection").onclick=()=>{selected.clear();renderSongs();saved()};
$("addSongs").onclick=()=>{const names=$("customSongs").value.split(/\n/).map(s=>s.trim()).filter(Boolean);names.forEach(name=>{if(!catalog.some(s=>s.name===name)){const id=Math.max(-1,...catalog.map(s=>s.id))+1;catalog.push({id,name});selected.add(id)}});$("customSongs").value="";renderSongs();saved()};
$("start").onclick=start;$("undo").onclick=undo;$("saveExit").onclick=()=>{saved();show("setup")};$("restart").onclick=()=>{state=null;saved();show("setup")};
$("download").onclick=()=>{const c=$("poster"),ctx=c.getContext("2d");ctx.fillStyle="#29213f";ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle="#f17aa7";ctx.fillRect(0,0,c.width,22);ctx.fillStyle="#fffaf5";ctx.textAlign="center";ctx.font="bold 54px sans-serif";ctx.fillText("ウマ娘 楽曲ソート",540,105);ctx.font="28px sans-serif";ctx.fillStyle="#f5c96b";ctx.fillText("MY FAVORITE SONGS",540,155);ctx.textAlign="left";let y=220;state.ranked.forEach((s,i)=>{ctx.fillStyle=i===0?"#f5c96b":"#fffaf5";ctx.font=`${i===0?"bold ":""}30px sans-serif`;ctx.fillText(`${String(i+1).padStart(2,"0")}  ${s.name}`,90,y);y+=65});ctx.fillStyle="#cfc5db";ctx.font="18px sans-serif";ctx.textAlign="center";ctx.fillText("Fan-made / 非公式",540,1540);const a=document.createElement("a");a.download="umamusume-ranking.png";a.href=c.toDataURL("image/png");a.click()};
function restore(){try{const d=JSON.parse(localStorage.getItem("umaSortState"));if(d){if(d.catalog?.length)catalog=d.catalog;selected=new Set(d.selected||[]);state=d.state||null;}}catch{}renderSongs();if(state){if(state.phase==="result")showResults();else if(state.current)renderMatch();else nextMatch()}else show("setup")}
restore();
