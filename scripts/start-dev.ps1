npx tsc --build
Copy-Item .\src\.env .\build\.env
Set-Location build
node main.js