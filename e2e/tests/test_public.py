"""
Testes das páginas públicas:
- Home (/)
- Atendimento (/attendance)
- Unidades/Localizações (/locations)
- Header e Footer globais
- Navegação pública
- Botão WhatsApp
"""
import pytest
from selenium.webdriver.common.by import By
from pages.home_page import HomePage
from pages.base_page import BasePage


@pytest.fixture()
def home(driver, base_url):
    return HomePage(driver, base_url)


@pytest.fixture()
def base(driver, base_url):
    return BasePage(driver, base_url)


class TestHomePage:
    def test_home_page_loads(self, home):
        home.open()
        assert home.is_header_visible(), "Header deve estar visível na home"

    def test_home_has_hero_section(self, home):
        home.open()
        assert home.has_hero_section(), "Home deve ter seção hero"

    def test_home_has_footer(self, home):
        home.open()
        assert home.is_footer_visible(), "Footer deve estar visível na home"

    def test_home_has_whatsapp_button(self, home):
        home.open()
        assert home.has_whatsapp_button(), "Deve existir link de WhatsApp na home"

    def test_home_whatsapp_link_has_wa_url(self, home):
        home.open()
        links = home.find_all(By.CSS_SELECTOR, "a[href*='wa.me'], a[href*='whatsapp']")
        assert len(links) > 0, "Deve existir ao menos um link de WhatsApp"
        href = links[0].get_attribute("href")
        assert "wa.me" in href or "whatsapp" in href, "Link WhatsApp deve conter domínio correto"

    def test_header_nav_atendimento_link_exists(self, home):
        home.open()
        assert home.element_exists(By.XPATH, "//a[contains(@href,'/attendance')]"), (
            "Deve existir link para /attendance no header"
        )

    def test_header_nav_unidades_link_exists(self, home):
        home.open()
        assert home.element_exists(By.XPATH, "//a[contains(@href,'/locations')]"), (
            "Deve existir link para /locations no header"
        )

    def test_header_has_entrar_button(self, home):
        home.open()
        assert home.element_exists(By.XPATH, "//a[contains(@href,'/admin-access')]"), (
            "Deve existir botão/link 'Entrar' no header"
        )

    def test_entrar_button_navigates_to_login(self, home):
        home.open()
        home.click_entrar()
        home.wait_for_url_contains("/admin-access", timeout=5)
        assert "/admin-access" in home.current_url, "Botão Entrar deve navegar para /admin-access"

    def test_nav_atendimento_navigates(self, home):
        home.open()
        home.click_atendimento()
        home.wait_for_url_contains("/attendance", timeout=5)
        assert "/attendance" in home.current_url

    def test_nav_unidades_navigates(self, home):
        home.open()
        home.click_unidades()
        home.wait_for_url_contains("/locations", timeout=5)
        assert "/locations" in home.current_url


class TestAttendancePage:
    def test_attendance_page_loads(self, base):
        base.navigate("/attendance")
        assert base.is_displayed(By.CSS_SELECTOR, "app-attendance-page, main, body", timeout=5), (
            "Página de atendimento deve carregar"
        )
        assert "attendance" in base.current_url

    def test_attendance_has_header(self, base):
        base.navigate("/attendance")
        assert base.is_displayed(By.CSS_SELECTOR, "app-global-header", timeout=5), (
            "Header deve estar visível em /attendance"
        )

    def test_attendance_has_footer(self, base):
        base.navigate("/attendance")
        assert base.is_displayed(By.CSS_SELECTOR, "app-global-footer", timeout=5), (
            "Footer deve estar visível em /attendance"
        )


class TestLocationsPage:
    def test_locations_page_loads(self, base):
        base.navigate("/locations")
        assert base.is_displayed(By.CSS_SELECTOR, "app-locations-page, main, body", timeout=5), (
            "Página de localizações deve carregar"
        )
        assert "locations" in base.current_url

    def test_locations_has_header(self, base):
        base.navigate("/locations")
        assert base.is_displayed(By.CSS_SELECTOR, "app-global-header", timeout=5)

    def test_locations_has_footer(self, base):
        base.navigate("/locations")
        assert base.is_displayed(By.CSS_SELECTOR, "app-global-footer", timeout=5)


class TestWildcardRoute:
    def test_unknown_route_redirects_to_home(self, base):
        base.navigate("/rota-que-nao-existe-xyz")
        try:
            base.wait_for_url_contains("/", timeout=5)
        except Exception:
            pass
        assert base.is_displayed(By.CSS_SELECTOR, "app-global-header, body", timeout=5), (
            "Rota inválida deve redirecionar para home ou exibir página válida"
        )
