import { useEffect, useRef, useState } from "react";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import Settings from "./settings";
import "./addTask.css";


function ToDoList(){

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("")
  const [activeView, setActiveView] = useState("pending");
  const [timetableItems, setTimetableItems] = useState([]);
  const [newTimetableTime, setNewTimetableTime] = useState("");
  const [newTimetableTitle, setNewTimetableTitle] = useState("");
  const [activeTimetableDay, setActiveTimetableDay] = useState("mon");
  const [currentPage, setCurrentPage] = useState("workspaces");
  const [previousPage, setPreviousPage] = useState("workspaces");
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("taskboard-theme");

    return savedTheme === "light" ? "light" : "dark";
  });
  const [workspaces, setWorkspaces] = useState([
    { id: "home", name: "Home" },
    { id: "work", name: "Work" },
  ]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("home");
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [editingWorkspaceId, setEditingWorkspaceId] = useState(null);
  const [editingWorkspaceName, setEditingWorkspaceName] = useState("");
  const [openWorkspaceMenuId, setOpenWorkspaceMenuId] = useState(null);
  const workspaceInputRef = useRef(null);
  const timetableDays = [
    { id: "sun", label: "S" },
    { id: "mon", label: "M" },
    { id: "tue", label: "T" },
    { id: "wed", label: "W" },
    { id: "thu", label: "T" },
    { id: "fri", label: "F" },
    { id: "sat", label: "S" },
  ];

  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId);
  const workspaceTasks = tasks.filter((task) => task.workspaceId === activeWorkspaceId);
  const pendingTasks = workspaceTasks.filter((task) => !task.completed);
  const completedTasks = workspaceTasks.filter((task) => task.completed);
  const workspaceTimetable = timetableItems
    .filter((item) => item.workspaceId === activeWorkspaceId && item.day === activeTimetableDay)
    .sort((a, b) => a.time.localeCompare(b.time));
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
    localStorage.setItem("taskboard-theme", theme);
  }, [theme]);

  function getWorkspaceProgress(workspaceId){
    const workspaceTaskList = tasks.filter((task) => task.workspaceId === workspaceId);
    const completedTaskList = workspaceTaskList.filter((task) => task.completed);
    const total = workspaceTaskList.length;
    const completed = completedTaskList.length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { total, completed, percent };
  }

  function handleInputChange(event){
    setNewTask(event.target.value);
  }
   
  function handleKeyDown(event){
    
    
    if(event.key==="Enter"){
      addTask();
    }
  }

  function addTask(){
    if (newTask.trim()!==""){
      const task = {
        id: Date.now(),
        title: newTask.trim(),
        completed: false,
        workspaceId: activeWorkspaceId,
      };

      setTasks(t=>[...t, task]);
      setNewTask("");
      setActiveView("pending");
    }
   
  }

  function removeTask(id){
    setTasks(tasks.filter((task) => task.id !== id));
  }

  function moveToCompleted(id){
    setTasks(tasks.map((task) =>
      task.id === id ? { ...task, completed: true } : task
    ));
  }

  function moveToPending(id){
    setTasks(tasks.map((task) =>
      task.id === id ? { ...task, completed: false } : task
    ));
  }

  function addTimetableItem(){
    if (newTimetableTitle.trim() === "") return;

    const timetableItem = {
      id: Date.now(),
        title: newTimetableTitle.trim(),
        time: newTimetableTime,
        day: activeTimetableDay,
        workspaceId: activeWorkspaceId,
      };

    setTimetableItems([...timetableItems, timetableItem]);
    setNewTimetableTitle("");
    setNewTimetableTime("");
  }

  function handleTimetableKeyDown(event){
    if(event.key==="Enter"){
      addTimetableItem();
    }
  }

  function removeTimetableItem(id){
    setTimetableItems(timetableItems.filter((item) => item.id !== id));
  }

  function formatTimetableTime(time){
    if (time === "") return "Anytime";

    const [hourValue, minute] = time.split(":");
    const hour = Number(hourValue);
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const period = hour >= 12 ? "PM" : "AM";

    return `${displayHour}:${minute} ${period}`;
  }

  function addWorkspace(){
    const workspaceName = newWorkspaceName.trim();

    if (workspaceName === "") return;

    const existingWorkspace = workspaces.find((workspace) =>
      workspace.name.toLowerCase() === workspaceName.toLowerCase()
    );

    if (existingWorkspace) {
      setActiveWorkspaceId(existingWorkspace.id);
      setActiveView("pending");
      setCurrentPage("workspace");
      setNewWorkspaceName("");
      return;
    }

    const workspace = {
      id: Date.now().toString(),
      name: workspaceName,
    };

    setWorkspaces([...workspaces, workspace]);
    setActiveWorkspaceId(workspace.id);
    setActiveView("pending");
    setCurrentPage("workspace");
    setNewWorkspaceName("");
  }

  function handleWorkspaceKeyDown(event){
    if(event.key==="Enter"){
      addWorkspace();
    }
  }

  function changeWorkspace(workspaceId){
    setActiveWorkspaceId(workspaceId);
    setActiveView("pending");
  }

  function openWorkspace(workspaceId){
    changeWorkspace(workspaceId);
    setCurrentPage("workspace");
  }

  function handleWorkspaceCardKeyDown(event, workspaceId){
    if (event.target !== event.currentTarget) return;

    if(event.key==="Enter" || event.key===" "){
      event.preventDefault();
      openWorkspace(workspaceId);
    }
  }

  function focusWorkspaceInput(){
    setCurrentPage("workspaces");
    setTimeout(() => workspaceInputRef.current?.focus(), 0);
  }

  function openSettings(){
    setPreviousPage(currentPage);
    setCurrentPage("settings");
  }

  function closeSettings(){
    setCurrentPage(previousPage);
  }

  function toggleTheme(){
    setTheme((currentTheme) => currentTheme === "dark" ? "light" : "dark");
  }

  function changeTaskView(view){
    setActiveView(view);
    setCurrentPage("workspace");
  }

  function startWorkspaceRename(workspace){
    setEditingWorkspaceId(workspace.id);
    setEditingWorkspaceName(workspace.name);
    setOpenWorkspaceMenuId(null);
  }

  function cancelWorkspaceRename(){
    setEditingWorkspaceId(null);
    setEditingWorkspaceName("");
  }

  function saveWorkspaceRename(workspaceId){
    const workspaceName = editingWorkspaceName.trim();

    if (workspaceName === "") return;

    const duplicateWorkspace = workspaces.find((workspace) =>
      workspace.id !== workspaceId &&
      workspace.name.toLowerCase() === workspaceName.toLowerCase()
    );

    if (duplicateWorkspace) return;

    setWorkspaces(workspaces.map((workspace) =>
      workspace.id === workspaceId ? { ...workspace, name: workspaceName } : workspace
    ));
    cancelWorkspaceRename();
  }

  function handleWorkspaceRenameKeyDown(event, workspaceId){
    if(event.key==="Enter"){
      saveWorkspaceRename(workspaceId);
    }

    if(event.key==="Escape"){
      cancelWorkspaceRename();
    }
  }

  function toggleWorkspaceMenu(workspaceId){
    setOpenWorkspaceMenuId(openWorkspaceMenuId === workspaceId ? null : workspaceId);
  }

  function deleteWorkspace(workspaceId){
    if (workspaces.length <= 1) return;

    const remainingWorkspaces = workspaces.filter((workspace) => workspace.id !== workspaceId);

    setWorkspaces(remainingWorkspaces);
    setTasks(tasks.filter((task) => task.workspaceId !== workspaceId));
    setTimetableItems(timetableItems.filter((item) => item.workspaceId !== workspaceId));
    setOpenWorkspaceMenuId(null);

    if (editingWorkspaceId === workspaceId) {
      cancelWorkspaceRename();
    }

    if (activeWorkspaceId === workspaceId) {
      setActiveWorkspaceId(remainingWorkspaces[0].id);
      setActiveView("pending");
    }
  }

  return(
  <div className="app-shell">
    <Sidebar
      activeView={activeView}
      pendingCount={pendingTasks.length}
      completedCount={completedTasks.length}
      onViewChange={changeTaskView}
    />

    <main className="to-do-list">
      <Navbar
        workspaceName={
          currentPage === "settings"
            ? "Settings"
            : currentPage === "workspace"
              ? activeWorkspace?.name || "Workspace"
              : "All Workspaces"
        }
        onAddWorkspaceClick={focusWorkspaceInput}
        onSettingsClick={openSettings}
      />
    
  
      {currentPage === "settings" ? (
        <Settings
          onBack={closeSettings}
          onThemeToggle={toggleTheme}
          theme={theme}
          totalTasks={tasks.length}
          totalWorkspaces={workspaces.length}
        />
      ) : currentPage === "workspace" ? (
        <>
          <button
            className="back-button"
            onClick={() => setCurrentPage("workspaces")}
            type="button"
          >
            Back to Workspaces
          </button>

          <h1>{activeWorkspace?.name}</h1>
    
          <div>
            <input
                  type="text"
                  placeholder="Enter a task..."
                  value={newTask}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}/>
    
            <button className="add-button" onClick={addTask}>
              Add
            </button>
          </div>

          <section className="task-section">
            <h2>Your Tasks - {activeWorkspace?.name}</h2>
            {activeView === "pending" ? (
              pendingTasks.length === 0 ? (
                <p className="empty">No Tasks found</p>
              ) : (
                <ol>
                  {pendingTasks.map((task)=>
                    <li key={task.id}>
                      <span className="text">{task.title}</span>
                      <button className="delete-task" onClick={()=> removeTask(task.id)}>Delete</button>
                      <button className="completed-button" onClick={()=> moveToCompleted(task.id)}>Completed</button>
                    </li>
                  )}
                </ol>
              )
            ) : completedTasks.length === 0 ? (
              <p className="empty">No Tasks found</p>
            ) : (
              <ol>
                {completedTasks.map((task)=>
                  <li key={task.id} className="done">
                    <span className="text">{task.title}</span>
                    <button className="delete-task" onClick={()=> removeTask(task.id)}>Delete</button>
                    <button className="completed-button" onClick={()=> moveToPending(task.id)}>Pending</button>
                  </li>
                )}
              </ol>
            )}
          </section>

          <section className="timetable-section">
            <div className="timetable-header">
              <div>
                <h2>Timetable</h2>
                <p>You have {workspaceTimetable.length} items Today</p>
              </div>
              <button
                className="timetable-reset"
                onClick={() => setActiveTimetableDay("mon")}
                type="button"
              >
                Reset
              </button>
            </div>

            <div className="timetable-days">
              {timetableDays.map((day) => (
                <button
                  className={activeTimetableDay === day.id ? "active" : ""}
                  key={day.id}
                  onClick={() => setActiveTimetableDay(day.id)}
                  type="button"
                >
                  {day.label}
                </button>
              ))}
            </div>

            <div className="timetable-form">
              <input
                type="time"
                value={newTimetableTime}
                onChange={(event) => setNewTimetableTime(event.target.value)}
              />
              <input
                type="text"
                placeholder="Add timetable item..."
                value={newTimetableTitle}
                onChange={(event) => setNewTimetableTitle(event.target.value)}
                onKeyDown={handleTimetableKeyDown}
              />
              <button type="button" onClick={addTimetableItem}>
                Add
              </button>
            </div>

            {workspaceTimetable.length === 0 ? (
              <p className="empty">No timetable items found</p>
            ) : (
              <div className="timetable-list">
                {workspaceTimetable.map((item) => (
                  <div className="timetable-item" key={item.id}>
                    <div className="timetable-time">
                      <span className="timetable-dot" />
                      <time>{formatTimetableTime(item.time)}</time>
                    </div>
                    <div className="timetable-card">
                      <strong>{item.title}</strong>
                      <span>{activeWorkspace?.name} schedule</span>
                      <button type="button" onClick={() => removeTimetableItem(item.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <section className="workspace-section workspace-section-main">
        <h1>Workspaces</h1>
        <div className="sidebar-section-title">Workspaces</div>

        <div className="workspace-create-card">
          <div className="workspace-form">
            <input
              ref={workspaceInputRef}
              type="text"
              placeholder="Enter a new Workspace"
              value={newWorkspaceName}
              onChange={(event) => setNewWorkspaceName(event.target.value)}
              onKeyDown={handleWorkspaceKeyDown}
            />
            <button type="button" onClick={addWorkspace}>
              Add
            </button>
          </div>
        </div>

        <div className="workspace-list">
          {workspaces.map((workspace) => {
            const progress = getWorkspaceProgress(workspace.id);

            return editingWorkspaceId === workspace.id ? (
              <div className="workspace-rename-row" key={workspace.id}>
                <input
                  type="text"
                  value={editingWorkspaceName}
                  onChange={(event) => setEditingWorkspaceName(event.target.value)}
                  onKeyDown={(event) => handleWorkspaceRenameKeyDown(event, workspace.id)}
                  autoFocus
                />
                <button type="button" onClick={() => saveWorkspaceRename(workspace.id)}>
                  Save
                </button>
                <button type="button" onClick={cancelWorkspaceRename}>
                  Cancel
                </button>
              </div>
            ) : (
              <div
                className={
                  activeWorkspaceId === workspace.id
                    ? "workspace-row active"
                    : "workspace-row"
                }
                key={workspace.id}
                onClick={() => openWorkspace(workspace.id)}
                onKeyDown={(event) => handleWorkspaceCardKeyDown(event, workspace.id)}
                role="button"
                tabIndex={0}
              >
                <div className="workspace-card-header">
                  <div
                    className={
                      activeWorkspaceId === workspace.id
                        ? "workspace-button active"
                        : "workspace-button"
                    }
                  >
                    <span>{workspace.name}</span>
                  </div>
                  <div className="workspace-menu-wrap">
                    <button
                      aria-label={`Open ${workspace.name} workspace options`}
                      className="workspace-menu-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleWorkspaceMenu(workspace.id);
                      }}
                      type="button"
                    >
                      ...
                    </button>

                    {openWorkspaceMenuId === workspace.id && (
                      <div className="workspace-menu" onClick={(event) => event.stopPropagation()}>
                        <button type="button" onClick={() => startWorkspaceRename(workspace)}>
                          Rename
                        </button>
                        <button type="button" onClick={() => deleteWorkspace(workspace.id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="workspace-progress">
                  <div className="workspace-progress-meta">
                    <span>{progress.completed} of {progress.total} completed</span>
                    <strong>{progress.percent}%</strong>
                  </div>
                  <div className="workspace-progress-track">
                    <div style={{ width: `${progress.percent}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      )}

      

    </main>
  </div>)
}
export default ToDoList
