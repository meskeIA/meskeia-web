declare module 'sql.js' {
  interface QueryExecResult {
    columns: string[];
    values: unknown[][];
  }

  interface Statement {
    getColumnNames: () => string[];
    step: () => boolean;
    get: () => unknown[];
    free: () => boolean;
  }

  interface Database {
    run: (sql: string, params?: unknown[]) => void;
    prepare: (sql: string) => Statement;
    exec: (sql: string) => QueryExecResult[];
    close: () => void;
    getRowsModified: () => number;
  }

  interface SqlJsStatic {
    Database: new (data?: ArrayLike<number>) => Database;
  }

  export default function initSqlJs(config?: {
    locateFile?: (file: string) => string;
  }): Promise<SqlJsStatic>;
}
