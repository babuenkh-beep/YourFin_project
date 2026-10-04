"""Verify the YourFin profile table and Supabase Auth signup trigger."""

import psycopg2

from database import get_connection

TABLE_NAME = "public.financial_profiles"
LOAN_APPLICATIONS_TABLE_NAME = "public.loan_applications"
AUTH_TRIGGER_NAME = "on_auth_user_created"
AUTH_FUNCTION_NAME = "public.handle_new_user"
REQUIRED_PROFILE_COLUMNS = {
    "id",
    "email_address",
    "full_name",
    "age",
    "employment_status",
    "monthly_income",
    "total_expenses",
    "total_debt",
    "financial_goal",
    "country",
    "currency",
}


def check_schema() -> None:
    """Confirm that the table, trigger function, and auth.users trigger exist."""
    try:
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT to_regclass(%s);", (TABLE_NAME,))
                if cursor.fetchone()[0] is None:
                    raise RuntimeError(f"Table not found: {TABLE_NAME}")

                cursor.execute(
                    """
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'financial_profiles';
                    """
                )
                profile_columns = {row[0] for row in cursor.fetchall()}
                missing_columns = REQUIRED_PROFILE_COLUMNS - profile_columns
                if missing_columns:
                    raise RuntimeError(
                        "Financial profile columns missing: "
                        + ", ".join(sorted(missing_columns))
                    )

                cursor.execute(
                    """
                    SELECT EXISTS (
                        SELECT 1
                        FROM pg_constraint AS foreign_key
                        JOIN pg_class AS profile_table
                            ON profile_table.oid = foreign_key.conrelid
                        JOIN pg_namespace AS profile_schema
                            ON profile_schema.oid = profile_table.relnamespace
                        JOIN pg_class AS referenced_table
                            ON referenced_table.oid = foreign_key.confrelid
                        JOIN pg_namespace AS referenced_schema
                            ON referenced_schema.oid = referenced_table.relnamespace
                        WHERE foreign_key.contype = 'f'
                          AND profile_schema.nspname = 'public'
                          AND profile_table.relname = 'financial_profiles'
                          AND referenced_schema.nspname = 'auth'
                          AND referenced_table.relname = 'users'
                          AND pg_get_constraintdef(foreign_key.oid)
                              LIKE 'FOREIGN KEY (id) REFERENCES auth.users(id)%'
                    );
                    """
                )
                if not cursor.fetchone()[0]:
                    raise RuntimeError(
                        "financial_profiles.id is not linked to auth.users(id)."
                    )

                cursor.execute("SELECT to_regclass(%s);", (LOAN_APPLICATIONS_TABLE_NAME,))
                if cursor.fetchone()[0] is None:
                    raise RuntimeError(f"Table not found: {LOAN_APPLICATIONS_TABLE_NAME}")

                cursor.execute(
                    """
                    SELECT EXISTS (
                        SELECT 1
                        FROM pg_trigger AS trigger
                        JOIN pg_class AS table_class
                            ON table_class.oid = trigger.tgrelid
                        JOIN pg_namespace AS table_namespace
                            ON table_namespace.oid = table_class.relnamespace
                        WHERE trigger.tgname = %s
                          AND table_namespace.nspname = 'auth'
                          AND table_class.relname = 'users'
                          AND NOT trigger.tgisinternal
                    );
                    """,
                    (AUTH_TRIGGER_NAME,),
                )
                if not cursor.fetchone()[0]:
                    raise RuntimeError("Auth signup trigger not found: on_auth_user_created")

                cursor.execute("SELECT to_regprocedure(%s);", (AUTH_FUNCTION_NAME + "()",))
                if cursor.fetchone()[0] is None:
                    raise RuntimeError("Auth signup trigger function not found: public.handle_new_user")

                cursor.execute(
                    """
                    SELECT COUNT(*)
                    FROM auth.users AS auth_user
                    LEFT JOIN public.financial_profiles AS profile
                        ON profile.id = auth_user.id
                    WHERE profile.id IS NULL;
                    """
                )
                missing_profile_count = cursor.fetchone()[0]
                if missing_profile_count:
                    raise RuntimeError(
                        "Auth trigger verification failed: "
                        f"{missing_profile_count} Auth user(s) have no financial profile."
                    )

        print("Table found: public.financial_profiles")
        print("Required financial profile columns and Auth user ID link verified")
        print("Table found: public.loan_applications")
        print("Auth signup trigger found: on_auth_user_created")
        print("Trigger configuration and existing Auth user profiles verified")
    except (RuntimeError, psycopg2.Error) as error:
        print(f"Schema verification failed: {error}")
        raise SystemExit(1) from error


if __name__ == "__main__":
    check_schema()