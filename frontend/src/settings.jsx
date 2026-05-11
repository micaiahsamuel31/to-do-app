function Settings({
  onBack,
  onLogout,
  onThemeToggle,
  passwordLength,
  theme,
  totalTasks,
  totalWorkspaces,
  user,
}) {
  const isDarkTheme = theme === "dark";
  const maskedPassword = passwordLength ? "*".repeat(passwordLength) : "Not available";

  return (
    <section className="settings-page">
      <button className="back-button" onClick={onBack} type="button">
        Back
      </button>

      <h1>Settings</h1>

      <section className="settings-profile">
        <div>
          <span>Profile</span>
          <h2>{user?.username || "No user found"}</h2>
        </div>

        <div className="profile-details">
          <div>
            <span>Email</span>
            <strong>{user?.username || "Not available"}</strong>
          </div>
          <div>
            <span>Password</span>
            <code>{maskedPassword}</code>
          </div>
        </div>

        <button className="logout-button" onClick={onLogout} type="button">
          Log Out
        </button>
      </section>

      <div className="settings-grid">
        <div className="settings-card">
          <span>Workspaces</span>
          <strong>{totalWorkspaces}</strong>
        </div>

        <div className="settings-card">
          <span>Total Tasks</span>
          <strong>{totalTasks}</strong>
        </div>

        <div className="settings-card">
          <div>
            <span>Switch Theme</span>
            <strong>{isDarkTheme ? "Dark" : "Light"}</strong>
          </div>
          <button
            aria-label={`Switch to ${isDarkTheme ? "light" : "dark"} theme`}
            aria-pressed={isDarkTheme}
            className={isDarkTheme ? "theme-switch active" : "theme-switch"}
            onClick={onThemeToggle}
            type="button"
          >
            <span />
          </button>
        </div>
      </div>
    </section>
  );
}

export default Settings;
