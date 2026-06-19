# Testes E2E — Jornada Completa (Selenium + Pytest)

Teste de jornada completa do usuário na aplicação COM: páginas públicas → login → CRUD dos módulos principais → limpeza dos dados criados.

## Pré-requisitos

- Python 3.10+
- Google Chrome instalado

## Instalação

```bash
cd e2e
python -m venv .venv

# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate

pip install -r requirements.txt
```

## Executando

```bash
# Definir credenciais (PowerShell)
$env:E2E_ADMIN_USERNAME = "email@exemplo.com"
$env:E2E_ADMIN_PASSWORD = "senha"

# Execução direta
python application_flow_test.py

# Execução via pytest
pytest application_flow_test.py -v
```

O Chrome abre visível e percorre automaticamente toda a aplicação. Em caso de falha, um screenshot é salvo em `e2e_error.png` e a URL atual é impressa no console.

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `E2E_BASE_URL` | `http://marianadias.odo.br` | URL base da aplicação |
| `E2E_ADMIN_USERNAME` | — | E-mail de acesso (obrigatório) |
| `E2E_ADMIN_PASSWORD` | — | Senha de acesso (obrigatória) |

## Estrutura

```
e2e/
├── application_flow_test.py   # Teste único — jornada completa
├── pytest.ini                 # Configuração do pytest
├── requirements.txt           # Dependências Python
└── .env                       # Variáveis de ambiente (opcional)
```

## Fluxo do Teste

### Páginas públicas
1. **Home** — navega para `/`, realiza scroll progressivo pela página
2. **Atendimento** — navega para `/attendance`
3. **Unidades** — navega para `/locations`

### Acesso administrativo
4. **Login** — navega para `/admin-access`, preenche credenciais, aguarda redirecionamento para `/panel`
5. **Painel** — valida cards e sidebar

### Módulos administrativos
6. **Pacientes** — lista pacientes
7. **Cadastrar paciente** — cria registro de teste, armazena ID
8. **Agenda** — navega para `/schedule`, tenta visualizar consulta existente
9. **Prontuários** — abre prontuário do paciente criado
10. **Tratamentos** — lista `/treatments`, acessa tratamentos do paciente
11. **Estoque** — lista `/inventories`
12. **Cadastrar material** — cria item de teste, armazena ID
13. **Clínicas** — lista `/clinics`
14. **Cadastrar clínica** — cria clínica de teste, armazena ID
15. **Certificados** — navega para `/certificados`, cria certificado de teste
16. **Funcionários** — navega para `/employees`
17. **Meu Perfil** — navega para `/meu-perfil`
18. **Logout** — clica em "Sair" e confirma retorno a `/admin-access`

### Limpeza
Ao final (mesmo em caso de falha), todos os registros criados durante o teste são removidos na ordem: certificados → materiais → pacientes → clínicas.
