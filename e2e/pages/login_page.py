from selenium.webdriver.common.by import By
from .base_page import BasePage


class LoginPage(BasePage):
    PATH = "/admin-access"

    # Locators
    _USERNAME = (By.CSS_SELECTOR, "input[formControlName='username'], input[type='email'], input[name='username']")
    _PASSWORD = (By.CSS_SELECTOR, "input[formControlName='password'], input[type='password']")
    _SUBMIT = (By.CSS_SELECTOR, "button[type='submit']")
    _ERROR_MSG = (By.CSS_SELECTOR, ".text-red-500, [class*='error'], [class*='alert']")
    _PASSWORD_TOGGLE = (By.CSS_SELECTOR, "button[aria-label*='senha'], button[aria-label*='password'], button.toggle-password")

    def open(self):
        self.navigate(self.PATH)
        return self

    def enter_username(self, username: str):
        self.type_into(*self._USERNAME, username)
        return self

    def enter_password(self, password: str):
        self.type_into(*self._PASSWORD, password)
        return self

    def submit(self):
        self.click(*self._SUBMIT)
        return self

    def login(self, username: str, password: str):
        self.enter_username(username)
        self.enter_password(password)
        self.submit()
        return self

    def get_error_message(self) -> str:
        return self.get_text(*self._ERROR_MSG)

    def toggle_password_visibility(self):
        self.click(*self._PASSWORD_TOGGLE)
        return self

    def password_is_visible(self) -> bool:
        el = self.find(*self._PASSWORD)
        return el.get_attribute("type") == "text"

    def is_on_login_page(self) -> bool:
        return self.PATH in self.current_url

    def has_required_errors(self) -> bool:
        return self.element_exists(By.CSS_SELECTOR, ".text-red-500, [class*='error']")

    def username_has_error(self) -> bool:
        return self.element_exists(
            By.XPATH,
            "//*[contains(text(),'obrigatório') or contains(text(),'inválido') or contains(text(),'required')]",
        )
