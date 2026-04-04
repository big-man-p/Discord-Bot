npx tsc --build
Copy-Item .\src\.env .\build\.env
Copy-Item .\src\bot\system-prompt.md .\build\bot\system-prompt.md
Set-Location build
node main.js