@echo off
setlocal
REM Stux.Digital Clientpage - Local dev server (Windows)
REM Usage: dev-server.bat [port] [--no-dev-mode] [--lan]
REM   port            default: 8000
REM   --no-dev-mode   render exactly as production does (no dev banner)
REM   --lan           listen on all interfaces so phones/tablets on your network can
REM                   connect (prints the addresses to open); default is 127.0.0.1 only
REM
REM Static site, nothing to build: this serves the folder the way GitHub Pages does through
REM .github\dev-router.php. DEV_MODE is on by default, which makes the router answer
REM /assets/dev-mode.js with window.SITE_DEV_MODE = true, so every page shows the dev banner.
REM PHP is only the local web server here; like the other Stux projects it runs on PHP 7.4:
REM %PHP_BIN% if set, else %LOCALAPPDATA%\Programs\PHP\7.4, else php74 on PATH, else php.

set "DIR=%~dp0"
set "PORT=8000"
set "HOST=127.0.0.1"
set "DEV_MODE=1"

:args
if "%~1"=="" goto run
if /I "%~1"=="--no-dev-mode" (
    set "DEV_MODE=0"
    shift
    goto args
)
if /I "%~1"=="--lan" (
    set "HOST=0.0.0.0"
    shift
    goto args
)
set "PORT=%~1"
shift
goto args

:run
set "PHP=%PHP_BIN%"
if not defined PHP if exist "%LOCALAPPDATA%\Programs\PHP\7.4\php.exe" set "PHP=%LOCALAPPDATA%\Programs\PHP\7.4\php.exe"
if not defined PHP (where php74 >nul 2>&1 && set "PHP=php74")
if not defined PHP set "PHP=php"
for /f "delims=" %%v in ('call "%PHP%" -r "echo PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION;"') do set "PHPVER=%%v"
if not "%PHPVER%"=="7.4" echo WARNING: serving with PHP %PHPVER%; the Stux projects use PHP 7.4. Install 7.4 or set PHP_BIN. 1>&2

if "%DEV_MODE%"=="1" (
    echo DEV_MODE on ^(dev banner^) - pass --no-dev-mode to see it as production does.
) else (
    echo DEV_MODE off - rendering exactly as production does.
)
echo Stux.Digital Clientpage running at http://127.0.0.1:%PORT% ^(PHP %PHPVER%^)
if "%HOST%"=="0.0.0.0" (
    echo On your local network ^(--lan^), open one of these on the other device:
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
        for /f "tokens=* delims= " %%b in ("%%a") do echo     http://%%b:%PORT%
    )
    echo   ^(usually the 192.168.x.x one; allow PHP through the firewall if asked^)
)
"%PHP%" -S %HOST%:%PORT% -t "%DIR%." "%DIR%.github\dev-router.php"
