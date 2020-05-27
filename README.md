# Adonis fullstack application

## Setup



```bash

npm install
sudo apt install mariadb-client-core-10.3
sudo apt-get install mysql-server
sudo mysql -u root
    ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password_from_.env';
    FLUSH PRIVILEGES;
    create database adonis;
```

## Env


```bash
vim .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
HOST=VPS_IP
PORT=80
APP_KEY="<RANDOM_AS_LONG_AS_APP_KEY>"
GAME_SECRET="<RANDOM_AS_LONG_AS_APP_KEY>"
```


### Migrations

Run the following command to run startup migrations.

```bash
adonis migration:run
```

## Run

```
sudo ENV=prod adonis serve
```
