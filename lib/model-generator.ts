import { Table, Relationship } from '../store/useSchemaStore';

const toPascalCase = (str: string) => {
  return str.replace(/(^\w|_\w)/g, (m) => m.replace('_', '').toUpperCase());
};

const toCamelCase = (str: string) => {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
};

const singularize = (str: string) => {
  if (str.endsWith('ies')) return str.slice(0, -3) + 'y';
  if (str.endsWith('s')) return str.slice(0, -1);
  return str;
};

export const generateModel = (table: Table, relationships: Relationship[], allTables: Table[]): string => {
  const className = toPascalCase(singularize(table.name));
  const fillable = table.columns.map((c) => `'${c.name}'`).join(',\n        ');
  
  const casts = table.columns
    .filter((c) => ['json', 'boolean', 'date', 'dateTime', 'float', 'integer'].includes(c.type))
    .map((c) => {
      let castType = 'string';
      if (c.type === 'json') castType = 'array';
      if (c.type === 'boolean') castType = 'boolean';
      if (c.type === 'integer') castType = 'integer';
      if (c.type === 'float') castType = 'float';
      if (c.type === 'date') castType = 'date';
      if (c.type === 'dateTime') castType = 'datetime';
      return `'${c.name}' => '${castType}'`;
    })
    .join(',\n        ');

  // Generate Relationship Methods
  const relationshipMethods = relationships
    .map((rel) => {
      // Case 1: This table HAS the foreign key (BelongsTo)
      if (rel.sourceTableId === table.id) {
        const targetTable = allTables.find((t) => t.id === rel.targetTableId);
        if (!targetTable) return '';
        
        const methodName = toCamelCase(singularize(targetTable.name));
        const targetClass = toPascalCase(singularize(targetTable.name));
        
        return `    public function ${methodName}()
    {
        return $this->belongsTo(${targetClass}::class);
    }`;
      }
      
      // Case 2: This table is TARGETED by a foreign key (HasOne / HasMany)
      if (rel.targetTableId === table.id) {
        const sourceTable = allTables.find((t) => t.id === rel.sourceTableId);
        if (!sourceTable) return '';
        
        const sourceClass = toPascalCase(singularize(sourceTable.name));
        
        if (rel.type === '1:1') {
            const methodName = toCamelCase(singularize(sourceTable.name));
            return `    public function ${methodName}()
    {
        return $this->hasOne(${sourceClass}::class);
    }`;
        } else {
            // Default to HasMany for 1:N
            const methodName = toCamelCase(sourceTable.name); // Plural
            return `    public function ${methodName}()
    {
        return $this->hasMany(${sourceClass}::class);
    }`;
        }
      }
      return '';
    })
    .filter(Boolean)
    .join('\n\n');

  return `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;

class ${className} extends Model
{
    use HasFactory;

    protected $table = '${table.name}';

    protected $fillable = [
        ${fillable}
    ];

    protected $casts = [
        ${casts}
    ];

${relationshipMethods}
}
`;
};
