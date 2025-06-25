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
            } else{
                console.log(data);
            }
        })
        .catch(error =>{
            console.error(`Une erreur est survenue lors de la génération des animes: ${error}`);
        });
});