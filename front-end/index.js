// JS du SITE
/* ------- */

document.querySelector("#navbar img").addEventListener("click", () =>{
    location.reload();
});

// Toggle pour sélectionner un genre
document.addEventListener("DOMContentLoaded", () =>{
    const mode = document.querySelectorAll(`input[name="mode"]`);
    const genreToggle = document.querySelector(".genre-toggle");
    const genreLabel = genreToggle.querySelector(".genre-label");
    const genreOptions = document.querySelector(".genre-options");
    const genreInput = document.querySelector("#genre");

    let isOpen = false;

    function updateToggleState(){
        const selectedMode = document.querySelector(`input[name="mode"]:checked`)?.value;
        const isCharactersMode = selectedMode === "2";

        genreToggle.classList.toggle("disabled", isCharactersMode);
        genreToggle.style.pointerEvents = isCharactersMode ? "none" : "auto";
        genreToggle.style.opacity = isCharactersMode ? "0.7" : "1";

        if(isCharactersMode){
            genreLabel.textContent = "Any";
            genreInput.value = "";

            // Fermer le menu déroulant si ouvert
            genreOptions.style.display = "none";
            isOpen = false;
        }
    }
    // Changement de mode
    mode.forEach(radio =>{
        radio.addEventListener("change", updateToggleState);
    });

    // Toggle du menu déroulant
    genreToggle.addEventListener("click", () =>{
        if(genreToggle.classList.contains("disabled")){
            return;
        }

        // On inverse l'état du toggle (ouvert / fermé)
        isOpen = !isOpen;

        genreOptions.style.display = isOpen ? "flex" : "none";
    });
    // Sélection d'une option de genre
    genreOptions.querySelectorAll("button").forEach(button =>{
        button.addEventListener("click", () =>{
            const value = button.getAttribute("data-value");
            genreLabel.textContent = value || "Any";
            genreInput.value = value;

            // Fermer le menu déroulant si ouvert
            genreOptions.style.display = "none";
            isOpen = false;
        });
    });

    // Initialisation
    updateToggleState();
});

// Formulaire de génération
let resultsList = [];
let currentIndex = 0;

document.querySelector("form").addEventListener("submit", async (event) =>{
    event.preventDefault(); // Empêche la soumission par défaut du formulaire

    const selectedMode = document.querySelector(`input[name="mode"]:checked`)?.value || "";
    const genreValue = document.querySelector("#genre").value;
    const inputValue = document.querySelector("#username").value;

    const checkedStatusInputs = document.querySelectorAll(`input[name="list"]:checked`);
    const selectedStatuses = Array.from(checkedStatusInputs).map(cb => cb.value);

    fetch("/getListOfRandomAnimes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode: selectedMode, genre: genreValue, username: inputValue, statuses: selectedStatuses })
        })
        .then(response =>{
            return response.json();
        })
        .then(data =>{
            if(data.success === false){
                document.querySelector("#error").style.display = "block";
                return;
            }

            resultsList = data;
            currentIndex = 0;
            const modeValue = document.querySelector(`input[name="mode"]:checked`)?.value;

            document.body.classList.add("results-page");
            document.querySelector("#navbar").classList.add("results-page");

            // Cacher tout sauf la navbar et les résultats
            document.querySelectorAll("body > *:not(#navbar)").forEach(el =>{
                if(!el.classList.contains("results")){
                    el.style.display = "none";
                }
            });

            displayResult(resultsList[currentIndex], modeValue);

            document.querySelector(".results").style.display = "flex";
        })
        .catch(error =>{
            console.error(`Une erreur est survenue lors de la génération des animes: ${error}`);
        });
});

function displayResult(result, modeValue){
    const img = document.querySelector(".results img");
    const mainTitle = document.querySelector(".main-title");
    const subtitle = document.querySelector(".subtitle");

    if(modeValue === "1"){
        // Mode anime
        img.src = result.coverImage?.large || "";
        img.alt = result.title?.romaji;
        img.width = "230";
        img.height = "345";

        mainTitle.textContent = result.title?.romaji.toUpperCase();
        subtitle.textContent = result.title?.english;
    } else if(modeValue === "2"){
        // Mode personnage
        img.src = result.image?.large || "";
        img.alt = result.name?.full;
        img.width = "230";
        img.height = "345";

        mainTitle.textContent = result.name?.full.toUpperCase();
    }
}

// Bouton pour afficher le résultat suivant
document.querySelector(".next-btn").addEventListener("click", () =>{
    if(!resultsList.length){
        return;
    }

    currentIndex = (currentIndex + 1) % resultsList.length;
    const modeValue = document.querySelector(`input[name="mode"]:checked`)?.value;

    displayResult(resultsList[currentIndex], modeValue);
});