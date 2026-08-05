const $=id=>document.getElementById(id),sum=a=>a.reduce((x,y)=>x+y,0),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const defaultDice={9:2,12:2,15:3,18:4},penaltySteps=[2,3,4];
const pips={1:["mc"],2:["tl","br"],3:["tl","mc","br"],4:["tl","tr","bl","br"],5:["tl","tr","mc","bl","br"],6:["tl","ml","bl","tr","mr","br"]};
const orient={1:"rotateX(-90deg)",2:"rotateY(90deg)",3:"rotateX(0deg)",4:"rotateY(180deg)",5:"rotateY(-90deg)",6:"rotateX(90deg)"};
const D={
sl:{language:"Jezik",name:"Igralno ime",box:"Box",rounds:"Runde",persona:"AI osebnost",start:"ZAČNI TEKMO",player:"Igralec",round:"Runda",dice:"Kocke",penalty:"Pribitek",total:"Skupaj",roll:"VRZI KOCKE",close:"ZAPRI IZBRANE ŠTEVILKE",next:"NASLEDNJA RUNDA",new:"NOVA TEKMA",switch:"Menjava kock",change:"ZAMENJAJ",target:"Ciljna vsota",selected:"Izbrane številke",score:"Rezultat runde",results:"Rezultati",best:"Osebni rekord",rules:"Po metu izberi odprte številke, katerih vsota je enaka metu. Vsako številko lahko uporabiš samo enkrat. Nižji rezultat je boljši.",begin:"Začni z metom kock.",choose:"Izberi odprte številke s skupno vsoto",nomove:"Ni več možne kombinacije",ok:"Poteza potrjena. Vrzi ponovno.",perfect:"LEGENDARY PERFECT GAME",end:"Konec tekme"},
en:{language:"Language",name:"Nickname",box:"Box",rounds:"Rounds",persona:"AI personality",start:"START MATCH",player:"Player",round:"Round",dice:"Dice",penalty:"Penalty",total:"Total",roll:"ROLL DICE",close:"CLOSE SELECTED NUMBERS",next:"NEXT ROUND",new:"NEW MATCH",switch:"Change dice",change:"CHANGE",target:"Target sum",selected:"Selected numbers",score:"Round score",results:"Results",best:"Personal best",rules:"Choose open numbers whose sum equals the roll. Each number can be used once. Lower score is better.",begin:"Roll the dice to begin.",choose:"Choose open numbers totaling",nomove:"No valid combination remains",ok:"Move confirmed. Roll again.",perfect:"LEGENDARY PERFECT GAME",end:"Match over"}};
["de","fr","it","es","pt","zh","hi","ja","ru"].forEach(k=>D[k]=D.en);
let s={lang:"sl",active:false,max:9,rounds:3,round:1,dice:2,open:[],sel:[],target:null,rolled:false,results:[],penalty:0,switches:0,rolling:false,perfect:false};
const tr=k=>(D[s.lang]||D.en)[k]||k;
function translate(){document.querySelectorAll("[data-t]").forEach(e=>e.textContent=tr(e.dataset.t))}
function setMsg(x){$("message").textContent=x}
function lockSetup(v){["name","mode","rounds"].forEach(id=>$(id).disabled=v);$("start").disabled=v}
function read(){s.max=+$("mode").value;s.rounds=+$("rounds").value;s.dice=defaultDice[s.max]}
function startMatch(){if(s.active)return;read();s.active=true;s.round=1;s.results=[];lockSetup(true);$("new").disabled=true;startRound();renderResults()}
function startRound(){s.open=Array.from({length:s.max},(_,i)=>i+1);s.sel=[];s.target=null;s.rolled=false;s.penalty=0;s.switches=0;s.rolling=false;s.perfect=false;s.dice=defaultDice[s.max];$("diceChoice").value=s.dice;$("diceChoice").disabled=false;$("change").disabled=false;$("roll").disabled=false;$("close").disabled=true;$("next").hidden=true;$("dice").innerHTML="";$("target").textContent="–";$("selected").textContent="0";renderTiles();update();setMsg(`${tr("round")} ${s.round}/${s.rounds}. ${tr("begin")}`);$("ai").textContent="🤖"}
function renderTiles(){$("tiles").innerHTML="";for(let i=1;i<=s.max;i++){let e=document.createElement("div"),o=s.open.includes(i),q=s.sel.includes(i);e.className="tile "+(o?"open":"closed")+(q?" selected":"");e.textContent=i;if(o)e.onclick=()=>toggle(i);$("tiles").appendChild(e)}}
function toggle(n){if(!s.rolled||s.rolling)return;s.sel=s.sel.includes(n)?s.sel.filter(x=>x!==n):[...s.sel,n];$("selected").textContent=sum(s.sel);$("close").disabled=sum(s.sel)!==s.target;renderTiles()}
function combo(nums,w){function f(i,t){if(t===w)return true;if(t>w||i===nums.length)return false;return f(i+1,t+nums[i])||f(i+1,t)}return f(0,0)}
function flatDie(v){
  let die=document.createElement("div");
  die.className="face finalDie";
  die.style.position="relative";
  die.style.transform="none";
  die.style.flex="0 0 74px";
  pips[v].forEach(pos=>{let d=document.createElement("span");d.className="pip "+pos;die.appendChild(d)});
  return die
}
function rollingCube(){
  let w=document.createElement("div");w.className="cubeWrap rolling";
  let c=document.createElement("div");c.className="cube";
  [["front",3],["back",4],["right",2],["left",5],["top",1],["bottom",6]].forEach(([cl,n])=>{
    let f=document.createElement("div");f.className="face "+cl;
    pips[n].forEach(pos=>{let d=document.createElement("span");d.className="pip "+pos;f.appendChild(d)});
    c.appendChild(f)
  });
  w.appendChild(c);
  requestAnimationFrame(()=>c.style.transform=`rotateX(${720+Math.random()*360}deg) rotateY(${720+Math.random()*360}deg)`);
  return w
}
function showDice(vals){
  $("dice").innerHTML="";
  vals.forEach(()=>$("dice").appendChild(rollingCube()));
  setTimeout(()=>{
    $("dice").innerHTML="";
    vals.forEach(v=>$("dice").appendChild(flatDie(v)))
  },840)
}
function provoke(){let p=$("persona").value,m={friend:["Mirno, ena dobra odločitev naenkrat."],professor:[`Cilj je ${s.target}. Oglej si vse kombinacije.`],provoker:["Si prepričan, da boš izbral najboljšo kombinacijo?","Morda bi bila menjava kock pametna ... ali draga napaka."],comic:["Kocke so svoje naredile. Zdaj si na vrsti ti, Einstein."],silent:[""]};$("ai").textContent=p==="silent"?"":"🤖 "+m[p][Math.floor(Math.random()*m[p].length)]}
async function roll(){if(!s.active||s.rolling||s.rolled)return;s.rolling=true;$("roll").disabled=true;$("change").disabled=true;$("diceChoice").disabled=true;let vals=Array.from({length:s.dice},()=>1+Math.floor(Math.random()*6));showDice(vals);await sleep(900);s.target=sum(vals);s.rolled=true;s.rolling=false;$("target").textContent=s.target;if(!combo(s.open,s.target))finish(`${tr("nomove")}: ${s.target}.`);else{setMsg(`${tr("choose")} ${s.target}.`);provoke()}}
function closeNums(){if(sum(s.sel)!==s.target)return;s.open=s.open.filter(n=>!s.sel.includes(n));s.sel=[];s.target=null;s.rolled=false;$("target").textContent="–";$("selected").textContent="0";$("dice").innerHTML="";$("close").disabled=true;renderTiles();update();if(!s.open.length){s.perfect=true;finish(tr("perfect"))}else{$("roll").disabled=false;$("change").disabled=s.switches>=3;$("diceChoice").disabled=s.switches>=3;setMsg(tr("ok"))}}
function changeDice(){if(!s.active||s.rolled||s.rolling)return;let n=+$("diceChoice").value;if(n===s.dice){setMsg("Izberi drugo število kock.");return}if(s.switches>=3)return;s.penalty+=penaltySteps[s.switches];s.switches++;s.dice=n;update();setMsg(`Menjava opravljena: +${s.penalty}.`);$("ai").textContent="🤖 Plačal si za nadzor. Zdaj ga izkoristi.";if(s.switches>=3){$("change").disabled=true;$("diceChoice").disabled=true}}
function finish(reason){s.rolled=false;s.rolling=false;$("roll").disabled=true;$("close").disabled=true;$("change").disabled=true;$("diceChoice").disabled=true;let r=sum(s.open)+s.penalty;s.results.push(r);renderResults();update();if(s.perfect)celebrate();if(s.round>=s.rounds){s.active=false;lockSetup(false);$("new").disabled=false;$("next").hidden=true;let t=sum(s.results);saveBest(t);setMsg(`${reason} ${tr("end")}: ${t}.`)}else{$("next").hidden=false;setMsg(`${reason} ${tr("score")}: ${r}.`)}}
function nextRound(){s.round++;startRound();renderResults()}
function renderResults(){$("results").innerHTML="";for(let r=1;r<=s.rounds;r++){let e=document.createElement("div");e.className="roundRow"+(r===s.round&&s.active?" current":"");e.innerHTML=`<span>${tr("round")} ${r}</span><b>${s.results[r-1]??"–"}</b>`;$("results").appendChild(e)}$("sum").textContent=sum(s.results);loadBest()}
function update(){$("player").textContent=$("name").value.trim()||"Player";$("round").textContent=`${s.round}/${s.rounds}`;$("diceCount").textContent=s.dice;$("penalty").textContent=s.penalty;$("total").textContent=sum(s.results);$("score").textContent=sum(s.open)+s.penalty}
function key(){return`bc-best-${s.max}-${s.rounds}`}function saveBest(v){let o=+localStorage.getItem(key());if(!o||v<o)localStorage.setItem(key(),v);loadBest()}function loadBest(){$("best").textContent=localStorage.getItem(key())||"–"}
function celebrate(){$("celebrateTitle").textContent=tr("perfect");$("celebrateText").textContent=$("name").value;$("celebrate").hidden=false;for(let i=0;i<50;i++){let c=document.createElement("div");c.className="confetti";c.style.left=Math.random()*100+"vw";c.style.background=`hsl(${Math.random()*360} 80% 60%)`;c.style.animationDelay=Math.random()*.7+"s";document.body.appendChild(c);setTimeout(()=>c.remove(),3500)}}
async function piLogin(){try{if(!window.Pi)throw 0;Pi.init({version:"2.0",sandbox:true});let a=await Pi.authenticate(["username"],()=>{});$("piStatus").textContent=a.user.username;$("name").value=a.user.username}catch{$("piStatus").textContent="Open in Pi Browser"}}
$("enter").onclick=()=>{$("intro").hidden=true;$("game").hidden=false;translate();loadBest()};$("lang").onchange=e=>{s.lang=e.target.value;translate();renderResults();update()};$("name").oninput=()=>{if(!s.active)update()};$("start").onclick=startMatch;$("roll").onclick=roll;$("close").onclick=closeNums;$("next").onclick=nextRound;$("new").onclick=startMatch;$("change").onclick=changeDice;$("piLogin").onclick=piLogin;$("ok").onclick=()=>$("celebrate").hidden=true;translate();