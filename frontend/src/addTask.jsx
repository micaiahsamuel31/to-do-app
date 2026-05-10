import { useState } from "react";
import Navbar from "./navbar";
import "./addTask.css";


function ToDoList(){

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("")

  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

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
      };

      setTasks(t=>[...t, task]);
      setNewTask("");
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

  return(
  <div className="to-do-list">
    <Navbar
      pendingCount={pendingTasks.length}
      completedCount={completedTasks.length}
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

    <section className="task-section">
      <h2>Pending</h2>
      {pendingTasks.length === 0 ? (
        <p className="empty">No pending tasks found</p>
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
      )}
    </section>

  </div>)
}
export default ToDoList
