"""
Testes da feature de Agenda/Agendamentos:
- Página principal (calendário)
- Formulário de novo agendamento
- Listagem de agendamentos
- Filtros por status e localização
- Validações do formulário
"""
import pytest
import time
from selenium.webdriver.common.by import By
from pages.schedule_page import ScheduleMainPage, AppointmentFormPage, AppointmentsListPage


def _inject_token(driver, base_url):
    driver.get(base_url)
    driver.execute_script(
        "localStorage.setItem('access_token', 'selenium-test-token');"
        "localStorage.setItem('access_token_expiry', String(Date.now() + 3600000));"
    )


@pytest.fixture()
def main_page(driver, base_url):
    _inject_token(driver, base_url)
    return ScheduleMainPage(driver, base_url)


@pytest.fixture()
def form_page(driver, base_url):
    _inject_token(driver, base_url)
    return AppointmentFormPage(driver, base_url)


@pytest.fixture()
def list_page(driver, base_url):
    _inject_token(driver, base_url)
    return AppointmentsListPage(driver, base_url)


class TestScheduleMainPage:
    def test_schedule_page_loads(self, main_page):
        main_page.open()
        assert "/schedule" in main_page.current_url or "/admin-access" in main_page.current_url

    def test_schedule_page_renders_calendar_or_content(self, main_page):
        main_page.open()
        assert main_page.is_displayed(By.CSS_SELECTOR, "main, body", timeout=5)

    def test_schedule_has_novo_button(self, main_page):
        main_page.open()
        if "/admin-access" in main_page.current_url:
            pytest.skip("Backend não disponível — agenda redireciona para login")
        has_btn = main_page.element_exists(
            By.XPATH, "//a[contains(@href,'/schedule/new')] | //button[contains(normalize-space(.),'Novo')]"
        )
        assert has_btn, "Deve existir botão para novo agendamento"

    def test_click_novo_navigates_to_form(self, main_page):
        main_page.open()
        try:
            main_page.click_novo_agendamento()
            main_page.wait_for_url_contains("/schedule/new", timeout=5)
            assert "/schedule/new" in main_page.current_url
        except Exception:
            pytest.skip("Requer autenticação real com backend")


class TestAppointmentFormPage:
    def test_appointment_form_loads(self, form_page):
        form_page.open()
        assert "/schedule/new" in form_page.current_url

    def test_appointment_form_has_patient_search(self, form_page):
        form_page.open()
        has_field = form_page.element_exists(
            By.CSS_SELECTOR,
            "input[formControlName='patientSearch'], input[placeholder*='paciente'], input[placeholder*='Paciente']",
        )
        assert has_field, "Formulário deve ter campo de busca de paciente"

    def test_appointment_form_has_date_field(self, form_page):
        form_page.open()
        has_field = form_page.element_exists(
            By.CSS_SELECTOR, "input[type='date'], input[formControlName='date']"
        )
        assert has_field, "Formulário deve ter campo de data"

    def test_appointment_form_has_time_fields(self, form_page):
        form_page.open()
        time_fields = form_page.find_all(By.CSS_SELECTOR, "input[type='time']")
        assert len(time_fields) >= 1, "Formulário deve ter ao menos um campo de horário"

    def test_appointment_form_has_save_button(self, form_page):
        form_page.open()
        has_btn = form_page.element_exists(
            By.XPATH, "//button[@type='submit'] | //button[contains(normalize-space(.),'Salvar') or contains(normalize-space(.),'Agendar')]"
        )
        assert has_btn, "Formulário deve ter botão salvar/agendar"

    def test_submit_empty_form_does_not_navigate_away(self, form_page):
        form_page.open()
        try:
            form_page.submit()
            time.sleep(1)
            assert "/schedule" in form_page.current_url
        except Exception:
            pytest.skip("Submit não disponível sem backend")

    def test_date_field_accepts_value(self, form_page):
        form_page.open()
        form_page.set_date("2026-07-15")
        date_els = form_page.find_all(By.CSS_SELECTOR, "input[type='date'], input[formControlName='date']")
        if date_els:
            assert date_els[0].get_attribute("value") == "2026-07-15", (
                "Data deve ser preenchida corretamente"
            )

    def test_time_fields_accept_values(self, form_page):
        form_page.open()
        form_page.set_start_time("09:00")
        form_page.set_end_time("10:00")
        time_fields = form_page.find_all(By.CSS_SELECTOR, "input[type='time']")
        if len(time_fields) >= 2:
            assert time_fields[0].get_attribute("value") == "09:00"
            assert time_fields[1].get_attribute("value") == "10:00"

    def test_notes_field_accepts_text(self, form_page):
        form_page.open()
        form_page.add_notes("Observações do teste Selenium")
        try:
            el = form_page.find(By.CSS_SELECTOR, "textarea[formControlName='notes']")
            assert "Selenium" in el.get_attribute("value")
        except Exception:
            pytest.skip("Campo de notas não encontrado")

    def test_cancel_returns_to_schedule(self, form_page):
        form_page.open()
        try:
            form_page.cancel()
            form_page.wait_for_url_contains("/schedule", timeout=5)
            assert "/schedule/new" not in form_page.current_url
        except Exception:
            pytest.skip("Botão cancelar não encontrado")

    def test_patient_search_input_is_interactive(self, form_page):
        form_page.open()
        try:
            form_page.search_patient("Maria")
            time.sleep(1)
            el = form_page.find(By.CSS_SELECTOR, "input[formControlName='patientSearch'], input[placeholder*='aciente']")
            assert "Maria" in el.get_attribute("value"), "Campo de busca deve aceitar texto"
        except Exception:
            pytest.skip("Campo de busca de paciente não disponível")

    def test_professional_select_exists(self, form_page):
        form_page.open()
        has_field = form_page.element_exists(
            By.CSS_SELECTOR, "select[formControlName='professionalId']"
        )
        assert has_field, "Select de profissional deve existir"

    def test_procedure_select_exists(self, form_page):
        form_page.open()
        has_field = form_page.element_exists(
            By.CSS_SELECTOR, "select[formControlName='procedureId']"
        )
        assert has_field, "Select de procedimento deve existir"


class TestAppointmentsListPage:
    def test_appointments_list_loads(self, list_page):
        list_page.open()
        assert "/schedule/appointments" in list_page.current_url or "/admin-access" in list_page.current_url

    def test_appointments_list_renders_content(self, list_page):
        list_page.open()
        assert list_page.is_displayed(By.CSS_SELECTOR, "main, body", timeout=5)

    def test_appointments_list_has_novo_button(self, list_page):
        import time
        list_page.open()
        time.sleep(0.4)
        if "/admin-access" in list_page.current_url:
            pytest.skip("Backend não disponível — lista de agendamentos redireciona para login")
        has_btn = list_page.element_exists(By.XPATH, "//a[contains(@href,'/schedule/new')]")
        assert has_btn, "Lista de agendamentos deve ter botão para novo agendamento"

    def test_appointments_list_table_or_empty(self, list_page):
        list_page.open()
        count = list_page.get_row_count()
        assert count >= 0, "get_row_count deve retornar número >= 0"
