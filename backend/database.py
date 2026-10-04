"""Database connection and schema initialization utilities for YourFin."""

from __future__ import annotations

import os
from pathlib import Path
from urllib.parse import urlparse

import psycopg2
from dotenv import load_dotenv
from psycopg2.extensions import connection as Connection

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"
SCHEMA_FILE = BASE_DIR / "supabase_schema.sql"


def get_database_url() -> str:
    """Load and validate DATABASE_URL without exposing secret values."""
    load_dotenv(ENV_FILE)
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise RuntimeError(
            "DATABASE_URL is not configured. Add it to the .env file in the project folder."
        )

    parsed_url = urlparse(database_url)
    if parsed_url.scheme not in {"postgres", "postgresql"} or not parsed_url.hostname:
        raise RuntimeError("DATABASE_URL must be a valid PostgreSQL connection URL.")

    return database_url


def get_connection() -> Connection:
    """Create a TLS-enabled PostgreSQL connection to Supabase."""
    return psycopg2.connect(get_database_url(), sslmode="require")


def initialize_database() -> None:
    """Create the YourFin schema, Auth signup trigger, and RLS policies."""
    if not SCHEMA_FILE.is_file():
        raise FileNotFoundError(f"Schema file not found: {SCHEMA_FILE}")

    schema_sql = SCHEMA_FILE.read_text(encoding="utf-8")
    if not schema_sql.strip():
        raise RuntimeError("The schema SQL file is empty.")

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(schema_sql)


if __name__ == "__main__":
    try:
        initialize_database()
        print("Database initialization completed successfully")
    except (OSError, RuntimeError, psycopg2.Error) as error:
        print(f"Database initialization failed: {error}")
        raise SystemExit(1) from error