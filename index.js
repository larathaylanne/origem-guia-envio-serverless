// Ponto de entrada para o Google Cloud Functions (2ª geração).
// Localmente, o emulador oficial (Functions Framework) sobe esta função em http://localhost:8080.
const functions = require("@google-cloud/functions-framework");
const { guiaEnvio } = require("./src/handler");

functions.http("guiaEnvio", guiaEnvio);
