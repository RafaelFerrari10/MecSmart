# Corrige o Windows Firewall para permitir conexões do celular ao backend/Expo.
# Execute este arquivo com o PowerShell COMO ADMINISTRADOR:
#   botão direito -> "Executar com o PowerShell" (ou Run as administrator)
#
# O problema: existem regras "Query User" bloqueando o node.exe nas conexões
# de entrada (perfil Private/Public), e regra de BLOQUEIO por programa vence a
# regra de permissão por porta. Por isso o app abre no celular mas a API (:3000)
# não responde.

$ErrorActionPreference = 'Stop'

Write-Host '=== 1. Removendo regras de BLOQUEIO do node.exe ===' -ForegroundColor Yellow

$nomesBloqueio = @(
  'TCP Query User{828D0EA3-0FE1-43E1-81C6-905B5EB471C9}C:\program files\nodejs\node.exe',
  'UDP Query User{3A1EE284-2E96-45CB-B34D-AAE347C682AB}C:\program files\nodejs\node.exe',
  'TCP Query User{6E37C4AB-B7CA-4DC0-9574-BA1555F82F5D}C:\users\rafae_bl2ubjm\appdata\local\npm-cache\_npx\1838e33cf768caf6\node_modules\node\bin\node.exe',
  'UDP Query User{1E5C08C6-B243-44E4-AC8A-14126CEC1FA1}C:\users\rafae_bl2ubjm\appdata\local\npm-cache\_npx\1838e33cf768caf6\node_modules\node\bin\node.exe'
)

foreach ($n in $nomesBloqueio) {
  if (Get-NetFirewallRule -Name $n -ErrorAction SilentlyContinue) {
    Remove-NetFirewallRule -Name $n
    Write-Host ("  - Removida: " + $n) -ForegroundColor Green
  }
}

# Também remove qualquer outra regra de bloqueio do node.exe/npm
Get-NetFirewallRule -ErrorAction SilentlyContinue |
  Where-Object { $_.DisplayName -match 'node\.exe|Node\.js JavaScript Runtime' -and $_.Action -eq 'Block' } |
  ForEach-Object {
    Remove-NetFirewallRule -Name $_.Name
    Write-Host ("  - Removida (extra): " + $_.DisplayName) -ForegroundColor Green
  }

Write-Host ''
Write-Host '=== 2. Garantindo regras de PERMISSÃO (entrada) ===' -ForegroundColor Yellow

# Porta da API do backend
if (-not (Get-NetFirewallRule -DisplayName 'MecSmart API 3000' -ErrorAction SilentlyContinue)) {
  New-NetFirewallRule -DisplayName 'MecSmart API 3000' -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Profile Any | Out-Null
  Write-Host '  - Criada: MecSmart API 3000 (Allow)' -ForegroundColor Green
} else {
  Write-Host '  - MecSmart API 3000 já existe' -ForegroundColor Green
}

# Porta do Expo/Metro
if (-not (Get-NetFirewallRule -DisplayName 'Expo Metro 8081' -ErrorAction SilentlyContinue)) {
  New-NetFirewallRule -DisplayName 'Expo Metro 8081' -Direction Inbound -Protocol TCP -LocalPort 8081 -Action Allow -Profile Any | Out-Null
  Write-Host '  - Criada: Expo Metro 8081 (Allow)' -ForegroundColor Green
} else {
  Write-Host '  - Expo Metro 8081 já existe' -ForegroundColor Green
}

Write-Host ''
Write-Host '=== Conferência final ===' -ForegroundColor Yellow
Get-NetFirewallRule -ErrorAction SilentlyContinue |
  Where-Object { $_.DisplayName -match 'MecSmart|node\.exe|Node\.js JavaScript' } |
  Select-Object DisplayName, Action, Direction | Format-Table -AutoSize

Write-Host ''
Write-Host 'Pronto! Agora reinicie o backend e o Expo, e teste no celular.' -ForegroundColor Cyan
