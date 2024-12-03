// import Sqlite
import Gio from 'gi://Gio';

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
            // create "history" if not exists
            const createHistoryTableQuery = `
                CREATE TABLE IF NOT EXISTS history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user TEXT NOT NULL,
                    model TEXT NOT NULL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(id) ON CONFLICT REPLACE
                );
            `;

            // create "functions" if not exists
            const createFunctions = `
                CREATE TABLE IF NOT EXISTS functions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    desc TEXT NOT NULL,
                    UNIQUE(id) ON CONFLICT REPLACE
                );
            `;

            // create "params" if not exists
            const createParams = `
                CREATE TABLE IF NOT EXISTS params (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    fid INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    desc TEXT NOT NULL,
                    UNIQUE(id) ON CONFLICT REPLACE,
                    FOREIGN KEY (fid) REFERENCES functions(id) ON DELETE CASCADE
                );
            `;

            // Initialize database
            await this.executeSql(createHistoryTableQuery);
            await this.executeSql(createFunctions);
            await this.executeSql(createParams);
        } catch (error) {
            console.error('Error initializing database:', error);
        }
    }

    async addFunction(name, desc) {
        try {
            const insertQuery = `
            INSERT INTO functions (name, desc)
            VALUES ('${name}', '${desc}');
            `;
            await this.executeSql(insertQuery);
        } catch (error) {
            console.error('Error adding function:', error);
        }
    }

    async addParam(fid, name, type, desc) {
        try {
            const insertQuery = `
            INSERT INTO params (fid, name, type, desc)
            VALUES ('${fid}', '${name}', '${type}', '${desc}');
            `;
            await this.executeSql(insertQuery);
        } catch (error) {
            console.error('Error adding param:', error);
        }
    }

    async removeFunction(id) {
        try {
            const deleteQuery = `DELETE FROM functions WHERE id = ${id}`;
            await this.executeSql(deleteQuery);
        } catch (error) {
            console.error('Error removing function:', error);
        }
    }

    async removeParam(fid) {
        try {
            const deleteQuery = `DELETE FROM params WHERE fid = ${fid}`;
            await this.executeSql(deleteQuery);
        } catch (error) {
            console.error('Error removing param:', error);
        }
    }

    /**
     * @description return functions and their parameters
     */
    getFunctions() {
        try {
            const functionsQuery = `SELECT id, name, desc FROM functions`;
            const paramsQuery = `SELECT fid, name, type, desc FROM params`;

            const functionsResult = this.executeSql(functionsQuery);
            const paramsResult = this.executeSql(paramsQuery);

            if (!functionsResult || !paramsResult) {
                return [];
            }

            const functions = functionsResult
                .split('\n')
                .map((line) => {
                    const [id, name, desc] = line.split('|');
                    return {id, name, desc};
                })
                .filter(Boolean);

            const params = paramsResult
                .split('\n')
                .map((line) => {
                    const [fid, name, type, desc] = line.split('|');
                    return {fid, name, type, desc};
                })
                .filter(Boolean);

            const functionsWithParams = functions.map((func) => ({
                ...func,
                params: params.filter((param) => param.fid === func.id),
            }));

            return functionsWithParams;
        } catch (error) {
            console.error('Error getting functions:', error);
            return [];
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
