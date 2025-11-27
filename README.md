# How to use

You will need to follow the instructions top down

## Create a shared env

make an enviorment file to hold the api base and the secret that protects leaderboard submissions lightly ( enought to deter the lazy )

```
echo  "REACT_APP_API_BASE=http://127.0.0.1:8000
REACT_APP_LEADERBOARD_SECRET=whatever" > ./frontend/.env

```

## add this to your '/etc/nginx/sites-available/default' ( fix paths)

location = /tetris {
return 301 /tetris/;
}
location /tetris/ {
alias /var/www/bossadapt.org/CSC478-Tetris/frontend/build/;
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
cp ./tetris_api.service /etc/systemd/system/tetris_api.service
sudo systemctl daemon-reload
sudo systemctl enable tetris_api
sudo systemctl start tetris_api
sudo systemctl status tetris_api

## Start frontend:

You will need npm installed

```
cd ./frontend
npm run start
```
