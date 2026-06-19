# 📋 Agenda Digital com Supabase

## Aplicação Web de Gerenciamento de Contatos com CRUD e RLS

---

## 📌 Cabeçalho
Link github pages : https://wbraz94.github.io/Desenvolvimento-de-Aplica-o-em-Nuvem/
| Item | Descrição |
|------|-----------|
| Disciplina | Desenvolvimento de Aplicação em Nuvem |
| Modalidade | [Dupla] |
| Integrantes | [Welerson Sousa] 
| | [Jamile Barbosa]
| Banco Escolhido | Supabase (PostgreSQL) |

## 🎯 Sobre o Projeto

Aplicação web de **Agenda Digital** desenvolvida em HTML5, CSS3 e JavaScript Vanilla, integrada ao **Supabase** como Backend as a Service (BaaS). O sistema permite gerenciar contatos com operações CRUD completas, utilizando banco de dados PostgreSQL com RLS (Row Level Security) para segurança.

---

## 💻 Tecnologias Utilizadas

| Tecnologia | Descrição |
|------------|-----------|
| **HTML5** | Estrutura da aplicação |
| **CSS3** | Estilização responsiva |
| **JavaScript** | Lógica e integração |
| **Supabase** | BaaS (PostgreSQL) |
| **Font Awesome** | Ícones |

---

## 📁 Estrutura do Projeto
agenda-digital-supabase/
│
├── index.html # Página principal
├── style.css # Estilos CSS
├── script.js # Lógica JavaScript + Supabase

---

## ⚡ Funcionalidades

### CRUD Completo
- ✅ **Criar** - Cadastro de novos contatos
- ✅ **Listar** - Visualização de todos os contatos
- ✅ **Editar** - Atualização de contatos existentes
- ✅ **Excluir** - Remoção com confirmação

### Funcionalidades Extras
- 🔍 Busca de contatos por nome
- 📊 Contador de registros
- 📱 Design responsivo
- 🔔 Notificações de feedback
- ⏳ Loading spinner

---

## 🗄️ Banco de Dados

### Estrutura da Tabela

sql
CREATE TABLE contato (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(255) NOT NULL,
    email       VARCHAR(255),
    telefone    VARCHAR(25),
    obs         VARCHAR(255),
    dtcontato   DATE DEFAULT CURRENT_DATE
);

Configuração RLS
-- Habilitar RLS
ALTER TABLE contato ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Permitir SELECT público" ON contato FOR SELECT USING (true);
CREATE POLICY "Permitir INSERT público" ON contato FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir UPDATE público" ON contato FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir DELETE público" ON contato FOR DELETE USING (true);

🔒 Segurança
Medidas Implementadas
Medida	Status
RLS ativado	✅
Políticas configuradas	✅
Uso apenas da anon_key	✅
Validação de dados	✅
Confirmação antes de excluir	✅
Sanitização de entrada	✅
HTTPS	✅
