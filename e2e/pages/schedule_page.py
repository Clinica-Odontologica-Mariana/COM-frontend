from selenium.webdriver.common.by import By
from .base_page import BasePage


class ScheduleMainPage(BasePage):
    PATH = "/schedule"

    _CALENDAR = (By.CSS_SELECTOR, "app-appointment-main-page, [class*='calendar']")
    _BTN_NOVO = (By.XPATH, "//a[contains(@href,'/schedule/new')] | //button[contains(normalize-space(.),'Novo')]")
    _BTN_LISTA = (By.XPATH, "//a[contains(@href,'/schedule/appointments')] | //button[contains(normalize-space(.),'Lista')]")
    _VIEW_MONTH = (By.XPATH, "//button[contains(normalize-space(.),'Mês') or contains(normalize-space(.),'mês')]")
    _VIEW_WEEK = (By.XPATH, "//button[contains(normalize-space(.),'Semana') or contains(normalize-space(.),'semana')]")

    def open(self):
        import time
        self.navigate(self.PATH)
        time.sleep(0.4)
        return self

    def is_calendar_visible(self) -> bool:
        return self.is_displayed(*self._CALENDAR, timeout=5)

    def click_novo_agendamento(self):
        self.click(*self._BTN_NOVO)

    def click_ver_lista(self):
        self.click(*self._BTN_LISTA)


class AppointmentFormPage(BasePage):
    PATH = "/schedule/new"

    _PATIENT_SEARCH = (By.CSS_SELECTOR, "input[formControlName='patientSearch'], input[placeholder*='paciente'], input[placeholder*='Paciente']")
    _PATIENT_OPTION = (By.CSS_SELECTOR, "[class*='autocomplete'] li, [class*='dropdown'] li, [class*='suggestion']")
    _PROFESSIONAL = (By.CSS_SELECTOR, "select[formControlName='professionalId']")
    _PROCEDURE = (By.CSS_SELECTOR, "select[formControlName='procedureId']")
    _CLINIC = (By.CSS_SELECTOR, "select[formControlName='clinicId']")
    _WORKPLACE = (By.CSS_SELECTOR, "select[formControlName='workplaceId']")
    _DATE = (By.CSS_SELECTOR, "input[formControlName='date'], input[type='date']")
    _START_TIME = (By.CSS_SELECTOR, "input[formControlName='startTime'], input[type='time']:first-of-type")
    _END_TIME = (By.CSS_SELECTOR, "input[formControlName='endTime'], input[type='time']:last-of-type")
    _STATUS = (By.CSS_SELECTOR, "select[formControlName='status']")
    _NOTES = (By.CSS_SELECTOR, "textarea[formControlName='notes']")
    _BTN_SALVAR = (By.XPATH, "//button[@type='submit'] | //button[contains(normalize-space(.),'Salvar') or contains(normalize-space(.),'Agendar')]")
    _BTN_CANCELAR = (By.XPATH, "//button[contains(normalize-space(.),'Cancelar')] | //a[contains(normalize-space(.),'Cancelar')]")

    def open(self):
        import time
        import pytest
        self.navigate(self.PATH)
        time.sleep(0.4)
        if "/admin-access" in self.driver.current_url:
            pytest.skip("Backend não disponível — formulário de agenda redireciona para login")
        return self

    def search_patient(self, name: str):
        self.type_into(*self._PATIENT_SEARCH, name)
        return self

    def select_first_patient_option(self):
        opts = self.wait_for_elements(*self._PATIENT_OPTION, timeout=5)
        if opts:
            opts[0].click()
        return self

    def set_date(self, date_str: str):
        el = self.wait_for_element(*self._DATE)
        self.js_set_value(el, date_str)
        return self

    def set_start_time(self, time_str: str):
        els = self.find_all(By.CSS_SELECTOR, "input[type='time']")
        if els:
            self.js_set_value(els[0], time_str)
        return self

    def set_end_time(self, time_str: str):
        els = self.find_all(By.CSS_SELECTOR, "input[type='time']")
        if len(els) >= 2:
            self.js_set_value(els[1], time_str)
        return self

    def add_notes(self, text: str):
        try:
            self.type_into(*self._NOTES, text, timeout=3)
        except Exception:
            pass
        return self

    def submit(self):
        btn = self.wait_for_clickable(*self._BTN_SALVAR)
        self.scroll_into_view(btn)
        btn.click()
        return self

    def cancel(self):
        self.click(*self._BTN_CANCELAR)
        return self


class AppointmentsListPage(BasePage):
    PATH = "/schedule/appointments"

    _TABLE_ROWS = (By.CSS_SELECTOR, "tbody tr")
    _FILTER_STATUS = (By.CSS_SELECTOR, "select[formControlName='status'], select[name='status']")
    _FILTER_LOCATION = (By.CSS_SELECTOR, "select[formControlName='location'], select[name='location']")
    _INPUT_SEARCH = (By.CSS_SELECTOR, "input[type='search'], input[placeholder*='Buscar']")
    _BTN_NOVO = (By.XPATH, "//a[contains(@href,'/schedule/new')]")

    def open(self):
        self.navigate(self.PATH)
        return self

    def get_row_count(self) -> int:
        try:
            rows = self.wait_for_elements(*self._TABLE_ROWS, timeout=5)
            return len(rows)
        except Exception:
            return 0
