// import Sqlite
import Gio from 'gi://Gio';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class Database {
    constructor(app) {
        this.app = app;
        this.dbPath = this.app.userSettings.HISTORY_FILE;
        this.initDatabase();
    }

    executeSql(query) {
        try {
            const subprocess = new Gio.Subprocess({
                argv: ['sqlite3', this.dbPath, query],
                flags:
                    Gio.SubprocessFlags.STDOUT_PIPE |
                    Gio.SubprocessFlags.STDERR_PIPE,
            });

            subprocess.init(null);

            const [, stdout, stderr] = subprocess.communicate_utf8(null, null);
            if (stderr.trim()) {
                throw new Error(`SQLite error: ${stderr.trim()}`);
            }
            return stdout.trim();
        } catch (error) {
            console.error('Error executing SQL query:', error);
            return null;
        }
    }

    escapeString(value) {
        return value.replace(/'/g, "''");
    }

    async addToHistory(user, model) {
        try {
            const escapedUser = this.escapeString(user);
            const escapedModel = this.escapeString(model);
            const insertQuery = `
            INSERT INTO history (user, model)
            VALUES ('${escapedUser}', '${escapedModel}');
            `;
            await this.executeSql(insertQuery);
        } catch (error) {
            console.error('Error adding to history:', error);
        }
    }

    async initDatabase() {
        try {
            // Create "history" if not exists
            const createHistoryTableQuery = `
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user TEXT NOT NULL,
                model TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user, model) ON CONFLICT REPLACE
            );
        `;
            await this.executeSql(createHistoryTableQuery);
            this.addToHistory(
                this.app.gemini.getTuneString('user'),
                this.app.gemini.getTuneString('model'),
            );
        } catch (error) {
            console.error('Error initializing database:', error);
        }
    }

    getHistory() {
        try {
            const query = 'SELECT user, model FROM history';
            const history = this.executeSql(query);
            let result = [];
            if (history) {
                if (this.app.userSettings.RECURSIVE_TALK) {
                    for (const row of history) {
                        result.push({
                            role: 'user',
                            parts: [
                                {
                                    text: row.user,
                                },
                            ],
                        });
                        result.push({
                            role: 'model',
                            parts: [
                                {
                                    text: row.model,
                                },
                            ],
                        });
                    }
                }
            }
            return result;
        } catch (error) {
            console.error('Error getting history:', error);
            return [];
        }
    }

    // Edit location on id 1 in user string, change "Undefined" to this.app.userSettings.LOCATION
    async editHistoryLocation(location) {
        try {
            const updateQuery = `
            UPDATE history
            SET user = REPLACE(user, 'Undefined', '${location}')
            WHERE id = 1;
        `;
            await this.executeSql(updateQuery);
        } catch (error) {
            console.error('Error editing history location:', error);
        }
    }

    async cleanHistory() {
        try {
            const deleteQuery = `
            DELETE FROM history
            WHERE id > (SELECT MIN(id) FROM history);
        `;
            await this.executeSql(deleteQuery);
        } catch (error) {
            console.error('Error cleaning history:', error);
        }
    }

    closeDatabase() {
        try {
            this.executeSql('VACUUM');
            this.executeSql('PRAGMA optimize');
        } catch (error) {
            console.error('Error closing database:', error);
        }
    }
}
