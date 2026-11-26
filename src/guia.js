// Regra de negócio da guia de envio do Origem.
// As tabelas de frete são as mesmas do backend do Origem
// (backend/app/src/lib/frete.ts no repositório Samara020/Projeto-Integrador-Origem).

const crypto = require("node:crypto");

const OPCOES_FRETE = [
  { id: "economico", nome: "Origem Econômico", prazo: "6 a 8 dias úteis", valor: 18, ativa: true },
  { id: "expresso", nome: "Origem Expresso", prazo: "2 a 3 dias úteis", valor: 34.9, ativa: true },
];

const REGIAO_POR_UF = {
  AC: "Norte", AM: "Norte", AP: "Norte", PA: "Norte", RO: "Norte", RR: "Norte", TO: "Norte",
  AL: "Nordeste", BA: "Nordeste", CE: "Nordeste", MA: "Nordeste", PB: "Nordeste",
  PE: "Nordeste", PI: "Nordeste", RN: "Nordeste", SE: "Nordeste",
  DF: "Centro-Oeste", GO: "Centro-Oeste", MS: "Centro-Oeste", MT: "Centro-Oeste",
  ES: "Sudeste", MG: "Sudeste", RJ: "Sudeste", SP: "Sudeste",
  PR: "Sul", RS: "Sul", SC: "Sul",
};

class ErroValidacao extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

const numeroPositivo = (v) => typeof v === "number" && Number.isFinite(v) && v > 0;

function validar(entrada) {
  const erros = [];
  if (!entrada || typeof entrada !== "object") {
    throw new ErroValidacao(400, "Envie um JSON com os dados do pedido.");
  }
  const { pedidoId, destinatario, pesoKg, dimensoes } = entrada;

  if (typeof pedidoId !== "string" || pedidoId.trim() === "") erros.push("pedidoId é obrigatório.");
  if (!destinatario || typeof destinatario !== "object") {
    erros.push("destinatario é obrigatório.");
  } else {
    if (typeof destinatario.nome !== "string" || destinatario.nome.trim() === "") erros.push("destinatario.nome é obrigatório.");
    if (typeof destinatario.cep !== "string" || !/^\d{5}-?\d{3}$/.test(destinatario.cep)) erros.push("CEP inválido.");
    if (typeof destinatario.uf !== "string" || !REGIAO_POR_UF[destinatario.uf.toUpperCase()]) erros.push("UF inválida.");
  }
  if (!numeroPositivo(pesoKg) || pesoKg > 1000) erros.push("pesoKg deve ser maior que 0 e no máximo 1000.");
  if (!dimensoes || !["altura", "largura", "profundidade"].every((k) => numeroPositivo(dimensoes[k]))) {
    erros.push("dimensoes precisa de altura, largura e profundidade (cm) maiores que 0.");
  }

  if (erros.length) throw new ErroValidacao(400, erros.join(" "));
}

function opcaoPorId(id) {
  const opcao = OPCOES_FRETE.find((item) => item.id === (id ?? "economico"));
  if (!opcao || !opcao.ativa) throw new ErroValidacao(400, "Opção de envio indisponível.");
  return opcao;
}

// Mesmo pedido gera sempre o mesmo código: se a função for chamada duas vezes
// (reenvio, retry do provedor), a guia não muda.
function codigoRastreio(pedidoId) {
  const hash = crypto.createHash("sha256").update(pedidoId).digest("hex");
  const digitos = (BigInt("0x" + hash.slice(0, 15)) % 1000000000n).toString().padStart(9, "0");
  return `OR${digitos}BR`;
}

function gerarGuia(entrada, agora = new Date()) {
  validar(entrada);
  const opcao = opcaoPorId(entrada.opcaoEnvioId);
  const { altura, largura, profundidade } = entrada.dimensoes;
  const uf = entrada.destinatario.uf.toUpperCase();
  const codigo = codigoRastreio(entrada.pedidoId);

  return {
    guia: {
      numero: `GE-${entrada.pedidoId}`,
      codigoRastreio: codigo,
      pedidoId: entrada.pedidoId,
      servico: { id: opcao.id, nome: opcao.nome, prazo: opcao.prazo },
      valorFrete: opcao.valor,
      destinatario: {
        nome: entrada.destinatario.nome.trim(),
        cep: entrada.destinatario.cep.replace(/^(\d{5})-?(\d{3})$/, "$1-$2"),
        uf,
        regiao: REGIAO_POR_UF[uf],
      },
      volume: {
        pesoKg: entrada.pesoKg,
        dimensoesCm: { altura, largura, profundidade },
        // Peso cubado usado pelas transportadoras: A x L x P / 6000.
        pesoCubadoKg: Math.round(((altura * largura * profundidade) / 6000) * 100) / 100,
      },
      emitidaEm: agora.toISOString(),
    },
  };
}

module.exports = { gerarGuia, codigoRastreio, ErroValidacao, OPCOES_FRETE };
