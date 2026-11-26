// Faz as 4 chamadas de evidência contra a função rodando no emulador.
// Uso: com a função rodando (npm start), abra outro terminal e rode: npm run chamar
const fs = require("node:fs");
const path = require("node:path");

const URL_FUNCAO = process.env.URL_FUNCAO || "http://localhost:8080";
const exemplo = (nome) => fs.readFileSync(path.join(__dirname, "..", "exemplos", nome), "utf8");

const casos = [
  { titulo: "1. Pedido válido (expresso para SP)", method: "POST", body: exemplo("pedido-valido.json") },
  { titulo: "2. CEP inválido", method: "POST", body: exemplo("pedido-cep-invalido.json") },
  { titulo: "3. Opção de envio que não existe", method: "POST", body: exemplo("pedido-opcao-indisponivel.json") },
  { titulo: "4. Método errado (GET)", method: "GET" },
];

(async () => {
  for (const caso of casos) {
    const resposta = await fetch(URL_FUNCAO, {
      method: caso.method,
      headers: caso.body ? { "Content-Type": "application/json" } : {},
      body: caso.body,
    });
    console.log(`\n=== ${caso.titulo} ===`);
    console.log(`${caso.method} ${URL_FUNCAO} -> HTTP ${resposta.status}`);
    console.log(JSON.stringify(await resposta.json(), null, 2));
  }
})().catch((erro) => {
  console.error("Não consegui chamar a função. Ela está rodando? (npm start)\n", erro.message);
  process.exit(1);
});
