set shell := ["bash", "-cu"]

host := "personal"
frontend_dir := "frontend"
frontend_site_root := "/var/www/bossadapt.org/tetris"
frontend_archive_name := "frontend-build.tar.gz"
backend_dir := "/srv/tetris_api"
backend_archive_name := "backend.tar.gz"
backend_service_name := "tetris_api"
backend_service_file := "backend/tetris_api.service"
backend_env_file := "frontend/.env"
backend_env_archive_name := "tetris_api.env"

default:
    @just --list

install-frontend:
    cd {{frontend_dir}} && npm ci

build-frontend:
    test -x {{frontend_dir}}/node_modules/.bin/react-scripts || (cd {{frontend_dir}} && npm ci)
    cd {{frontend_dir}} && npm run build

pack-frontend: build-frontend
    rm -f {{frontend_archive_name}}
    tar -czf {{frontend_archive_name}} -C {{frontend_dir}}/build .

upload-frontend: pack-frontend
    scp {{frontend_archive_name}} {{host}}:/tmp/{{frontend_archive_name}}

pack-backend:
    rm -f {{backend_archive_name}}
    tar -czf {{backend_archive_name}} \
        --exclude='.venv' \
        --exclude='__pycache__' \
        --exclude='*.pyc' \
        --exclude='.pytest_cache' \
        --exclude='game.db*' \
        -C backend .

upload-backend: pack-backend
    scp {{backend_archive_name}} {{host}}:/tmp/{{backend_archive_name}}

ssh:
    ssh {{host}}

deploy-frontend: upload-frontend
    ssh {{host}} "mkdir -p {{frontend_site_root}}"
    ssh {{host}} "find {{frontend_site_root}} -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +"
    ssh {{host}} "tar -xzf /tmp/{{frontend_archive_name}} -C {{frontend_site_root}}"
    ssh {{host}} "rm -f /tmp/{{frontend_archive_name}}"

    rm -f {{frontend_archive_name}}
    printf 'Deployed frontend to %s:%s\n' "{{host}}" "{{frontend_site_root}}"

install-backend-service:
    scp {{backend_service_file}} {{host}}:/tmp/{{backend_service_name}}.service
    ssh {{host}} "sudo install -m 644 /tmp/{{backend_service_name}}.service /etc/systemd/system/{{backend_service_name}}.service"
    ssh {{host}} "rm -f /tmp/{{backend_service_name}}.service"
    ssh {{host}} "sudo systemctl daemon-reload"
    ssh {{host}} "sudo systemctl enable {{backend_service_name}}"

    printf 'Installed service %s on %s\n' "{{backend_service_name}}" "{{host}}"

deploy-backend-env:
    if test -f {{backend_env_file}}; then \
        scp {{backend_env_file}} {{host}}:/tmp/{{backend_env_archive_name}}; \
        ssh {{host}} "sudo install -o www-data -g www-data -m 640 /tmp/{{backend_env_archive_name}} {{backend_dir}}/.env"; \
        ssh {{host}} "rm -f /tmp/{{backend_env_archive_name}}"; \
        printf 'Installed backend env to %s:%s/.env\n' "{{host}}" "{{backend_dir}}"; \
    elif ssh {{host}} "test -f {{backend_dir}}/.env"; then \
        printf 'Using existing backend env on %s:%s/.env\n' "{{host}}" "{{backend_dir}}"; \
    else \
        printf 'Missing %s and no existing %s/.env on %s\n' "{{backend_env_file}}" "{{backend_dir}}" "{{host}}" >&2; \
        exit 1; \
    fi

deploy-backend: deploy-backend-env upload-backend
    ssh {{host}} "sudo install -d -o www-data -g www-data -m 755 {{backend_dir}}"
    ssh {{host}} "sudo find {{backend_dir}} -mindepth 1 -maxdepth 1 ! -name '.env' ! -name 'game.db' ! -name 'game.db-shm' ! -name 'game.db-wal' -exec rm -rf -- {} +"
    ssh {{host}} "sudo -u www-data tar -xzf /tmp/{{backend_archive_name}} -C {{backend_dir}}"
    ssh {{host}} "rm -f /tmp/{{backend_archive_name}}"
    ssh {{host}} "sudo -u www-data python3 -m venv {{backend_dir}}/.venv"
    ssh {{host}} "sudo -u www-data {{backend_dir}}/.venv/bin/pip install -r {{backend_dir}}/requirements.txt"
    ssh {{host}} "sudo systemctl restart {{backend_service_name}}"

    rm -f {{backend_archive_name}}
    printf 'Deployed backend to %s:%s\n' "{{host}}" "{{backend_dir}}"

status-backend:
    ssh {{host}} "sudo systemctl --no-pager --full status {{backend_service_name}}"

logs-backend:
    ssh {{host}} "sudo journalctl -u {{backend_service_name}} -n 100 --no-pager"

deploy-all: deploy-frontend deploy-backend
