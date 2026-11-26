// Camada HTTP da função: recebe a requisição, chama a regra e devolve JSON.
const { gerarGuia, ErroValidacao } = require("./guia");

function guiaEnvio(req, res) {
  if (req.method !== "POST") {
    res.set("Allow", "POST");
    return res.status(405).json({ erro: "Use POST com o JSON do pedido." });
  }
  try {
    return res.status(200).json(gerarGuia(req.body));
  } catch (erro) {
    if (erro instanceof ErroValidacao) {
      return res.status(erro.status).json({ erro: erro.message });
    }
    console.error(erro);
    return res.status(500).json({ erro: "Erro interno ao gerar a guia." });
  }
}

module.exports = { guiaEnvio };
