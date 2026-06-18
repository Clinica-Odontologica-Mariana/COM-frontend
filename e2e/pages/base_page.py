"""Page Object base com helpers de espera e interação."""
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys

DEFAULT_TIMEOUT = 10


class BasePage:
    def __init__(self, driver, base_url: str):
        self.driver = driver
        self.base_url = base_url.rstrip("/")

    # ------------------------------------------------------------------
    # Navigation
    # ------------------------------------------------------------------

    def navigate(self, path: str = ""):
        self.driver.get(f"{self.base_url}{path}")

    @property
    def current_url(self) -> str:
        return self.driver.current_url

    @property
    def current_path(self) -> str:
        url = self.driver.current_url
        return url.replace(self.base_url, "")

    @property
    def page_title(self) -> str:
        return self.driver.title

    # ------------------------------------------------------------------
    # Waits
    # ------------------------------------------------------------------

    def wait(self, timeout: int = DEFAULT_TIMEOUT) -> WebDriverWait:
        return WebDriverWait(self.driver, timeout)

    def wait_for_url_contains(self, fragment: str, timeout: int = DEFAULT_TIMEOUT):
        self.wait(timeout).until(EC.url_contains(fragment))

    def wait_for_element(self, by, value, timeout: int = DEFAULT_TIMEOUT):
        return self.wait(timeout).until(EC.presence_of_element_located((by, value)))

    def wait_for_visible(self, by, value, timeout: int = DEFAULT_TIMEOUT):
        return self.wait(timeout).until(EC.visibility_of_element_located((by, value)))

    def wait_for_clickable(self, by, value, timeout: int = DEFAULT_TIMEOUT):
        return self.wait(timeout).until(EC.element_to_be_clickable((by, value)))

    def wait_for_text_in_element(self, by, value, text: str, timeout: int = DEFAULT_TIMEOUT):
        return self.wait(timeout).until(EC.text_to_be_present_in_element((by, value), text))

    def wait_for_elements(self, by, value, timeout: int = DEFAULT_TIMEOUT):
        self.wait(timeout).until(EC.presence_of_all_elements_located((by, value)))
        return self.driver.find_elements(by, value)

    def wait_for_invisibility(self, by, value, timeout: int = DEFAULT_TIMEOUT):
        return self.wait(timeout).until(EC.invisibility_of_element_located((by, value)))

    # ------------------------------------------------------------------
    # Interaction helpers
    # ------------------------------------------------------------------

    def find(self, by, value):
        return self.driver.find_element(by, value)

    def find_all(self, by, value):
        return self.driver.find_elements(by, value)

    def click(self, by, value, timeout: int = DEFAULT_TIMEOUT):
        el = self.wait_for_clickable(by, value, timeout)
        el.click()

    def type_into(self, by, value, text: str, clear: bool = True, timeout: int = DEFAULT_TIMEOUT):
        el = self.wait_for_clickable(by, value, timeout)
        if clear:
            el.clear()
        el.send_keys(text)

    def select_by_value(self, by, value, option_value: str, timeout: int = DEFAULT_TIMEOUT):
        el = self.wait_for_element(by, value, timeout)
        Select(el).select_by_value(option_value)

    def select_by_visible_text(self, by, value, text: str, timeout: int = DEFAULT_TIMEOUT):
        el = self.wait_for_element(by, value, timeout)
        Select(el).select_by_visible_text(text)

    def scroll_into_view(self, element):
        self.driver.execute_script("arguments[0].scrollIntoView(true);", element)

    def js_click(self, element):
        self.driver.execute_script("arguments[0].click();", element)

    def js_set_value(self, element, value: str):
        self.driver.execute_script("arguments[0].value = arguments[1];", element, value)

    def get_text(self, by, value, timeout: int = DEFAULT_TIMEOUT) -> str:
        return self.wait_for_visible(by, value, timeout).text.strip()

    def is_displayed(self, by, value, timeout: int = 2) -> bool:
        try:
            return self.wait_for_visible(by, value, timeout).is_displayed()
        except Exception:
            return False

    def element_exists(self, by, value, timeout: int = 2) -> bool:
        try:
            self.wait(timeout).until(EC.presence_of_element_located((by, value)))
            return True
        except Exception:
            return False

    def slow_type(self, element, text: str, delay: float = 0.05):
        for char in text:
            element.send_keys(char)
            time.sleep(delay)

    # ------------------------------------------------------------------
    # Cookies / localStorage
    # ------------------------------------------------------------------

    def set_local_storage(self, key: str, value: str):
        self.driver.execute_script(
            "localStorage.setItem(arguments[0], arguments[1]);", key, value
        )

    def get_local_storage(self, key: str) -> str:
        return self.driver.execute_script(
            "return localStorage.getItem(arguments[0]);", key
        )

    def clear_local_storage(self):
        current = self.driver.current_url
        if not current.startswith("http"):
            self.driver.get(self.base_url)
        self.driver.execute_script("localStorage.clear();")

    # ------------------------------------------------------------------
    # Toast notifications
    # ------------------------------------------------------------------

    def wait_for_toast(self, timeout: int = 8) -> str:
        """Aguarda qualquer toast aparecer e retorna seu texto."""
        el = self.wait_for_visible(By.CSS_SELECTOR, "[class*='toast']", timeout)
        return el.text.strip()

    # ------------------------------------------------------------------
    # Modal / confirm dialog
    # ------------------------------------------------------------------

    def wait_for_confirm_dialog(self, timeout: int = DEFAULT_TIMEOUT):
        return self.wait_for_visible(By.CSS_SELECTOR, "app-confirm-dialog", timeout)

    def click_confirm_dialog_confirm(self):
        btn = self.wait_for_clickable(
            By.XPATH,
            "//app-confirm-dialog//button[contains(normalize-space(.), 'Confirmar') or contains(normalize-space(.), 'Sim') or contains(normalize-space(.), 'Excluir')]",
        )
        btn.click()

    def click_confirm_dialog_cancel(self):
        btn = self.wait_for_clickable(
            By.XPATH,
            "//app-confirm-dialog//button[contains(normalize-space(.), 'Cancelar') or contains(normalize-space(.), 'Não')]",
        )
        btn.click()
