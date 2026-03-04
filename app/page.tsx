import SchemaCanvas from '../components/canvas/SchemaCanvas';
import TableEditor from '../components/sidebar/TableEditor';
import Toolbar from '../components/toolbar/Toolbar';

export default function Home() {
  return (
    <main className="flex flex-col h-screen">
      <Toolbar />
      <div className="flex flex-1">
        <div className="w-64 border-r border-zinc-700">
          <TableEditor />
        </div>
        <div className="flex-1">
          <SchemaCanvas />
        </div>
      </div>
    </main>
  );
}
