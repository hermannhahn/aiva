import GLib from 'gi://GLib';
import Sqlite from 'gi://Sqlite';

class DatabaseManager {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.initDatabase();
    }

    initDatabase() {
        this.db = Sqlite.open(this.dbPath);

        // Criação da tabela "users" se não existir
        const createUsersTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user TEXT NOT NULL,
                email TEXT NOT NULL
            );
        `;
        this.db.exec(createUsersTableQuery);

        // Criação da tabela "settings" se não existir
        const createSettingsTableQuery = `
            CREATE TABLE IF NOT EXISTS settings (
                user_id INTEGER NOT NULL,
                apikey TEXT,
                speechkey TEXT,
                location TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id)
            );
        `;
        this.db.exec(createSettingsTableQuery);
    }

    addUser(user, email) {
        const query = `INSERT INTO users (user, email) VALUES (?, ?);`;
        const statement = this.db.prepare(query);
        statement.bindText(1, user);
        statement.bindText(2, email);
        statement.step();
        statement.reset();
        statement.finalize();
    }

    editUser(id, user, email) {
        const query = `UPDATE users SET user = ?, email = ? WHERE id = ?;`;
        const statement = this.db.prepare(query);
        statement.bindText(1, user);
        statement.bindText(2, email);
        statement.bindInt(3, id);
        statement.step();
        statement.reset();
        statement.finalize();
    }

    removeUser(id) {
        const query = `DELETE FROM users WHERE id = ?;`;
        const statement = this.db.prepare(query);
        statement.bindInt(1, id);
        statement.step();
        statement.reset();
        statement.finalize();
    }

    addOrEditSetting(userId, apikey, speechkey, location) {
        const query = `
            INSERT INTO settings (user_id, apikey, speechkey, location) 
            VALUES (?, ?, ?, ?) 
            ON CONFLICT(user_id) DO UPDATE SET
                apikey = excluded.apikey,
                speechkey = excluded.speechkey,
                location = excluded.location;
        `;
        const statement = this.db.prepare(query);
        statement.bindInt(1, userId);
        statement.bindText(2, apikey);
        statement.bindText(3, speechkey);
        statement.bindText(4, location);
        statement.step();
        statement.reset();
        statement.finalize();
    }

    removeSetting(userId) {
        const query = `DELETE FROM settings WHERE user_id = ?;`;
        const statement = this.db.prepare(query);
        statement.bindInt(1, userId);
        statement.step();
        statement.reset();
        statement.finalize();
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
dbManager.addUser('Hermann', 'hermann.h.hahn@gmail.com');
dbManager.addOrEditSetting(
    1,
    'api_key_example',
    'speech_key_example',
    'location_example',
);
dbManager.closeDatabase();
