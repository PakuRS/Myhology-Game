const cardDatabase = { "Rat":{attack:10,defense:5,cost:1,image:"https://i.imgur.com/3jiKmHe.png"},"Evil Weevil":{attack:20,defense:15,cost:2,image:"https://i.imgur.com/WwD7rqj.png"},"Goblin":{attack:15,defense:25,cost:3,image:"https://i.imgur.com/lBbVF8J.png"},"Vampire":{attack:30,defense:25,cost:4,image:"https://i.imgur.com/XJT7Wec.png"},"King Goblin":{attack:40,defense:40,cost:5,image:"https://i.imgur.com/rW58q2x.png"}, };
let gameState;

const soundDraw = new Audio('https://www.myinstants.com/media/sounds/card-draw.mp3');
const soundDestroy = new Audio('https://www.myinstants.com/media/sounds/yugioh-card-destroyed.mp3');
soundDraw.volume = 0.5;
soundDestroy.volume = 0.5;

const icons = { attack: `<svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 14.3462V22H10.6538L21.5 11.1538L14.8462 4.5L4 14.3462Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.5 5.84619L20.1538 12.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`, defense: `<svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>` };

function resetGameState() { gameState = { player: { hp: 20, mana: 0, maxMana: 0, deck: [], hand: [], field: [] }, opponent: { hp: 20, mana: 0, maxMana: 0, deck: [], hand: [], field: [] }, isPlayerTurn: true, actionMenu: { element: null } }; }
function initGameObjects() { gameState.player.ui = { hp: document.getElementById('player-hp'), mana: document.getElementById('player-mana'), deck: document.getElementById('player-deck-count'), hand: document.getElementById('player-hand'), field: document.getElementById('player-field') }; gameState.opponent.ui = { hp: document.getElementById('opponent-hp'), mana: document.getElementById('opponent-mana'), deck: document.getElementById('opponent-deck-count'), field: document.getElementById('opponent-field'), infoBox: document.getElementById('opponent-info-box') }; }
function createDeck() { const deck = []; for (const cardName in cardDatabase) { for (let i = 0; i < 3; i++) { deck.push(cardName); } } return shuffle(deck); }
function shuffle(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array; }

function drawCard(player) {
    if (player.deck.length > 0) {
        soundDraw.play().catch(()=>{});
        const cardName = player.deck.pop();
        const cardData = cardDatabase[cardName];
        player.hand.push({ name: cardName, ...cardData, defense: cardData.defense, uniqueId: Date.now() + Math.random() });
    }
}

function startTurn(player) { if (player.maxMana < 10) player.maxMana++; player.mana = player.maxMana; player.field.forEach(c => c.canAttack = true); drawCard(player); updateUI(); }
function updateUI() { if (!gameState) return; gameState.player.ui.hp.textContent = `HP: ${gameState.player.hp}`; gameState.player.ui.mana.textContent = `Mana: ${gameState.player.mana}/${gameState.player.maxMana}`; gameState.player.ui.deck.textContent = gameState.player.deck.length; gameState.opponent.ui.hp.textContent = `HP: ${gameState.opponent.hp}`; gameState.opponent.ui.mana.textContent = `Mana: ${gameState.opponent.mana}/${gameState.opponent.maxMana}`; gameState.opponent.ui.deck.textContent = gameState.opponent.deck.length; gameState.player.ui.hand.innerHTML = ''; gameState.player.hand.forEach(card => gameState.player.ui.hand.appendChild(createCardElement(card, 'hand'))); gameState.player.ui.field.innerHTML = ''; gameState.player.field.forEach(card => gameState.player.ui.field.appendChild(createCardElement(card, 'field'))); gameState.opponent.ui.field.innerHTML = ''; gameState.opponent.field.forEach(card => gameState.opponent.ui.field.appendChild(createCardElement(card, 'field'))); document.getElementById('turn-indicator').textContent = gameState.isPlayerTurn ? "Your Turn" : "Opponent's Turn"; document.getElementById('end-turn-button').disabled = !gameState.isPlayerTurn; }
function createCardElement(card, location) { const el = document.createElement('div'); el.className = 'card'; el.style.backgroundImage = `url(${card.image})`; el.dataset.id = card.uniqueId; el.innerHTML = `<div class="cost">${card.cost}</div><div class="stats"><span class="attack">${icons.attack} ${card.attack}</span><span class="defense">${icons.defense} ${card.defense}</span></div>`; if (location === 'hand') { el.onclick = () => playCard(card.uniqueId); } else if (location === 'field' && gameState.player.field.includes(card)) { el.onclick = (event) => showActionMenu(card, event); } return el; }
function playCard(uniqueId) { if (!gameState.isPlayerTurn) return; const cardIndex = gameState.player.hand.findIndex(c => c.uniqueId === uniqueId); if (cardIndex === -1) return; const card = gameState.player.hand[cardIndex]; if (card.cost <= gameState.player.mana && gameState.player.field.length < 5) { gameState.player.mana -= card.cost; card.canAttack = false; gameState.player.field.push(card); gameState.player.hand.splice(cardIndex, 1); updateUI(); } }
function createLaser(startEl, endEl) { const container = document.getElementById('game-container'); const startRect = startEl.getBoundingClientRect(); const endRect = endEl.getBoundingClientRect(); const containerRect = container.getBoundingClientRect(); const startX = startRect.left + startRect.width / 2 - containerRect.left; const startY = startRect.top + startRect.height / 2 - containerRect.top; const endX = endRect.left + endRect.width / 2 - containerRect.left; const endY = endRect.top + endRect.height / 2 - containerRect.top; const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI; const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)); const laser = document.createElement('div'); laser.className = 'laser'; laser.style.width = `${distance}px`; laser.style.top = `${startY}px`; laser.style.left = `${startX}px`; laser.style.transform = `rotate(${angle}deg)`; container.appendChild(laser); setTimeout(() => laser.remove(), 1000); }
function showActionMenu(card, event) { closeActionMenu(); if (!gameState.isPlayerTurn || !card.canAttack) return; const menu = document.createElement('div'); menu.className = 'action-menu'; gameState.opponent.field.forEach((opponentCard) => { const btn = document.createElement('button'); btn.textContent = `Attack ${opponentCard.name}`; btn.onclick = () => { attack(card, opponentCard); closeActionMenu(); }; menu.appendChild(btn); }); const directAttackBtn = document.createElement('button'); directAttackBtn.textContent = 'Attack Opponent Directly'; directAttackBtn.disabled = gameState.opponent.field.length > 0; directAttackBtn.onclick = () => { attack(card, gameState.opponent); closeActionMenu(); }; menu.appendChild(directAttackBtn); document.body.appendChild(menu); menu.style.left = `${event.clientX}px`; menu.style.top = `${event.clientY}px`; gameState.actionMenu.element = menu; }
function closeActionMenu() { if (gameState.actionMenu.element) { gameState.actionMenu.element.remove(); gameState.actionMenu.element = null; } }
document.addEventListener('click', (event) => { if (gameState && gameState.actionMenu.element && !gameState.actionMenu.element.contains(event.target) && !event.target.closest('.card')) { closeActionMenu(); } });

function attack(attacker, defender) {
    const attackerEl = document.querySelector(`[data-id='${attacker.uniqueId}']`);
    const defenderIsPlayer = defender.hp !== undefined;
    const defenderEl = defenderIsPlayer ? document.getElementById(gameState.player.field.includes(attacker) ? 'opponent-info-box' : 'player-info-box') : document.querySelector(`[data-id='${defender.uniqueId}']`);
    if (attackerEl && defenderEl) createLaser(attackerEl, defenderEl);
    if (defenderIsPlayer) defender.hp -= attacker.attack; else defender.defense -= attacker.attack;
    attacker.canAttack = false;
    
    if (defender.defense <= 0) {
        soundDestroy.play().catch(()=>{});
        const destroyedCardEl = document.querySelector(`[data-id='${defender.uniqueId}']`);
        if (destroyedCardEl) destroyedCardEl.classList.add('destroyed');
        setTimeout(() => {
            if(gameState.player.field.includes(defender)) gameState.player.field = gameState.player.field.filter(c => c.uniqueId !== defender.uniqueId);
            else gameState.opponent.field = gameState.opponent.field.filter(c => c.uniqueId !== defender.uniqueId);
            updateUI();
        }, 500);
    } else { setTimeout(updateUI, 200); }
    if (gameState.player.hp <= 0) { setTimeout(() => endGame("You Lose!"), 300); } else if (gameState.opponent.hp <= 0) { setTimeout(() => endGame("You Win!"), 300); }
}

function opponentTurn() {
    startTurn(gameState.opponent);
    const playableCards = gameState.opponent.hand.filter(c => c.cost <= gameState.opponent.mana);
    if (playableCards.length > 0 && gameState.opponent.field.length < 5) {
        const cardToPlay = playableCards[0];
        gameState.opponent.mana -= cardToPlay.cost;
        cardToPlay.canAttack = false;
        gameState.opponent.field.push(cardToPlay);
        gameState.opponent.hand = gameState.opponent.hand.filter(c => c.uniqueId !== cardToPlay.uniqueId);
    }
    updateUI();
    const attackers = gameState.opponent.field.filter(c => c.canAttack);
    setTimeout(() => {
        attackers.forEach(attacker => {
            const target = gameState.player.field.length > 0 ? gameState.player.field[0] : gameState.player;
            attack(attacker, target);
        });
        setTimeout(() => {
            gameState.isPlayerTurn = true;
            startTurn(gameState.player);
        }, 1000);
    }, 1000);
}

document.getElementById('end-turn-button').onclick = () => { if (!gameState.isPlayerTurn) return; closeActionMenu(); gameState.isPlayerTurn = false; updateUI(); setTimeout(opponentTurn, 1500); };
function endGame(message) { alert(message); document.getElementById('game-container').style.display = 'none'; document.getElementById('player-hand').innerHTML = ''; document.getElementById('turn-indicator').style.display = 'none'; document.getElementById('end-turn-button').style.display = 'none'; document.getElementById('main-menu').style.display = 'flex'; }

document.getElementById('play-ai-button').onclick = () => {
    soundDraw.play().catch(e => console.error("Sound error:", e));
    soundDestroy.play().catch(e => console.error("Sound error:", e));
    soundDraw.pause(); soundDestroy.pause();

    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'grid';
    document.getElementById('turn-indicator').style.display = 'block';
    document.getElementById('end-turn-button').style.display = 'block';
    resetGameState(); initGameObjects();
    gameState.player.deck = createDeck(); gameState.opponent.deck = createDeck();
    for(let i=0; i<5; i++) { drawCard(gameState.player); }
    for(let i=0; i<5; i++) { if (gameState.opponent.deck.length > 0) { const cardName = gameState.opponent.deck.pop(); const cardData = cardDatabase[cardName]; gameState.opponent.hand.push({ name: cardName, ...cardData, defense: cardData.defense, uniqueId: Date.now() + Math.random() }); } }
    startTurn(gameState.player);
};
