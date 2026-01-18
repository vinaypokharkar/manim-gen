@echo off
echo Running Backend Tests...
cd /d "%~dp0"
pytest -v
pause
