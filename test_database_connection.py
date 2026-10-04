"""Verify that the configured Supabase PostgreSQL database is reachable."""

import psycopg2

from database import get_connection


def test_database_connection() -> None:
    """Connect to PostgreSQL and execute a minimal query."""
    try:
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1;")
                cursor.fetchone()
        print("Database connection successful")
    except (RuntimeError, psycopg2.Error) as error:
        print(f"Database connection failed: {error}")
        raise SystemExit(1) from error


if __name__ == "__main__":
    test_database_connection()