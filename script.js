const modeNames = {9:"Classic",12:"Extended",15:"Pro",18:"Master"};

let maxN = 9;
let diceCount = 2;
let openNums = [];
let selected = [];
let target = null;
let rolled = false;

const tilesEl = document.getElementById("tiles");
const diceEl = document.getElementById("dice");
const messageEl = document.getElementById("message");
const targetEl = document.getElementById("target");
const selectedEl = document.getElementById("selectedSum");
const scoreEl = document.getElementById("score");
const confirmBtn = document.getElementById("confirmBtn");
const rollBtn = document.getElementById("rollBtn");

const sum = values => values.reduce((a,b) => a+b, 0);

function setMessage(text){
  messageEl.textContent = text;
}

function newGame(){
  maxN = Number(document.getElementById("mode").value);
  diceCount = maxN <= 12 ? 2 : 3;
  openNums = Array.from({length:maxN}, (_,i) => i+1);
  selected = [];
  target = null;
  rolled = false;

  document.getElementById("modeLabel").textContent = modeNames[maxN];
  diceEl.innerHTML = "";
  targetEl.textContent = "–";
  selectedEl.textContent = "0";
  rollBtn.disabled = false;
  confirmBtn.disabled = true;

  renderTiles();
  updateScore();
  setMessage("Začni z metom kock.");
}

function renderTiles(){
  tilesEl.innerHTML = "";

  for(let i=1; i<=maxN; i++){
    const tile = document.createElement("div");
    const isOpen = openNums.includes(i);
    const isSelected = selected.includes(i);

    tile.className = "tile " + (isOpen ? "open" : "closed") + (isSelected ? " selected" : "");
    tile.textContent = i;

    if(isOpen){
      tile.addEventListener("click", () => toggleNumber(i));
    }

    tilesEl.appendChild(tile);
  }
}

function toggleNumber(number){
  if(!rolled) return;

  selected = selected.includes(number)
    ? selected.filter(n => n !== number)
    : [...selected, number];

  selectedEl.textContent = sum(selected);
  confirmBtn.disabled = sum(selected) !== target;
  renderTiles();
}

function hasCombination(numbers, wanted){
  function search(index, total){
    if(total === wanted) return true;
    if(total > wanted || index === numbers.length) return false;

    return search(index+1, total + numbers[index]) ||
           search(index+1, total);
  }

  return search(0, 0);
}

function rollDice(){
  selected = [];
  selectedEl.textContent = "0";
  confirmBtn.disabled = true;

  const values = Array.from({length:diceCount}, () => 1 + Math.floor(Math.random()*6));
  target = sum(values);
  rolled = true;

  diceEl.innerHTML = "";
  values.forEach(value => {
    const die = document.createElement("div");
    die.className = "die";
    die.textContent = value;
    diceEl.appendChild(die);
  });

  targetEl.textContent = target;

  if(!hasCombination(openNums, target)){
    rolled = false;
    rollBtn.disabled = true;
    setMessage(`Ni več možne kombinacije za ${target}. Konec igre – rezultat: ${sum(openNums)}.`);
  } else {
    setMessage(`Izberi odprte številke s skupno vsoto ${target}.`);
  }
}

function confirmMove(){
  if(sum(selected) !== target) return;

  openNums = openNums.filter(n => !selected.includes(n));
  selected = [];
  rolled = false;
  target = null;

  targetEl.textContent = "–";
  selectedEl.textContent = "0";
  diceEl.innerHTML = "";
  confirmBtn.disabled = true;

  updateScore();
  renderTiles();

  if(openNums.length === 0){
    rollBtn.disabled = true;
    setMessage("PERFECT GAME! Zaprl si vse številke. Rezultat: 0.");
  } else {
    setMessage("Poteza potrjena. Vrzi ponovno.");
  }
}

function updateScore(){
  scoreEl.textContent = sum(openNums);
}

document.getElementById("mode").addEventListener("change", newGame);
document.getElementById("rollBtn").addEventListener("click", rollDice);
document.getElementById("confirmBtn").addEventListener("click", confirmMove);
document.getElementById("resetBtn").addEventListener("click", newGame);

newGame();
