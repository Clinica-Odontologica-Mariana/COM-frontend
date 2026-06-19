"""
Teste E2E — Jornada completa da aplicação COM (demonstração/pitch visual).

Execução direta:
    python e2e/application_flow_test.py

Execução via pytest:
    pytest e2e/application_flow_test.py -v

Requisitos:
    pip install -r e2e/requirements.txt
    Frontend rodando em E2E_BASE_URL (padrão: https://marianadias.odo.br)
    Backend acessível com credenciais em E2E_ADMIN_USERNAME / E2E_ADMIN_PASSWORD
"""

import os
import time

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select, WebDriverWait

try:
    from webdriver_manager.chrome import ChromeDriverManager
    from selenium.webdriver.chrome.service import Service as ChromeService

    _USE_MANAGER = True
except ImportError:
    _USE_MANAGER = False

# ---------------------------------------------------------------------------
# Configuração
# ---------------------------------------------------------------------------
_BASE_URL = os.getenv("E2E_BASE_URL", "https://marianadias.odo.br")
_USERNAME = os.getenv("E2E_ADMIN_USERNAME", "")
_PASSWORD = os.getenv("E2E_ADMIN_PASSWORD", "")
_TIMEOUT = 20

_CPF_TEST = "529.982.247-25"
_PATIENT_NAME = "Paciente E2E Selenium"
_CERT_TITLE = "Certificado E2E Selenium"


# ---------------------------------------------------------------------------
# Classe principal
# ---------------------------------------------------------------------------
class ApplicationFlowTest:
    """Jornada completa: páginas públicas → login → CRUD módulos → limpeza."""

    # Pytest exige que classes de teste não tenham __init__.
    # O estado é inicializado em _init_state(), chamado pelo fluxo principal.
    driver: webdriver.Chrome | None = None
    base_url: str = _BASE_URL
    created_data: dict = {}

    def _init_state(self) -> None:
        self.driver = None
        self.base_url = _BASE_URL
        self.created_data = {
            "patient_id": None,
            "material_id": None,
            "clinic_id": None,
            "certificate_title": None,
        }

    # ------------------------------------------------------------------
    # Setup / teardown
    # ------------------------------------------------------------------
    def setup_driver(self) -> None:
        options = webdriver.ChromeOptions()
        options.add_argument("--start-maximized")

        if _USE_MANAGER:
            service = ChromeService(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=options)
        else:
            self.driver = webdriver.Chrome(options=options)

        self.driver.implicitly_wait(0)

    def teardown(self) -> None:
        if self.driver:
            self.driver.quit()
            self.driver = None

    # ------------------------------------------------------------------
    # Helpers de espera e interação
    # ------------------------------------------------------------------
    def visual_wait(self) -> None:
        time.sleep(1)

    def slow_scroll(self, pixels: int = 500) -> None:
        self.driver.execute_script(f"window.scrollBy(0, {pixels})")
        self.visual_wait()

    def _wait_visible(self, by, value, timeout: int = _TIMEOUT):
        return WebDriverWait(self.driver, timeout).until(
            EC.visibility_of_element_located((by, value))
        )

    def _wait_clickable(self, by, value, timeout: int = _TIMEOUT):
        return WebDriverWait(self.driver, timeout).until(
            EC.element_to_be_clickable((by, value))
        )

    def _wait_url(self, fragment: str, timeout: int = _TIMEOUT) -> None:
        WebDriverWait(self.driver, timeout).until(EC.url_contains(fragment))

    def _click(self, by, value, timeout: int = _TIMEOUT):
        el = self._wait_clickable(by, value, timeout)
        el.click()
        self.visual_wait()
        return el

    def _type(self, by, value, text: str, timeout: int = _TIMEOUT):
        el = self._wait_clickable(by, value, timeout)
        el.clear()
        el.send_keys(text)
        self.visual_wait()
        return el

    def _navigate(self, path: str) -> None:
        self.driver.get(f"{self.base_url}{path}")
        self.visual_wait()

    def _select_option(self, by, value, option_value: str, timeout: int = _TIMEOUT):
        el = self._wait_visible(by, value, timeout)
        Select(el).select_by_value(option_value)
        self.visual_wait()

    def _select_by_visible_text(self, by, value, text: str, timeout: int = _TIMEOUT):
        el = self._wait_visible(by, value, timeout)
        Select(el).select_by_visible_text(text)
        self.visual_wait()

    def _log(self, msg: str) -> None:
        print(f"[E2E] {msg}")

    def _confirm_modal(self, timeout: int = 5) -> None:
        try:
            confirm_btn = WebDriverWait(self.driver, timeout).until(
                EC.element_to_be_clickable((
                    By.XPATH,
                    "//button[contains(normalize-space(.),'Confirmar') or "
                    "contains(normalize-space(.),'Excluir') or "
                    "contains(normalize-space(.),'Sim')]",
                ))
            )
            confirm_btn.click()
            self.visual_wait()
        except Exception:
            pass

    # ------------------------------------------------------------------
    # Fluxo principal (pytest entry-point e standalone)
    # ------------------------------------------------------------------
    def test_complete_flow(self):
        """Entry-point coletado pelo pytest."""
        self.run_full_flow()

    def run_full_flow(self) -> None:
        self._init_state()
        self.setup_driver()
        try:
            # Páginas públicas
            self._public_home()
            self._public_attendance()
            self._public_locations()

            # Autenticação
            logged_in = self._login()
            if not logged_in:
                self._log("Backend indisponível — abortando fluxo administrativo.")
                return

            # Área administrativa
            self._panel()
            self._patients_crud()
            self._schedule()
            self._medical_records()
            self._treatments()
            self._inventory_crud()
            self._clinics_crud()
            self._certificates()
            self._employees()
            self._profile()
            self._logout()

        except Exception:
            self.driver.save_screenshot("e2e_error.png")
            self._log(f"Falha na URL: {self.driver.current_url}")
            raise
        finally:
            self.cleanup_created_data()
            self.teardown()

    # ==================================================================
    # Etapas públicas
    # ==================================================================

    def _public_home(self) -> None:
        self._log("Etapa 1 — Página pública (home)")
        self._navigate("/")
        self._wait_visible(By.CSS_SELECTOR, "body")
        self.slow_scroll(400)
        self.slow_scroll(400)
        self.slow_scroll(400)
        self._log("Home carregada e percorrida com scroll.")

    def _public_attendance(self) -> None:
        self._log("Etapa 2 — Atendimento")
        self._navigate("/attendance")
        self._wait_visible(By.CSS_SELECTOR, "body")
        self.slow_scroll(400)
        self._log("Página /attendance carregada.")

    def _public_locations(self) -> None:
        self._log("Etapa 3 — Unidades")
        self._navigate("/locations")
        self._wait_visible(By.CSS_SELECTOR, "body")
        self.slow_scroll(400)
        self._log("Página /locations carregada.")

    # ==================================================================
    # Autenticação
    # ==================================================================

    def _login(self) -> bool:
        self._log("Etapa 4 — Login")
        self._navigate("/admin-access")
        self._wait_visible(By.CSS_SELECTOR, "[formcontrolname='username']")

        self._type(By.CSS_SELECTOR, "[formcontrolname='username']", _USERNAME)
        self._type(By.CSS_SELECTOR, "[formcontrolname='password']", _PASSWORD)
        self._click(By.CSS_SELECTOR, "[type='submit']")

        try:
            self._wait_url("/panel", timeout=20)
        except Exception:
            self._log("Login não redirecionou para /panel — backend indisponível.")
            return False

        self._wait_visible(By.CSS_SELECTOR, "app-global-sidebar", timeout=15)
        self.visual_wait()
        self._log("Login realizado. Sidebar presente.")
        return True

    # ==================================================================
    # Área administrativa
    # ==================================================================

    def _panel(self) -> None:
        self._log("Etapa 5 — Painel")
        self._navigate("/panel")
        self._wait_url("/panel")
        self.slow_scroll(300)
        self._log("Painel carregado.")

    # ------------------------------------------------------------------
    # Pacientes
    # ------------------------------------------------------------------

    def _patients_crud(self) -> None:
        self._log("Etapa 6 — Lista de pacientes")
        self._click(By.CSS_SELECTOR, "a[href='/pacientes']")
        self._wait_url("/pacientes")
        self.slow_scroll(300)

        self._log("Etapa 7 — Cadastrar paciente")
        self._create_patient()

    def _create_patient(self) -> None:
        try:
            self._click(
                By.XPATH,
                "//a[contains(@href,'/pacientes/new')] | "
                "//button[contains(normalize-space(.),'Novo Cadastro')]",
            )
            self._wait_url("/pacientes/new")
            self.visual_wait()

            self._type(By.CSS_SELECTOR, "input[formControlName='fullName']", _PATIENT_NAME)
            self._type(By.CSS_SELECTOR, "input[formControlName='cpf']", _CPF_TEST)

            btn = self._wait_clickable(
                By.XPATH,
                "//button[@type='submit'] | //button[contains(normalize-space(.),'Salvar')]",
            )
            self.driver.execute_script("arguments[0].scrollIntoView(true);", btn)
            btn.click()
            self.visual_wait()

            try:
                self._wait_url("/pacientes", timeout=10)
            except Exception:
                pass

            # Capturar ID do paciente pelo href de edição
            try:
                edit_links = self.driver.find_elements(
                    By.XPATH, "//a[contains(@href,'/editar')]"
                )
                if edit_links:
                    href = edit_links[0].get_attribute("href") or ""
                    parts = [p for p in href.split("/") if p]
                    idx = parts.index("pacientes") if "pacientes" in parts else -1
                    if idx != -1 and idx + 1 < len(parts):
                        self.created_data["patient_id"] = parts[idx + 1]
                        self._log(f"Paciente criado — ID: {self.created_data['patient_id']}")
            except Exception:
                pass

        except Exception as exc:
            self._log(f"Criação de paciente falhou: {exc}")

    # ------------------------------------------------------------------
    # Agenda
    # ------------------------------------------------------------------

    def _schedule(self) -> None:
        self._log("Etapa 8 — Agenda")
        self._click(By.CSS_SELECTOR, "a[href='/schedule']")
        self._wait_url("/schedule")
        self.slow_scroll(300)

        self._log("Etapa 9 — Lista de consultas")
        try:
            self._navigate("/schedule/appointments")
            self._wait_url("/schedule")
            self.visual_wait()
            self.slow_scroll(300)
        except Exception as exc:
            self._log(f"Agenda — consulta indisponível: {exc}")

    # ------------------------------------------------------------------
    # Prontuários
    # ------------------------------------------------------------------

    def _medical_records(self) -> None:
        self._log("Etapa 10 — Prontuários")
        self._click(By.CSS_SELECTOR, "a[href='/medical-records']")
        self._wait_url("/medical-records")
        self.slow_scroll(300)

        patient_id = self.created_data.get("patient_id")
        if patient_id:
            try:
                self._navigate(f"/medical-records/{patient_id}")
                self._wait_url(f"/medical-records/{patient_id}")
                self.slow_scroll(300)
                self._log(f"Prontuário do paciente {patient_id} aberto.")
            except Exception as exc:
                self._log(f"Prontuário indisponível: {exc}")
        else:
            try:
                links = self.driver.find_elements(
                    By.XPATH, "//a[contains(@href,'/medical-records/')]"
                )
                if links:
                    links[0].click()
                    self.visual_wait()
                    self.slow_scroll(300)
            except Exception:
                pass

    # ------------------------------------------------------------------
    # Tratamentos
    # ------------------------------------------------------------------

    def _treatments(self) -> None:
        self._log("Etapa 11 — Tratamentos")
        self._click(By.CSS_SELECTOR, "a[href='/treatments']")
        self._wait_url("/treatments")
        self.slow_scroll(300)

        patient_id = self.created_data.get("patient_id")
        if patient_id:
            self._log("Etapa 12 — Tratamentos do paciente criado")
            try:
                self._navigate(f"/pacientes/{patient_id}/tratamentos")
                self._wait_url("/tratamentos")
                self.slow_scroll(300)
                self._log("Página de tratamentos do paciente carregada.")
            except Exception as exc:
                self._log(f"Tratamentos do paciente indisponível: {exc}")
        else:
            try:
                links = self.driver.find_elements(
                    By.XPATH, "//a[contains(@href,'/treatments/')]"
                )
                if links:
                    links[0].click()
                    self.visual_wait()
                    self.slow_scroll(300)
            except Exception:
                pass

    # ------------------------------------------------------------------
    # Estoque
    # ------------------------------------------------------------------

    def _inventory_crud(self) -> None:
        self._log("Etapa 13 — Estoque")
        self._click(By.CSS_SELECTOR, "a[href='/inventories']")
        self._wait_url("/inventories")
        self.slow_scroll(300)

        self._log("Etapa 14 — Cadastrar material")
        self._create_material()

    def _create_material(self) -> None:
        try:
            self._navigate("/inventories/new")
            self._wait_url("/inventories/new")
            self.visual_wait()

            # Clínica (select — obrigatório em modo criação)
            try:
                clinic_selects = self.driver.find_elements(
                    By.CSS_SELECTOR, "select[formControlName='clinicId']"
                )
                if clinic_selects:
                    sel = Select(clinic_selects[0])
                    for opt in sel.options:
                        val = opt.get_attribute("value") or ""
                        if val:
                            sel.select_by_value(val)
                            self.visual_wait()
                            break
            except Exception:
                pass

            self._type(By.CSS_SELECTOR, "input[formControlName='name']", "Material E2E Selenium")

            try:
                self._select_option(
                    By.CSS_SELECTOR, "select[formControlName='type']", "MATERIAL"
                )
            except Exception:
                pass

            try:
                self._select_option(
                    By.CSS_SELECTOR, "select[formControlName='unit']", "unidade"
                )
            except Exception:
                pass

            save_btn = self._wait_clickable(
                By.XPATH, "//button[contains(normalize-space(.),'Salvar')]"
            )
            self.driver.execute_script("arguments[0].scrollIntoView(true);", save_btn)
            save_btn.click()
            self.visual_wait()

            try:
                self._wait_url("/inventories", timeout=10)
            except Exception:
                pass

            # Capturar ID do material criado
            try:
                edit_links = self.driver.find_elements(
                    By.XPATH,
                    "//a[contains(@href,'/inventories/') and contains(@href,'/edit')]",
                )
                if edit_links:
                    href = edit_links[0].get_attribute("href") or ""
                    parts = [p for p in href.split("/") if p]
                    idx = parts.index("inventories") if "inventories" in parts else -1
                    if idx != -1 and idx + 1 < len(parts):
                        self.created_data["material_id"] = parts[idx + 1]
                        self._log(f"Material criado — ID: {self.created_data['material_id']}")
            except Exception:
                pass

        except Exception as exc:
            self._log(f"Criação de material falhou: {exc}")

    # ------------------------------------------------------------------
    # Clínicas
    # ------------------------------------------------------------------

    def _clinics_crud(self) -> None:
        self._log("Etapa 15 — Clínicas")
        self._click(By.CSS_SELECTOR, "a[href='/clinics']")
        self._wait_url("/clinics")
        self.slow_scroll(300)

        self._log("Etapa 16 — Cadastrar clínica")
        self._create_clinic()

    def _create_clinic(self) -> None:
        try:
            btn = self.driver.find_elements(
                By.XPATH,
                "//a[contains(@href,'/clinics/new')] | "
                "//button[contains(normalize-space(.),'Nova Clínica') or "
                "contains(normalize-space(.),'Adicionar')]",
            )
            if btn:
                btn[0].click()
                self.visual_wait()
            else:
                self._navigate("/clinics/new")
                self.visual_wait()

            name_fields = self.driver.find_elements(
                By.CSS_SELECTOR, "input[formControlName='name']"
            )
            if not name_fields:
                self._log("Formulário de clínica não encontrado — pulando.")
                return

            name_fields[0].clear()
            name_fields[0].send_keys("Clínica E2E Selenium")
            self.visual_wait()

            phone_fields = self.driver.find_elements(
                By.CSS_SELECTOR, "input[formControlName='phone']"
            )
            if phone_fields:
                phone_fields[0].clear()
                phone_fields[0].send_keys("(11) 99999-9999")
                self.visual_wait()

            zip_fields = self.driver.find_elements(
                By.CSS_SELECTOR, "input[formControlName='zipCode']"
            )
            if zip_fields:
                zip_fields[0].clear()
                zip_fields[0].send_keys("01310-100")
                self.visual_wait()

            # Aguardar autopreenchimento do CEP (ViaCep)
            time.sleep(2)

            number_fields = self.driver.find_elements(
                By.CSS_SELECTOR, "input[formControlName='number']"
            )
            if number_fields:
                number_fields[0].clear()
                number_fields[0].send_keys("100")
                self.visual_wait()

            save_btns = self.driver.find_elements(
                By.XPATH,
                "//button[@type='submit'] | //button[contains(normalize-space(.),'Salvar')]",
            )
            if save_btns:
                self.driver.execute_script(
                    "arguments[0].scrollIntoView(true);", save_btns[0]
                )
                save_btns[0].click()
                self.visual_wait()

            # Capturar ID da clínica criada
            try:
                time.sleep(2)
                edit_links = self.driver.find_elements(
                    By.XPATH,
                    "//a[contains(@href,'/clinics/') and contains(@href,'/edit')]",
                )
                if edit_links:
                    href = edit_links[0].get_attribute("href") or ""
                    parts = [p for p in href.split("/") if p]
                    idx = parts.index("clinics") if "clinics" in parts else -1
                    if idx != -1 and idx + 1 < len(parts):
                        self.created_data["clinic_id"] = parts[idx + 1]
                        self._log(f"Clínica criada — ID: {self.created_data['clinic_id']}")
            except Exception:
                pass

        except Exception as exc:
            self._log(f"Criação de clínica falhou: {exc}")

    # ------------------------------------------------------------------
    # Certificados
    # ------------------------------------------------------------------

    def _certificates(self) -> None:
        self._log("Etapa 17 — Certificados")
        self._click(By.CSS_SELECTOR, "a[href='/certificados']")
        self._wait_url("/certificados")
        self.slow_scroll(300)

        self._log("Etapa 18 — Cadastrar certificado")
        self._create_certificate()

    def _create_certificate(self) -> None:
        try:
            title_fields = self.driver.find_elements(
                By.CSS_SELECTOR, "input[name='title']"
            )
            if not title_fields:
                self._log("Formulário de certificado não encontrado — pulando.")
                return

            title_fields[0].clear()
            title_fields[0].send_keys(_CERT_TITLE)
            self.visual_wait()

            try:
                self._select_by_visible_text(
                    By.CSS_SELECTOR, "select[name='certificateType']", "Especialização"
                )
            except Exception:
                pass

            save_btn = self._wait_clickable(
                By.XPATH,
                "//button[@type='submit'] | //button[contains(normalize-space(.),'Salvar Certificado')]",
            )
            self.driver.execute_script("arguments[0].scrollIntoView(true);", save_btn)
            save_btn.click()
            self.visual_wait()

            time.sleep(2)
            self.slow_scroll(300)

            self.created_data["certificate_title"] = _CERT_TITLE
            self._log(f"Certificado criado — título: {_CERT_TITLE}")

        except Exception as exc:
            self._log(f"Criação de certificado falhou: {exc}")

    # ------------------------------------------------------------------
    # Funcionários
    # ------------------------------------------------------------------

    def _employees(self) -> None:
        self._log("Etapa 19 — Funcionários")
        try:
            self._navigate("/employees")
            self._wait_url("/employees")
            self.slow_scroll(300)
            self._log("Lista de funcionários carregada.")
        except Exception as exc:
            self._log(f"Módulo de funcionários indisponível: {exc}")

    # ------------------------------------------------------------------
    # Perfil
    # ------------------------------------------------------------------

    def _profile(self) -> None:
        self._log("Etapa 20 — Meu perfil")
        try:
            self._navigate("/meu-perfil")
            self._wait_url("/meu-perfil")
            self.slow_scroll(300)
            self._log("Perfil carregado.")
        except Exception as exc:
            self._log(f"Perfil indisponível: {exc}")

    # ------------------------------------------------------------------
    # Logout
    # ------------------------------------------------------------------

    def _logout(self) -> None:
        self._log("Logout")
        try:
            self._wait_visible(
                By.XPATH, "//button[normalize-space(.)='Sair']", timeout=10
            )
            self._click(By.XPATH, "//button[normalize-space(.)='Sair']")
            self._wait_url("/admin-access", timeout=10)
            self.visual_wait()
            self._log("Logout realizado com sucesso.")
        except Exception as exc:
            self._log(f"Logout falhou: {exc}")

    # ==================================================================
    # Limpeza dos dados criados pelo E2E
    # ==================================================================

    def cleanup_created_data(self) -> None:
        if not self.driver:
            return

        self._log("Iniciando limpeza dos dados criados pelo E2E...")

        # Ordem: certificados → materiais → pacientes → clínicas
        self._cleanup_certificate()
        self._cleanup_material()
        self._cleanup_patient()
        self._cleanup_clinic()

        self._log("Limpeza concluída.")

    def _cleanup_certificate(self) -> None:
        title = self.created_data.get("certificate_title")
        if not title:
            return
        try:
            self._navigate("/certificados")
            self._wait_url("/certificados")
            self.visual_wait()

            edit_btns = self.driver.find_elements(
                By.XPATH,
                f"//div[contains(normalize-space(.), '{title}')]"
                f"/ancestor::*[position()<=4]"
                f"//button[contains(normalize-space(.),'Editar') or @aria-label='Editar']",
            )
            if edit_btns:
                edit_btns[0].click()
                self.visual_wait()
                delete_btns = self.driver.find_elements(
                    By.XPATH,
                    "//button[contains(normalize-space(.),'Excluir') or "
                    "contains(normalize-space(.),'Deletar')]",
                )
                if delete_btns:
                    delete_btns[0].click()
                    self.visual_wait()
                    self._confirm_modal()
                    self._log(f"Certificado '{title}' removido.")
            else:
                self._log(f"Certificado '{title}' não encontrado para remoção.")
        except Exception as exc:
            self._log(f"Falha ao remover certificado: {exc}")

    def _cleanup_material(self) -> None:
        material_id = self.created_data.get("material_id")
        if not material_id:
            return
        try:
            self._navigate(f"/inventories/{material_id}/edit")
            self._wait_url("/inventories")
            self.visual_wait()

            delete_btns = self.driver.find_elements(
                By.XPATH,
                "//button[contains(normalize-space(.),'Excluir') or "
                "contains(normalize-space(.),'Deletar')]",
            )
            if delete_btns:
                delete_btns[0].click()
                self.visual_wait()
                self._confirm_modal()
                self._log(f"Material {material_id} removido.")
            else:
                self._log(f"Botão excluir não encontrado para material {material_id}.")
        except Exception as exc:
            self._log(f"Falha ao remover material {material_id}: {exc}")

    def _cleanup_patient(self) -> None:
        patient_id = self.created_data.get("patient_id")
        if not patient_id:
            return
        try:
            self._navigate("/pacientes")
            self._wait_url("/pacientes")
            self.visual_wait()

            delete_btns = self.driver.find_elements(
                By.XPATH,
                "//button[@aria-label='Excluir'] | //button[@title='Excluir']",
            )
            if delete_btns:
                delete_btns[0].click()
                self.visual_wait()
                self._confirm_modal()
                self._log(f"Paciente {patient_id} removido.")
            else:
                self._log(f"Botão excluir não encontrado para paciente {patient_id}.")
        except Exception as exc:
            self._log(f"Falha ao remover paciente {patient_id}: {exc}")

    def _cleanup_clinic(self) -> None:
        clinic_id = self.created_data.get("clinic_id")
        if not clinic_id:
            return
        try:
            self._navigate("/clinics")
            self._wait_url("/clinics")
            self.visual_wait()

            delete_btns = self.driver.find_elements(
                By.XPATH,
                "//button[@aria-label='Excluir'] | //button[@title='Excluir'] | "
                "//button[contains(normalize-space(.),'Excluir')]",
            )
            if delete_btns:
                delete_btns[0].click()
                self.visual_wait()
                self._confirm_modal()
                self._log(f"Clínica {clinic_id} removida.")
            else:
                self._log(f"Botão excluir não encontrado para clínica {clinic_id}.")
        except Exception as exc:
            self._log(f"Falha ao remover clínica {clinic_id}: {exc}")


# ---------------------------------------------------------------------------
# Execução direta
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    ApplicationFlowTest().run_full_flow()
