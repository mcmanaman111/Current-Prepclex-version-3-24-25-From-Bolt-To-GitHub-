import fs from 'fs/promises';

async function generateSchema() {
  try {
    // Read the schema export JSON file
    const schemaData = JSON.parse(await fs.readFile('schema_export.json', 'utf8'));

    // Group items by category
    const groupedData = schemaData.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    // Generate markdown content
    let markdown = '# NCLEX Prep App Database Schema\n\n';
    
    // Add overview
    markdown += '## Overview\n';
    markdown += 'This document provides a comprehensive reference for the NCLEX Prep application database schema. ';
    markdown += 'It includes detailed information about tables, columns, functions, triggers, and security features.\n\n';

    // Add Functions section
    if (groupedData.Functions) {
      markdown += '## Functions\n\n';
      groupedData.Functions.forEach(func => {
        markdown += `### ${func.column_name}\n`;
        markdown += `**Return Type:** ${func.data_type}\n\n`;
        markdown += '**Implementation:**\n```sql\n' + func.column_description + '\n```\n\n';
      });
    }

    // Add Tables section
    const tableColumns = groupedData['Table Columns'] || [];
    const tables = [...new Set(tableColumns.map(col => col.table_name))];
    
    markdown += '## Tables\n\n';
    tables.forEach(tableName => {
      const columns = tableColumns.filter(col => col.table_name === tableName);
      
      markdown += `### ${tableName}\n`;
      markdown += '| Column Name | Data Type | Description |\n';
      markdown += '|------------|-----------|-------------|\n';
      
      columns.forEach(col => {
        const description = col.column_description || 'No description available';
        markdown += `| ${col.column_name} | ${col.data_type} | ${description} |\n`;
      });
      markdown += '\n';
    });

    // Add Triggers section
    if (groupedData.Triggers) {
      markdown += '## Triggers\n\n';
      const triggersByTable = groupedData.Triggers.reduce((acc, trigger) => {
        if (!acc[trigger.table_name]) {
          acc[trigger.table_name] = [];
        }
        acc[trigger.table_name].push(trigger);
        return acc;
      }, {});

      Object.entries(triggersByTable).forEach(([table, triggers]) => {
        markdown += `### ${table}\n`;
        triggers.forEach(trigger => {
          markdown += `#### ${trigger.column_name}\n`;
          if (trigger.column_description) {
            markdown += '```sql\n' + trigger.column_description + '\n```\n\n';
          }
        });
      });
    }

    // Write the markdown file
    await fs.writeFile('docs/db_schema.md', markdown);
    console.log('Schema documentation generated successfully!');
    
  } catch (error) {
    console.error('Error generating schema:', error);
    process.exit(1);
  }
}

generateSchema();