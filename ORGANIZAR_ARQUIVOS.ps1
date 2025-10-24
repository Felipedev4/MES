# Script de Organização de Arquivos do Projeto MES
# Data: 24/10/2025
# Objetivo: Limpar e organizar arquivos temporários, de debug e documentação

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  ORGANIZAÇÃO DE ARQUIVOS - MES" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 1. CRIAR BACKUP
Write-Host "[1/5] Criando backup..." -ForegroundColor Yellow
$backupDir = "backup_pre_limpeza_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
Copy-Item -Path "*.sql" -Destination $backupDir -ErrorAction SilentlyContinue
Copy-Item -Path "*.md" -Destination $backupDir -Filter "!README.md" -ErrorAction SilentlyContinue
Write-Host "   Backup criado em: $backupDir" -ForegroundColor Green

# 2. CRIAR ESTRUTURA DE PASTAS
Write-Host "[2/5] Criando estrutura de pastas..." -ForegroundColor Yellow
$folders = @(
    "docs/guias",
    "docs/correcoes",
    "docs/melhorias",
    "docs/arquivados",
    "scripts_uteis",
    "diagnosticos_old",
    "correcoes_historico"
)
foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}
Write-Host "   Pastas criadas com sucesso" -ForegroundColor Green

# 3. MOVER ARQUIVOS SQL
Write-Host "[3/5] Organizando arquivos SQL..." -ForegroundColor Yellow

# Scripts Úteis (MANTER)
$scriptsUteis = @(
    "EXEMPLO_CONFIGURACAO_EMAIL.sql",
    "pre_cadastro_setores_fabrica_plastico.sql",
    "INSERIR_DADOS_EMPRESA_PLASTICO.sql",
    "SETUP_MULTI_EMPRESA_TESTE.sql",
    "init_email_logs_permissions.sql",
    "ADICIONAR_PERMISSOES_EMAIL_ALERTAS.sql",
    "ADICIONAR_PERMISSOES_FALTANTES_CORRIGIDO.sql",
    "ATUALIZAR_PERMISSOES_MANUAL_POSTING.sql",
    "add_colors_migration.sql",
    "APLICAR_CAVIDADES_ATIVAS.sql",
    "APLICAR_TIME_DIVISOR.sql",
    "APLICAR_SOLUCAO_AGORA.sql",
    "FIX_REGISTROS_COMPLETO.sql"
)
foreach ($file in $scriptsUteis) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "scripts_uteis/" -Force
        Write-Host "   ✓ Movido: $file → scripts_uteis/" -ForegroundColor Gray
    }
}

# Diagnósticos (ARQUIVAR)
$diagnosticos = @(
    "diagnostico_falta_energia.sql",
    "DIAGNOSTICO_RAPIDO_EMAIL_PARADA.sql",
    "diagnostico_rapido.sql",
    "DIAGNOSTICO_ORDEM_PAUSED_SEM_DOWNTIME.sql",
    "DIAGNOSTICO_INICIO_PRODUCAO.sql",
    "verificar_dados_banco.sql",
    "verificar_op001.sql",
    "VERIFICAR_QUANTIDADE_PRODUZIDA_CARDS.sql",
    "VERIFICAR_CLPCOUNTERVALUE.sql",
    "VERIFICAR_APONTAMENTOS_PERDIDOS.sql",
    "VERIFICAR_APONTAMENTO_36.sql",
    "VERIFICAR_ULTIMOS_APONTAMENTOS.sql",
    "VERIFICAR_VINCULOS_EMPRESA.sql",
    "VALIDACAO_KPIS_APONTAMENTOS.sql",
    "VALIDAR_PERMISSOES_TODAS_TELAS.sql",
    "VERIFICAR_PERMISSOES_COMPLETO.sql",
    "INVESTIGAR_DIVERGENCIA_OP-2025-001.sql"
)
foreach ($file in $diagnosticos) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "diagnosticos_old/" -Force
        Write-Host "   ✓ Arquivado: $file → diagnosticos_old/" -ForegroundColor Gray
    }
}

# Correções Históricas (ARQUIVAR)
$correcoes = @(
    "correcao_simples.sql",
    "CORRIGIR_APONTAMENTOS_ANTIGOS_ESTRUTURA.sql",
    "CORRIGIR_APONTAMENTOS_ANTIGOS.sql",
    "CORRIGIR_CLPCOUNTERVALUE_OP001.sql",
    "CORRIGIR_OP_2025_001_AGORA.sql",
    "CORRIGIR_ORDEM_PAUSED_SEM_DOWNTIME.sql",
    "CORRIGIR_PRODUCED_QUANTITY_TODAS_ORDENS.sql",
    "CORRIGIR_USUARIO_EMPRESA.sql",
    "LIMPAR_DUPLICATAS_APONTAMENTOS.sql",
    "LIMPAR_E_INSERIR_DADOS_TESTE.sql",
    "LIMPAR_MIGRATIONS_FALHADAS.sql",
    "ASSOCIAR_DADOS_EMPRESA_001.sql",
    "SCRIPT_RAPIDO_ASSOCIAR_EMP001.sql",
    "CALCULAR_0_07_HORAS.sql",
    "ADICIONAR_SUPERVISOR_RECURSOS_ANTIGOS.sql"
)
foreach ($file in $correcoes) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "correcoes_historico/" -Force
        Write-Host "   ✓ Arquivado: $file → correcoes_historico/" -ForegroundColor Gray
    }
}

Write-Host "   SQL: OK" -ForegroundColor Green

# 4. MOVER ARQUIVOS MD
Write-Host "[4/5] Organizando arquivos .md..." -ForegroundColor Yellow

# Guias (MANTER - docs/guias)
$guias = Get-ChildItem -Filter "GUIA_*.md"
foreach ($file in $guias) {
    Move-Item -Path $file.FullName -Destination "docs/guias/" -Force
    Write-Host "   ✓ Movido: $($file.Name) → docs/guias/" -ForegroundColor Gray
}

# Correções (ARQUIVAR - docs/correcoes)
$correcoesDoc = Get-ChildItem -Filter "CORRECAO_*.md"
foreach ($file in $correcoesDoc) {
    Move-Item -Path $file.FullName -Destination "docs/correcoes/" -Force
    Write-Host "   ✓ Arquivado: $($file.Name) → docs/correcoes/" -ForegroundColor Gray
}

# Melhorias (MANTER - docs/melhorias)
$melhorias = Get-ChildItem -Filter "MELHORIA*.md"
foreach ($file in $melhorias) {
    Move-Item -Path $file.FullName -Destination "docs/melhorias/" -Force
    Write-Host "   ✓ Movido: $($file.Name) → docs/melhorias/" -ForegroundColor Gray
}

# Ações, Diagnósticos, Fixes (ARQUIVAR - docs/arquivados)
$arquivar = @(
    "ACAO_*.md",
    "DEBUG_*.md",
    "DIAGNOSTICO_*.md",
    "FIX_*.md",
    "APLICAR_*.md"
)
foreach ($pattern in $arquivar) {
    $files = Get-ChildItem -Filter $pattern
    foreach ($file in $files) {
        Move-Item -Path $file.FullName -Destination "docs/arquivados/" -Force
        Write-Host "   ✓ Arquivado: $($file.Name) → docs/arquivados/" -ForegroundColor Gray
    }
}

# Resumos, Implementações, Explicações (MANTER - docs/melhorias)
$documentacao = @(
    "RESUMO_*.md",
    "IMPLEMENTACAO_*.md",
    "EXPLICACAO_*.md",
    "SISTEMA_*.md"
)
foreach ($pattern in $documentacao) {
    $files = Get-ChildItem -Filter $pattern
    foreach ($file in $files) {
        if (-not (Test-Path "docs/melhorias/$($file.Name)")) {
            Move-Item -Path $file.FullName -Destination "docs/melhorias/" -Force
            Write-Host "   ✓ Movido: $($file.Name) → docs/melhorias/" -ForegroundColor Gray
        }
    }
}

Write-Host "   MD: OK" -ForegroundColor Green

# 5. LIMPAR SCRIPTS .PS1 ANTIGOS
Write-Host "[5/5] Organizando scripts PowerShell..." -ForegroundColor Yellow
$scriptsAntigos = @(
    "APLICAR_*.ps1",
    "EXECUTAR_*.ps1",
    "REINICIAR_*.ps1"
)
foreach ($pattern in $scriptsAntigos) {
    $files = Get-ChildItem -Filter $pattern -Exclude "ORGANIZAR_ARQUIVOS.ps1"
    foreach ($file in $files) {
        Move-Item -Path $file.FullName -Destination "scripts_uteis/" -Force
        Write-Host "   ✓ Movido: $($file.Name) → scripts_uteis/" -ForegroundColor Gray
    }
}
Write-Host "   PS1: OK" -ForegroundColor Green

# RESUMO
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  ORGANIZAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Estrutura criada:" -ForegroundColor Yellow
Write-Host "  ├── docs/" -ForegroundColor White
Write-Host "  │   ├── guias/          (guias de usuário)" -ForegroundColor Gray
Write-Host "  │   ├── correcoes/      (histórico de correções)" -ForegroundColor Gray
Write-Host "  │   ├── melhorias/      (documentação de melhorias)" -ForegroundColor Gray
Write-Host "  │   └── arquivados/     (debug, ações antigas)" -ForegroundColor Gray
Write-Host "  ├── scripts_uteis/      (scripts SQL/PS1 úteis)" -ForegroundColor White
Write-Host "  ├── diagnosticos_old/   (queries diagnóstico)" -ForegroundColor White
Write-Host "  └── correcoes_historico/ (correções aplicadas)" -ForegroundColor White
Write-Host ""
Write-Host "Backup salvo em: $backupDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Projeto organizado e limpo!" -ForegroundColor Green
Write-Host ""

