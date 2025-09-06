import React, { useEffect, useState } from "react";
import type { TTodoItem, TTodoList } from "../types/index";
import { api } from "../API/api";
import "./TodoList.css";
import 'bootstrap/dist/css/bootstrap.min.css';

const userId = 100; // example userId

type Messagetype = "Success" | "Error";

const TodoList: React.FC = () => {
  const [todosList, setTodosList] = useState<TTodoItem[]>([]);
  const [newtodo, setNewtodo] = useState("");
  
  const [message, setMessage] = useState<string | null>(null);
  const [messagetype, setMessagetype] = useState<Messagetype | null>(null);

  const [loading, setLoading] = useState(false);
  
  
  useEffect(() => {
    fetchtodos();
  }, []);

  //Show feedback message
  const ShowMessage = (message: string, type: Messagetype = "Success") =>{
    setMessage(message);
    setMessagetype(type);
    setTimeout(()=>{
      setMessage(null);
    },5000);
  }

  // Fetch todo items from API
  const fetchtodos = async () =>{
    setLoading(true);
    try{
      const res = await api.get<{todos: TTodoList}> ("/todos");
      setTodosList(res.data.todos);
    
    }catch(error){
      console.error("Error fetching todos:", error);
      ShowMessage("It failed to fetch todos. Please try again.", "Error");
    }finally{
      setLoading(false);
    }
   
    
    }

    //Add new todo item
    const addtodo = async () =>{
      if (!newtodo.trim()){
        ShowMessage("Todo item cannot be empty.", "Error");
        return; // prevent adding empty todos
      }
      setLoading(true);
      try{
        const res = await api.post<TTodoItem> ("/todos/add",{
          todo:newtodo.trim(),
          completed: false,
          userId,
        });
        console.log(res.data);
        setTodosList([...todosList, res.data]);
        setNewtodo("");
        ShowMessage("Todo item is added successfully.");
      } catch (error){
        console.error("Error adding todo item:", error);
        ShowMessage("It failed to add todo item. Please try again.", "Error");
      
      
      }finally{
        setLoading(false);
      };
    }

    //Delete todo item
      const deletetodo = async (id: number)=>{
      setLoading(true);
        
        try{
          await api.delete(`/todos/${id}`);
          setTodosList(todosList.filter((todo)=> todo.id !== id))
          ShowMessage("Todo item is deleted successfully.");
        }catch(error){
          console.error("Error deleting todo:", error);
          ShowMessage("It failed to delete todo item. Please try again.","Error");
        
      }finally{
        setLoading(false);
      };
    }

    // Toggle complete status
      const completeTodo = async (todo: TTodoItem) =>{
        setLoading(true);
        
        try{
          const res = await api.put<TTodoItem>(`/todos/${todo.id}`,{
            
            completed: !todo.completed,
          });
          setTodosList(todosList.map((Todo)=> (Todo.id === todo.id ? res.data : Todo)));
          ShowMessage(!todo.completed ? "Todo item is completed!": "Todo item is marked as incomplete.");
        }catch(error){
          console.error("Error updating item todo:", error);
          ShowMessage("It failed to update todo item. Please try again.", "Error");
        }finally{
          setLoading(false);
        }
        
      };

      return(
        <div className="container mt-5">
          <h1 className="text-center text-primary mb-4">Todo List</h1>

          {/* feedback message */}
          {message && (
            <p style={{
              color: messagetype === "Success" ? "green" : "red",
              background: "lightgrey",
              fontSize: "20px",
              borderStyle: "solid",
              borderRadius: "5px",
              padding: "10px",
              marginBottom: "10px"
            }}>
              {message}
            </p>
          )}
          
        
          {/*Loading indicator */}
          {loading && 
          <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
          </div>}
          {/* todo list */}
          <ul className="p-0 m-0">
            {todosList.map((t,index)=>(
              <li key={`{t.id}-${index}`} className="todo-item">
                <input type="checkbox"
                className="form-check-input todo-checkbox me-3"
                checked={t.completed}
                onChange={()=> completeTodo(t)}  disabled={loading}/>
                 <div className="todo-text" style={{ textDecoration: t.  completed ? "line-through" : "" }}>
                  {t.todo}
                 </div>
                 <button className="btn btn-danger btn-sm"
                 onClick={() => deletetodo(t.id)}  disabled={loading}>
                  Delete
                 </button>

              </li>
            ))}
          </ul>

            {/* Input field and add todo section */}
            <div className="card shadow p-3">
                <div className="input-group mb-3">
                  <input className="form-control" type="text" value={newtodo} onChange={(event) =>setNewtodo(event.target.value)} placeholder="Type here to add..." disabled={loading}/>

                  <button className ="btn btn-success" onClick = {addtodo}  disabled={loading}>Add</button>
              
                </div>
            </div>

        </div>

        
      )
}
export default TodoList;