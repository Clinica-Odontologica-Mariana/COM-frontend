from selenium.webdriver.common.by import By
from .base_page import BasePage


class PatientsListPage(BasePage):
    PATH = "/pacientes"

    _TABLE = (By.CSS_SELECTOR, "table, [class*='table']")
    _TABLE_ROWS = (By.CSS_SELECTOR, "tbody tr, [class*='table'] [class*='row']:not(:first-child)")
    _BTN_NOVO_CADASTRO = (By.XPATH, "//a[contains(@href,'/pacientes/new')] | //button[contains(normalize-space(.),'Novo Cadastro')]")
    _INPUT_BUSCA = (By.CSS_SELECTOR, "input[placeholder*='Buscar'], input[placeholder*='buscar'], input[placeholder*='nome'], input[placeholder*='Nome']")
    _INPUT_CPF = (By.CSS_SELECTOR, "input[placeholder*='CPF'], input[formControlName='cpf']")
    _SELECT_STATUS = (By.CSS_SELECTOR, "select[formControlName='status'], select[name='status']")
    _BTN_DELETE = (By.XPATH, "//button[@aria-label='Excluir'] | //button[@title='Excluir'] | //button[contains(normalize-space(.),'Excluir') and not(contains(@href,'/pacientes/new'))]")
    _BTN_EDIT = (By.XPATH, "//a[contains(@href,'/editar')] | //button[@aria-label='Editar']")
    _EMPTY_STATE = (By.XPATH, "//*[contains(normalize-space(.),'Nenhum') or contains(normalize-space(.),'nenhum') or contains(normalize-space(.),'Sem pacientes')]")
    _PAGINATION = (By.CSS_SELECTOR, "[class*='paginat']")
    _BREADCRUMB = (By.CSS_SELECTOR, "[class*='breadcrumb'], nav[aria-label*='breadcrumb']")

    def open(self):
        self.navigate(self.PATH)
        try:
            self.wait_for_element(By.CSS_SELECTOR, "main, body", timeout=4)
        except Exception:
            pass
        return self

    def click_novo_cadastro(self):
        self.click(*self._BTN_NOVO_CADASTRO)

    def search_by_name(self, name: str):
        self.type_into(*self._INPUT_BUSCA, name)

    def search_by_cpf(self, cpf: str):
        self.type_into(*self._INPUT_CPF, cpf)

    def get_row_count(self) -> int:
        try:
            rows = self.wait_for_elements(*self._TABLE_ROWS, timeout=5)
            return len(rows)
        except Exception:
            return 0

    def click_first_edit(self):
        btns = self.find_all(*self._BTN_EDIT)
        if btns:
            btns[0].click()

    def click_first_delete(self):
        btns = self.find_all(*self._BTN_DELETE)
        if btns:
            btns[0].click()

    def has_empty_state(self) -> bool:
        return self.is_displayed(*self._EMPTY_STATE, timeout=3)

    def has_table(self) -> bool:
        return self.is_displayed(*self._TABLE, timeout=5)


class PatientFormPage(BasePage):
    # Dados Pessoais
    _FULL_NAME = (By.CSS_SELECTOR, "input[formControlName='fullName']")
    _CPF = (By.CSS_SELECTOR, "input[formControlName='cpf']")
    _BIRTH_DATE = (By.CSS_SELECTOR, "input[formControlName='birthDate']")
    _PROFESSION = (By.CSS_SELECTOR, "input[formControlName='profession']")
    _STATUS = (By.CSS_SELECTOR, "select[formControlName='status']")
    _GENDER_FEMININO = (By.XPATH, "//input[@type='radio' and @value='female'] | //label[contains(normalize-space(.),'Feminino')]//input")
    _GENDER_MASCULINO = (By.XPATH, "//input[@type='radio' and @value='male'] | //label[contains(normalize-space(.),'Masculino')]//input")

    # Anamnese
    _CHIEF_COMPLAINT = (By.CSS_SELECTOR, "textarea[formControlName='chiefComplaint']")
    _CONTINUOUS_MEDS = (By.CSS_SELECTOR, "input[formControlName='continuousMedications']")
    _HC_HYPERTENSION = (By.XPATH, "//label[contains(normalize-space(.),'Hipertensão')]//input[@type='checkbox'] | //input[@value='hypertension']")
    _HC_DIABETES = (By.XPATH, "//label[contains(normalize-space(.),'Diabetes')]//input[@type='checkbox'] | //input[@value='diabetes']")

    # Contato
    _PHONE = (By.CSS_SELECTOR, "input[formControlName='phone']")
    _EMAIL = (By.CSS_SELECTOR, "input[formControlName='email']")
    _WHATSAPP_TOGGLE = (By.CSS_SELECTOR, "input[formControlName='whatsappReminders']")

    # Endereço
    _ZIP_CODE = (By.CSS_SELECTOR, "input[formControlName='zipCode']")
    _STREET = (By.CSS_SELECTOR, "input[formControlName='street']")
    _NEIGHBORHOOD = (By.CSS_SELECTOR, "input[formControlName='neighborhood']")
    _CITY = (By.CSS_SELECTOR, "input[formControlName='city']")
    _STATE = (By.CSS_SELECTOR, "input[formControlName='state']")

    # Ações
    _BTN_SALVAR = (By.XPATH, "//button[@type='submit'] | //button[contains(normalize-space(.),'Salvar')]")
    _BTN_CANCELAR = (By.XPATH, "//a[contains(@href,'/pacientes') and contains(normalize-space(.),'Cancelar')] | //button[contains(normalize-space(.),'Cancelar')]")

    # Erros
    _GENERIC_REQUIRED_ERROR = (By.CSS_SELECTOR, ".text-red-500")

    def open_new(self):
        self.navigate("/pacientes/new")
        try:
            self.wait_for_element(By.CSS_SELECTOR, "input[formControlName='fullName']", timeout=6)
        except Exception:
            pass
        return self

    def open_edit(self, patient_id: str):
        self.navigate(f"/pacientes/{patient_id}/editar")
        return self

    def fill_basic_info(self, full_name: str, cpf: str, status: str = "active", gender: str = "female"):
        self.type_into(*self._FULL_NAME, full_name)
        self.type_into(*self._CPF, cpf)
        try:
            self.select_by_value(*self._STATUS, status)
        except Exception:
            pass
        if gender == "female":
            self._click_radio(*self._GENDER_FEMININO)
        else:
            self._click_radio(*self._GENDER_MASCULINO)
        return self

    def _click_radio(self, by, value):
        try:
            el = self.wait_for_element(by, value, timeout=3)
            self.js_click(el)
        except Exception:
            pass

    def fill_contact(self, phone: str, email: str):
        self.type_into(*self._PHONE, phone)
        self.type_into(*self._EMAIL, email)
        return self

    def fill_address(self, zip_code: str, street: str, neighborhood: str, city: str, state: str):
        self.type_into(*self._ZIP_CODE, zip_code)
        self.type_into(*self._STREET, street)
        self.type_into(*self._NEIGHBORHOOD, neighborhood)
        self.type_into(*self._CITY, city)
        self.type_into(*self._STATE, state)
        return self

    def fill_anamnese(self, complaint: str):
        self.type_into(*self._CHIEF_COMPLAINT, complaint)
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
        return len(self.find_all(*self._GENERIC_REQUIRED_ERROR)) > 0

    def is_on_form_page(self) -> bool:
        return "/pacientes/new" in self.current_url or "/editar" in self.current_url
