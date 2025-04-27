## SET UP and DATABASE CONNECTION

1. Go to `/doclean/database`
2. Start the PostgreSQL Container: `docker-compose up -d`
3. Install `golang-migrate`:
   MAC OS: `brew install golang-migrate`
   WINDOWS: `scoop install migrate`
4. Go to DBeaver and fill in as below:

![alt text](image.png)

where database, username, password is in `docker-compose.yml` file

## CREATE NEW TABLE IN DATABASE

`migrate create -ext sql -dir db/migrations -seq <migration-file-name>`

If there were no errors, we should have two files available under db/migrations folder:

`000001_<migration-file-name>.down.sql`
`000001_<migration-file-name>.up.sql`

## DATABASE MIGRATIONS

1. Run in terminal: `export POSTGRESQL_URL='postgres://admin:golatex_admin@localhost:5000/golatex?sslmode=disable'`
2. To migrate UP database: `migrate -database ${POSTGRESQL_URL} -path db/migrations up <step>`
3. To migrate DOWN database: `migrate -database ${POSTGRESQL_URL} -path db/migrations down <step>`

where step is the number of steps you want to migrate up/down from the latest migration

## Share a Database Data to other developers as Database Dump

1. To extract data into `.sql` file: `docker exec -t golatex-postgres-container pg_dump -U admin golatex > backup.sql`, then you can push the `backup.sql` to GitHub or send to other dev directly
2. To synchronize data into database in your local machine: `cat backup.sql | docker exec -i golatex-postgres-container psql -U admin -d golatex`
