# Script para testar a API de Activity Types

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "TESTANDO API DE TIPOS DE ATIVIDADE" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o backend esta rodando
Write-Host "1. Verificando se o backend esta rodando..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/activity-types" -Method GET -TimeoutSec 5 -ErrorAction Stop
    
    Write-Host "   Backend esta ONLINE!" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor White
    Write-Host ""
    
    # Converter resposta para JSON
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "2. Dados retornados:" -ForegroundColor Yellow
    Write-Host "   Total de registros: $($data.Count)" -ForegroundColor White
    Write-Host ""
    
    if ($data.Count -gt 0) {
        Write-Host "3. Primeiro registro (exemplo):" -ForegroundColor Yellow
        $primeiro = $data[0]
        
        Write-Host "   ID: $($primeiro.id)" -ForegroundColor White
        Write-Host "   Codigo: $($primeiro.code)" -ForegroundColor White
        Write-Host "   Nome: $($primeiro.name)" -ForegroundColor White
        Write-Host "   Tipo: $($primeiro.type)" -ForegroundColor White
        Write-Host "   Ativo: $($primeiro.active)" -ForegroundColor White
        
        # Verificar se os novos campos existem
        if ($null -ne $primeiro.PSObject.Properties['sectorEmail']) {
            Write-Host "   E-mail Setor: $($primeiro.sectorEmail)" -ForegroundColor Cyan
            Write-Host "   Notificacoes: $($primeiro.emailNotificationsEnabled)" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "   NOVOS CAMPOS PRESENTES!" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "   ATENCAO: Novos campos NAO encontrados!" -ForegroundColor Red
            Write-Host "   Prisma Client pode nao ter sido regenerado" -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "4. Estrutura completa do primeiro registro:" -ForegroundColor Yellow
        $primeiro | ConvertTo-Json -Depth 3 | Write-Host
    } else {
        Write-Host "   Nenhum registro encontrado no banco" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   ERRO: Backend nao esta respondendo!" -ForegroundColor Red
    Write-Host "   Mensagem: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Verifique se o backend esta rodando:" -ForegroundColor Yellow
    Write-Host "   cd backend" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan

