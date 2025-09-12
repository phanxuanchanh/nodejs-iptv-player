--
-- File generated with SQLiteStudio v3.4.17 on Fri Sep 12 19:48:57 2025
--
-- Text encoding used: System
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: all_channels
CREATE TABLE IF NOT EXISTS all_channels (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, logo TEXT, "group" TEXT, url TEXT, list_id INTEGER);

-- Table: all_lists
CREATE TABLE IF NOT EXISTS all_lists (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, urlOrFileName TEXT NOT NULL, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP);

COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
