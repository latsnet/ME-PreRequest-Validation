# ME PreRequest Validation

## Instalando os programas necessários

1. Instalar o NodeJS para executar o projeto.

```
choco install nodejs.install
```

2. Instalar as dependências com npm.

```
npm install
```

3. Instalar o ngrok, que será usado para criar uma  URL pública do servidor local, necessário para acessar os endpoints da API no localhost.

```
choco install ngrok
```

4. Acessar o site do [Ngrok](https://ngrok.com), criar uma conta e configurar o ngrok na máquina local com as informações de autenticação geradas pelo site.

```
ngrok config add-authtoken <token gerado pelo site do ngrok>
```

5. Executar este projeto no localhost:

```
node index.js
```

Deverá aparecer uma mensagem "Servidor rodando na porta 3030".  Para testar, abra o navegador e acesse a url [http](http://localhost:3030/api/status).  Se tudo estiver correto, irá aparecer um "Ok".


## Configuração no Partner's Portal

1. Acessar o ["Partner's Portal"](https://trunk.partner.miisy.me/) do Mercado Eletrônico (ambiente de testes), usando o login do ME.  Caso não tenha acesso/permissão, contactar algum usuário administrador para configurar o usuário como desenvolvedor.

2. Configurar uma "API Key" e incluir as informações no arquivo *index.js*.

3. Configurar uma url pública no ngrok que irá apontar para o endereço local http://localhost:3030

```
ngrok http http://localhost:3030
```

Deverá aparecer uma janela de status com uma URL que deverá ser usada na configuração do Partner's Portal, dessa forma:

```
Forwarding                    https://7239-179-60-172-20.ngrok-free.app -> http://localhost:3030
```

No caso, a URL pública que deverá ser utilizada é a https://7239-179-60-172-20.ngrok-free.app.

4. Dentro do "Partner's Portal", deverá ser criado um Webhook que será usado para receber os eventos de criação de requisição síncrona.  No cabeçalho da página clique em "Webhooks", e depois em "Create New" no canto superior direito.  Na janela que abrir, escolha no campo "Topic" a opção "Pre-Request Submitted", em "Name" coloque um nome que identifique o endpoint (pode ser qualquer valor), e no campo "Callback URL" coloque a URL dinâmica gerada pelo ngrok, acrescentando no final a rota */api/json/* (por exemplo, https://7239-179-60-172-20.ngrok-free.app/api/json) e clique em "Save".

5. Para testar o funcionamento do evento, clique no botão "Send test".  Deverá aparecer no console que estiver rodando o node o log da execução do serviço.
