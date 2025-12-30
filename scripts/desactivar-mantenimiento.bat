@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo.
echo ============================================
echo   meskeIA - DESACTIVAR Modo Mantenimiento
echo ============================================
echo.

cd /d "c:\Users\jaceb\meskeia-web"

echo [1/4] Desactivando modo mantenimiento...

:: Reemplazar true por false en maintenance.config.ts
powershell -Command "(Get-Content 'maintenance.config.ts') -replace 'MAINTENANCE_MODE = true', 'MAINTENANCE_MODE = false' | Set-Content 'maintenance.config.ts'"

echo [2/4] Verificando cambio...
findstr /C:"MAINTENANCE_MODE = false" maintenance.config.ts >nul
if %errorlevel% neq 0 (
    echo.
    echo ERROR: No se pudo desactivar el modo mantenimiento
    echo Verifica el archivo maintenance.config.ts manualmente
    pause
    exit /b 1
)

echo [3/4] Realizando commit...
git add maintenance.config.ts
git commit -m "chore: desactivar modo mantenimiento"

echo [4/4] Subiendo a GitHub...
git push origin main

echo.
echo ============================================
echo   MANTENIMIENTO DESACTIVADO
echo ============================================
echo.
echo   Vercel desplegará en ~60 segundos
echo   meskeia.com volverá a funcionar normalmente
echo.
pause
