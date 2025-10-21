-- ============================================================================
-- SCRIPT DE MIGRAÇÃO - Sistema MES
-- Adiciona novas entidades: Company, Sector, ActivityType, Defect, ReferenceType, ProductionDefect
-- ============================================================================

-- 1. Criar tabela de Empresas
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    trade_name VARCHAR(200),
    cnpj VARCHAR(14) UNIQUE,
    address VARCHAR(500),
    phone VARCHAR(20),
    email VARCHAR(100),
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 2. Criar tabela de Setores
CREATE TABLE IF NOT EXISTS sectors (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT
);

-- 3. Criar tabela de Tipos de Atividade
CREATE TABLE IF NOT EXISTS activity_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    color VARCHAR(7), -- Formato: #RRGGBB
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 4. Criar enum de severidade de defeitos
DO $$ BEGIN
    CREATE TYPE defect_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Criar tabela de Defeitos
CREATE TABLE IF NOT EXISTS defects (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    severity defect_severity DEFAULT 'MEDIUM' NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 6. Criar tabela de Tipos de Referência
CREATE TABLE IF NOT EXISTS reference_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 7. Criar tabela de Defeitos de Produção
CREATE TABLE IF NOT EXISTS production_defects (
    id SERIAL PRIMARY KEY,
    production_order_id INTEGER NOT NULL,
    defect_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (defect_id) REFERENCES defects(id) ON DELETE RESTRICT
);

-- 8. Adicionar coluna reference_type_id em items (se não existir)
DO $$ BEGIN
    ALTER TABLE items ADD COLUMN reference_type_id INTEGER;
    ALTER TABLE items ADD FOREIGN KEY (reference_type_id) REFERENCES reference_types(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 9. Adicionar colunas company_id e sector_id em production_orders (se não existir)
DO $$ BEGIN
    ALTER TABLE production_orders ADD COLUMN company_id INTEGER;
    ALTER TABLE production_orders ADD COLUMN sector_id INTEGER;
    ALTER TABLE production_orders ADD FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;
    ALTER TABLE production_orders ADD FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 10. Adicionar coluna activity_type_id em downtimes (se não existir)
DO $$ BEGIN
    ALTER TABLE downtimes ADD COLUMN activity_type_id INTEGER;
    ALTER TABLE downtimes ADD FOREIGN KEY (activity_type_id) REFERENCES activity_types(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 11. Adicionar coluna sector_id em plc_configs (se não existir)
DO $$ BEGIN
    ALTER TABLE plc_configs ADD COLUMN sector_id INTEGER;
    ALTER TABLE plc_configs ADD FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 12. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_sectors_company_id ON sectors(company_id);
CREATE INDEX IF NOT EXISTS idx_production_defects_production_order_id ON production_defects(production_order_id);
CREATE INDEX IF NOT EXISTS idx_production_defects_defect_id ON production_defects(defect_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_company_id ON production_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_sector_id ON production_orders(sector_id);
CREATE INDEX IF NOT EXISTS idx_downtimes_activity_type_id ON downtimes(activity_type_id);
CREATE INDEX IF NOT EXISTS idx_plc_configs_sector_id ON plc_configs(sector_id);
CREATE INDEX IF NOT EXISTS idx_items_reference_type_id ON items(reference_type_id);

-- 13. Inserir dados iniciais de exemplo
INSERT INTO companies (code, name, trade_name, active) VALUES 
    ('EMP001', 'Empresa Exemplo LTDA', 'Exemplo', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO sectors (company_id, code, name, description, active) VALUES 
    (1, 'SET001', 'Injeção', 'Setor de injeção de plásticos', true),
    (1, 'SET002', 'Montagem', 'Setor de montagem de produtos', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO activity_types (code, name, description, color, active) VALUES 
    ('AT001', 'Setup de Máquina', 'Configuração e preparação de máquina', '#3498db', true),
    ('AT002', 'Troca de Molde', 'Troca de molde/ferramenta', '#e74c3c', true),
    ('AT003', 'Manutenção Preventiva', 'Manutenção programada', '#2ecc71', true),
    ('AT004', 'Refeição', 'Parada para refeição', '#f39c12', true),
    ('AT005', 'Reunião', 'Reuniões e treinamentos', '#9b59b6', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO defects (code, name, description, severity, active) VALUES 
    ('DEF001', 'Rebarbas', 'Peça com rebarbas excessivas', 'LOW', true),
    ('DEF002', 'Trinca', 'Trinca ou rachadura na peça', 'HIGH', true),
    ('DEF003', 'Falta de Material', 'Peça com falta de material', 'CRITICAL', true),
    ('DEF004', 'Manchas', 'Manchas ou descoloração', 'MEDIUM', true),
    ('DEF005', 'Dimensão Fora', 'Dimensões fora da tolerância', 'HIGH', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO reference_types (code, name, description, active) VALUES 
    ('REF001', 'Matéria-Prima', 'Materiais utilizados na produção', true),
    ('REF002', 'Produto Acabado', 'Produtos finalizados', true),
    ('REF003', 'Semi-Acabado', 'Produtos em processo', true),
    ('REF004', 'Componente', 'Componentes para montagem', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================

-- Mensagem de sucesso
SELECT 'Migração executada com sucesso!' AS status;

