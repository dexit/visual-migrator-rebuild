import { Table } from '../store/useSchemaStore';

const toPascalCase = (str: string) => {
  return str.replace(/(^\w|_\w)/g, (m) => m.replace('_', '').toUpperCase());
};

export const generateIngestor = (table: Table): string => {
  const className = toPascalCase(table.name);
  
  return `<?php

namespace App\\Http\\Controllers;

use App\\Models\\${className};
use App\\Jobs\\Process${className}Data;
use Illuminate\\Http\\Request;

class ${className}IngestorController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            ${table.columns.map(c => `'${c.name}' => '${c.nullable ? 'nullable' : 'required'}|${c.type}'`).join(',\n            ')}
        ]);

        Process${className}Data::dispatch($data);

        return response()->json(['message' => '${className} data queued for processing'], 202);
    }
}
`;
};

export const generateJob = (table: Table): string => {
  const className = toPascalCase(table.name);
  
  return `<?php

namespace App\\Jobs;

use App\\Models\\${className};
use Illuminate\\Bus\\Queueable;
use Illuminate\\Contracts\\Queue\\ShouldQueue;
use Illuminate\\Foundation\\Bus\\Dispatchable;
use Illuminate\\Queue\\InteractsWithQueue;
use Illuminate\\Queue\\SerializesModels;

class Process${className}Data implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(protected array $data) {}

    public function handle(): void
    {
        ${className}::create($this->data);
    }
}
`;
};
