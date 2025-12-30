@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo.
echo ============================================
echo   meskeIA - ACTIVAR Modo Mantenimiento
echo ============================================
echo.

cd /d "c:\Users\jaceb\meskeia-web"

echo [1/4] Activando modo mantenimiento...

:: Reemplazar false por true en maintenance.config.ts
powershell -Command "(Get-Content 'maintenance.config.ts') -replace 'MAINTENANCE_MODE = false', 'MAINTENANCE_MODE = true' | Set-Content 'maintenance.config.ts'"

echo [2/4] Verificando cambio...
findstr /C:"MAINTENANCE_MODE = true" maintenance.config.ts >nul
if %errorlevel% neq 0 (
    echo.
    echo ERROR: No se pudo activar el modo mantenimiento
    echo Verifica el archivo maintenance.config.ts manualmente
    pause
    exit /b 1
)

echo [3/4] Realizando commit...
git add maintenance.config.ts
git commit -m "chore: activar modo mantenimiento"

echo [4/4] Subiendo a GitHub...
git push origin main

echo.
echo ============================================
echo   MANTENIMIENTO ACTIVADO
echo ============================================
echo.
echo   Vercel desplegará en ~60 segundos
echo   meskeia.com mostrará página de mantenimiento
echo.
echo   Para desactivar: desactivar-mantenimiento.bat
echo.
pause
