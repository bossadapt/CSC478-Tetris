# How to use

You will need to follow the instructions top down

## Create a shared env

make an enviorment file to hold the api base and the secret that protects leaderboard submissions lightly ( enought to deter the lazy )

```
echo  "REACT_APP_API_BASE=http://127.0.0.1:8000
REACT_APP_LEADERBOARD_SECRET=whatever" > ./frontend/.env

```

The backend also accepts `LEADERBOARD_SECRET` in `/srv/tetris_api/.env`, but keeping
`REACT_APP_LEADERBOARD_SECRET` in `frontend/.env` is still required for the frontend build.

## add this to your '/etc/nginx/sites-available/default' ( fix paths)

location = /tetris {
return 301 /tetris/;
}
location /tetris/ {
alias /var/www/bossadapt.org/tetris/;
index index.html;
try_files $uri $uri/ /tetris/index.html;
}
location /tetris/api/ {
proxy_pass http://127.0.0.1:7898/;

    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

}

## Start backend:

### Testing

You will need python and python venv installed

```
cd ./backend
just init
just run
```

### Prod

just init
sudo install -d -m 755 /srv/tetris_api
sudo cp ../frontend/.env /srv/tetris_api/.env
sudo cp ./tetris_api.service /etc/systemd/system/tetris_api.service
sudo systemctl daemon-reload
sudo systemctl enable tetris_api
sudo systemctl start tetris_api
sudo systemctl status tetris_api

If you deploy with the repo-level `justfile`, `just deploy-backend` first syncs
`/srv/tetris_api/.env` from `frontend/.env` when that file exists locally. If it does
not exist locally, the deploy reuses the existing remote `/srv/tetris_api/.env` and only
fails when neither copy exists. You can still use `just deploy-backend-env` by itself
for recovery or manual secret syncs.

## Start frontend:

You will need npm installed

```
cd ./frontend
npm run start
```
