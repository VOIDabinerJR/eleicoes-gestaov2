const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const secretKey = process.env.SECRET_KEY || 'chave_secreta_teste'; // Teste

// Configuração do usuário
const user = { id: 1, username: 'mamau' };

// Armazenamento em memória para tokens
const tokenStore = {};

// Função para criar um token com limite de 20 usos
async function createToken() {
    try {
        const jti = uuidv4(); // ID único para o token
        const payload = { user, jti, usages: 1200000 };
        const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

        // Armazena no armazenamento em memória com contagem de usos
        tokenStore[jti] = { usages: 1200000, expiresAt: Date.now() + 3600 * 1000 }; // 1 hora em milissegundos

        console.log("Token criado:", token);
        return token; 
    } catch (err) {
        console.error('Erro ao criar o token:', err); 
        throw err;
    }
}


  

// Função para decodificar e validar o token, e verificar o número de usos
async function decodeToken(token) {
    return new Promise((resolve, reject) => {
        // Verifica o token
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return reject('err');
            }

            const jti = decoded.jti;

            // Verifica o número de usos no armazenamento em memória
            const tokenData = tokenStore[jti];

            if (!tokenData || tokenData.usages <= 0 || tokenData.expiresAt < Date.now()) {
                return reject('err');
            }

            // Decrementa o contador de usos
            tokenData.usages -= 1;
            if (tokenData.usages <= 0) {
                delete tokenStore[jti]; // Remove o token se não houver mais usos
            } else {
                tokenStore[jti] = tokenData; // Atualiza o contador de usos
            }

            resolve(decoded); // Retorna o conteúdo do token
        });
    });
}


// Criando um token para testes
createToken().then(async (token) => {
    
    // Tentando decodificar o token várias vezes
    for (let i = 0; i < 1; i++) {
        try {
            let decoded = await decodeToken(token);
            console.log(`Tentativa ${i + 1}:`, decoded);
        } catch (err) {
            console.error(`Tentativa ${i + 1} falhou:`, err);
            break; // Interrompe o loop se o token for inválido ou expirado
        }
    }
}).catch((err) => {
    console.error('Erro ao criar o token:', err);
});
// Exemplo de exportação das funções
module.exports = {
    createToken,
    decodeToken
};
