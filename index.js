const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3030;

const client_id = 'CLIENT_ID';         // Colocar o ClientId configurado no Partner's Portal
const client_secret = 'CLIENT_SECRET'; // Colocar o ClientSecret configurado no Partner's Portal
const env = 'ENVIRONMENT';             // Trocar para o ambiente de teste (trunk, stg)

const APPROVED = true;   // Trocar para false para testar o fluxo de rejeição

let access_token = "";

async function executeLogin() {
    const tokenUrl = `https://${env}.api.mercadoe.com/v1/auth/tokens`;    

    const loginData = {
        clientId: client_id,
        clientSecret: client_secret,
      };
    
    const headers = { 'Content-Type': 'application/json'};

    let executeLogin = false;

    console.log("Efetuando Login...")

    await axios
      .post(tokenUrl, loginData, headers)
      .then((response) => {
        console.log("Login efetuado com sucesso!")
        access_token = `Bearer ${response.data.accessToken}`;
        executeLogin = true;
      })
      .catch((error) => {
        console.error('Não foi possível fazer o login:', error.message);
        console.log(error.response.data);
      });

    return executeLogin;
}

function getPreRequest(preRequestId) {

    executeLogin()
        .then(response => {
            if (!response) return
            console.log('Buscando PreRequest ' + preRequestId);

            const getPreRequestUrl = `https://${env}.api.mercadoe.com/v1/requests/pre-requests/${preRequestId}`;

            axios.defaults.headers.common['Authorization'] = access_token;
        
            axios
                .get(getPreRequestUrl)
                .then((response) => {
                console.log('Resposta da API:', response.data);
                
                if (APPROVED) {
                    approvePreRequest(preRequestId);
                } else {
                    rejectPreRequest(preRequestId);
                }
                })
                .catch((error) => {
                    console.error('Erro ao buscar a requisição:', error.message);
                    console.log(error.response.data);
                });                 
        });
}

async function approvePreRequest(preRequestId) {

    executeLogin()
        .then(response => {
            if (!response) return;

            const approvePreRequestUrl = `https://${env}.api.mercadoe.com/v1/requests/pre-requests/${preRequestId}/approve`;

            const headers = { 'Content-Length': 0 };
        
            axios
              .post(approvePreRequestUrl, {}, headers)
              .then((response) => {;
                console.log('Requisição aprovada: ', response.data);
                access_token = `Bearer ${response.data.accessToken}`;
        
                axios.defaults.headers.common['Authorization'] = access_token;
              })
              .catch((error) => {
                console.error('Erro ao aprovar a requisição:', error.message);
                console.log(error.response.data);
              });   
        
        });
}

async function rejectPreRequest(preRequestId) {

    executeLogin()
        .then(response => {
            if (!response) return;

            const rejectPreRequestUrl = `https://${env}.api.mercadoe.com/v1/requests/pre-requests/${preRequestId}/reject`;

            const headers = { 'Content-Type': 'application/json'};
        
            axios.defaults.headers.common['Authorization'] = access_token;
        
            const rejectData = {
                items: [
                  {
                    costObjects: [
                      {
                        wbsElement: "Valor do item 1 ultrapassa o orçamento para o projeto.",
                        costCenter: "Centro de Custos 1 inválido",
                        index: 1
                      }
                    ],
                    itemNumber: 1
                  }
                ]
              }
        
            axios
              .post(rejectPreRequestUrl, rejectData, headers)
              .then((response) => {
                console.log('Requisição recusada: ', response.data);
                access_token = `Bearer ${response.data.accessToken}`;
        
                axios.defaults.headers.common['Authorization'] = access_token;
              })
              .catch((error) => {
                console.error('Erro ao recusar a requisição: ', error.message);
                console.log(error.response.data);
              });
        });
    
}

// Middleware para permitir o uso de JSON no corpo das requisições
app.use(express.json());

app.get('/api/status', (req, res) => {
    res.send('Ok');
});

app.get('/loginData', (req, res) => {
    res.send(access_token);
});

// Endpoint para receber informações em JSON
app.post('/api/json', (req, res) => {
    const data = req.body; // O corpo da requisição contém o JSON enviado
    console.log('Informação recebida:', data);
    res.json({ message: 'Informação recebida com sucesso!', receivedData: data });

    getPreRequest(data.data.preRequestId);
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
