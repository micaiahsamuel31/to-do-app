function Settings({ onBack, onThemeToggle, theme, totalTasks, totalWorkspaces }) {
  const isDarkTheme = theme === "dark";

  return (
    <section className="settings-page">
      <button className="back-button" onClick={onBack} type="button">
        Back
      </button>

      <h1>Settings</h1>

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
