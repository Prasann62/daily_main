@echo off
echo Fixing git errors and cleaning up frozen processes...
taskkill /F /IM git.exe 2>nul
del .git\index.lock 2>nul

echo.
echo Adding your new CSS and JS files...
git add .

echo.
echo Committing the design fixes...
git commit -m "Fixed PDF light theme and sizes"

echo.
echo Pushing to GitHub...
git push

echo.
echo =======================================
echo ALL DONE! Your code is updated!
echo =======================================
pause
