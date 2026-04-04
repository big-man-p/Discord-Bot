tsc --build
Copy-Item .\src\bot\system-prompt.md .\build\bot\system-prompt.md
docker build . -t fakeawakepc.local:5000/discord-bot:latest
docker push fakeawakepc.local:5000/discord-bot:latest