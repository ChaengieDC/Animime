// SERVER.JS = Configuration du SERVEUR
/* --------------------------------- */

// Configuration du serveur Express
const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, '../front-end')));
app.use('/img', express.static(path.join(__dirname, '../data/img')));


// Requêtes de type POST
// Requête POST pour récupérer une liste d'animes ou personnages aléatoires
app.post('/getListOfRandomAnimes', async (req, res) => {
    try{
        const mode = req.body.mode;
        const username = req.body.username;
        const statuses = req.body.statuses;

        const statusesMap = {
            "1": "ALL",
            "2": "CURRENT",
            "3": "COMPLETED",
            "4": "PAUSED",
            "5": "DROPPED",
            "6": "PLANNING"
        };
        // Map les statuts en AniList MediaListStatus, sauf pour "ALL"
        let mappedStatuses = [];
        if(statuses.includes("1")){
            mappedStatuses = null;
        } else{
            mappedStatuses = statuses.map(s => statusesMap[s]).filter(Boolean);
        }
        if(username){
            const query = 
                `query($username: String, $status_in: [MediaListStatus]){
                    MediaListCollection(userName: $username, type: ANIME, status_in: $status_in){
                        lists{
                            entries{
                                media{
                                    id
                                    format
                                    title{
                                        romaji
                                        english
                                    }
                                    coverImage{
                                        large
                                    }
                                    characters(perPage: 25){
                                        nodes{
                                            id
                                            name{
                                                full
                                            }
                                            image{
                                                large
                                            }
                                            favourites
                                        }
                                    }
                                }
                            }
                        }
                    }
                }`;

            // Paramètres: Username + Status (si null = all)
            const variables = { username };
            if(mappedStatuses !== null){
                variables.status_in = mappedStatuses;
            }

            const response = await fetch("https://graphql.anilist.co", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, variables })
            });
            const json = await response.json();

            // On récupère tous les animes
            const entries = json.data.MediaListCollection.lists.flatMap(list => list.entries.map(entry => entry.media));

            // Et on filtre pour garder uniquement TV et MOVIE
            const filteredEntries = entries.filter(media => media.format === "TV" || media.format === "MOVIE");

            // Puis on randomize la liste
            const shuffledAnimes = filteredEntries.sort(() => Math.random() - 0.5);

            // Mode ANIMES
            if(mode === "1"){
                res.json(shuffledAnimes.slice(0, 100));
            // Mode CHARACTERS
            } else if(mode === "2"){
                let allCharacters = [];
                for(const media of shuffledAnimes){
                    const characters = media.characters?.nodes.filter(c => c.favourites > 20);
                    allCharacters.push(...characters);
                }

                const shuffledCharacters = allCharacters.sort(() => Math.random() - 0.5).slice(0, 100);
                res.json(shuffledCharacters);
            }
        } else{
            if(mode === "1"){
                // 5 pages aléatoires de 50 animes
                const pages = Array.from({ length: 5 }, () => Math.floor(Math.random() * 50 + 1));

                const queries = pages.map(p =>
                    `query{
                        Page(perPage: 50, page: ${p}){
                            media(type: ANIME, format_in: [TV, MOVIE], sort: POPULARITY_DESC){
                                id
                                format
                                title{
                                    romaji
                                    english
                                }
                                coverImage{
                                    large
                                }
                                popularity
                            }
                        }
                    }`
                );

                const responses = await Promise.all(queries.map(query =>
                    fetch("https://graphql.anilist.co", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ query })
                    })
                ));
                const jsons = await Promise.all(responses.map(r => r.json()));

                // Log des erreurs éventuelles
                jsons.forEach((j, i) =>{
                    if(j.errors){
                        console.warn(`Erreur sur la page ${pages[i]}:`, j.errors);
                    }
                });

                const animes = jsons
                    .filter(j => j?.data?.Page?.media)
                    .flatMap(j => j.data.Page.media)
                    .filter(a => a.popularity > 1000);

                const shuffledAnimes = animes.sort(() => Math.random() - 0.5).slice(0, 100);
                res.json(shuffledAnimes);

            } else if(mode === "2"){
                // 5 pages aléatoires de 50 personnages
                const pages = Array.from({ length: 5 }, () => Math.floor(Math.random() * 50 + 1));

                const queries = pages.map(p => 
                    `query{
                        Page(perPage: 50, page: ${p}){
                            characters(sort: FAVOURITES_DESC){
                                id
                                name{
                                    full
                                }
                                image{
                                    large
                                }
                                favourites
                            }
                        }
                    }`
                );

                const responses = await Promise.all(queries.map(query =>
                    fetch("https://graphql.anilist.co", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ query })
                    })
                ));
                const jsons = await Promise.all(responses.map(r => r.json()));

                // Log des erreurs éventuelles
                jsons.forEach((j, i) =>{
                    if(j.errors){
                        console.warn(`Erreur sur la page ${pages[i]}:`, j.errors);
                    }
                });

                const characters = jsons
                    .filter(j => j?.data?.Page?.characters)
                    .flatMap(j => j.data.Page.characters)
                    .filter(c => c.favourites > 100);

                const shuffledCharacters = characters.sort(() => Math.random() - 0.5).slice(0, 100);
                res.json(shuffledCharacters);
            }
        }
    } catch(error){
        console.error(error);
        res.status(500).send(`Erreur lors de la récupération des animes ou personnages: ${error}`);
    }
});


app.listen(3002, () =>{
    console.log("App is running...");
});