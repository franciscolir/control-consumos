@echo off
setlocal
cd /d "%~dp0"

title Control de Consumos

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: No se encontro Node.js.
  echo Instala Node.js LTS desde https://nodejs.org/
  echo Luego vuelve a ejecutar este archivo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Instalando dependencias por primera vez...
  call npm install
  if errorlevel 1 (
    echo.
    echo ERROR: No se pudieron instalar las dependencias.
    pause
    exit /b 1
  )
)

echo Iniciando Control de Consumos...
start "" http://localhost:3000
call npm start
pause
