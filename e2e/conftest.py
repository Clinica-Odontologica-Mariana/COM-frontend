import pytest
import os
import requests as _requests
from pathlib import Path
from selenium import webdriver

try:
    from dotenv import load_dotenv  # type: ignore[import-untyped]
except ImportError:
    load_dotenv = lambda *_, **__: None  # type: ignore[assignment]
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager

# Carrega .env do diretório e2e/ (e .env.local se existir, com prioridade)
_ENV_DIR = Path(__file__).parent
load_dotenv(_ENV_DIR / ".env")
load_dotenv(_ENV_DIR / ".env.local", override=True)

# -----------------------------------------------------------------------
# Configuração geral
# -----------------------------------------------------------------------
BASE_URL = os.getenv("E2E_BASE_URL", "http://localhost:4200")
BROWSER = os.getenv("E2E_BROWSER", "chrome")
HEADLESS = os.getenv("E2E_HEADLESS", "true").lower() == "true"
IMPLICIT_WAIT = int(os.getenv("E2E_IMPLICIT_WAIT", "5"))
WINDOW_WIDTH = int(os.getenv("E2E_WINDOW_WIDTH", "1440"))
WINDOW_HEIGHT = int(os.getenv("E2E_WINDOW_HEIGHT", "900"))

# -----------------------------------------------------------------------
# Credenciais e URLs de backend/Keycloak
# -----------------------------------------------------------------------
ADMIN_USERNAME = os.getenv("E2E_ADMIN_USERNAME", "api-admin")
ADMIN_PASSWORD = os.getenv("E2E_ADMIN_PASSWORD", "api-admin123")

BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:8080/api/v1")
KEYCLOAK_EXTERNAL_URL = os.getenv("KEYCLOAK_EXTERNAL_URL", "http://localhost:8080")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "rest-ms")
KEYCLOAK_CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID", "rest-ms-api")
KEYCLOAK_CLIENT_SECRET = os.getenv("KEYCLOAK_CLIENT_SECRET", "rest-ms-api-secret")

# -----------------------------------------------------------------------
# Helpers de autenticação
# -----------------------------------------------------------------------

def _get_token_via_backend(username: str, password: str) -> str | None:
    """Obtém JWT chamando o endpoint de login do Spring Backend."""
    try:
        resp = _requests.post(
            f"{BACKEND_API_URL}/auth/login",
            json={"username": username, "password": password},
            timeout=10,
        )
        if resp.status_code == 200:
            data = resp.json()
            return data.get("accessToken") or data.get("access_token")
    except _requests.RequestException:
        pass
    return None


def _get_token_via_keycloak(username: str, password: str) -> str | None:
    """Obtém JWT diretamente do Keycloak via Resource Owner Password Credentials."""
    token_url = (
        f"{KEYCLOAK_EXTERNAL_URL}/realms/{KEYCLOAK_REALM}"
        "/protocol/openid-connect/token"
    )
    try:
        resp = _requests.post(
            token_url,
            data={
                "grant_type": "password",
                "client_id": KEYCLOAK_CLIENT_ID,
                "client_secret": KEYCLOAK_CLIENT_SECRET,
                "username": username,
                "password": password,
            },
            timeout=10,
        )
        if resp.status_code == 200:
            return resp.json().get("access_token")
    except _requests.RequestException:
        pass
    return None


def get_real_token(username: str = ADMIN_USERNAME, password: str = ADMIN_PASSWORD) -> str | None:
    """
    Tenta obter um JWT real na seguinte ordem:
      1. Endpoint de login do Spring Backend (/api/v1/auth/login)
      2. Endpoint direto do Keycloak (ROPC flow)
    Retorna None se o backend não estiver disponível.
    """
    token = _get_token_via_backend(username, password)
    if token:
        return token
    return _get_token_via_keycloak(username, password)


def _inject_auth(driver, base_url: str, token: str, expires_in_ms: int = 3_600_000):
    """Injeta token JWT no localStorage do driver para autenticar sem UI."""
    driver.get(base_url)
    driver.execute_script(
        """
        const expiry = Date.now() + arguments[1];
        localStorage.setItem('access_token', arguments[0]);
        localStorage.setItem('access_token_expiry', expiry.toString());
        """,
        token,
        expires_in_ms,
    )


# -----------------------------------------------------------------------
# Fábrica de WebDriver
# -----------------------------------------------------------------------

def _make_chrome(headless: bool) -> webdriver.Chrome:
    opts = webdriver.ChromeOptions()
    if headless:
        opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.add_argument(f"--window-size={WINDOW_WIDTH},{WINDOW_HEIGHT}")
    service = ChromeService(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=opts)


def _make_firefox(headless: bool) -> webdriver.Firefox:
    opts = webdriver.FirefoxOptions()
    if headless:
        opts.add_argument("--headless")
    service = FirefoxService(GeckoDriverManager().install())
    driver = webdriver.Firefox(service=service, options=opts)
    driver.set_window_size(WINDOW_WIDTH, WINDOW_HEIGHT)
    return driver


# -----------------------------------------------------------------------
# Fixtures de sessão (criadas uma vez por execução)
# -----------------------------------------------------------------------

@pytest.fixture(scope="session")
def base_url() -> str:
    return BASE_URL


@pytest.fixture(scope="session")
def credentials() -> dict:
    return {"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}


@pytest.fixture(scope="session")
def real_token() -> str | None:
    """
    JWT real obtido do backend/Keycloak uma única vez por sessão de teste.
    Retorna None se o backend não estiver disponível (testes que exigem
    backend real devem marcar pytest.skip() nesses casos).
    """
    return get_real_token()


# -----------------------------------------------------------------------
# Fixtures de driver (criadas por teste)
# -----------------------------------------------------------------------

@pytest.fixture()
def driver():
    """Driver limpo, sem autenticação."""
    d = _make_firefox(HEADLESS) if BROWSER == "firefox" else _make_chrome(HEADLESS)
    d.implicitly_wait(IMPLICIT_WAIT)
    yield d
    d.quit()


@pytest.fixture()
def authenticated_driver(driver, base_url: str, real_token: str | None):
    """
    Driver com sessão autenticada injetada via localStorage.

    Estratégia:
      - Se o backend estiver disponível: usa JWT real (API calls funcionam).
      - Caso contrário: usa token placeholder para bypass do auth guard do Angular
        (telas carregam, mas chamadas à API retornarão 401).
    """
    token = real_token or "selenium-placeholder-token"
    _inject_auth(driver, base_url, token)
    return driver
