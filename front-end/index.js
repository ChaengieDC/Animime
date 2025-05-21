// JS du SITE
/* ------- */

document.querySelector("#navbar img").addEventListener("click", () =>{
    location.reload();
});

/* Formulaire de génération */
document.querySelector("form").addEventListener("submit", async (event) =>{
    event.preventDefault(); // Empêche la soumission par défaut du formulaire

    const selectedMode = document.querySelector(`input[name="mode"]:checked`).value;
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
            console.log(data);
        })
        .catch(error =>{
            console.error(`Une erreur est survenue lors de la génération des animes: ${error}`);
        });
});