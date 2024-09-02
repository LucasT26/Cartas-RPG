const deckElement = document.getElementById('deck');
const fullScreenCard = document.getElementById('full-screen-card');
const cardDisplay = document.getElementById('card-display');
const flipButton = document.getElementById('flip-button');
const addToMyDeckButton = document.getElementById('add-to-my-deck');
const removeFromMyDeckButton = document.getElementById('remove-from-my-deck');
const filterButtons = document.querySelectorAll('.filter-button');
const profileSelector = document.getElementById('profile-selector');
const usernameInput = document.getElementById('username');
const createProfileButton = document.getElementById('create-profile');
const loadProfileButton = document.getElementById('load-profile');
const selectedProfileElement = document.getElementById('selected-profile');

let currentCardId = '';
let currentGroup = 'geral';
let currentProfile = '';

const groups = {
    sangue: 13,
    morte: 13,
    conhecimento: 13,
    energia: 13,
    medo: 4
};

function createDeck() {
    filterCards(currentGroup);
}

function createCard(value, group, container) {
    const cardId = `${value}_${group}`;

    const cardContainer = document.createElement('div');
    cardContainer.className = 'card-container';
    cardContainer.setAttribute('data-id', cardId);

    const card = document.createElement('div');
    card.className = 'card';
    card.addEventListener('click', () => showCardInFullScreen(cardId));

    const cardFront = document.createElement('div');
    cardFront.className = 'card-face card-front';
    cardFront.style.backgroundImage = `url('images/fronts/${group}/${value}.png')`;

    const cardBack = document.createElement('div');
    cardBack.className = 'card-face card-back';
    cardBack.style.backgroundImage = `url('images/backs/${group}/${value}.png')`;

    card.appendChild(cardFront);
    card.appendChild(cardBack);
    cardContainer.appendChild(card);
    container.appendChild(cardContainer);
}

function filterCards(group) {
    deckElement.innerHTML = '';

    if (group === 'geral') {
        Object.keys(groups).forEach(grp => {
            if (grp !== 'meuBaralho') {
                for (let i = 1; i <= groups[grp]; i++) {
                    createCard(`carta${i}`, grp, deckElement);
                }
            }
        });
    } else if (group === 'meuBaralho' && currentProfile) {
        const myDeck = loadDeckForProfile(currentProfile);
        myDeck.forEach(cardId => {
            const [value, cardGroup] = cardId.split('_');
            createCard(value, cardGroup, deckElement);
        });
    } else {
        const totalCards = groups[group] || 0;
        for (let i = 1; i <= totalCards; i++) {
            createCard(`carta${i}`, group, deckElement);
        }
    }
}

function showCardInFullScreen(cardId) {
    currentCardId = cardId;
    const [value, group] = cardId.split('_');

    cardDisplay.innerHTML = '';
    const cardFront = document.createElement('div');
    cardFront.className = 'card-face card-front';
    cardFront.style.backgroundImage = `url('images/fronts/${group}/${value}.png')`;

    const cardBack = document.createElement('div');
    cardBack.className = 'card-face card-back';
    cardBack.style.backgroundImage = `url('images/backs/${group}/${value}.png')`;

    cardDisplay.appendChild(cardFront);
    cardDisplay.appendChild(cardBack);

    cardDisplay.classList.remove('flipped');
    fullScreenCard.classList.remove('hidden');

    updateButtonVisibility(cardId);
}

function updateButtonVisibility(cardId) {
    if (currentProfile) {
        const myDeck = loadDeckForProfile(currentProfile);
        if (myDeck.includes(cardId)) {
            addToMyDeckButton.classList.add('hidden');
            removeFromMyDeckButton.classList.remove('hidden');
        } else {
            addToMyDeckButton.classList.remove('hidden');
            removeFromMyDeckButton.classList.add('hidden');
        }
    }
}

flipButton.addEventListener('click', () => {
    cardDisplay.classList.toggle('flipped');
});

addToMyDeckButton.addEventListener('click', () => {
    if (currentCardId && currentProfile) {
        const cardId = currentCardId;
        const myDeck = loadDeckForProfile(currentProfile);

        if (!myDeck.includes(cardId)) {
            myDeck.push(cardId);
            saveDeckForProfile(currentProfile, myDeck);
        }

        if (currentGroup === 'meuBaralho') {
            createCard(...cardId.split('_'), deckElement);
        }

        fullScreenCard.classList.add('hidden');
    }
});

removeFromMyDeckButton.addEventListener('click', () => {
    if (currentCardId && currentProfile) {
        const cardId = currentCardId;
        let myDeck = loadDeckForProfile(currentProfile);

        const index = myDeck.indexOf(cardId);
        if (index > -1) {
            myDeck.splice(index, 1);
            saveDeckForProfile(currentProfile, myDeck);

            const cardToRemove = deckElement.querySelector(`[data-id="${cardId}"]`);
            if (cardToRemove) {
                deckElement.removeChild(cardToRemove);
            }
        }

        fullScreenCard.classList.add('hidden');
    }
});

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        currentGroup = button.getAttribute('data-group');
        filterCards(currentGroup);
    });
});

fullScreenCard.addEventListener('click', (e) => {
    if (e.target === fullScreenCard) {
        fullScreenCard.classList.add('hidden');
    }
});

function saveDeckForProfile(username, deck) {
    localStorage.setItem(`deck_${username}`, JSON.stringify(deck));
}

function loadDeckForProfile(username) {
    const savedDeck = localStorage.getItem(`deck_${username}`);
    return savedDeck ? JSON.parse(savedDeck) : [];
}

function populateProfileSelector() {
    profileSelector.innerHTML = '';
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('deck_')) {
            const username = key.substring(5);
            const option = document.createElement('option');
            option.value = username;
            option.textContent = username;
            profileSelector.appendChild(option);
        }
    });
    updateSelectedProfile(currentProfile);
}

function updateSelectedProfile(profile) {
    selectedProfileElement.textContent = profile ? `Perfil Selecionado: ${profile}` : 'Perfil Selecionado: Nenhum';
}

createProfileButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username && !localStorage.getItem(`deck_${username}`)) {
        saveDeckForProfile(username, []);
        populateProfileSelector();
        usernameInput.value = '';
        currentProfile = username;
        updateSelectedProfile(username);
    }
});

loadProfileButton.addEventListener('click', () => {
    const username = profileSelector.value;
    if (username) {
        currentProfile = username;
        updateSelectedProfile(username);
        createDeck();
        currentGroup = 'geral';
        filterCards('meuBaralho');
    }
});

createDeck();
