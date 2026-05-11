import { useEffect, useRef, useState } from "react";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import Settings from "./settings";
import { apiRequest } from "./api";
import "./addTask.css";


function mapTask(task){
  return {
    id: task.id,
    title: task.title,
    completed: task.completed,
    timeLeftMinutes: task.time_left_minutes,
    workspaceId: task.workspace_id,
  };
}

function mapTimetableItem(item){
  return {
    id: item.id,
    title: item.title,
    time: item.time || "",
    day: item.day,
    workspaceId: item.workspace_id,
  };
}


function ToDoList({ authToken, onLogout, passwordLength }){

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("")
  const [activeView, setActiveView] = useState("pending");
  const [timetableItems, setTimetableItems] = useState([]);
  const [newTimetableTime, setNewTimetableTime] = useState("");
  const [newTimetableTitle, setNewTimetableTitle] = useState("");
  const [isTimetableFormOpen, setIsTimetableFormOpen] = useState(false);
  const [isTimedTaskFormOpen, setIsTimedTaskFormOpen] = useState(false);
  const [newTimedTaskTitle, setNewTimedTaskTitle] = useState("");
  const [newTimedTaskHours, setNewTimedTaskHours] = useState("");
  const [newTimedTaskMinutes, setNewTimedTaskMinutes] = useState("");
  const [activeTimetableDay, setActiveTimetableDay] = useState("mon");
  const [currentPage, setCurrentPage] = useState("workspaces");
  const [previousPage, setPreviousPage] = useState("workspaces");
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("taskboard-theme");

    return savedTheme === "light" ? "light" : "dark";
  });
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [editingWorkspaceId, setEditingWorkspaceId] = useState(null);
  const [editingWorkspaceName, setEditingWorkspaceName] = useState("");
  const [openWorkspaceMenuId, setOpenWorkspaceMenuId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [dataError, setDataError] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const workspaceInputRef = useRef(null);
  const timetableTitleRef = useRef(null);
  const timedTaskTitleRef = useRef(null);
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
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((currentTasks) =>
        currentTasks.map((task) => {
          if (
            task.completed ||
            task.timeLeftMinutes == null ||
            task.timeLeftMinutes <= 0
          ) {
            return task;
          }

          return {
            ...task,
            timeLeftMinutes: task.timeLeftMinutes - 1,
          };
        })
      );
    }, 60000); // every 1 minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let ignoreResponse = false;

    async function loadBoardData(){
      try {
        setIsLoadingData(true);
        setDataError("");

        const [userData, workspaceData, taskData, timetableData] = await Promise.all([
          apiRequest("/auth/me", {}, authToken),
          apiRequest("/workspaces", {}, authToken),
          apiRequest("/todos", {}, authToken),
          apiRequest("/timetable-items", {}, authToken),
        ]);

        if (ignoreResponse) return;

        setCurrentUser(userData);
        setWorkspaces(workspaceData);
        setTasks(taskData.map(mapTask));
        setTimetableItems(timetableData.map(mapTimetableItem));
        setActiveWorkspaceId((currentWorkspaceId) => {
          const currentWorkspaceExists = workspaceData.some((workspace) =>
            workspace.id === currentWorkspaceId
          );

          return currentWorkspaceExists ? currentWorkspaceId : workspaceData[0]?.id || null;
        });
      } catch (error) {
        if (!ignoreResponse) {
          setDataError(error.message);
        }
      } finally {
        if (!ignoreResponse) {
          setIsLoadingData(false);
        }
      }
    }

    if (authToken) {
      loadBoardData();
    }

    return () => {
      ignoreResponse = true;
    };
  }, [authToken]);

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

  async function addTask(){
    if (newTask.trim()!==""){
      if (activeWorkspaceId === null) return;

      try {
        setDataError("");
        const task = await apiRequest("/todos", {
          method: "POST",
          body: {
            title: newTask.trim(),
            completed: false,
            workspace_id: activeWorkspaceId,
          },
        }, authToken);

        setTasks(t=>[...t, mapTask(task)]);
        setNewTask("");
        setActiveView("pending");
      } catch (error) {
        setDataError(error.message);
      }
    }
   
  }

  async function addTimedTask(){
    const taskTitle = newTimedTaskTitle.trim();
    const hours = newTimedTaskHours === "" ? 0 : Number(newTimedTaskHours);
    const minutes = newTimedTaskMinutes === "" ? 0 : Number(newTimedTaskMinutes);
    const timeLeft = (hours * 60) + minutes;

    if (taskTitle === "") return;
    if (activeWorkspaceId === null) return;
    if (
      !Number.isInteger(hours) ||
      !Number.isInteger(minutes) ||
      hours < 0 ||
      minutes < 0 ||
      minutes > 59 ||
      timeLeft < 1
    ) {
      setDataError("Time left must be at least 1 minute");
      return;
    }

    try {
      setDataError("");
      const task = await apiRequest("/todos", {
        method: "POST",
        body: {
          title: taskTitle,
          completed: false,
          time_left_minutes: timeLeft,
          workspace_id: activeWorkspaceId,
        },
      }, authToken);

      setTasks(t=>[...t, mapTask(task)]);
      setNewTimedTaskTitle("");
      setNewTimedTaskHours("");
      setNewTimedTaskMinutes("");
      setIsTimedTaskFormOpen(false);
      setActiveView("pending");
    } catch (error) {
      setDataError(error.message);
    }
  }

  function openTimedTaskForm(){
    setIsTimedTaskFormOpen(true);
    setTimeout(() => timedTaskTitleRef.current?.focus(), 0);
  }

  function closeTimedTaskForm(){
    setIsTimedTaskFormOpen(false);
    setNewTimedTaskTitle("");
    setNewTimedTaskHours("");
    setNewTimedTaskMinutes("");
  }

  function handleTimedTaskKeyDown(event){
    if(event.key==="Enter"){
      addTimedTask();
    }
  }

  function handleTimedTaskDialogKeyDown(event){
    if(event.key==="Escape"){
      closeTimedTaskForm();
    }
  }

  async function removeTask(id){
    try {
      setDataError("");
      await apiRequest(`/todos/${id}`, { method: "DELETE" }, authToken);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      setDataError(error.message);
    }
  }

  async function moveToCompleted(id){
    try {
      setDataError("");
      const updatedTask = await apiRequest(`/todos/${id}`, {
        method: "PATCH",
        body: { completed: true },
      }, authToken);

      setTasks(tasks.map((task) =>
        task.id === id ? mapTask(updatedTask) : task
      ));
    } catch (error) {
      setDataError(error.message);
    }
  }

  async function moveToPending(id){
    try {
      setDataError("");
      const updatedTask = await apiRequest(`/todos/${id}`, {
        method: "PATCH",
        body: { completed: false },
      }, authToken);

      setTasks(tasks.map((task) =>
        task.id === id ? mapTask(updatedTask) : task
      ));
    } catch (error) {
      setDataError(error.message);
    }
  }

  async function addTimetableItem(){
    if (newTimetableTitle.trim() === "") return;
    if (activeWorkspaceId === null) return;

    try {
      setDataError("");
      const timetableItem = await apiRequest("/timetable-items", {
        method: "POST",
        body: {
          title: newTimetableTitle.trim(),
          time: newTimetableTime,
          day: activeTimetableDay,
          workspace_id: activeWorkspaceId,
        },
      }, authToken);

      setTimetableItems([...timetableItems, mapTimetableItem(timetableItem)]);
      setNewTimetableTitle("");
      setNewTimetableTime("");
      setIsTimetableFormOpen(false);
    } catch (error) {
      setDataError(error.message);
    }
  }

  function handleTimetableKeyDown(event){
    if(event.key==="Enter"){
      addTimetableItem();
    }
  }

  function openTimetableForm(){
    setIsTimetableFormOpen(true);
    setTimeout(() => timetableTitleRef.current?.focus(), 0);
  }

  function closeTimetableForm(){
    setIsTimetableFormOpen(false);
    setNewTimetableTitle("");
    setNewTimetableTime("");
  }

  function handleTimetableDialogKeyDown(event){
    if(event.key==="Escape"){
      closeTimetableForm();
    }
  }

  async function removeTimetableItem(id){
    try {
      setDataError("");
      await apiRequest(`/timetable-items/${id}`, { method: "DELETE" }, authToken);
      setTimetableItems(timetableItems.filter((item) => item.id !== id));
    } catch (error) {
      setDataError(error.message);
    }
  }

  function formatTimetableTime(time){
    if (time === "") return "Anytime";

    const [hourValue, minute] = time.split(":");
    const hour = Number(hourValue);
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const period = hour >= 12 ? "PM" : "AM";

    return `${displayHour}:${minute} ${period}`;
  }

  function formatTimeLeft(minutes){
    if (minutes == null) return "";

    if (minutes <= 0) return "Time's up";

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) return `${remainingMinutes}m left`;
    if (remainingMinutes === 0) return `${hours}h left`;

    return `${hours}h ${remainingMinutes}m left`;
  }

  async function addWorkspace(){
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

    try {
      setDataError("");
      const workspace = await apiRequest("/workspaces", {
        method: "POST",
        body: { name: workspaceName },
      }, authToken);

      setWorkspaces([...workspaces, workspace]);
      setActiveWorkspaceId(workspace.id);
      setActiveView("pending");
      setCurrentPage("workspace");
      setNewWorkspaceName("");
    } catch (error) {
      setDataError(error.message);
    }
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

  async function saveWorkspaceRename(workspaceId){
    const workspaceName = editingWorkspaceName.trim();

    if (workspaceName === "") return;

    const duplicateWorkspace = workspaces.find((workspace) =>
      workspace.id !== workspaceId &&
      workspace.name.toLowerCase() === workspaceName.toLowerCase()
    );

    if (duplicateWorkspace) return;

    try {
      setDataError("");
      const updatedWorkspace = await apiRequest(`/workspaces/${workspaceId}`, {
        method: "PATCH",
        body: { name: workspaceName },
      }, authToken);

      setWorkspaces(workspaces.map((workspace) =>
        workspace.id === workspaceId ? updatedWorkspace : workspace
      ));
      cancelWorkspaceRename();
    } catch (error) {
      setDataError(error.message);
    }
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

  async function deleteWorkspace(workspaceId){
    if (workspaces.length <= 1) return;

    try {
      setDataError("");
      await apiRequest(`/workspaces/${workspaceId}`, { method: "DELETE" }, authToken);

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
    } catch (error) {
      setDataError(error.message);
    }
  }

  function renderTimetableSection(isPopup = false){
    return (
      <section
        className={
          isPopup
            ? "timetable-section timetable-section-popup"
            : "timetable-section"
        }
        onClick={isPopup ? (event) => event.stopPropagation() : undefined}
      >
        <div className="timetable-header">
          <div>
            <h2>Timetable</h2>
            <p>You have {workspaceTimetable.length} items Today</p>
          </div>
          <div className="timetable-actions">
            <button
              className="timetable-reset"
              onClick={() => setActiveTimetableDay("mon")}
              type="button"
            >
              Reset
            </button>
            {isPopup && (
              <button
                aria-label="Close timetable"
                className="timetable-close"
                onClick={closeTimetableForm}
                type="button"
              >
                x
              </button>
            )}
          </div>
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
            ref={timetableTitleRef}
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
    );
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
      {dataError && <p className="empty">{dataError}</p>}
      {isLoadingData ? (
        <p className="empty">Loading your board...</p>
      ) : (
      <>
    
  
      {currentPage === "settings" ? (
        <Settings
          onBack={closeSettings}
          onThemeToggle={toggleTheme}
          onLogout={onLogout}
          passwordLength={passwordLength}
          user={currentUser}
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
                      <span className="task-copy">
                        <span className="text">{task.title}</span>
                        {task.timeLeftMinutes && (
                          <span className="time-left">
                            {formatTimeLeft(task.timeLeftMinutes)}
                          </span>
                        )}
                      </span>
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
                    <span className="task-copy">
                      <span className="text">{task.title}</span>
                      {task.timeLeftMinutes && (
                        <span className="time-left">
                          {formatTimeLeft(task.timeLeftMinutes)}
                        </span>
                      )}
                    </span>
                    <button className="delete-task" onClick={()=> removeTask(task.id)}>Delete</button>
                    <button className="completed-button" onClick={()=> moveToPending(task.id)}>Pending</button>
                  </li>
                )}
              </ol>
            )}
          </section>

          <div className="workspace-tool-actions">
            {workspaceTimetable.length === 0 && (
              <button
                className="timetable-open-button"
                onClick={openTimetableForm}
                type="button"
              >
                Add a Timetable
              </button>
            )}
            <button
              className="timed-task-open-button"
              onClick={openTimedTaskForm}
              type="button"
            >
              Add Timed Tasks
            </button>
          </div>

          {workspaceTimetable.length > 0 && renderTimetableSection()}

          {isTimetableFormOpen && (
            <div
              aria-modal="true"
              className="timetable-modal"
              onClick={closeTimetableForm}
              onKeyDown={handleTimetableDialogKeyDown}
              role="dialog"
            >
              {renderTimetableSection(true)}
            </div>
          )}

          {isTimedTaskFormOpen && (
            <div
              aria-modal="true"
              className="timed-task-modal"
              onClick={closeTimedTaskForm}
              onKeyDown={handleTimedTaskDialogKeyDown}
              role="dialog"
            >
              <section
                className="timed-task-panel"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="timed-task-header">
                  <div>
                    <h2>Add Timed Task</h2>
                    <p>{activeWorkspace?.name}</p>
                  </div>
                  <button
                    aria-label="Close timed task form"
                    className="timed-task-close"
                    onClick={closeTimedTaskForm}
                    type="button"
                  >
                    x
                  </button>
                </div>

                <div className="timed-task-form">
                  <input
                    ref={timedTaskTitleRef}
                    type="text"
                    placeholder="Task name..."
                    value={newTimedTaskTitle}
                    onChange={(event) => setNewTimedTaskTitle(event.target.value)}
                    onKeyDown={handleTimedTaskKeyDown}
                  />
                  <input
                    min="0"
                    type="number"
                    placeholder="Hours"
                    value={newTimedTaskHours}
                    onChange={(event) => setNewTimedTaskHours(event.target.value)}
                    onKeyDown={handleTimedTaskKeyDown}
                  />
                  <input
                    max="59"
                    min="0"
                    type="number"
                    placeholder="Minutes"
                    value={newTimedTaskMinutes}
                    onChange={(event) => setNewTimedTaskMinutes(event.target.value)}
                    onKeyDown={handleTimedTaskKeyDown}
                  />
                  <button type="button" onClick={addTimedTask}>
                    Add
                  </button>
                </div>
              </section>
            </div>
          )}
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

      
      </>
      )}

    </main>
  </div>)
}
export default ToDoList
