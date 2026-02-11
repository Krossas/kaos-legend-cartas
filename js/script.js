// Estado de la aplicación
let allCards = [];
let filteredCards = [];

// Elementos del DOM
const filterNameInput = document.getElementById('filterName');
const filterFactionSelect = document.getElementById('filterFaction');
const sortBySelect = document.getElementById('sortBy');
const cardsContainer = document.getElementById('cardsContainer');
const resultCountSpan = document.getElementById('resultCount');

// Modales
const cardModal = document.getElementById('cardModal');
const cardModalClose = document.getElementById('cardModalClose');
const cardModalImage = document.getElementById('cardModalImage');
const cardModalTitle = document.getElementById('cardModalTitle');

const imageModal = document.getElementById('imageModal');
const imageModalClose = document.getElementById('imageModalClose');
const imageModalImg = document.getElementById('imageModalImg');

// Navegación
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page-section');

// Función para normalizar texto (eliminar tildes y convertir a minúsculas)
function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

// ==================== NAVEGACIÓN ====================
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageName = link.getAttribute('data-page');
        
        // Actualizar links activos
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Mostrar página
        pages.forEach(page => page.classList.remove('active'));
        document.getElementById(`${pageName}-page`).classList.add('active');
    });
});

// ==================== MODALES DE CARTAS ====================
function openCardModal(card) {
    cardModalImage.src = card.image;
    cardModalTitle.textContent = card.nombre;
    cardModal.classList.add('active');
}

function closeCardModal() {
    cardModal.classList.remove('active');
}

cardModalClose.addEventListener('click', closeCardModal);
cardModal.addEventListener('click', (e) => {
    if (e.target === cardModal) {
        closeCardModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cardModal.classList.contains('active')) {
        closeCardModal();
    }
});

// ==================== MODALES DE IMAGEN ====================
function openImageModal(imageSrc) {
    imageModalImg.src = imageSrc;
    imageModal.classList.add('active');
}

function closeImageModal() {
    imageModal.classList.remove('active');
}

imageModalClose.addEventListener('click', closeImageModal);
imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) {
        closeImageModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && imageModal.classList.contains('active')) {
        closeImageModal();
    }
});

// Event listeners para imágenes de la página Sobre
document.addEventListener('DOMContentLoaded', () => {
    const diceImage = document.getElementById('diceImage');
    const rulesImage = document.getElementById('rulesImage');
    
    if (diceImage) {
        diceImage.addEventListener('click', () => {
            openImageModal(diceImage.src);
        });
    }
    
    if (rulesImage) {
        rulesImage.addEventListener('click', () => {
            openImageModal(rulesImage.src);
        });
    }
});

// ==================== CARTAS ====================

// Cargar datos del JSON
async function loadCards() {
    try {
        const response = await fetch('data/cards.json');
        if (!response.ok) throw new Error('No se pudo cargar el archivo');
        allCards = await response.json();
        
        // Inicializar la aplicación
        populateFactionFilter();
        applyFiltersAndSort();
    } catch (error) {
        console.error('Error cargando cartas:', error);
        cardsContainer.innerHTML = '<div class="alert alert-danger">Error al cargar las cartas. Verifica la ruta del archivo JSON.</div>';
    }
}

// Llenar el selector de facciones
function populateFactionFilter() {
    const factions = [...new Set(allCards.map(card => card.grupo))];
    
    factions.forEach(faction => {
        const option = document.createElement('option');
        option.value = faction;
        option.textContent = faction;
        filterFactionSelect.appendChild(option);
    });
}

// Aplicar filtros
function applyFilters() {
    const nameFilter = normalizeText(filterNameInput.value);
    const factionFilter = filterFactionSelect.value;

    filteredCards = allCards.filter(card => {
        const matchesName = nameFilter === '' || 
            normalizeText(card.nombre).includes(nameFilter);
        
        const matchesFaction = factionFilter === '' || 
            card.grupo === factionFilter;

        return matchesName && matchesFaction;
    });
}

// Aplicar ordenamiento
function applySort() {
    const sortOption = sortBySelect.value;

    const sortFunctions = {
        'numero': (a, b) => a.numero - b.numero,
        'nombre': (a, b) => a.nombre.localeCompare(b.nombre, 'es'),
        'furia': (a, b) => b.stats.furia - a.stats.furia,
        'magia': (a, b) => b.stats.magia - a.stats.magia,
        'armas': (a, b) => b.stats.armas - a.stats.armas,
        'fuerza': (a, b) => b.stats.fuerza - a.stats.fuerza
    };

    if (sortFunctions[sortOption]) {
        filteredCards.sort(sortFunctions[sortOption]);
    }
}

// Agrupar cartas por facción
function groupCardsByFaction() {
    const grouped = {};
    
    filteredCards.forEach(card => {
        if (!grouped[card.grupo]) {
            grouped[card.grupo] = [];
        }
        grouped[card.grupo].push(card);
    });

    return grouped;
}

// Crear elemento de carta
function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card-item';
    
    cardDiv.innerHTML = `
        <img src="${card.image}" alt="${card.nombre}" class="card-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22220%22 height=%22290%22 viewBox=%220 0 220 290%22%3E%3Crect fill=%22%23252525%22 width=%22220%22 height=%22290%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2216%22 fill=%22%23999%22%3EImagen no disponible%3C/text%3E%3C/svg%3E'">
        <div class="card-body">
            <div class="card-title">${card.nombre}</div>
            <div class="card-faction">${card.grupo}</div>
            <div class="card-number">Carta #${card.numero}</div>
            <div class="card-stats">
                <div class="stat">
                    <span class="stat-label">Furia</span>
                    <span class="stat-value">${(card.stats.furia / 1000).toFixed(0)}k</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Magia</span>
                    <span class="stat-value">${card.stats.magia}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Armas</span>
                    <span class="stat-value">${(card.stats.armas / 1000).toFixed(0)}k</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Fuerza</span>
                    <span class="stat-value">${(card.stats.fuerza / 1000).toFixed(0)}k</span>
                </div>
            </div>
        </div>
    `;
    
    // Agregar evento de click para abrir modal
    cardDiv.addEventListener('click', () => {
        openCardModal(card);
    });
    
    return cardDiv;
}

// Renderizar cartas
function renderCards() {
    cardsContainer.innerHTML = '';
    
    if (filteredCards.length === 0) {
        cardsContainer.innerHTML = `
            <div class="cards-grid">
                <div class="no-results">
                    <p>No se encontraron cartas con los filtros seleccionados.</p>
                </div>
            </div>
        `;
        resultCountSpan.textContent = 'No hay resultados';
        return;
    }

    const grouped = groupCardsByFaction();
    
    // Ordenar las facciones en el orden original del JSON
    const factionOrder = [...new Set(allCards.map(c => c.grupo))];
    
    factionOrder.forEach(faction => {
        if (grouped[faction]) {
            const factionSection = document.createElement('div');
            factionSection.className = 'faction-section';
            
            const header = document.createElement('div');
            header.className = 'faction-header';
            header.innerHTML = `<h2>${faction}</h2>`;
            
            const grid = document.createElement('div');
            grid.className = 'cards-grid';
            
            grouped[faction].forEach(card => {
                grid.appendChild(createCardElement(card));
            });
            
            factionSection.appendChild(header);
            factionSection.appendChild(grid);
            cardsContainer.appendChild(factionSection);
        }
    });

    // Actualizar contador
    resultCountSpan.textContent = `${filteredCards.length} carta${filteredCards.length !== 1 ? 's' : ''} encontrada${filteredCards.length !== 1 ? 's' : ''}`;
}

// Función principal para aplicar filtros y ordenamiento
function applyFiltersAndSort() {
    applyFilters();
    applySort();
    renderCards();
}

// Event listeners
filterNameInput.addEventListener('input', applyFiltersAndSort);
filterFactionSelect.addEventListener('change', applyFiltersAndSort);
sortBySelect.addEventListener('change', applyFiltersAndSort);

// Inicializar cuando carga la página
document.addEventListener('DOMContentLoaded', loadCards);