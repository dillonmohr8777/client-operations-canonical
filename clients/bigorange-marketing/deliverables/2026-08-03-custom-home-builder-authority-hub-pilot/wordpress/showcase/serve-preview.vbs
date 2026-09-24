Option Explicit

Dim shell, folder, commandLine
Set shell = CreateObject("WScript.Shell")
folder = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
commandLine = "cmd.exe /c cd /d """ & folder & """ && python -m http.server 8765 --bind 127.0.0.1 > NUL 2>&1"
shell.Run commandLine, 0, False
