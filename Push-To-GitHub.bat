@echo off
title Push SafeCity AI to GitHub
cd /d "C:\Users\ATECH\Desktop\safe-signals-"
echo ===================================================
echo Pushing SafeCity AI Frontend & Backend to GitHub...
echo Repository: https://github.com/zeishansheikh/safe-signals-.git
echo ===================================================
git push origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Pushed all frontend, backend, and brain files to GitHub!
) else (
    echo [ERROR] Push failed. If prompted, please complete browser login.
)
echo.
pause
