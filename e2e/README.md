# Testes de Interface (Selenium + Pytest)

Suíte completa de testes E2E para o COM-Frontend usando Python, Selenium e Pytest.

## Pré-requisitos

- Python 3.10+
- Google Chrome (ou Firefox)
- Frontend rodando em `http://localhost:4200` (`npm start`)
- Backend (opcional — muitos testes fazem bypass de auth via localStorage)

## Instalação

```bash
# Ubuntu/Debian: instalar pip e venv caso não estejam presentes
sudo apt install python3-pip python3-venv -y

cd e2e
python3 -m venv .venv
source .venv/bin/activate        # Linux/Mac
# .venv\Scripts\activate          # Windows

pip install -r requirements.txt
```

## Executando os Testes

```bash
# Todos os testes
pytest

# Testes específicos por arquivo
pytest tests/test_auth.py
pytest tests/test_patients.py
pytest tests/test_clinics.py
pytest tests/test_schedule.py
pytest tests/test_medical_records.py
pytest tests/test_inventories.py
pytest tests/test_public.py
pytest tests/test_navigation.py
pytest tests/test_accessibility.py

# Por marcador
pytest -m smoke
pytest -m auth
pytest -m patients

# Com navegador visível (sem headless)
E2E_HEADLESS=false pytest

# Usando Firefox
E2E_BROWSER=firefox pytest

# Apontar para URL diferente
E2E_BASE_URL=http://localhost:4201 pytest

# Gerar relatório HTML
pytest --html=reports/report.html --self-contained-html
```

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `E2E_BASE_URL` | `http://localhost:4200` | URL base do frontend |
| `E2E_BROWSER` | `chrome` | Navegador (`chrome` ou `firefox`) |
| `E2E_HEADLESS` | `true` | Rodar sem interface gráfica |
| `E2E_IMPLICIT_WAIT` | `5` | Tempo de espera implícito (segundos) |
| `E2E_ADMIN_USERNAME` | `api-admin` | Usuário admin |
| `E2E_ADMIN_PASSWORD` | `api-admin123` | Senha admin |

## Estrutura

```
e2e/
├── conftest.py              # Fixtures globais (driver, base_url, credentials)
├── pytest.ini               # Configuração do pytest
├── requirements.txt         # Dependências Python
├── pages/                   # Page Object Models
│   ├── base_page.py         # Classe base com helpers
│   ├── login_page.py        # Página /admin-access
│   ├── home_page.py         # Página /
│   ├── sidebar_page.py      # Sidebar global (rotas protegidas)
│   ├── patients_page.py     # Páginas /patients e /patients/new
│   ├── schedule_page.py     # Páginas /schedule e /schedule/new
│   ├── clinics_page.py      # Páginas /clinics e /clinics/new
│   ├── medical_records_page.py  # Páginas /medical-records
│   └── inventories_page.py  # Páginas /inventories
├── tests/                   # Arquivos de teste
│   ├── test_auth.py         # Autenticação, auth guard, logout
│   ├── test_public.py       # Home, Atendimento, Localizações
│   ├── test_navigation.py   # Sidebar, links, mobile menu
│   ├── test_patients.py     # CRUD de pacientes
│   ├── test_schedule.py     # Agenda e agendamentos
│   ├── test_clinics.py      # CRUD de clínicas
│   ├── test_medical_records.py  # Prontuários
│   ├── test_inventories.py  # Estoque
│   └── test_accessibility.py   # Estrutura HTML e acessibilidade
└── reports/                 # Relatórios HTML gerados
```

## Estratégia de Autenticação

Os testes de rotas protegidas usam duas abordagens:

1. **Login real** (`test_auth.py`) — usa as credenciais do backend para testar o fluxo completo.
2. **Token injetado via localStorage** (demais testes) — evita depender do backend para testar a UI. O guard Angular verifica apenas a presença e validade (por data de expiração) do token.

Testes que dependem de dados reais do backend são marcados com `pytest.skip()` quando o backend não está disponível.

## Cobertura de Testes

| Módulo | Testes |
|--------|--------|
| Autenticação | Login válido/inválido, toggle senha, auth guard, logout |
| Páginas públicas | Home, Atendimento, Localizações, header, footer, WhatsApp |
| Navegação | Sidebar links, Novo Atendimento, mobile hamburger |
| Pacientes | Listagem, busca, formulário completo, validações, CPF/telefone/CEP |
| Agenda | Calendário, formulário, autocomplete de paciente, lista |
| Clínicas | Listagem, formulário completo, dias de funcionamento |
| Prontuários | Listagem, detalhe, seções, diálogo de evolução |
| Estoque | Listagem, formulário criação/edição, selects de tipo/unidade |
| Acessibilidade | Title, labels, alt text, aria, semântica de nav |
