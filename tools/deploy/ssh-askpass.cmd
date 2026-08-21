@echo off
powershell.exe -NoProfile -Command "Write-Output $env:SSH_PASSPHRASE"
