# madchatter - backend

## Running the project
Make sure to have python and uv installed.

Create a `.env` file using the `.env.example` template.

Run `uv run src/main,py` to start the server.

## Applying Migrations
We use Alembic + SQLAlchemy for our database. This comes with the possiblity to auto-generate and run database migration scripts. These scripts should typically be made after any change to the database model before pushing the new code. Migrations can be created by calling the command:
```bash
alembic revision --autogenerate -m "hello"
```
And applied using:
```bash
alembic upgrade head
```
