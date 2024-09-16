const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { createToken, decodeToken } = require('../config/tokens');
let decoded =null;

// Exibir localidades por distrito
router.get('/:distrito_id',async (req, res) => {
    const { distrito_id } = req.params;
    const { token,p,d,l } = req.query;
    const queryParams = '?token='+ token +'&p='+p+'&l='+l+'&d='+distrito_id;
    

    try {
      
        
   
        let totalVotos =0;
        const { mesa_id } = req.params;
      
    
        db.query('SELECT * FROM localidades where distrito_id = ?', [distrito_id], (err, mesas) => {
    
            
           
            if (err) throw err;
    
      
            db.query('SELECT * FROM votos WHERE distrito_id = ?', [distrito_id], (err, rows) => {
                if (err) throw err; 
        
               
                    // Cria um array de Promises para consultar os nomes dos candidatos
                    const nomePromises = rows.map(voto => {
                        return new Promise((resolve, reject) => {
                            db.query('SELECT nome FROM candidatos WHERE id = ?', [voto.candidato_id], (err, result) => {
                                if (err) return reject(err);
                                resolve({ ...voto, candidato_nome: result[0].nome });
                            });
                        });
                    });
                    Promise.all(nomePromises)
                        .then(votosComNomes => {
                            votosComNomes.forEach(candidato => {
                                const { quantidade_votos, id } = candidato;
                                if (id !== 'null' && id !== null) {
                                    totalVotos += parseInt(quantidade_votos, 10);
                                }
                            });
                            votosComNomes = votosComNomes.map(candidato => {
                                const { quantidade_votos } = candidato;
                                const percentagem = (quantidade_votos / totalVotos) * 100;
        
                                return {
                                    ...candidato,
                                    percentagem: percentagem.toFixed(2) // Limita a percentagem a 2 casas decimais
                                };
                            });// Aggregate votes
                            const aggregatedVotes = votosComNomes.reduce((acc, voto) => {
                                if (!acc[voto.candidato_nome]) {
                                    acc[voto.candidato_nome] = { ...voto };
                                } else {
                                    acc[voto.candidato_nome].quantidade_votos += voto.quantidade_votos;
                                    acc[voto.candidato_nome].percentagem = (acc[voto.candidato_nome].quantidade_votos / totalVotos) * 100; // Update percentage if needed
                                }
                                return acc;
                            }, {});
                            const aggregatedVotesArray = Object.values(aggregatedVotes);
                            console.log(mesas)
        
                          
                                res.render('localidades/main', { localidades: mesas, distrito_id, votos: aggregatedVotesArray, totalVotos, EleitoresRegistados: 20000, fotoUrl:''});
                            
                          //  res.render('votos/detalhes2', { votos: votosComNomes, totalVotos, fotoUrl, EleitoresRegistados: 20000 });
                        })
                        .catch(err => {
                            console.error('Erro ao recuperar nomes dos candidatos:', err);
                            res.status(500).send('Erro ao recuperar nomes dos candidatos');
                        });
                
            });
            
    
    
        });
    } catch (error) {
            console.log(error)
    }
});


module.exports = router;
