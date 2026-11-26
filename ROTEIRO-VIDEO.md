# Roteiro do vídeo (até 3 minutos)

Grave a tela do VS Code com o terminal aberto. Dá para gravar no Windows com **Win + Alt + R** (Xbox Game Bar) ou com o Clipchamp.

**0:00 a 0:30 · O que é**
"Oi, sou a Lara. Fiz a atividade de serverless com o Origem, o marketplace de artesanato do nosso PI. A função recebe um pedido e devolve a guia de envio: serviço, valor do frete, prazo e código de rastreio. Usei o Google Cloud Functions, rodando aqui no meu computador com o emulador do Google, o Functions Framework."

**0:30 a 1:00 · O código** (abrir `src/guia.js` e `src/handler.js`)
"A regra fica no `guia.js`: valida CEP, UF, peso e medidas, pega o valor e o prazo da mesma tabela de frete do Origem e gera o código de rastreio a partir do número do pedido. O `handler.js` só cuida do HTTP: aceita POST e devolve 200, 400 ou 405. A função não guarda nada, por isso o provedor pode criar e desligar instâncias quando quiser."

**1:00 a 1:20 · Testes** (rodar `npm test`)
"São 7 testes, todos passando."

**1:20 a 2:40 · Funcionando** (terminal 1: `npm start`; terminal 2: `npm run chamar`)
"Subo a função no emulador, na porta 8080. Agora chamo a função: um pedido válido para São Paulo no expresso volta 200 com a guia, R$ 34,90, 2 a 3 dias úteis. CEP errado volta 400. Opção de envio que não existe volta 400. E um GET volta 405, porque a função só aceita POST."

**2:40 a 3:00 · Fechamento**
"O mesmo código pode ir para a nuvem com `gcloud functions deploy`; publicar era opcional. O link do repositório e as evidências estão no README. Obrigada!"
