<#
  Nainstaluje boot animaci Umime skolu: zkopiruje soubory do
  %ProgramData%\UmimeBoot a vytvori naplanovanou ulohu "UmimeBootAnimace",
  ktera se spusti pri prihlaseni uzivatele.
  Spust v PowerShellu jako SPRAVCE:  powershell -ExecutionPolicy Bypass -File .\install.ps1
  Volitelne: -Duration 8   (delka animace v sekundach)
#>
param([int]$Duration = 6)

$ErrorActionPreference = 'Stop'
$id = [Security.Principal.WindowsIdentity]::GetCurrent()
if (-not (New-Object Security.Principal.WindowsPrincipal $id).IsInRole('Administrator')) {
    throw 'Spust skript jako Spravce (pravy klik na PowerShell > Spustit jako spravce).'
}

$dest = Join-Path $env:ProgramData 'UmimeBoot'
New-Item -ItemType Directory -Force $dest | Out-Null
Copy-Item (Join-Path $PSScriptRoot 'boot.html') $dest -Force

# Launcher: spusti Edge v kiosk rezimu pres celou obrazovku a po __DUR__ sekundach ho zavre.
$launcher = @'
$html = 'file:///' + ((Join-Path $env:ProgramData 'UmimeBoot\boot.html') -replace '\\','/') + '?dur=__DUR__'
$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
          "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") |
        Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { exit 1 }
$prof = Join-Path $env:TEMP 'umime-boot-profile'
Start-Process $edge -ArgumentList @('--kiosk', $html, '--edge-kiosk-type=fullscreen',
    "--user-data-dir=$prof", '--no-first-run', '--autoplay-policy=no-user-gesture-required')
Start-Sleep -Seconds (__DUR__ + 3)
# zavre jen nase okno (podle vlastniho profilu), ne bezne Edge okna uzivatele
Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" |
    Where-Object { $_.CommandLine -like '*umime-boot-profile*' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
'@
$launcher = $launcher.Replace('__DUR__', "$Duration")
Set-Content -Path (Join-Path $dest 'launch.ps1') -Value $launcher -Encoding UTF8

$action  = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$dest\launch.ps1`""
$trigger = New-ScheduledTaskTrigger -AtLogOn
$set     = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 2)
Register-ScheduledTask -TaskName 'UmimeBootAnimace' -Action $action -Trigger $trigger `
    -Settings $set -RunLevel Limited -Force | Out-Null

Write-Host "Hotovo. Animace se spusti pri dalsim prihlaseni. Test hned: Start-ScheduledTask UmimeBootAnimace"
