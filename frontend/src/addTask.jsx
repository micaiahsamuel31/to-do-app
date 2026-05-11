import { useRef, useState } from "react";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import "./addTask.css";


function ToDoList(){

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("")
  const [activeView, setActiveView] = useState("pending");
  const [workspaces, setWorkspaces] = useState([
    { id: "home", name: "Home" },
    { id: "work", name: "Work" },
  ]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("home");
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [editingWorkspaceId, setEditingWorkspaceId] = useState(null);
  const [editingWorkspaceName, setEditingWorkspaceName] = useState("");
  const workspaceInputRef = useRef(null);

  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId);
  const workspaceTasks = tasks.filter((task) => task.workspaceId === activeWorkspaceId);
  const pendingTasks = workspaceTasks.filter((task) => !task.completed);
  const completedTasks = workspaceTasks.filter((task) => task.completed);
  const workspaceCounts = workspaces.reduce((counts, workspace) => {
    counts[workspace.id] = tasks.filter((task) => task.workspaceId === workspace.id).length;
    return counts;
  }, {});

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

  function addWorkspace(){
    const workspaceName = newWorkspaceName.trim();

    if (workspaceName === "") return;

    const existingWorkspace = workspaces.find((workspace) =>
      workspace.name.toLowerCase() === workspaceName.toLowerCase()
    );

    if (existingWorkspace) {
      setActiveWorkspaceId(existingWorkspace.id);
      setActiveView("pending");
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

  function focusWorkspaceInput(){
    workspaceInputRef.current?.focus();
  }

  function startWorkspaceRename(workspace){
    setEditingWorkspaceId(workspace.id);
    setEditingWorkspaceName(workspace.name);
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

  return(
  <div className="app-shell">
    <Sidebar
      activeView={activeView}
      pendingCount={pendingTasks.length}
      completedCount={completedTasks.length}
      onViewChange={setActiveView}
    />

    <main className="to-do-list">
      <Navbar
        workspaceName={activeWorkspace?.name || "Workspace"}
        onAddWorkspaceClick={focusWorkspaceInput}
      />
    
  
      <h1>To-Do-List</h1>
  
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

      <section className="workspace-section workspace-section-main">
        <div className="sidebar-section-title">Workspaces</div>

        <div className="workspace-create-card">
          <div className="workspace-form">
            <input
              ref={workspaceInputRef}
              type="text"
              placeholder="College, groceries..."
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
          {workspaces.map((workspace) => (
            editingWorkspaceId === workspace.id ? (
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
              >
                <button
                  className={
                    activeWorkspaceId === workspace.id
                      ? "workspace-button active"
                      : "workspace-button"
                  }
                  onClick={() => changeWorkspace(workspace.id)}
                  type="button"
                >
                  <span>{workspace.name}</span>
                  <strong>{workspaceCounts[workspace.id] || 0}</strong>
                </button>
                <button
                  className="workspace-rename-button"
                  onClick={() => startWorkspaceRename(workspace)}
                  type="button"
                >
                  Rename
                </button>
              </div>
            )
          ))}
        </div>
      </section>

      <section className="task-section">
        <h2>{activeView === "pending" ? "Pending" : "Completed"} - {activeWorkspace?.name}</h2>
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

    </main>
  </div>)
}
export default ToDoList
