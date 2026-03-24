import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ShirtEditor from "./pages/ShirtEditor";
import MeshEditor from "./pages/MeshEditor";
import Home from "./pages/Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/shirt",
    element: <ShirtEditor />,
  },
  {
    path: "/mesh",
    element: <MeshEditor/>,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;