function Sidebar({
  activeView,
  pendingCount,
  completedCount,
  workspaces,
  activeWorkspaceId,
  isOpen,
  onClose,
  onViewChange,
  onWorkspaceOpen,
  onSettingsClick,
}) {
  const totalCount = pendingCount + completedCount;
  const completedPercent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <aside className={isOpen ? "sidebar open" : "sidebar"}>
      <div className="sidebar-brand">
        <span className="sidebar-mark">T</span>
        <div>
          <strong>TaskBoard</strong>
          <span>Daily tasks</span>
        </div>
        <button
          aria-label="Close menu"
          className="sidebar-close"
          onClick={onClose}
          type="button"
        >
          x
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Task views">
        <button
          className={activeView === "pending" ? "sidebar-link active" : "sidebar-link"}
          onClick={() => {
            onViewChange("pending");
            onClose();
          }}
          type="button"
        >
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </button>

        <button
          className={activeView === "completed" ? "sidebar-link active" : "sidebar-link"}
          onClick={() => {
            onViewChange("completed");
            onClose();
          }}
          type="button"
        >
          <span>Completed</span>
          <strong>{completedCount}</strong>
        </button>
      </nav>

      <div className="sidebar-mobile-section">
        <span className="sidebar-section-title">Workspaces</span>
        <div className="sidebar-workspace-list">
          {workspaces.map((workspace) => (
            <button
              className={
                workspace.id === activeWorkspaceId
                  ? "sidebar-workspace-link active"
                  : "sidebar-workspace-link"
              }
              key={workspace.id}
              onClick={() => {
                onWorkspaceOpen(workspace.id);
                onClose();
              }}
              type="button"
            >
              {workspace.name}
            </button>
          ))}
        </div>
      </div>

      <button
        className="sidebar-settings-link"
        onClick={() => {
          onSettingsClick();
          onClose();
        }}
        type="button"
      >
        Settings
      </button>

      <div className="sidebar-summary">
        <span>Progress</span>
        <strong>{completedPercent}%</strong>
        <div className="progress-track">
          <div style={{ width: `${completedPercent}%` }} />
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
