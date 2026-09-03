import DropZone from "./ui/DropZone.tsx";
import Toolbar from "./ui/Toolbar.tsx";
import Viewer from "./viewer/Viewer.tsx";

export default function App() {
  return (
    <DropZone>
      <div className="app">
        <Toolbar />
        <main className="app__viewer">
          <Viewer />
        </main>
      </div>
    </DropZone>
  );
}
