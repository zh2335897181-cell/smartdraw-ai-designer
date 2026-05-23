/**
 * SQL Parser — Parse CREATE TABLE statements to extract:
 * - Table name
 * - Columns (name, type, constraints)
 * - Primary keys
 * - Foreign keys / REFERENCES
 *
 * Supports MySQL, PostgreSQL, and SQLite dialects.
 */

export interface ParsedColumn {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  referencesTable?: string;
  referencesColumn?: string;
  isNullable: boolean;
  defaultValue?: string;
}

export interface ParsedTable {
  name: string;
  columns: ParsedColumn[];
  primaryKeys: string[];
  foreignKeys: {
    column: string;
    referencesTable: string;
    referencesColumn: string;
  }[];
}

/**
 * Parse a SQL string containing one or more CREATE TABLE statements.
 */
export function parseSQL(sql: string): ParsedTable[] {
  const tables: ParsedTable[] = [];

  // Extract CREATE TABLE blocks (handles multi-line, different bracket styles)
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"\[]?(\w+)[`"\]]?\s*\(([\s\S]*?)\)\s*;?/gi;
  let match;

  while ((match = tableRegex.exec(sql)) !== null) {
    const tableName = match[1];
    const body = match[2];
    const table: ParsedTable = {
      name: tableName,
      columns: [],
      primaryKeys: [],
      foreignKeys: [],
    };

    // Parse column definitions and constraints
    const lines = splitColumns(body);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Check for table-level PRIMARY KEY
      const pkMatch = trimmed.match(/^\s*PRIMARY\s+KEY\s*\(([^)]+)\)/i);
      if (pkMatch) {
        pkMatch[1].split(',').forEach((col) => {
          const c = col.trim().replace(/[`"\[\]]/g, '');
          table.primaryKeys.push(c);
          // Mark existing column
          const existing = table.columns.find((ec) => ec.name === c);
          if (existing) existing.isPrimaryKey = true;
        });
        continue;
      }

      // Check for table-level FOREIGN KEY
      const fkMatch = trimmed.match(/^\s*FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+[`"\[]?(\w+)[`"\]]?\s*\(([^)]+)\)/i);
      if (fkMatch) {
        table.foreignKeys.push({
          column: fkMatch[1].trim().replace(/[`"\[\]]/g, ''),
          referencesTable: fkMatch[2],
          referencesColumn: fkMatch[3].trim().replace(/[`"\[\]]/g, ''),
        });
        // Mark column
        const existing = table.columns.find((ec) => ec.name === fkMatch[1].trim());
        if (existing) {
          existing.isForeignKey = true;
          existing.referencesTable = fkMatch[2];
          existing.referencesColumn = fkMatch[3].trim();
        }
        continue;
      }

      // Check for UNIQUE, INDEX, CONSTRAINT (skip these)
      if (/^\s*(UNIQUE|INDEX|CONSTRAINT|CHECK)\s/i.test(trimmed)) {
        continue;
      }

      // Individual column definition
      const colDef = parseColumnDef(trimmed);
      if (colDef) {
        table.columns.push(colDef);
      }
    }

    tables.push(table);
  }

  return tables;
}

function splitColumns(body: string): string[] {
  const columns: string[] = [];
  let depth = 0;
  let current = '';

  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ',' && depth === 0) {
      columns.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) columns.push(current);
  return columns;
}

function parseColumnDef(def: string): ParsedColumn | null {
  // Pattern: column_name TYPE [(length)] [constraints...]
  const match = def.match(/^\s*[`"\[]?(\w+)[`"\]]?\s+(\w+(?:\s*\([^)]*\))?)\s*(.*)/i);
  if (!match) return null;

  const name = match[1];
  const type = match[2].toUpperCase();
  const rest = match[3].toUpperCase();

  const isPrimaryKey = /PRIMARY\s+KEY/i.test(rest);
  const isNullable = !/NOT\s+NULL/i.test(rest) && !isPrimaryKey;
  const isAutoIncrement = /AUTO_?INCREMENT/i.test(rest);

  // Inline REFERENCES
  const refMatch = rest.match(/REFERENCES\s+[`"\[]?(\w+)[`"\]]?\s*\(([^)]+)\)/i);
  const isForeignKey = !!refMatch;
  const referencesTable = refMatch ? refMatch[1] : undefined;
  const referencesColumn = refMatch ? refMatch[2] : undefined;

  // Default value
  const defaultMatch = rest.match(/DEFAULT\s+(\S+)/i);
  const defaultValue = defaultMatch ? defaultMatch[1].replace(/['"]/g, '') : undefined;

  return {
    name,
    type: type + (isAutoIncrement ? ' AUTO_INCREMENT' : ''),
    isPrimaryKey,
    isForeignKey,
    referencesTable,
    referencesColumn,
    isNullable,
    defaultValue,
  };
}

/**
 * Generate a summary string from parsed tables.
 */
export function formatTableSummary(table: ParsedTable): string {
  const lines: string[] = [`Table: ${table.name}`];
  for (const col of table.columns) {
    const badges: string[] = [];
    if (col.isPrimaryKey) badges.push('PK');
    if (col.isForeignKey) badges.push(`FK→${col.referencesTable}.${col.referencesColumn}`);
    if (!col.isNullable) badges.push('NOT NULL');
    lines.push(`  ${col.name} ${col.type} ${badges.length ? `[${badges.join(', ')}]` : ''}`);
  }
  return lines.join('\n');
}
