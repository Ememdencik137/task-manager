import React, { useState, useEffect } from 'react';
import './App.css';

// Адрес нашего backend API
const API_URL = 'http://localhost:5000/tasks';

function App() {
  // Состояния (state) — это данные, которые могут меняться
  const [tasks, setTasks] = useState([]);        // Список задач
  const [newTaskTitle, setNewTaskTitle] = useState(''); // Текст новой задачи
  const [loading, setLoading] = useState(false);  // Флаг загрузки
  const [error, setError] = useState(null);       // Ошибка, если есть

  // useEffect — это хук, который выполняется при загрузке страницы
  useEffect(() => {
    fetchTasks(); // Загружаем задачи сразу после открытия страницы
  }, []); // Пустой массив [] значит "выполнить только один раз"

  // --- Функции для работы с API ---
  
  // GET - получение всех задач
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Ошибка загрузки');
      const data = await response.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить задачи');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // POST - добавление новой задачи
  const addTask = async (e) => {
    e.preventDefault(); // Отменяем перезагрузку страницы при отправке формы
    if (!newTaskTitle.trim()) return; // Если поле пустое - ничего не делаем

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle }),
      });

      if (!response.ok) throw new Error('Ошибка добавления');
      
      const newTask = await response.json();
      setTasks([newTask, ...tasks]); // Добавляем новую задачу в начало списка
      setNewTaskTitle(''); // Очищаем поле ввода
    } catch (err) {
      setError('Не удалось добавить задачу');
      console.error(err);
    }
  };

  // PUT - изменение статуса задачи (выполнена/не выполнена)
  const toggleTask = async (id, completed) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });

      if (!response.ok) throw new Error('Ошибка обновления');
      
      const updatedTask = await response.json();
      // Обновляем задачу в списке
      setTasks(tasks.map(task => 
        task.id === id ? updatedTask : task
      ));
    } catch (err) {
      setError('Не удалось обновить задачу');
      console.error(err);
    }
  };

  // DELETE - удаление задачи
  const deleteTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Ошибка удаления');
      
      // Удаляем задачу из списка (оставляем только те, у которых id не совпадает)
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      setError('Не удалось удалить задачу');
      console.error(err);
    }
  };

  // --- Что отображаем на странице (JSX разметка) ---
  return (
    <div className="App">
      <h1>Менеджер задач</h1>
      
      {/* Показываем ошибку, если она есть */}
      {error && <div className="error">{error}</div>}
      
      {/* Форма добавления задачи */}
      <form onSubmit={addTask} className="task-form">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Введите новую задачу"
        />
        <button type="submit">Добавить</button>
      </form>

      {/* Список задач: показываем либо загрузку, либо список */}
      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <ul className="task-list">
          {tasks.map(task => (
            <li key={task.id} className={task.completed ? 'completed' : ''}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id, task.completed)}
              />
              <span>{task.title}</span>
              <button onClick={() => deleteTask(task.id)}>Удалить</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;