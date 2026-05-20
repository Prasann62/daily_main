@echo off
echo Cleaning up git processes and locks...
taskkill /F /IM git.exe 2>nul
del .git\index.lock 2>nul
git merge --abort 2>nul
git rebase --abort 2>nul

echo.
echo Forcing branch to main...
git checkout -B main

echo.
echo Adding and committing files...
git add .
git commit -m "Added Save & Restore feature: auto-download JSON data and Manager Edit Tool"

echo.
echo Force pushing to GitHub...
git push -f origin main

echo.
echo =======================================
echo ALL DONE! Your code is forcefully updated!
echo =======================================
pause
