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


// Requêtes de type GET



// Requêtes de type POST



app.listen(3002, () =>{
    console.log("App is running...");
});