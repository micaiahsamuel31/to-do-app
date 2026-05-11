function Navbar({ workspaceName, onAddWorkspaceClick, onSettingsClick }) {
  return (
    <nav className="navbar">
      <div className="navbar-title">
        <span>Workspace</span>
        <strong>{workspaceName}</strong>
      </div>

      <div className="navbar-actions">
        <button type="button" onClick={onAddWorkspaceClick}>
          Add a Workspace
        </button>
        <button
          aria-label="Open settings"
          className="settings-icon-button"
          type="button"
          onClick={onSettingsClick}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
            <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.04.04a2.1 2.1 0 0 1-2.97 2.97l-.04-.04A1.8 1.8 0 0 0 14.8 19a1.8 1.8 0 0 0-1.8 1.8v.1a2.1 2.1 0 0 1-4.2 0v-.1A1.8 1.8 0 0 0 7 19a1.8 1.8 0 0 0-1.98.36l-.04.04a2.1 2.1 0 0 1-2.97-2.97l.04-.04A1.8 1.8 0 0 0 2.6 15a1.8 1.8 0 0 0-1.8-1.8h-.1a2.1 2.1 0 0 1 0-4.2h.1A1.8 1.8 0 0 0 2.6 7a1.8 1.8 0 0 0-.36-1.98l-.04-.04a2.1 2.1 0 0 1 2.97-2.97l.04.04A1.8 1.8 0 0 0 7 2.6a1.8 1.8 0 0 0 1.8-1.8v-.1a2.1 2.1 0 0 1 4.2 0v.1A1.8 1.8 0 0 0 14.8 2.6a1.8 1.8 0 0 0 1.98-.36l.04-.04a2.1 2.1 0 0 1 2.97 2.97l-.04.04A1.8 1.8 0 0 0 19.4 7a1.8 1.8 0 0 0 1.8 1.8h.1a2.1 2.1 0 0 1 0 4.2h-.1A1.8 1.8 0 0 0 19.4 15Z" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
