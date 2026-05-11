import { useState } from "react";
import ToDoList from "./addTask";
import Login from "./login";


function App() {
  const [authToken, setAuthToken] = useState(() =>
    localStorage.getItem("todo-auth-token")
  );
  const [passwordLength, setPasswordLength] = useState(() => {
    const savedLength = localStorage.getItem("todo-password-length");

    return savedLength ? Number(savedLength) : null;
  });

  function handleLogin(token, nextPasswordLength) {
    setAuthToken(token);
    setPasswordLength(nextPasswordLength);
  }

  function handleLogout() {
    localStorage.removeItem("todo-auth-token");
    localStorage.removeItem("todo-password-length");
    setAuthToken(null);
    setPasswordLength(null);
  }

  if (!authToken) {
    return <Login onLogin={handleLogin} />;
  }

  return (<>
            <ToDoList
              authToken={authToken}
              onLogout={handleLogout}
              passwordLength={passwordLength}
            />
          </>

  );
}




export default App;
