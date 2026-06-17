from selenium.webdriver.common.by import By
from .base_page import BasePage


class MedicalRecordsListPage(BasePage):
    PATH = "/medical-records"

    _TABLE_ROWS = (By.CSS_SELECTOR, "tbody tr, [class*='record-row']")
    _INPUT_BUSCA = (By.CSS_SELECTOR, "input[placeholder*='Buscar'], input[placeholder*='buscar'], input[type='search']")
    _RECORD_LINKS = (By.XPATH, "//a[contains(@href,'/medical-records/')]")

    def open(self):
        self.navigate(self.PATH)
        return self

    def get_row_count(self) -> int:
        try:
            rows = self.wait_for_elements(*self._TABLE_ROWS, timeout=5)
            return len(rows)
        except Exception:
            return 0

    def click_first_record(self):
        links = self.find_all(*self._RECORD_LINKS)
        if links:
            links[0].click()

    def search(self, term: str):
        try:
            self.type_into(*self._INPUT_BUSCA, term, timeout=3)
        except Exception:
            pass


class MedicalRecordDetailPage(BasePage):
    _PATIENT_NAME = (By.CSS_SELECTOR, "h1, h2, [class*='patient-name']")
    _BTN_ADD_EVOLUTION = (By.XPATH, "//button[contains(normalize-space(.),'Evolução') or contains(normalize-space(.),'evolução') or contains(normalize-space(.),'Adicionar')]")
    _EVOLUTION_DIALOG = (By.CSS_SELECTOR, "dialog, [role='dialog'], [class*='modal'], [class*='dialog']")
    _EVOLUTIONS_LIST = (By.CSS_SELECTOR, "[class*='evolution'], [class*='Evolution']")
    _PRESCRIPTIONS_SECTION = (By.XPATH, "//*[contains(normalize-space(.),'Prescrição') or contains(normalize-space(.),'receita')]")
    _PROCEDURES_SECTION = (By.XPATH, "//*[contains(normalize-space(.),'Procedimento') or contains(normalize-space(.),'procedimento')]")

    def open(self, record_id: str):
        self.navigate(f"/medical-records/{record_id}")
        return self

    def patient_name_is_visible(self) -> bool:
        return self.is_displayed(*self._PATIENT_NAME, timeout=5)

    def click_add_evolution(self):
        self.click(*self._BTN_ADD_EVOLUTION)

    def is_evolution_dialog_open(self) -> bool:
        return self.is_displayed(*self._EVOLUTION_DIALOG, timeout=3)
