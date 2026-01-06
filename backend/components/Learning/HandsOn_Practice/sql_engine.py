# backend/components/Learning/HandsOn_Practice/sql_engine.py

import sqlite3
from typing import List, Dict, Any


DB_PATH = ":memory:"


def init_db(conn: sqlite3.Connection):
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE employees (
            id INTEGER PRIMARY KEY,
            name TEXT,
            salary INTEGER
        )
    """)
    cur.executemany(
        "INSERT INTO employees (name, salary) VALUES (?, ?)",
        [
            ("Alice", 60000),
            ("Bob", 50000),
            ("Charlie", 70000),
        ],
    )
    conn.commit()


def execute_sql(query: str) -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    init_db(conn)

    cur = conn.cursor()
    cur.execute(query)
    rows = cur.fetchall()

    return [dict(row) for row in rows]
