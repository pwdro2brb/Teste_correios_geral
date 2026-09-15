// Cria (ou recria) um usuário de login local. Uso: node --experimental-strip-types scripts/seed-user.ts email@mrv.com.br "Nome" admin senha123
import { createLocalUser } from '../lib/server/local-auth.ts'

const [email, nome, role, senha] = process.argv.slice(2)

if (!email || !nome || !role || !senha) {
  console.error('Uso: seed-user <email@mrv.com.br> <nome> <colaborador|operador|admin> <senha>')
  process.exit(1)
}

if (!['colaborador', 'operador', 'admin'].includes(role)) {
  console.error('Role inválida. Use colaborador, operador ou admin.')
  process.exit(1)
}

const user = createLocalUser(email, nome, role as 'colaborador' | 'operador' | 'admin', senha)
console.log('Usuário criado:', user)
