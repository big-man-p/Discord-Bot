tsc --build
docker build . -t fakeawakepc.local:5000/discord-bot:latest
docker push fakeawakepc.local:5000/discord-bot:latest