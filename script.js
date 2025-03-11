function parseMana(str) {
    return str.split(/\s*({\w*})\s*/g).filter(Boolean);
}
const grid = document.querySelector(".grid");
console.log("Grid container:", grid); // Devrait afficher l'élément DOM dans la console
if (!grid) {
    console.error("L'élément '.grid' n'a pas été trouvé dans le DOM.");
}
async function afficherCartes() {
    const grid = document.querySelector(".grid");
    const template = document.querySelector("#card-template");
    let url = "https://api.scryfall.com/cards/search?q=e:ltr+lang:fr&format=json&order=set&unique=prints";
    const cartes = [];

    try {
        while (url) {
            console.log(`Fetching: ${url}`); // Log pour suivre les appels API
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            cartes.push(...data.data);
            url = data.has_more ? data.next_page : null;
        }

        console.log(`Total de cartes : ${cartes.length}`);

        const symbols = await getSymbols(); // Récupération des symboles de mana
        console.log("Symboles récupérés :", symbols);

        // Affichage des cartes
        cartes.forEach(carte => {
            const clone = template.content.cloneNode(true);
            const img = clone.querySelector(".card-img");
            const p = clone.querySelector("p");
            const manaContainer = clone.querySelector(".mana-cost");

            if (!manaContainer) {
                console.error("Élément '.mana-cost' introuvable dans le template.");
                return;
            }

            img.src = carte.image_uris?.normal || "";
            p.textContent = carte.printed_name || "Nom non disponible";

            const manaCosts = parseMana(carte.mana_cost || "");
            manaCosts.forEach(symbol => {
                const manaImg = document.createElement("img");
                manaImg.src = symbols[symbol] || "";
                manaImg.classList.add("mana");
                manaContainer.appendChild(manaImg);
            });

            grid.appendChild(clone);
        });

    } catch (error) {
        console.error("Erreur lors de l'affichage des cartes :", error);
    }
}

// Fonction pour récupérer les symboles de mana
async function getSymbols() {
    const response = await fetch("https://api.scryfall.com/symbology");
    const data = await response.json();
    const symbols = {};
    data.data.forEach(symbol => {
        symbols[symbol.symbol] = symbol.svg_uri;
    });
    return symbols;
}
document.addEventListener("DOMContentLoaded", () => {
    afficherCartes();
});
// Charger les cartes au chargement de la page
window.onload = afficherCartes;
