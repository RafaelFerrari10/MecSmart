const fs = require('fs');
const path = require('path');

// O arquivo de credenciais do Firebase é gitignorado. Se estiver presente,
// o Firebase Admin é inicializado; caso contrário, o servidor continua
// rodando apenas com os endpoints JSON (a maioria da aplicação).
const arquivosChave = fs
  .readdirSync(__dirname)
  .filter((f) => /mecsmart-.*-firebase-adminsdk-.*\.json$/.test(f));

let admin = null;
let db = null;
let auth = null;

if (arquivosChave.length > 0) {
  try {
    const serviceAccount = require(path.join(__dirname, arquivosChave[0]));
    admin = require('firebase-admin');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    });
    db = admin.firestore();
    auth = admin.auth();
  } catch (error) {
    console.error('Falha ao inicializar Firebase, operando apenas com JSON:', error.message);
    admin = null;
    db = null;
    auth = null;
  }
} else {
  console.warn(
    'Arquivo de credenciais do Firebase não encontrado. ' +
      'Endpoints -firebase ficarão indisponíveis; o resto da API continua funcionando.',
  );
}

module.exports = { admin, db, auth };
