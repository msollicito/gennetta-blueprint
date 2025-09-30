using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace GenNettaApi.Controllers
{
    [ApiController]
    [Route("api")]
    public class SchemaController : ControllerBase
    {
        [HttpPost("analyze-schema")]
        public async Task<IActionResult> AnalyzeSchema([FromBody] SchemaRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.ConnectionString))
                {
                    return BadRequest(new { success = false, error = "Connection string is required" });
                }

                var tables = new List<TableSchema>();

                using (var connection = new SqlConnection(request.ConnectionString))
                {
                    await connection.OpenAsync();

                    // Get all tables
                    var tablesQuery = @"
                        SELECT TABLE_NAME 
                        FROM INFORMATION_SCHEMA.TABLES 
                        WHERE TABLE_TYPE = 'BASE TABLE' 
                        AND TABLE_SCHEMA = 'dbo'
                        ORDER BY TABLE_NAME";

                    using (var tablesCommand = new SqlCommand(tablesQuery, connection))
                    using (var tablesReader = await tablesCommand.ExecuteReaderAsync())
                    {
                        var tableNames = new List<string>();
                        while (await tablesReader.ReadAsync())
                        {
                            tableNames.Add(tablesReader.GetString(0));
                        }

                        tablesReader.Close();

                        // For each table, get columns
                        foreach (var tableName in tableNames)
                        {
                            var columns = new List<ColumnSchema>();

                            var columnsQuery = @"
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
                                WHERE c.TABLE_NAME = @TableName
                                ORDER BY c.ORDINAL_POSITION";

                            using (var columnsCommand = new SqlCommand(columnsQuery, connection))
                            {
                                columnsCommand.Parameters.AddWithValue("@TableName", tableName);

                                using (var columnsReader = await columnsCommand.ExecuteReaderAsync())
                                {
                                    while (await columnsReader.ReadAsync())
                                    {
                                        columns.Add(new ColumnSchema
                                        {
                                            Name = columnsReader.GetString(0),
                                            Type = columnsReader.GetString(1),
                                            Nullable = columnsReader.GetString(2) == "YES",
                                            PrimaryKey = columnsReader.GetInt32(3) == 1
                                        });
                                    }
                                }
                            }

                            tables.Add(new TableSchema
                            {
                                Name = tableName,
                                Columns = columns
                            });
                        }
                    }
                }

                return Ok(new { success = true, tables = tables });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }
    }

    public class SchemaRequest
    {
        public string ConnectionString { get; set; } = string.Empty;
    }

    public class TableSchema
    {
        public string Name { get; set; } = string.Empty;
        public List<ColumnSchema> Columns { get; set; } = new List<ColumnSchema>();
    }

    public class ColumnSchema
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool Nullable { get; set; }
        public bool PrimaryKey { get; set; }
    }
}
