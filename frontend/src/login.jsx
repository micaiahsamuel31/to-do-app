import { useEffect, useState } from "react";
import { apiRequest } from "./api";
import "./addTask.css";

function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isRegisterMode = mode === "register";

  useEffect(() => {
    const savedTheme = localStorage.getItem("taskboard-theme") || "dark";

    document.documentElement.dataset.theme = savedTheme;
    document.body.dataset.theme = savedTheme;
  }, []);

  function changeMode(nextMode) {
    setMode(nextMode);
    setMessage("");
    setMessageType("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    const endpoint = isRegisterMode ? "/auth/register" : "/auth/login-json";

    try {
      setIsLoading(true);

      const data = await apiRequest(endpoint, {
        method: "POST",
        body: {
          username: username.trim(),
          password,
        },
      });

      localStorage.setItem("todo-auth-token", data.access_token);
      localStorage.setItem("todo-password-length", password.length.toString());
      setMessage(isRegisterMode ? "Account created" : "Signed in");
      setMessageType("success");
      onLogin?.(data.access_token, password.length);
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="login-brand">
          <span className="login-mark">T</span>
          <div>
            <strong>TaskBoard</strong>
            <span>Workspace planner</span>
          </div>
        </div>

        <div className="login-copy">
          <h1>{isRegisterMode ? "Create account" : "Welcome back"}</h1>
          <p>{isRegisterMode ? "Start with your own board." : "Sign in to open your board."}</p>
        </div>

        <div className="login-tabs" role="tablist" aria-label="Authentication mode">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => changeMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => changeMode("register")}
            type="button"
          >
            Register
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span>Username</span>
            <input
              autoComplete="username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter username"
              required
              type="text"
              value={username}
            />
          </label>

          <label className="login-field">
            <span>Password</span>
            <input
              autoComplete={isRegisterMode ? "new-password" : "current-password"}
              minLength={isRegisterMode ? 6 : undefined}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              required
              type="password"
              value={password}
            />
          </label>

          {message && (
            <p className={`login-message ${messageType}`}>
              {message}
            </p>
          )}

          <button className="login-submit" disabled={isLoading} type="submit">
            {isLoading ? "Please wait" : isRegisterMode ? "Create Account" : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;
