# Odinstaluje boot animaci (spust jako Spravce).
Unregister-ScheduledTask -TaskName 'UmimeBootAnimace' -Confirm:$false -ErrorAction SilentlyContinue
Remove-Item (Join-Path $env:ProgramData 'UmimeBoot') -Recurse -Force -ErrorAction SilentlyContinue
Write-Host 'Odinstalovano.'
