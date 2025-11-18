# How to use

You will need to follow the instructions top down

## Create a shared env

make an enviorment file to hold the api base and the secret that protects leaderboard submissions lightly ( enought to deter the lazy )

```
echo  "REACT_APP_API_BASE=http://127.0.0.1:8000
REACT_APP_LEADERBOARD_SECRET=whatever" > ./frontend/.env

```

## Start backend:

You will need python and python venv installed

```
cd ./backend
just init
just run
```

## Start frontend:

You will need npm installed

```
cd ./frontend
npm run start
```
