@echo off
chcp 65001 >nul

echo.
echo ============================================
echo   meskeIA - DESACTIVAR Modo Mantenimiento
echo ============================================
echo.

cd /d "c:\Users\jaceb\meskeia-web"

echo [1/4] Desactivando modo mantenimiento...

powershell -Command "(Get-Content 'maintenance.config.ts') -replace 'FILE_MAINTENANCE_MODE = true', 'FILE_MAINTENANCE_MODE = false' | Set-Content 'maintenance.config.ts'"

echo [2/4] Verificando cambio...
findstr /C:"FILE_MAINTENANCE_MODE = false" maintenance.config.ts >nul
if %errorlevel% neq 0 (
    echo.
    echo ERROR: No se pudo desactivar el modo mantenimiento
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
echo   Vercel desplegara en 60 segundos
echo   meskeia.com volvera a funcionar
echo.
pause
