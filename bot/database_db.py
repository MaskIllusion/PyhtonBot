import sqlite3
from collections.abc import Iterable
from typing import Any

from data_config import DB_NAME


def get_db_connection() -> sqlite3.Connection:
    return sqlite3.connect(DB_NAME)


def create_table() -> None:
    with get_db_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                telegram_id INTEGER UNIQUE NOT NULL,
                first_name TEXT NOT NULL,
                last_name TEXT,
                username TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
    print("✅ Table created")


def add_user(
    telegram_id: int,
    first_name: str,
    last_name: str | None = None,
    username: str | None = None,
) -> bool:
    try:
        with get_db_connection() as conn:
            conn.execute(
                """
                INSERT OR IGNORE INTO users
                    (telegram_id, first_name, last_name, username)
                VALUES (?, ?, ?, ?)
                """,
                (telegram_id, first_name, last_name, username),
            )
        return True
    except sqlite3.Error as error:
        print(f"Database error: {error}")
        return False


def get_user(telegram_id: int) -> tuple[Any, ...] | None:
    with get_db_connection() as conn:
        return conn.execute(
            "SELECT * FROM users WHERE telegram_id = ?",
            (telegram_id,),
        ).fetchone()


def get_all_users() -> Iterable[tuple[Any, ...]]:
    with get_db_connection() as conn:
        return conn.execute(
            "SELECT * FROM users ORDER BY created_at DESC"
        ).fetchall()


class Database:
    create_table = staticmethod(create_table)
    add_user = staticmethod(add_user)
    get_user = staticmethod(get_user)
    get_all_users = staticmethod(get_all_users)


db = Database()