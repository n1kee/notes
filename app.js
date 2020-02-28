var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
const port = 8000;

app.set('views', path.join(__dirname, 'pages'));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;

let notes = require('./notes.js');

app.get('/', (req,res) => res.sendFile(__dirname + '/index.html'));

app.get('/notes', (req, res) => res.status(200).json( notes ));

app.post('/notes', (req, res) => {
    const newNote = req.body;
    newNote.id = + new Date();
    notes.push( newNote );
    res.status(200).send();
});

app.put('/notes/:id', (req, res) => {
    const noteIdx = notes.findIndex(note => note.id === parseInt(req.params.id));
    console.log("EDIT NOTE", req.body);
    notes[ noteIdx ] = req.body;
    res.status(200).send();
});

app.delete('/notes/:id', (req, res) => {
    notes = notes.filter(note => note.id !== parseInt(req.params.id));
    res.status(200).send();
});

app.listen(port, () => console.log(`Aapp listening on port ${port}!`))
