@echo off
title TravelEngine Setup ^& Startup Wizard
setlocal enabledelayedexpansion

:: Dynamically extract actual ESC character for bulletproof ANSI terminal styling
for /f "tokens=1,2 delims=#" %%a in ('"prompt #$H#$E# & echo on & for %%b in (1) do rem"') do set "ESC=%%b"
set "G=%ESC%[92m"
set "B=%ESC%[94m"
set "Y=%ESC%[93m"
set "R=%ESC%[91m"
set "M=%ESC%[95m"
set "C=%ESC%[96m"
set "W=%ESC%[0m"

cls
echo %C%================================================================================%W%
echo %B%             T R A V E L  P L A N N I N G  ^&  E X P E R I E N C E               %W%
echo %B%                         -  T R A V E L E N G I N E  -                          %W%
echo %C%================================================================================%W%
echo %Y%    Welcome to the Travel Planning ^& Experience Engine Startup Wizard^!%W%
echo.

:: Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo %R%[ERROR] Node.js is not installed or not found in your system's PATH.%W%
    echo Please install Node.js from https://nodejs.org/ and try again.
    echo.
    pause
    exit /b 1
)

:: Set project folder paths
set "PROJECT_DIR=%~dp0"
set "ENV_FILE=%PROJECT_DIR%\.env.local"

:: Run interactive setup wizard if config is missing (Escaping all parentheses in this block)
if not exist "%ENV_FILE%" (
    echo %Y%[SETUP] No configuration file ^(.env.local^) found. Starting Setup Wizard...%W%
    echo.
    echo 1. Enter your Neon PostgreSQL Connection String ^(DATABASE_URL^):
    set /p "DB_URL=> "
    echo.
    echo 2. Enter your OpenAI API Key ^(OPENAI_API_KEY^) - [Press Enter to Skip and run in Offline/Mock Mode]:
    set /p "AI_KEY=> "
    echo.
    
    :: Generate secure random JWT secret token using batch random generators
    set "JWT_SEC=JWT_SECRET_!random!!random!!random!!random!"
    
    echo DATABASE_URL=!DB_URL!> "%ENV_FILE%"
    if not "!AI_KEY!"=="" (
        echo OPENAI_API_KEY=!AI_KEY!>> "%ENV_FILE%"
    )
    echo JWT_SECRET=!JWT_SEC!>> "%ENV_FILE%"
    
    echo.
    echo %G%[SUCCESS] Config file created successfully at travelengine\.env.local!%W%
    echo.
    pause
) else (
    echo %G%[INFO] Existing configuration successfully loaded from travelengine\.env.local%W%
    echo.
    timeout /t 2 >nul
)

:MENU
cls
echo %C%================================================================================%W%
echo %B%          TRAVEL PLANNING ^& EXPERIENCE ENGINE - DEVELOPER CONTROL CENTER%W%
echo %C%================================================================================%W%
echo.
echo %W%Please choose an action to proceed:%W%
echo.
echo %C% [1]%W% Run Development Server (%Y%npm run dev%W%)
echo %C% [2]%W% Build ^& Run Production Server (%Y%npm run build ^& npm start%W%)
echo %C% [3]%W% Push Database Schema to Neon Postgres (%Y%npx drizzle-kit push%W%)
echo %C% [4]%W% Re-configure Environment Variables (%Y%Overwrites .env.local%W%)
echo %C% [5]%W% Exit
echo.
echo %C%================================================================================%W%
set /p "CHOICE=Enter choice [1-5]: "

if "%CHOICE%"=="1" goto DEV
if "%CHOICE%"=="2" goto PROD
if "%CHOICE%"=="3" goto MIGRATION
if "%CHOICE%"=="4" goto CONFIG
if "%CHOICE%"=="5" goto EXIT
goto MENU

:DEV
cls
echo %G%[RUNNING] Starting TravelEngine in Development Mode...%W%
echo %Y%Open http://localhost:3000 in your browser when ready.%W%
echo Press Ctrl+C in this terminal window to stop the server.
echo.
cd /d "%PROJECT_DIR%"
cmd /c npm run dev
pause
goto MENU

:PROD
cls
echo %G%[RUNNING] Building TravelEngine for Production...%W%
echo.
cd /d "%PROJECT_DIR%"
cmd /c npm run build
if %errorlevel% neq 0 (
    echo.
    echo %R%[ERROR] Next.js build failed. Please resolve compilation issues and try again.%W%
    pause
    goto MENU
)
echo.
echo %G%[RUNNING] Starting TravelEngine production bundle...%W%
echo %Y%Open http://localhost:3000 in your browser.%W%
echo Press Ctrl+C in this terminal window to stop the server.
echo.
cmd /c npm start
pause
goto MENU

:MIGRATION
cls
echo %G%[MIGRATION] Syncing Drizzle Schema with Neon Postgres...%W%
echo.
cd /d "%PROJECT_DIR%"
cmd /c npx drizzle-kit push
if %errorlevel% neq 0 (
    echo.
    echo %R%[ERROR] Schema push failed. Please verify your connection string in .env.local.%W%
    pause
    goto MENU
)
echo.
echo %G%[SUCCESS] Database schema successfully pushed to Neon Postgres!%W%
pause
goto MENU

:CONFIG
cls
echo %Y%[SETUP] Re-configuring Environment Variables...%W%
echo %R%WARNING: This will overwrite your existing .env.local file.%W%
echo.
echo 1. Enter your Neon PostgreSQL Connection String ^(DATABASE_URL^):
set /p "DB_URL=> "
echo.
echo 2. Enter your OpenAI API Key ^(OPENAI_API_KEY^) - [Press Enter to Skip]:
set /p "AI_KEY=> "
echo.

set "JWT_SEC=JWT_SECRET_!random!!random!!random!!random!"

echo DATABASE_URL=!DB_URL!> "%ENV_FILE%"
if not "!AI_KEY!"=="" (
    echo OPENAI_API_KEY=!AI_KEY!>> "%ENV_FILE%"
)
echo JWT_SECRET=!JWT_SEC!>> "%ENV_FILE%"

echo.
echo %G%[SUCCESS] Config file successfully updated at travelengine\.env.local!%W%
pause
goto MENU

:EXIT
echo.
echo %C%Thank you for using the Travel Planning ^& Experience Engine. Happy coding!%W%
echo.
timeout /t 3 >nul
exit /b 0
