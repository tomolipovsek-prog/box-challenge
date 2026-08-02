const modeNames={9:"Classic",12:"Extended",15:"Pro",18:"Master"};
const pipMap={1:["mc"],2:["tl","br"],3:["tl","mc","br"],4:["tl","tr","bl","br"],5:["tl","tr","mc","bl","br"],6:["tl","ml","bl","tr","mr","br"]};
const players=[{id:1,nickname:"Tomaž",rounds:[],total:0}];

let maxN=9,diceCount=2,openNums=[],selected=[],target=null,rolled=false,totalRounds=3,currentRound=1,roundResults=[],roundFinished=false,matchFinished=false,rollingNow=false;

const $=id=>document.getElementById(id);
const sum=a=>a.reduce((x,y)=>x+y,0);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function setMessage(t){$("message").textContent=t}
function readSetup(){
  maxN=Number($("mode").value);
  diceCount=maxN<=12?2:3;
  totalRounds=Number($("rounds").value);
  players[0].nickname=$("nickname").value.trim()||"Igralec";
  $("playerLabel").textContent=players[0].nickname;
  $("modeLabel").textContent=modeNames[maxN];
}
function newMatch(){
  readSetup();currentRound=1;roundResults=[];players[0].rounds=[];players[0].total=0;matchFinished=false;startRound();renderScoreboard();
}
function startRound(){
  openNums=Array.from({length:maxN},(_,i)=>i+1);selected=[];target=null;rolled=false;roundFinished=false;rollingNow=false;
  $("dice").innerHTML="";$("target").textContent="–";$("selectedSum").textContent="0";$("rollBtn").disabled=false;$("confirmBtn").disabled=true;$("nextRoundBtn").classList.add("hidden");
  renderTiles();updateScore();updateMatchDisplay();setMessage(`Runda ${currentRound} od ${totalRounds}. Začni z metom kock.`);
}
function renderTiles(){
  $("tiles").innerHTML="";
  for(let i=1;i<=maxN;i++){
    const d=document.createElement("div"),isOpen=openNums.includes(i),isSelected=selected.includes(i);
    d.className="tile "+(isOpen?"open":"closed")+(isSelected?" selected":"");d.textContent=i;
    if(isOpen)d.onclick=()=>toggleNumber(i);$("tiles").appendChild(d);
  }
}
function toggleNumber(n){
  if(!rolled||rollingNow||roundFinished)return;
  selected=selected.includes(n)?selected.filter(x=>x!==n):[...selected,n];
  $("selectedSum").textContent=sum(selected);$("confirmBtn").disabled=sum(selected)!==target;renderTiles();
}
function hasCombination(nums,wanted){
  function search(i,total){if(total===wanted)return true;if(total>wanted||i===nums.length)return false;return search(i+1,total+nums[i])||search(i+1,total)}
  return search(0,0);
}
function createDie(value,rolling=false){
  const die=document.createElement("div");die.className="die"+(rolling?" rolling":"");
  pipMap[value].forEach(pos=>{const p=document.createElement("span");p.className=`pip ${pos}`;die.appendChild(p)});
  return die;
}
function showDice(values,rolling=false){$("dice").innerHTML="";values.forEach(v=>$("dice").appendChild(createDie(v,rolling)))}
async function rollDice(){
  if(rollingNow||rolled||roundFinished||matchFinished)return;
  selected=[];$("selectedSum").textContent="0";$("confirmBtn").disabled=true;rollingNow=true;$("rollBtn").disabled=true;setMessage("Kocke se vrtijo ...");
  const finalValues=Array.from({length:diceCount},()=>1+Math.floor(Math.random()*6));
  const end=Date.now()+650;
  while(Date.now()<end){showDice(Array.from({length:diceCount},()=>1+Math.floor(Math.random()*6)),true);await sleep(85)}
  showDice(finalValues);target=sum(finalValues);rolled=true;rollingNow=false;$("target").textContent=target;
  if(!hasCombination(openNums,target))finishRound(`Ni več možne kombinacije za ${target}.`);
  else setMessage(`Izberi odprte številke s skupno vsoto ${target}.`);
}
function confirmMove(){
  if(sum(selected)!==target||roundFinished)return;
  openNums=openNums.filter(n=>!selected.includes(n));selected=[];rolled=false;target=null;$("target").textContent="–";$("selectedSum").textContent="0";$("dice").innerHTML="";$("confirmBtn").disabled=true;updateScore();renderTiles();
  if(openNums.length===0)finishRound("PERFECT GAME! Zaprl si vse številke.");
  else{$("rollBtn").disabled=false;setMessage("Poteza potrjena. Vrzi ponovno.");}
}
function finishRound(reason){
  roundFinished=true;rolled=false;rollingNow=false;$("rollBtn").disabled=true;$("confirmBtn").disabled=true;
  const result=sum(openNums);roundResults.push(result);players[0].rounds=[...roundResults];players[0].total=sum(roundResults);renderScoreboard();updateMatchDisplay();
  if(currentRound>=totalRounds){matchFinished=true;$("nextRoundBtn").classList.add("hidden");setMessage(`${reason} Konec tekme – skupni rezultat: ${players[0].total}.`)}
  else{$("nextRoundBtn").classList.remove("hidden");setMessage(`${reason} Rezultat runde ${currentRound}: ${result}.`)}
}
function nextRound(){if(!roundFinished||matchFinished)return;currentRound++;startRound();renderScoreboard()}
function renderScoreboard(){
  $("roundResults").innerHTML="";
  for(let r=1;r<=totalRounds;r++){
    const row=document.createElement("div");row.className="round-row"+(r===currentRound&&!matchFinished?" current":"");
    row.innerHTML=`<span>Runda ${r}</span><strong>${roundResults[r-1]??"–"}</strong>`;$("roundResults").appendChild(row);
  }
  const total=sum(roundResults);$("scoreboardTotal").textContent=total;$("matchTotal").textContent=total;
}
function updateMatchDisplay(){$("playerLabel").textContent=players[0].nickname;$("roundLabel").textContent=`${currentRound} od ${totalRounds}`;$("matchTotal").textContent=players[0].total}
function updateScore(){$("score").textContent=sum(openNums)}

$("mode").onchange=newMatch;$("rounds").onchange=newMatch;$("nickname").onchange=newMatch;$("rollBtn").onclick=rollDice;$("confirmBtn").onclick=confirmMove;$("nextRoundBtn").onclick=nextRound;$("resetBtn").onclick=newMatch;
newMatch();