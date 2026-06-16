-- =============================================================================
-- Seed: COM — Clínica Odontológica Mariana
-- Dados de teste para E2E. Execute no banco da aplicação antes dos testes.
-- Compatível com PostgreSQL. Para MySQL substitua ON CONFLICT por INSERT IGNORE.
--
-- Para resetar antes de re-executar:
--   DELETE FROM odontogram_entry   WHERE id LIKE '55555555%';
--   DELETE FROM treatment_plan_item WHERE id LIKE '44444444%';
--   DELETE FROM treatment_plan WHERE id LIKE '66666666%';
--   DELETE FROM medical_record WHERE id LIKE '33333333%';
--   DELETE FROM patient WHERE id LIKE '22222222%';
--   DELETE FROM clinical_procedure WHERE id LIKE '11111111%';
-- =============================================================================
-- ───────────────────────────────────────────────
-- Procedimentos Clínicos
-- ───────────────────────────────────────────────
INSERT INTO
  clinical_procedure (id, name, category)
VALUES
  (
    '11111111-0000-0000-0000-000000000001',
    'Extração de Siso',
    'Cirurgia'
  ),
  (
    '11111111-0000-0000-0000-000000000002',
    'Clareamento Dental',
    'Estética'
  ),
  (
    '11111111-0000-0000-0000-000000000003',
    'Restauração em Resina',
    'Restauração'
  ),
  (
    '11111111-0000-0000-0000-000000000004',
    'Implante Dentário',
    'Implante'
  ),
  (
    '11111111-0000-0000-0000-000000000005',
    'Coroa de Porcelana',
    'Prótese'
  ),
  (
    '11111111-0000-0000-0000-000000000006',
    'Limpeza e Profilaxia',
    'Prevenção'
  ),
  (
    '11111111-0000-0000-0000-000000000007',
    'Tratamento de Canal',
    'Endodontia'
  ),
  (
    '11111111-0000-0000-0000-000000000008',
    'Faceta de Porcelana',
    'Estética'
  ),
  (
    '11111111-0000-0000-0000-000000000009',
    'Aparelho Ortodôntico',
    'Ortodontia'
  ),
  (
    '11111111-0000-0000-0000-000000000010',
    'Contenção Fixa',
    'Ortodontia'
  ),
  (
    '11111111-0000-0000-0000-000000000011',
    'Raspagem Periodontal',
    'Periodontia'
  ),
  (
    '11111111-0000-0000-0000-000000000012',
    'Manutenção Periodontal',
    'Periodontia'
  ) ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────────
-- Pacientes
-- cpf: VARCHAR(11) sem formatação (só dígitos)
-- birth_date: NOT NULL no schema
-- ───────────────────────────────────────────────
INSERT INTO
  patient (id, full_name, cpf, phone, email, birth_date)
VALUES
  (
    '22222222-0001-0000-0000-000000000000',
    'Beatriz Oliveira Cavalcanti',
    '11122233301',
    '(11) 99111-0001',
    'beatriz.cavalcanti@example.com',
    '1990-03-15'
  ),
  (
    '22222222-0002-0000-0000-000000000000',
    'Carlos Eduardo Mendes',
    '11122233302',
    '(11) 99111-0002',
    'carlos.mendes@example.com',
    '1985-07-22'
  ),
  (
    '22222222-0003-0000-0000-000000000000',
    'Fernanda Ribeiro Santos',
    '11122233303',
    '(11) 99111-0003',
    'fernanda.santos@example.com',
    '1992-11-08'
  ),
  (
    '22222222-0004-0000-0000-000000000000',
    'Rafael Augusto Lopes',
    '11122233304',
    '(11) 99111-0004',
    'rafael.lopes@example.com',
    '2002-05-30'
  ),
  (
    '22222222-0005-0000-0000-000000000000',
    'Juliana Martins Alves',
    '11122233305',
    '(11) 99111-0005',
    'juliana.alves@example.com',
    '1988-01-17'
  ) ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────────
-- Prontuários
-- ───────────────────────────────────────────────
INSERT INTO
  medical_record (id, patient_id, general_observations)
VALUES
  (
    '33333333-0001-0000-0000-000000000000',
    '22222222-0001-0000-0000-000000000000',
    'Paciente apresenta bruxismo. Recomendado uso de placa de mordida após conclusão dos tratamentos.'
  ),
  (
    '33333333-0002-0000-0000-000000000000',
    '22222222-0002-0000-0000-000000000000',
    'Paciente com ausência do dente 46 há 3 anos. Osso em boas condições para implante.'
  ),
  (
    '33333333-0003-0000-0000-000000000000',
    '22222222-0003-0000-0000-000000000000',
    'Paciente alérgica à penicilina. Usar amoxicilina com cautela.'
  ),
  (
    '33333333-0004-0000-0000-000000000000',
    '22222222-0004-0000-0000-000000000000',
    'Tratamento ortodôntico iniciado em setembro/2025. Previsão de conclusão: setembro/2027.'
  ),
  (
    '33333333-0005-0000-0000-000000000000',
    '22222222-0005-0000-0000-000000000000',
    'Paciente com histórico de gengivite crônica. Manutenção trimestral recomendada.'
  ) ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────────
-- Planos de Tratamento
-- status: constraint aceita DRAFT | ACTIVE | COMPLETED | CANCELLED
-- IDs seguem o padrão 66666666- para diferenciar claramente de pacientes (22222222-).
-- ───────────────────────────────────────────────
INSERT INTO
  treatment_plan (
    id,
    patient_id,
    medical_record_id,
    title,
    status,
    notes,
    total_amount,
    created_at,
    updated_at
  )
VALUES
  (
    '66666666-0001-0000-0000-000000000000',
    '22222222-0001-0000-0000-000000000000',
    '33333333-0001-0000-0000-000000000000',
    'Plano — Beatriz Oliveira Cavalcanti',
    'ACTIVE',
    'Paciente apresenta bruxismo. Recomendado uso de placa de mordida após conclusão dos tratamentos.',
    2370.00,
    '2026-01-15 10:00:00+00',
    '2026-03-10 14:30:00+00'
  ),
  (
    '66666666-0002-0000-0000-000000000000',
    '22222222-0002-0000-0000-000000000000',
    '33333333-0002-0000-0000-000000000000',
    'Plano — Carlos Eduardo Mendes',
    'ACTIVE',
    'Paciente com ausência do dente 46 há 3 anos. Osso em boas condições para implante.',
    6880.00,
    '2025-12-10 09:00:00+00',
    '2026-01-20 11:00:00+00'
  ),
  (
    '66666666-0003-0000-0000-000000000000',
    '22222222-0003-0000-0000-000000000000',
    '33333333-0003-0000-0000-000000000000',
    'Plano — Fernanda Ribeiro Santos',
    'ACTIVE',
    'Paciente alérgica à penicilina. Usar amoxicilina com cautela.',
    4700.00,
    '2026-02-01 08:30:00+00',
    '2026-04-16 16:00:00+00'
  ),
  (
    '66666666-0004-0000-0000-000000000000',
    '22222222-0004-0000-0000-000000000000',
    '33333333-0004-0000-0000-000000000000',
    'Plano — Rafael Augusto Lopes',
    'ACTIVE',
    'Tratamento ortodôntico iniciado em setembro/2025. Previsão de conclusão: setembro/2027.',
    6600.00,
    '2025-09-01 10:00:00+00',
    '2025-09-15 10:00:00+00'
  ),
  (
    '66666666-0005-0000-0000-000000000000',
    '22222222-0005-0000-0000-000000000000',
    '33333333-0005-0000-0000-000000000000',
    'Plano — Juliana Martins Alves',
    'ACTIVE',
    'Paciente com histórico de gengivite crônica. Manutenção trimestral recomendada.',
    1950.00,
    '2026-01-20 11:00:00+00',
    '2026-05-26 15:00:00+00'
  ) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Itens dos Planos de Tratamento
--
-- Convenção de status:
--   PENDING  → pendente (aguardando início)
--   APPROVED → em andamento
--   DONE     → concluído
--   CANCELLED→ interrompido
--
-- Procedimentos restauradores/cirúrgicos por dente → um item por dente.
-- Procedimentos de arcada/sistêmicos → um item único, tooth_number = NULL.
-- =============================================================================
-- ───────────────────────────────────────────────
-- Beatriz Oliveira Cavalcanti  (total: R$ 2.370,00)
-- ───────────────────────────────────────────────
INSERT INTO
  treatment_plan_item (
    id,
    treatment_plan_id,
    procedure_id,
    tooth_number,
    description,
    estimated_price,
    status,
    sort_order,
    completed_at,
    created_at
  )
VALUES
  -- Extração de Siso — 4 sisos, em andamento (850 = 4 × 212,50)
  (
    '44444444-0101-0000-0000-000000000000',
    '66666666-0001-0000-0000-000000000000',
    '11111111-0000-0000-0000-000000000001',
    18,
    'Extração de Siso — dente 18',
    212.50,
    'APPROVED',
    1,
    NULL,
    '2026-03-10 08:00:00+00'
  ),
  (
    '44444444-0102-0000-0000-000000000000',
    '66666666-0001-0000-0000-000000000000',
    '11111111-0000-0000-0000-000000000001',
    28,
    'Extração de Siso — dente 28',
    212.50,
    'APPROVED',
    2,
    NULL,
    '2026-03-10 08:00:00+00'
  ),
  (
    '44444444-0103-0000-0000-000000000000',
    '66666666-0001-0000-0000-000000000000',
    '11111111-0000-0000-0000-000000000001',
    38,
    'Extração de Siso — dente 38',
    212.50,
    'APPROVED',
    3,
    NULL,
    '2026-03-10 08:00:00+00'
  ),
  (
    '44444444-0104-0000-0000-000000000000',
    '66666666-0001-0000-0000-000000000000',
    '11111111-0000-0000-0000-000000000001',
    48,
    'Extração de Siso — dente 48',
    212.50,
    'APPROVED',
    4,
    NULL,
    '2026-03-10 08:00:00+00'
  ),
  -- Clareamento Dental — arcada completa, pendente
  (
    '44444444-0105-0000-0000-000000000000',
    '66666666-0001-0000-0000-000000000000',
    '11111111-0000-0000-0000-000000000002',
    NULL,
    'Clareamento Dental',
    1200.00,
    'PENDING',
    5,
    NULL,
    '2026-04-15 09:00:00+00'
  ),
  -- Restauração em Resina — 2 dentes, concluída (320 = 2 × 160)
  (
    '44444444-0106-0000-0000-000000000000',
    '66666666-0001-0000-0000-000000000000',
    '11111111-0000-0000-0000-000000000003',
    36,
    'Restauração em Resina — dente 36',
    160.00,
    'DONE',
    6,
    '2026-02-05 14:00:00+00',
    '2026-02-05 08:00:00+00'
  ),
  (
    '44444444-0107-0000-0000-000000000000',
    '66666666-0001-0000-0000-000000000000',
    '11111111-0000-0000-0000-000000000003',
    37,
    'Restauração em Resina — dente 37',
    160.00,
    'DONE',
    7,
    '2026-02-05 14:00:00+00',
    '2026-02-05 08:00:00+00'
  ) ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────────
-- Carlos Eduardo Mendes  (total: R$ 6.880,00)
-- ───────────────────────────────────────────────
INSERT INTO
  treatment_plan_item (
    id,
    treatment_plan_id,
    procedure_id,
    tooth_number,
    description,
    estimated_price,
    status,
    sort_order,
    completed_at,
    created_at
  )
VALUES
  (
    '44444444-0201-0000-0000-000000000000',
    '66666666-0002-0000-0000-000000000000',
    '11111111-0000-0000-0000-000000000004',
    46,
    'Implante Dentário — dente 46',
    4500.00,
    'APPROVED',
    1,
    NULL,
    '2026-01-20 09:00:00+00'
  ),
  (
    '44444444-0202-0000-0000-000000000000',
    '66666666-0002-0000-0000-000000000000',
    '11111111-0000-0000-0000-000000000005',
    46,
    'Coroa de Porcelana — dente 46',
    2200.00,
    'PENDING',
    2,
    NULL,
    '2026-01-20 09:00:00+00'
  ),
  (
    '44444444-0203-0000-0000-000000000000',
    '66666666-0002-0000-0000-000000000000',
    '11111111-0000-0000-0000-000000000006',
    NULL,
    'Limpeza e Profilaxia',
    180.00,
    'DONE',
    3,
    '2026-01-10 11:00:00+00',
    '2025-12-20 10:00:00+00'
  ) ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────────
-- Fernanda Ribeiro Santos  (total: R$ 4.700,00)
-- ───────────────────────────────────────────────
INSERT INTO
  treatment_plan_item (
    id,
    treatment_plan_id,
    procedure_id,
    tooth_number,
    description,
    estimated_price,
    status,
    sort_order,
    completed_at,
    created_at
  )
VALUES
  (
    '44444444-0301-0000-0000-000000000000',
    '66666666-0003-0000-0000-000000000000',
    '11111111-0000-0000-0000-000000000007',
    26,
    'Tratamento de Canal — dente 26',
    1100.00,
    'DONE',
    1,
    '2026-04-16 16:00:00+00',
    '2026-04-02 08:00:00+00'
  ),
  -- Facetas de Porcelana — 4 dentes, pendentes (3600 = 4 × 900)
  (
    '44444444-0302-0000-0000-000000000000',
    '66666666-0003-0000-0000-000000000000',
    '11111111-0000-0000-0000-000000000008',
    11,
    'Faceta de Porcelana — dente 11',
    900.00,
    'PENDING',
    2,
    NULL,
    '2026-05-01 09:00:00+00'
  ),
  (
    '44444444-0303-0000-0000-000000000000',
    '66666666-0003-0000-0000-000000000000',
    '11111111-0000-0000-0000-000000000008',
    12,
    'Faceta de Porcelana — dente 12',
    900.00,
    'PENDING',
    3,
    NULL,
    '2026-05-01 09:00:00+00'
  ),
  (
    '44444444-0304-0000-0000-000000000000',
    '66666666-0003-0000-0000-000000000000',
    '11111111-0000-0000-0000-000000000008',
    21,
    'Faceta de Porcelana — dente 21',
    900.00,
    'PENDING',
    4,
    NULL,
    '2026-05-01 09:00:00+00'
  ),
  (
    '44444444-0305-0000-0000-000000000000',
    '66666666-0003-0000-0000-000000000000',
    '11111111-0000-0000-0000-000000000008',
    22,
    'Faceta de Porcelana — dente 22',
    900.00,
    'PENDING',
    5,
    NULL,
    '2026-05-01 09:00:00+00'
  ) ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────────
-- Rafael Augusto Lopes  (total: R$ 6.600,00)
-- ───────────────────────────────────────────────
INSERT INTO
  treatment_plan_item (
    id,
    treatment_plan_id,
    procedure_id,
    tooth_number,
    description,
    estimated_price,
    status,
    sort_order,
    completed_at,
    created_at
  )
VALUES
  (
    '44444444-0401-0000-0000-000000000000',
    '66666666-0004-0000-0000-000000000000',
    '11111111-0000-0000-0000-000000000009',
    NULL,
    'Aparelho Ortodôntico',
    5800.00,
    'APPROVED',
    1,
    NULL,
    '2025-09-15 09:00:00+00'
  ),
  (
    '44444444-0402-0000-0000-000000000000',
    '66666666-0004-0000-0000-000000000000',
    '11111111-0000-0000-0000-000000000010',
    NULL,
    'Contenção Fixa',
    800.00,
    'PENDING',
    2,
    NULL,
    '2025-09-15 09:00:00+00'
  ) ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────────
-- Juliana Martins Alves  (total: R$ 1.950,00)
-- ───────────────────────────────────────────────
INSERT INTO
  treatment_plan_item (
    id,
    treatment_plan_id,
    procedure_id,
    tooth_number,
    description,
    estimated_price,
    status,
    sort_order,
    completed_at,
    created_at
  )
VALUES
  (
    '44444444-0501-0000-0000-000000000000',
    '66666666-0005-0000-0000-000000000000',
    '11111111-0000-0000-0000-000000000011',
    NULL,
    'Raspagem Periodontal',
    750.00,
    'DONE',
    1,
    '2026-03-22 15:00:00+00',
    '2026-03-08 08:00:00+00'
  ),
  (
    '44444444-0502-0000-0000-000000000000',
    '66666666-0005-0000-0000-000000000000',
    '11111111-0000-0000-0000-000000000002',
    NULL,
    'Clareamento Dental',
    900.00,
    'DONE',
    2,
    '2026-05-26 15:00:00+00',
    '2026-05-12 08:00:00+00'
  ),
  (
    '44444444-0503-0000-0000-000000000000',
    '66666666-0005-0000-0000-000000000000',
    '11111111-0000-0000-0000-000000000012',
    NULL,
    'Manutenção Periodontal',
    300.00,
    'PENDING',
    3,
    NULL,
    '2026-05-26 08:00:00+00'
  ) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Odontograma
-- Registra dentes de procedimentos sem tooth_number e anotações clínicas.
-- medical_record_id é NOT NULL — vinculado ao prontuário do paciente.
-- =============================================================================
-- Beatriz: dentes do clareamento pendente (11–13, 21–23)
INSERT INTO
  odontogram_entry (
    id,
    medical_record_id,
    patient_id,
    tooth_number,
    condition_code
  )
VALUES
  (
    '55555555-0101-0000-0000-000000000000',
    '33333333-0001-0000-0000-000000000000',
    '22222222-0001-0000-0000-000000000000',
    11,
    'PLANNED'
  ),
  (
    '55555555-0102-0000-0000-000000000000',
    '33333333-0001-0000-0000-000000000000',
    '22222222-0001-0000-0000-000000000000',
    12,
    'PLANNED'
  ),
  (
    '55555555-0103-0000-0000-000000000000',
    '33333333-0001-0000-0000-000000000000',
    '22222222-0001-0000-0000-000000000000',
    13,
    'PLANNED'
  ),
  (
    '55555555-0104-0000-0000-000000000000',
    '33333333-0001-0000-0000-000000000000',
    '22222222-0001-0000-0000-000000000000',
    21,
    'PLANNED'
  ),
  (
    '55555555-0105-0000-0000-000000000000',
    '33333333-0001-0000-0000-000000000000',
    '22222222-0001-0000-0000-000000000000',
    22,
    'PLANNED'
  ),
  (
    '55555555-0106-0000-0000-000000000000',
    '33333333-0001-0000-0000-000000000000',
    '22222222-0001-0000-0000-000000000000',
    23,
    'PLANNED'
  ) ON CONFLICT (id) DO NOTHING;

-- Carlos: dente 46 ausente (implante em andamento via item do plano)
INSERT INTO
  odontogram_entry (
    id,
    medical_record_id,
    patient_id,
    tooth_number,
    condition_code
  )
VALUES
  (
    '55555555-0201-0000-0000-000000000000',
    '33333333-0002-0000-0000-000000000000',
    '22222222-0002-0000-0000-000000000000',
    46,
    'MISSING'
  ) ON CONFLICT (id) DO NOTHING;

-- Rafael: dentes da contenção futura (31–33, 41–43)
INSERT INTO
  odontogram_entry (
    id,
    medical_record_id,
    patient_id,
    tooth_number,
    condition_code
  )
VALUES
  (
    '55555555-0401-0000-0000-000000000000',
    '33333333-0004-0000-0000-000000000000',
    '22222222-0004-0000-0000-000000000000',
    31,
    'PLANNED'
  ),
  (
    '55555555-0402-0000-0000-000000000000',
    '33333333-0004-0000-0000-000000000000',
    '22222222-0004-0000-0000-000000000000',
    32,
    'PLANNED'
  ),
  (
    '55555555-0403-0000-0000-000000000000',
    '33333333-0004-0000-0000-000000000000',
    '22222222-0004-0000-0000-000000000000',
    33,
    'PLANNED'
  ),
  (
    '55555555-0404-0000-0000-000000000000',
    '33333333-0004-0000-0000-000000000000',
    '22222222-0004-0000-0000-000000000000',
    41,
    'PLANNED'
  ),
  (
    '55555555-0405-0000-0000-000000000000',
    '33333333-0004-0000-0000-000000000000',
    '22222222-0004-0000-0000-000000000000',
    42,
    'PLANNED'
  ),
  (
    '55555555-0406-0000-0000-000000000000',
    '33333333-0004-0000-0000-000000000000',
    '22222222-0004-0000-0000-000000000000',
    43,
    'PLANNED'
  ) ON CONFLICT (id) DO NOTHING;

-- Juliana: dentes do clareamento concluído (11–13, 21–23)
INSERT INTO
  odontogram_entry (
    id,
    medical_record_id,
    patient_id,
    tooth_number,
    condition_code
  )
VALUES
  (
    '55555555-0501-0000-0000-000000000000',
    '33333333-0005-0000-0000-000000000000',
    '22222222-0005-0000-0000-000000000000',
    11,
    'TREATED'
  ),
  (
    '55555555-0502-0000-0000-000000000000',
    '33333333-0005-0000-0000-000000000000',
    '22222222-0005-0000-0000-000000000000',
    12,
    'TREATED'
  ),
  (
    '55555555-0503-0000-0000-000000000000',
    '33333333-0005-0000-0000-000000000000',
    '22222222-0005-0000-0000-000000000000',
    13,
    'TREATED'
  ),
  (
    '55555555-0504-0000-0000-000000000000',
    '33333333-0005-0000-0000-000000000000',
    '22222222-0005-0000-0000-000000000000',
    21,
    'TREATED'
  ),
  (
    '55555555-0505-0000-0000-000000000000',
    '33333333-0005-0000-0000-000000000000',
    '22222222-0005-0000-0000-000000000000',
    22,
    'TREATED'
  ),
  (
    '55555555-0506-0000-0000-000000000000',
    '33333333-0005-0000-0000-000000000000',
    '22222222-0005-0000-0000-000000000000',
    23,
    'TREATED'
  ) ON CONFLICT (id) DO NOTHING;