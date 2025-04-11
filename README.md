# introduction
mapping.news is a project designed to explore geospatial information in local journalism.

# installation
we use `npm` for JS package version management and Poetry for the same in Python.

```bash
npm i
```

```bash
brew install pipx
pipx install poetry
poetry install
```

you can then run the program as needed

```bash
# parse feeds and update the database
poetry run python actions/feedParser.py

# run in dry-run mode (no database writes)
poetry run python actions/feedParser.py --dry-run

# sync cache with database (use with caution)
poetry run python actions/feedParser.py --sync-db

# validate cache against database
poetry run python actions/validateCache.py

# validate cache with detailed output
poetry run python actions/validateCache.py --verbose

# reconcile cache with database
poetry run python actions/validateCache.py --reconcile
```

and to start the frontend server

```bash
npm run dev
```

# wuh-huh? why?

read more on the [about page for the project](https://mapping.news/about).

# questions?

contact info is available on the [about page for the project](https://mapping.news/about).

# further reading and acknowledgements

read more on the [about page for the project](https://mapping.news/about).