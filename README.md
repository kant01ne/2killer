# Killer Role Play Game

![img1.png](https://raw.githubusercontent.com/NkxxkN/2killer/master/img1.png)

![img2.png](https://raw.githubusercontent.com/NkxxkN/2killer/master/img2.png)

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
```

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
HOST=IP
PORT=80
BASE_URL=https://thekiller.xyz
ADMIN_PASSWORD="<RANDOM_LONG_PASSWORD_TO_MANAGE_ADMIN_INTERFACE>"
APP_KEY="<RANDOM_AS_LONG_AS_APP_KEY>"
GAME_SECRET="<RANDOM_AS_LONG_AS_APP_KEY>"
ADMIN_PASSWORD="password"
HUMIO_API_TOKEN=""
HUMIO_INGEST_TOKEN=""
HUMIO_REPOSITORY="sandbox"
```


### Migrations

Run the following command to run startup migrations.

```bash
adonis migration:run
```

### DB Import

```bash
mkdir secrets
```

SSH into the old prod server:

```bash
mysqldump -u root -p adonis > ../dbexport.sql
```

On our machine or on the server:
```bash
scp root@:/home/<USERNAME>/dbexport.sql ./secrets/dbexport.sql
```

Back in the new server:
```bash
mysql -u root -p adonis < ./secrets/dbexport.sql
```

## Run

```
sudo ENV=prod adonis serve
```
