from selenium.webdriver.common.by import By
from .base_page import BasePage


class HomePage(BasePage):
    PATH = "/"

    _HEADER = (By.CSS_SELECTOR, "app-global-header")
    _NAV_SOBRE = (By.XPATH, "//app-global-header//a[contains(@href,'/') and normalize-space(.)='Sobre']")
    _NAV_ATENDIMENTO = (By.XPATH, "//app-global-header//a[contains(@href,'/attendance')]")
    _NAV_UNIDADES = (By.XPATH, "//app-global-header//a[contains(@href,'/locations')]")
    _BTN_ENTRAR = (By.XPATH, "//app-global-header//a[contains(@href,'/admin-access')] | //app-global-header//button[contains(normalize-space(.),'Entrar')]")
    _HERO_SECTION = (By.CSS_SELECTOR, "app-home-page section, app-home-page h1, app-home-page h2, main section")
    _CTA_AGENDAR = (By.XPATH, "//*[contains(normalize-space(.),'Agende') or contains(normalize-space(.),'agende')]")
    _WHATSAPP_FLOAT = (By.CSS_SELECTOR, "a[href*='wa.me'], a[href*='whatsapp']")
    _FOOTER = (By.CSS_SELECTOR, "app-global-footer")

    def open(self):
        self.navigate(self.PATH)
        return self

    def is_header_visible(self) -> bool:
        return self.is_displayed(*self._HEADER)

    def is_footer_visible(self) -> bool:
        return self.is_displayed(*self._FOOTER)

    def click_entrar(self):
        self.click(*self._BTN_ENTRAR)

    def click_atendimento(self):
        self.click(*self._NAV_ATENDIMENTO)

    def click_unidades(self):
        self.click(*self._NAV_UNIDADES)

    def has_hero_section(self) -> bool:
        return self.is_displayed(*self._HERO_SECTION, timeout=5)

    def has_whatsapp_button(self) -> bool:
        return self.element_exists(*self._WHATSAPP_FLOAT)
