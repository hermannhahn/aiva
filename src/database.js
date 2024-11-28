import GLib from 'gi://GLib';
import Sqlite from 'gi://Sqlite';

class DatabaseManager {
    constructor(app) {
        this.app = app;
        this.db = null;
        this.dbPath = this.app.EXT_DIR;
        this.initDatabase();
    }

    initDatabase() {
        try {
            // Create database if not exists
            this.db = Sqlite.open(this.dbPath);

            // Create "history" if not exists
            const createHistoryTableQuery = `
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user TEXT NOT NULL,
                model TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            );
        `;
            this.db.exec(createHistoryTableQuery);
            this.addToHistory(this.app.gemini.getTuneString(user), this.app.gemini.getTuneString(model));
        } catch (error) {
            console.error('Error initializing database:', error);
        }
    }

    getHistory() {
        try {
            const query = 'SELECT user, model FROM history';
            const result = this.db.query(query);
            const history = [];
            while (result.next()) {
                history.push(
                    {
                        role: 'user',
                        parts: [
                            {
                                text: result.get_value(0),
                            },
                        ],
                    },
                    {
                        role: 'model',
                        parts: [
                            {
                                text: result.get_value(1),
                            },
                        ],
                    },
                );
            }
            result.finalize();
            return history;
        } catch (error) {
            console.error('Error getting history:', error);
            return [];
        }
    }

    addToHistory(user, model) {
        try {
            const insertQuery = `
            INSERT INTO history (user, model)
            VALUES (?, ?);
        `;
            this.db.exec(insertQuery, [user, model]);
        } catch (error) {
            console.error('Error adding to history:', error);
        }
    }

    editHistoryLocation(location) {

    cleanHistory() {
        try {
            const deleteQuery = `
            DELETE FROM history
            WHERE id > (SELECT MIN(id) FROM history);
        `;
            this.db.exec(deleteQuery);
        } catch (error) {
            console.error('Error cleaning history:', error);
        }
    }

    closeDatabase() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}

// Exemplo de uso:
const dbPath = GLib.build_filenamev([
    GLib.get_user_data_dir(),
    'my_extension',
    'database.sqlite',
]);

const dbManager = new DatabaseManager(dbPath);
dbManager.closeDatabase();
