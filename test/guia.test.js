const { test } = require("node:test");
const assert = require("node:assert/strict");
const { gerarGuia, codigoRastreio } = require("../src/guia");
const { guiaEnvio } = require("../src/handler");
const pedidoValido = require("../exemplos/pedido-valido.json");

// Imita o objeto de resposta do Express usado pelo Functions Framework.
function respostaFalsa() {
  const res = { statusCode: 200, headers: {}, corpo: undefined };
  res.status = (s) => ((res.statusCode = s), res);
  res.json = (c) => ((res.corpo = c), res);
  res.set = (k, v) => ((res.headers[k] = v), res);
  return res;
}

test("gera a guia com o valor e o prazo do Origem Expresso", () => {
  const { guia } = gerarGuia(pedidoValido, new Date("2026-11-21T12:00:00Z"));
  assert.equal(guia.numero, "GE-ped_1042");
  assert.equal(guia.valorFrete, 34.9);
  assert.equal(guia.servico.prazo, "2 a 3 dias úteis");
  assert.equal(guia.destinatario.cep, "01310-100");
  assert.equal(guia.destinatario.regiao, "Sudeste");
  assert.equal(guia.volume.pesoCubadoKg, 1.5);
  assert.match(guia.codigoRastreio, /^OR\d{9}BR$/);
});

test("sem opção de envio, usa o Origem Econômico", () => {
  const { guia } = gerarGuia({ ...pedidoValido, opcaoEnvioId: undefined });
  assert.equal(guia.servico.id, "economico");
  assert.equal(guia.valorFrete, 18);
});

test("o mesmo pedido gera sempre o mesmo código de rastreio", () => {
  assert.equal(codigoRastreio("ped_1042"), codigoRastreio("ped_1042"));
  assert.notEqual(codigoRastreio("ped_1042"), codigoRastreio("ped_1043"));
});

test("CEP inválido responde 400", () => {
  const res = respostaFalsa();
  guiaEnvio({ method: "POST", body: require("../exemplos/pedido-cep-invalido.json") }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.corpo.erro, "CEP inválido.");
});

test("opção de envio inexistente responde 400", () => {
  const res = respostaFalsa();
  guiaEnvio({ method: "POST", body: require("../exemplos/pedido-opcao-indisponivel.json") }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.corpo.erro, "Opção de envio indisponível.");
});

test("corpo vazio responde 400", () => {
  const res = respostaFalsa();
  guiaEnvio({ method: "POST", body: undefined }, res);
  assert.equal(res.statusCode, 400);
});

test("GET responde 405", () => {
  const res = respostaFalsa();
  guiaEnvio({ method: "GET" }, res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.Allow, "POST");
});
