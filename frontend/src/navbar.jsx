function Navbar({ pendingCount, completedCount }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-mark">T</span>
        <span>TaskBoard</span>
      </div>

      <div className="navbar-stats">
        <span>{pendingCount} Pending</span>
        <span>{completedCount} Completed</span>
      </div>
    </nav>
  );
}

export default Navbar;
