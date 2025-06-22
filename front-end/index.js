// JS du SITE
/* ------- */

document.querySelector("#navbar img").addEventListener("click", () =>{
    location.reload();
});

// Toggle pour sélectionner un genre
const toggle = document.querySelector(".genre-toggle");
const options = document.querySelector(".genre-options");
const hiddenInput = document.querySelector("#genre");

let isOpen = false;

toggle.addEventListener("click", () =>{
	// On inverse l'état du toggle (ouvert / fermé)
	isOpen = !isOpen;

	options.style.display = isOpen ? "flex" : "none";
});
options.querySelectorAll("button").forEach(button =>{
	button.addEventListener("click", () =>{
		const value = button.getAttribute("data-value");
		toggle.querySelector(".genre-label").textContent = value || "Any";
		hiddenInput.value = value;

		options.style.display = "none";
		isOpen = false;
	});
});

// Formulaire de génération
document.querySelector("form").addEventListener("submit", async (event) =>{
    event.preventDefault(); // Empêche la soumission par défaut du formulaire

    const selectedMode = document.querySelector(`input[name="mode"]:checked`)?.value || "";
    const inputValue = document.querySelector("#username").value;

    const checkedStatusInputs = document.querySelectorAll(`input[name="list"]:checked`);
    const selectedStatuses = Array.from(checkedStatusInputs).map(cb => cb.value);

    fetch("/getListOfRandomAnimes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode: selectedMode, username: inputValue, statuses: selectedStatuses })
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