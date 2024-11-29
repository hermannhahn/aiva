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
                argv: ['sqlite3', '-separator', '|', this.dbPath, query],
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

    getHistory() {
        try {
            const query = 'SELECT user, model FROM history';
            const rawResult = this.executeSql(query);

            // Verifica se há resultado
            if (!rawResult || typeof rawResult !== 'string') {
                console.warn('No results from query:', query);
                return [];
            }

            // Processa o resultado bruto para transformá-lo em objetos
            const history = rawResult
                .split('\n') // Divide as linhas
                .map((line) => {
                    const [user, model] = line.split('|'); // Supondo que '|' é o delimitador
                    if (!user || !model) {
                        console.warn('Incomplete data row:', line);
                        return null; // Linha inválida
                    }
                    return {user, model};
                })
                .filter(Boolean); // Remove linhas inválidas

            // Retorna vazio se não houver histórico
            if (history.length === 0) {
                console.warn('No valid history entries found.');
                return [];
            }

            // Mapeia o histórico para o formato esperado
            return history.flatMap((row) => [
                {
                    role: 'user',
                    parts: [
                        {
                            text: row.user || '',
                        },
                    ],
                },
                {
                    role: 'model',
                    parts: [
                        {
                            text: row.model || '',
                        },
                    ],
                },
            ]);
        } catch (error) {
            console.error('Error getting history:', error);
            return [];
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
        } catch (error) {
            console.error('Error initializing database:', error);
        }
    }

    editHistoryLocation(location) {
        try {
            // Define o ID e a palavra a ser substituída
            const id = 1; // ID fixo para este caso
            const targetWord = 'Undefined'; // Palavra a ser substituída

            // Obtém o valor atual da coluna "user"
            const selectQuery = `SELECT user FROM history WHERE id = 1`;
            const currentValue = this.executeSql(selectQuery);

            // Verifica se foi retornado algum valor
            if (!currentValue) {
                throw new Error(`No user value found for ID ${id}`);
            }

            // Substitui a palavra no texto
            const updatedValue = currentValue.replace(targetWord, location);

            // Atualiza o valor no banco de dados
            const updateQuery = `UPDATE history SET user = '${updatedValue.replace(/'/g, "''")}' WHERE id = ${id}`;
            this.executeSql(updateQuery);

            this.app.log(`User value updated successfully for ID ${id}.`);
            return true;
        } catch (error) {
            this.app.log(`Error updating user value: ${error.message}`);
            return false;
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
