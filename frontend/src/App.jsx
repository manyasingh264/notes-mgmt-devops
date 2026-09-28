import { useState } from "react";

import Register from "./pages/register";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";

function App() {
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  if (loggedIn) {
    return <Dashboard />;
  }

  return (
    <div>
      <h1>Notes Management System</h1>

      <Register />

      <hr />

      <Login onLogin={() => setLoggedIn(true)} />

      <button
        onClick={() =>
          setLoggedIn(!!localStorage.getItem("token"))
        }
      >
        Refresh Login State
      </button>
    </div>
  );
}

export default App;