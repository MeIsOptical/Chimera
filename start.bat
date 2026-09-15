:: Fullscreen the window
@echo off
set "VBS_FILE=%temp%\fullscreen.vbs"
echo Set WshShell = WScript.CreateObject("WScript.Shell") > "%VBS_FILE%"
echo Wscript.Sleep 100 >> "%VBS_FILE%"
echo WshShell.SendKeys "%%{ENTER}" >> "%VBS_FILE%"
cscript //nologo "%VBS_FILE%" >nul 2>&1
del "%VBS_FILE%"

:: Start the script
node index.js