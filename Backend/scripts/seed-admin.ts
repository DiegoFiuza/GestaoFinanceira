import { MongoClient } from "mongodb";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

// 1. Configuração de caminhos para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 2. Carregar o .env (Subindo um nível para sair de 'scripts' e entrando em 'app')
// Isso resolve o caminho: backend/scripts/../app/.env -> backend/app/.env
dotenv.config({ path: resolve(__dirname, "../app/.env") });

// 3. Pegar a URI do process.env com um fallback para segurança
const mongoUri = process.env.MONGODB_URI;

async function createAdmin() {
  console.log("🚀 Iniciando script de seed...");

  // Validação crítica antes de instanciar o MongoClient
  if (!mongoUri) {
    console.error("❌ ERRO: Variável MONGO_URI não encontrada no .env!");
    console.log("Caminho tentado:", resolve(__dirname, "../app/.env"));
    console.log(
      "Dica: Verifique se o arquivo .env tem a chave MONGO_URI=mongodb://...",
    );
    return;
  }

  console.log("🔗 Tentando conectar em:", mongoUri);

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db();

    // Certifique-se de que o nome da coleção é 'users' (minúsculo) conforme o Mongoose costuma criar
    const usersCollection = db.collection("users");

    // Dados do novo admin
    const adminEmail = "admin@gestaofi.com";
    const passwordRaw = "Admin123!";

    // Gerar Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordRaw, salt);

    const adminUser = {
      name: "Administrador Sistema",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
    };

    // 4. Verificar se o Admin já existe
    const exists = await usersCollection.findOne({ email: adminEmail });
    if (exists) {
      console.log("⚠️  Aviso: Usuário Admin já existe no banco de dados.");
      return;
    }

    // 5. Inserir no Banco
    await usersCollection.insertOne(adminUser);

    console.log("--------------------------------------");
    console.log("✅ Usuário Admin criado com sucesso!");
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Senha: ${passwordRaw}`);
    console.log("--------------------------------------");
    console.log("Agora você já pode fazer login para obter o token.");
  } catch (error) {
    console.error("❌ Erro durante a execução do seed:");
    if (error.message.includes("startsWith")) {
      console.error(
        "Motivo: A string de conexão do MongoDB é inválida ou está vazia.",
      );
    } else {
      console.error(error);
    }
  } finally {
    await client.close();
    console.log("🔌 Conexão com MongoDB encerrada.");
  }
}

// Executar a função
createAdmin();
