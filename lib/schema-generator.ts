import { Table, Relationship } from '../store/useSchemaStore';

export const generateMigration = (table: Table, relationships: Relationship[], allTables: Table[]): string => {
  const columns = table.columns.map((col) => {
    let line = `$table->${col.type}('${col.name}')`;
    if (col.nullable) {
      line += '->nullable()';
    }
    return `            ${line};`;
  }).join('\n');

  // Find relationships where this table is the SOURCE (i.e., has the foreign key)
  // In our visual model, drawing FROM Table A TO Table B usually means Table A has a FK to Table B.
  // Let's assume Source -> Target means Source has `target_id`.
  
  const foreignKeys = relationships
    .filter((rel) => rel.sourceTableId === table.id)
    .map((rel) => {
      const targetTable = allTables.find((t) => t.id === rel.targetTableId);
      const targetTableName = targetTable ? targetTable.name : 'unknown_table';
      // Assuming the source column IS the foreign key column. 
      // If the user connected "user_id" (source) to "id" (target), then:
      // $table->foreign('user_id')->references('id')->on('users');
      
      const sourceCol = table.columns.find(c => c.id === rel.sourceColumnId);
      const sourceColName = sourceCol ? sourceCol.name : 'unknown_col';
      
      // If the target column is 'id', we can use constrained() shortcut if naming follows convention,
      // but for safety, let's be explicit or use foreignId if type matches.
      
      return `            $table->foreign('${sourceColName}')->references('id')->on('${targetTableName}')->onDelete('cascade');`;
    })
    .join('\n');

  return `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('${table.name}', function (Blueprint $table) {
            $table->id();
${columns}
${foreignKeys}
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('${table.name}');
    }
};
`;
};
