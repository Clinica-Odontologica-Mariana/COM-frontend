from selenium.webdriver.common.by import By
from .base_page import BasePage


class ClinicsListPage(BasePage):
    PATH = "/clinics"

    _CLINIC_CARDS = (By.CSS_SELECTOR, "[class*='clinic-card'], [class*='card']")
    _BTN_NOVO = (By.XPATH, "//a[contains(@href,'/clinics/new')] | //button[contains(normalize-space(.),'Nova') or contains(normalize-space(.),'Novo')]")
    _BTN_EDIT = (By.XPATH, "//a[contains(@href,'/clinics/') and contains(@href,'/edit')]")
    _BTN_DELETE = (By.XPATH, "//button[@aria-label='Excluir'] | //button[contains(normalize-space(.),'Excluir')]")
    _EMPTY_STATE = (By.XPATH, "//*[contains(normalize-space(.),'Nenhuma') or contains(normalize-space(.),'nenhuma') or contains(normalize-space(.),'clínica')]")

    def open(self):
        self.navigate(self.PATH)
        return self

    def click_novo(self):
        self.click(*self._BTN_NOVO)

    def get_card_count(self) -> int:
        try:
            cards = self.wait_for_elements(*self._CLINIC_CARDS, timeout=5)
            return len(cards)
        except Exception:
            return 0

    def click_first_edit(self):
        btns = self.find_all(*self._BTN_EDIT)
        if btns:
            self.js_click(btns[0])

    def click_first_delete(self):
        btns = self.find_all(*self._BTN_DELETE)
        if btns:
            btns[0].click()


class ClinicFormPage(BasePage):
    _NAME = (By.CSS_SELECTOR, "input[formControlName='name']")
    _PHONE = (By.CSS_SELECTOR, "input[formControlName='phone']")
    _EMAIL = (By.CSS_SELECTOR, "input[formControlName='email']")
    _WHATSAPP = (By.CSS_SELECTOR, "input[formControlName='whatsapp']")
    _INSTAGRAM = (By.CSS_SELECTOR, "input[formControlName='instagram']")
    _STREET = (By.CSS_SELECTOR, "input[formControlName='street']")
    _NUMBER = (By.CSS_SELECTOR, "input[formControlName='number']")
    _NEIGHBORHOOD = (By.CSS_SELECTOR, "input[formControlName='neighborhood']")
    _ZIP_CODE = (By.CSS_SELECTOR, "input[formControlName='zipCode']")
    _CITY = (By.CSS_SELECTOR, "input[formControlName='city']")
    _STATE = (By.CSS_SELECTOR, "input[formControlName='state']")
    _BTN_SALVAR = (By.XPATH, "//button[@type='submit'] | //button[contains(normalize-space(.),'Salvar')]")
    _BTN_CANCELAR = (By.XPATH, "//button[contains(normalize-space(.),'Cancelar')] | //a[contains(normalize-space(.),'Cancelar')]")
    _ACTIVE_TOGGLE = (By.CSS_SELECTOR, "input[formControlName='active']")
    _WORKING_DAY_CHECKBOXES = (By.XPATH, "//input[@type='checkbox' and (contains(@formControlName,'enabled') or ancestor::*[contains(@class,'working-day')])]")
    _START_TIME_INPUTS = (By.CSS_SELECTOR, "input[formControlName='startTime'], input[placeholder*='Início']")
    _END_TIME_INPUTS = (By.CSS_SELECTOR, "input[formControlName='endTime'], input[placeholder*='Fim']")

    def open_new(self):
        import time
        import pytest
        self.navigate("/clinics/new")
        time.sleep(0.4)
        if "/admin-access" in self.driver.current_url:
            pytest.skip("Backend não disponível — formulário de clínica redireciona para login")
        return self

    def open_edit(self, clinic_id: str):
        self.navigate(f"/clinics/{clinic_id}/edit")
        return self

    def fill_basic(self, name: str, phone: str, email: str, whatsapp: str, instagram: str):
        self.type_into(*self._NAME, name)
        self.type_into(*self._PHONE, phone)
        self.type_into(*self._EMAIL, email)
        self.type_into(*self._WHATSAPP, whatsapp)
        self.type_into(*self._INSTAGRAM, instagram)
        return self

    def fill_address(self, street: str, number: str, neighborhood: str, zip_code: str, city: str, state: str):
        self.type_into(*self._STREET, street)
        self.type_into(*self._NUMBER, number)
        self.type_into(*self._NEIGHBORHOOD, neighborhood)
        self.type_into(*self._ZIP_CODE, zip_code)
        self.type_into(*self._CITY, city)
        self.type_into(*self._STATE, state)
        return self

    def submit(self):
        btn = self.wait_for_clickable(*self._BTN_SALVAR)
        self.scroll_into_view(btn)
        btn.click()
        return self

    def cancel(self):
        self.click(*self._BTN_CANCELAR)
        return self

    def has_required_errors(self) -> bool:
        return len(self.find_all(By.CSS_SELECTOR, ".text-red-500")) > 0
