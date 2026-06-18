from selenium.webdriver.common.by import By
from .base_page import BasePage


class SidebarPage(BasePage):
    """Representa o sidebar global das rotas protegidas."""

    _SIDEBAR = (By.CSS_SELECTOR, "app-global-sidebar")
    _NAV_PACIENTES = (By.XPATH, "//app-global-sidebar//a[contains(@href,'/patients') and not(contains(@href,'/treatments'))]")
    _NAV_AGENDA = (By.XPATH, "//app-global-sidebar//a[contains(@href,'/schedule') and not(contains(@href,'/new')) and not(contains(@href,'/appointments'))]")
    _NAV_PRONTUARIOS = (By.XPATH, "//app-global-sidebar//a[contains(@href,'/medical-records') and not(contains(@href,'/'))]")
    _NAV_ESTOQUE = (By.XPATH, "//app-global-sidebar//a[contains(@href,'/inventories')]")
    _NAV_CLINICAS = (By.XPATH, "//app-global-sidebar//a[contains(@href,'/clinics')]")
    _BTN_NOVO_ATENDIMENTO = (By.XPATH, "//app-global-sidebar//a[contains(@href,'/schedule/new')] | //app-global-sidebar//button[contains(normalize-space(.),'Novo Atendimento')]")
    _BTN_SAIR = (By.XPATH, "//app-global-sidebar//button[contains(normalize-space(.),'Sair')]")
    _USER_NAME = (By.CSS_SELECTOR, "app-global-sidebar [class*='user'], app-global-sidebar [class*='name']")
    _HAMBURGER = (By.CSS_SELECTOR, "button[aria-label*='menu'], button.hamburger, [class*='hamburger']")

    def is_visible(self) -> bool:
        return self.is_displayed(*self._SIDEBAR)

    def go_to_patients(self):
        self.click(*self._NAV_PACIENTES)

    def go_to_schedule(self):
        self.click(*self._NAV_AGENDA)

    def go_to_medical_records(self):
        self.click(*self._NAV_PRONTUARIOS)

    def go_to_inventories(self):
        self.click(*self._NAV_ESTOQUE)

    def go_to_clinics(self):
        self.click(*self._NAV_CLINICAS)

    def click_novo_atendimento(self):
        self.click(*self._BTN_NOVO_ATENDIMENTO)

    def logout(self):
        self.click(*self._BTN_SAIR)

    def open_mobile_menu(self):
        self.click(*self._HAMBURGER)
