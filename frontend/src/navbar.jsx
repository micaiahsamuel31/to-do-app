function Navbar({ workspaceName, onAddWorkspaceClick }) {
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
      </div>
    </nav>
  );
}

export default Navbar;
