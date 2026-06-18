from selenium.webdriver.common.by import By
from .base_page import BasePage


class InventoriesListPage(BasePage):
    PATH = "/inventories"

    _TABLE_ROWS = (By.CSS_SELECTOR, "tbody tr, [class*='inventory-row']")
    _BTN_NOVO = (By.XPATH, "//a[contains(@href,'/inventories/new')] | //button[contains(normalize-space(.),'Novo')]")
    _BTN_EDIT = (By.XPATH, "//a[contains(@href,'/inventories/') and contains(@href,'/edit')]")
    _BTN_DELETE = (By.XPATH, "//button[@aria-label='Excluir'] | //button[contains(normalize-space(.),'Excluir')]")
    _EMPTY_STATE = (By.XPATH, "//*[contains(normalize-space(.),'Nenhum') or contains(normalize-space(.),'nenhum')]")

    def open(self):
        self.navigate(self.PATH)
        return self

    def click_novo(self):
        self.click(*self._BTN_NOVO)

    def get_row_count(self) -> int:
        try:
            rows = self.wait_for_elements(*self._TABLE_ROWS, timeout=5)
            return len(rows)
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

    def has_empty_state(self) -> bool:
        return self.is_displayed(*self._EMPTY_STATE, timeout=3)


class InventoryItemFormPage(BasePage):
    _NAME = (By.CSS_SELECTOR, "input[formControlName='name']")
    _TYPE = (By.CSS_SELECTOR, "select[formControlName='type']")
    _CLINIC = (By.CSS_SELECTOR, "select[formControlName='clinicId']")
    _UNIT = (By.CSS_SELECTOR, "select[formControlName='unit']")
    _SKU = (By.CSS_SELECTOR, "input[formControlName='sku']")
    _DESCRIPTION = (By.CSS_SELECTOR, "textarea[formControlName='description']")
    _MINIMUM_QTY = (By.CSS_SELECTOR, "input[formControlName='minimumQuantity']")
    _INITIAL_QTY = (By.CSS_SELECTOR, "input[formControlName='initialQuantity']")
    _ADJUSTED_QTY = (By.CSS_SELECTOR, "input[formControlName='adjustedQuantity']")
    _BTN_SALVAR = (By.XPATH, "//button[@type='submit'] | //button[contains(normalize-space(.),'Salvar')]")
    _BTN_CANCELAR = (By.XPATH, "//button[contains(normalize-space(.),'Cancelar')] | //a[contains(normalize-space(.),'Cancelar')]")

    def open_new(self):
        import time
        import pytest
        self.navigate("/inventories/new")
        time.sleep(0.4)
        if "/admin-access" in self.driver.current_url:
            pytest.skip("Backend não disponível — formulário de estoque redireciona para login")
        return self

    def open_edit(self, item_id: str):
        self.navigate(f"/inventories/{item_id}/edit")
        return self

    def fill_item(self, name: str, initial_qty: str = "10"):
        self.type_into(*self._NAME, name)
        try:
            self.type_into(*self._INITIAL_QTY, initial_qty, timeout=3)
        except Exception:
            pass
        try:
            self.type_into(*self._SKU, f"SKU-{name[:5].upper()}", timeout=3)
        except Exception:
            pass
        return self

    def select_type(self, value: str):
        try:
            self.select_by_value(*self._TYPE, value)
        except Exception:
            pass
        return self

    def select_unit(self, value: str):
        try:
            self.select_by_value(*self._UNIT, value)
        except Exception:
            pass
        return self

    def select_clinic(self, index: int = 0):
        try:
            from selenium.webdriver.support.ui import Select
            el = self.wait_for_element(*self._CLINIC, timeout=5)
            sel = Select(el)
            opts = sel.options
            if len(opts) > index + 1:
                sel.select_by_index(index + 1)
        except Exception:
            pass
        return self

    def adjust_quantity(self, qty: str):
        try:
            self.type_into(*self._ADJUSTED_QTY, qty, timeout=3)
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

    def has_required_errors(self) -> bool:
        return len(self.find_all(By.CSS_SELECTOR, ".text-red-500")) > 0
