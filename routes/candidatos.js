const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { createToken, decodeToken } = require('../config/tokens');
require('dotenv').config();
let decoded =null;

    
// Exibir candidatos
router.get('/',async (req, res) => {
    const { token,p,d,l } = req.query;
   
    const queryParams = '?token='+ token +'&p='+p+'&l='+l+'&d='+d;
   
    db.query('SELECT * FROM candidatos', (err, rows) => {
        if (err) throw err;
        
            res.render('candidatos/main', { candidatos: rows });
        
    }); 
});

module.exports = router;
