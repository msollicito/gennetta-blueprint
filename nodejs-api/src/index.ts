import express, { Request, Response } from 'express';
import cors from 'cors';
import sql from 'mssql';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

interface SchemaRequest {
  connectionString: string;
}

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
}

interface Table {
  name: string;
  columns: Column[];
}

app.post('/api/analyze-schema', async (req: Request, res: Response) => {
  try {
    const { connectionString } = req.body as SchemaRequest;

    if (!connectionString) {
      return res.status(400).json({
        success: false,
        error: 'Connection string is required'
      });
    }

    let pool: sql.ConnectionPool | null = null;

    try {
      // Connect to SQL Server
      pool = await sql.connect(connectionString);

      // Get all tables
      const tablesResult = await pool.request().query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        AND TABLE_SCHEMA = 'dbo'
        ORDER BY TABLE_NAME
      `);

      const tables: Table[] = [];

      // For each table, get columns
      for (const tableRow of tablesResult.recordset) {
        const tableName = tableRow.TABLE_NAME;

        const columnsResult = await pool.request()
          .input('tableName', sql.NVarChar, tableName)
          .query(`
            SELECT 
              c.COLUMN_NAME,
              c.DATA_TYPE,
              c.IS_NULLABLE,
              CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END as IS_PRIMARY_KEY
            FROM INFORMATION_SCHEMA.COLUMNS c
            LEFT JOIN (
              SELECT ku.TABLE_NAME, ku.COLUMN_NAME
              FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
              INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku
                ON tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
              WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
            ) pk ON c.TABLE_NAME = pk.TABLE_NAME AND c.COLUMN_NAME = pk.COLUMN_NAME
            WHERE c.TABLE_NAME = @tableName
            ORDER BY c.ORDINAL_POSITION
          `);

        const columns: Column[] = columnsResult.recordset.map(col => ({
          name: col.COLUMN_NAME,
          type: col.DATA_TYPE,
          nullable: col.IS_NULLABLE === 'YES',
          primaryKey: col.IS_PRIMARY_KEY === 1
        }));

        tables.push({
          name: tableName,
          columns
        });
      }

      return res.json({
        success: true,
        tables
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({
        success: false,
        error: dbError instanceof Error ? dbError.message : 'Database connection failed'
      });
    } finally {
      if (pool) {
        await pool.close();
      }
    }

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`GenNetta API running on port ${PORT}`);
});
