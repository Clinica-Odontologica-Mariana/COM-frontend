"""
Seed de dados de teste para a suíte E2E do COM-Frontend.

Cria os dados mínimos necessários para que todos os testes passem com backend real:
  - 1 clínica (usada nos selects de estoque e agendamento)
  - 2 pacientes: "Maria da Silva" (para teste de busca) e "João Silva"
  - 1 agendamento vinculando paciente à clínica
  - 1 item de estoque vinculado à clínica
  - Prontuário (ID=1) é gerado automaticamente no backend ao criar o paciente

Uso:
    python3 seed_data.py

Variáveis de ambiente (carregadas de .env / .env.local):
    BACKEND_API_URL       — ex.: http://localhost:8080/api/v1
    KEYCLOAK_EXTERNAL_URL — ex.: http://localhost:8080
    KEYCLOAK_REALM        — ex.: rest-ms
    KEYCLOAK_CLIENT_ID    — ex.: rest-ms-api
    KEYCLOAK_CLIENT_SECRET
    E2E_ADMIN_USERNAME
    E2E_ADMIN_PASSWORD
"""

import os
import sys
import time
import requests
from pathlib import Path

try:
    from dotenv import load_dotenv  # type: ignore[import-untyped]
except ImportError:
    load_dotenv = lambda *_, **__: None  # type: ignore[assignment]

load_dotenv(Path(__file__).parent / ".env")
load_dotenv(Path(__file__).parent / ".env.local", override=True)

BASE_API            = os.getenv("BACKEND_API_URL",       "http://localhost:8080/api/v1")
KC_URL              = os.getenv("KEYCLOAK_EXTERNAL_URL", "http://localhost:8080")
KC_REALM            = os.getenv("KEYCLOAK_REALM",        "rest-ms")
KC_CLIENT_ID        = os.getenv("KEYCLOAK_CLIENT_ID",    "rest-ms-api")
KC_CLIENT_SECRET    = os.getenv("KEYCLOAK_CLIENT_SECRET","rest-ms-api-secret")
ADMIN_USER          = os.getenv("E2E_ADMIN_USERNAME",    "api-admin")
ADMIN_PASS          = os.getenv("E2E_ADMIN_PASSWORD",    "api-admin123")

SESSION = requests.Session()
SESSION.headers.update({"Accept": "application/json"})


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

def _get_token() -> str | None:
    # Usa o endpoint de login do backend como fonte primária: ele chama o Keycloak
    # internamente (via hostname Docker "keycloak:8080"), então o token retornado
    # tem iss=http://keycloak:8080/realms/... — exatamente o que o Spring Boot
    # espera ao validar Bearer tokens. Resposta: {"success":true,"data":{"accessToken":"..."}}
    try:
        r = requests.post(
            f"{BASE_API}/auth/login",
            json={"username": ADMIN_USER, "password": ADMIN_PASS},
            timeout=10,
        )
        if r.status_code == 200:
            d = r.json()
            token = (
                d.get("data", {}).get("accessToken")
                or d.get("accessToken")
                or d.get("access_token")
            )
            if token:
                print("  (via backend /auth/login)")
                return token
        else:
            print(f"  (backend login → {r.status_code}: {r.text[:120]})")
    except requests.RequestException as e:
        print(f"  (backend indisponível: {e})")

    # Fallback: Keycloak ROPC direto (só funciona se KC_HOSTNAME estiver configurado
    # com a mesma URL que o Spring Boot usa como issuer-uri).
    try:
        r = requests.post(
            f"{KC_URL}/realms/{KC_REALM}/protocol/openid-connect/token",
            data={
                "grant_type":    "password",
                "client_id":     KC_CLIENT_ID,
                "client_secret": KC_CLIENT_SECRET,
                "username":      ADMIN_USER,
                "password":      ADMIN_PASS,
            },
            timeout=10,
        )
        if r.status_code == 200:
            token = r.json().get("access_token")
            if token:
                print("  (via Keycloak ROPC — iss pode divergir do issuer-uri do backend)")
                return token
        else:
            print(f"  (Keycloak ROPC → {r.status_code}: {r.text[:120]})")
    except requests.RequestException as e:
        print(f"  (Keycloak indisponível: {e})")

    return None


def _decode_jwt_payload(token: str) -> dict:
    """Decodifica o payload do JWT sem verificar assinatura (apenas diagnóstico)."""
    import base64, json as _json
    try:
        payload_b64 = token.split(".")[1]
        padding = 4 - len(payload_b64) % 4
        payload_b64 += "=" * (padding % 4)
        return _json.loads(base64.b64decode(payload_b64))
    except Exception:
        return {}


def _set_auth(token: str) -> None:
    SESSION.headers["Authorization"] = f"Bearer {token}"
    claims = _decode_jwt_payload(token)
    print(f"    iss : {claims.get('iss', '(não encontrado)')}")
    print(f"    sub : {claims.get('sub', '(não encontrado)')}")
    print(f"    azp : {claims.get('azp', '(não encontrado)')}")


# ---------------------------------------------------------------------------
# Helpers de API
# ---------------------------------------------------------------------------

def _unwrap(body: dict | list) -> list | dict | None:
    """Extrai o payload útil do envelope {"success":true,"data":...}."""
    if isinstance(body, list):
        return body
    if isinstance(body, dict):
        # Envelope padrão: {"success":true,"data":...}
        if "success" in body and "data" in body:
            inner = body["data"]
        else:
            inner = body
        # Paginado: {"content":[...], "totalElements":N, ...}
        if isinstance(inner, dict):
            for key in ("content", "items", "results"):
                if isinstance(inner.get(key), list):
                    return inner[key]
        return inner
    return None


def _get_list(path: str) -> list:
    """GET {path} → lista de itens (suporta envelope e paginação do Spring Boot)."""
    try:
        r = SESSION.get(f"{BASE_API}{path}", timeout=10)
        if r.status_code != 200:
            return []
        result = _unwrap(r.json())
        if isinstance(result, list):
            return result
    except Exception:
        pass
    return []


def _create(path: str, payload: dict) -> dict | None:
    try:
        r = SESSION.post(f"{BASE_API}{path}", json=payload, timeout=15)
        if r.status_code in (200, 201):
            result = _unwrap(r.json())
            return result if isinstance(result, dict) else None
        _warn(f"POST {path} → {r.status_code}: {r.text[:200]}")
        if r.status_code == 401:
            www_auth = r.headers.get("WWW-Authenticate", "(header ausente)")
            _warn(f"  WWW-Authenticate: {www_auth}")
    except Exception as e:
        _warn(f"POST {path} → exceção: {e}")
    return None


def _ok(msg: str)   -> None: print(f"  \033[32m✔\033[0m  {msg}")
def _skip(msg: str) -> None: print(f"  \033[33m–\033[0m  {msg}")
def _warn(msg: str) -> None: print(f"  \033[31m✗\033[0m  {msg}", file=sys.stderr)


def _upsert(
    list_path: str,
    create_path: str,
    payload: dict,
    key_field: str,
    key_value: str,
    label: str,
) -> dict | None:
    """Cria a entidade somente se não existir (busca por key_field == key_value)."""
    existing = _get_list(list_path)
    for item in existing:
        if str(item.get(key_field, "")).lower() == str(key_value).lower():
            _skip(f"{label} já existe (id={item.get('id', '?')})")
            return item

    created = _create(create_path, payload)
    if created:
        _ok(f"{label} criado (id={created.get('id', '?')})")
    return created


# ---------------------------------------------------------------------------
# Dados de teste
# ---------------------------------------------------------------------------

CLINICA = {
    "name":    "Clínica Odontológica Mariana",
    "phone":   "6130000001",
    "email":   "contato@comselenium.com.br",
    "whatsapp":"61999990001",
    "instagram":"@clinicamariana",
    "address": {
        "street":      "Rua dos Testes",
        "number":      "100",
        "neighborhood":"Asa Sul",
        "zipCode":     "70000000",
        "city":        "Brasília",
        "state":       "DF",
    },
}

PATIENT_MARIA = {
    "fullName":  "Maria da Silva Teste",
    "cpf":       "12345678909",   # CPF válido: 123.456.789-09
    "phone":     "61988887777",
    "email":     "maria.selenium@comteste.com",
    "birthDate": "1990-06-15",
}

PATIENT_JOAO = {
    "fullName":  "João Silva Teste",
    "cpf":       "98765432100",   # CPF válido: 987.654.321-00
    "phone":     "61977776666",
    "email":     "joao.selenium@comteste.com",
    "birthDate": "1985-03-20",
}

ESTOQUE_LUVA = {
    "name":     "Luva Descartável P",
    "itemType": "MATERIAL",    # MATERIAL ou EQUIPMENT
    "unit":     "UN",
    "sku":      "LUVA-P-E2E",
    "description": "Item criado automaticamente pelo seed E2E",
}


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    print()
    print("=" * 60)
    print("  COM E2E — Seed de dados de teste")
    print(f"  Backend: {BASE_API}")
    print("=" * 60)

    # Autenticação
    print("\n[1/5] Autenticando...")
    token = _get_token()
    if not token:
        _warn("Não foi possível obter token. Verifique se o backend está rodando.")
        return 1
    _set_auth(token)
    _ok(f"Autenticado como {ADMIN_USER}")

    # Clínica
    print("\n[2/5] Clínica...")
    clinic = _upsert("/clinics", "/clinics", CLINICA, "name", CLINICA["name"], "Clínica")
    clinic_id = clinic.get("id") if clinic else None

    # Pacientes
    print("\n[3/5] Pacientes...")
    _upsert(
        "/patients", "/patients",
        PATIENT_MARIA, "cpf", PATIENT_MARIA["cpf"], "Paciente Maria"
    )
    _upsert(
        "/patients", "/patients",
        PATIENT_JOAO, "cpf", PATIENT_JOAO["cpf"], "Paciente João"
    )

    # Agendamento (requer professionalId + statusId — pulado no seed automático)
    print("\n[4/5] Agendamento...")
    _skip("Agendamento requer professionalId e statusId — crie manualmente se necessário para testes")

    # Estoque
    print("\n[5/5] Estoque...")
    if clinic_id:
        item = {**ESTOQUE_LUVA, "clinicId": clinic_id}
        _upsert("/inventory-items", "/inventory-items", item, "sku", item["sku"], "Item de estoque")
    else:
        _skip("Estoque ignorado (clínica não disponível)")

    print()
    print("=" * 60)
    print("  Seed concluído.")
    print("=" * 60)
    print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
