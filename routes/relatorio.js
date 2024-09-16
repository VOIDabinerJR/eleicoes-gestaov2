const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { createToken, decodeToken } = require('../config/tokens');
let decoded =null;
// Relatório de votos por província
router.get('/provincia', (req, res) => {
      let provincias= {};
    let aggregatedVotesArray = {};
    const query = `
        SELECT provincias.nome AS provincia, SUM(votos.quantidade_votos) AS total_votos 
        FROM votos 
        JOIN mesas ON votos.mesa_id = mesas.id
        JOIN localidades ON mesas.localidade_id = localidades.id
        JOIN distritos ON localidades.distrito_id = distritos.id
        JOIN provincias ON distritos.provincia_id = provincias.id
        GROUP BY provincias.nome
    `;
    db.query(query, (err, rows) => {
        if (err) throw err;
        res.render('relatorio/provincia', { votos: rows });
    });
});

// Relatório de votos por distrito
router.get('/distrito/:provincia_id', (req, res) => {
    const { provincia_id } = req.params;
    const query = `
        SELECT distritos.nome AS distrito, SUM(votos.quantidade_votos) AS total_votos 
        FROM votos 
        JOIN mesas ON votos.mesa_id = mesas.id
        JOIN localidades ON mesas.localidade_id = localidades.id
        JOIN distritos ON localidades.distrito_id = distritos.id
        WHERE distritos.provincia_id = ?
        GROUP BY distritos.nome
    `;
    db.query(query, [provincia_id], (err, rows) => {
        if (err) throw err;
        res.render('relatorio/distrito', { votos: rows, provincia_id });
    });
}); 

// Relatório de votos por localidade
router.get('/localidade/:distrito_id', (req, res) => {
    const { distrito_id } = req.params;
    const query = `
        SELECT localidades.nome AS localidade, SUM(votos.quantidade_votos) AS total_votos 
        FROM votos 
        JOIN mesas ON votos.mesa_id = mesas.id
        JOIN localidades ON mesas.localidade_id = localidades.id
        WHERE localidades.distrito_id = ?
        GROUP BY localidades.nome
    `;
    db.query(query, [distrito_id], (err, rows) => {
        if (err) throw err;
        res.render('relatorio/localidade', { votos: rows, distrito_id });
    });
});

module.exports = router;
