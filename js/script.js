const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const deadlineInput = document.getElementById('deadline-input');
const todoList = document.getElementById('todo-list');

// Request notification permission
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Function to show notification
function showNotification(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

// Load todos from local storage on page load
document.addEventListener('DOMContentLoaded', loadTodos);

todoForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const newTodo = todoInput.value;
  const timestamp = new Date().toLocaleString();
  const deadline = new Date(deadlineInput.value);

  if (newTodo === '') {
    alert('Please add a task!');
    return;
  }

  addTodoToList(newTodo, timestamp, deadline);
  saveTodoInLocalStorage(newTodo, timestamp, deadline);

  todoInput.value = '';
  deadlineInput.value = '';
});

function addTodoToList(task, timestamp, deadline) {
  const li = document.createElement('li');
  li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');

  li.innerHTML = `
    <div>
      <strong>${task}</strong> <br>
      <small class="text-muted">Added on: ${timestamp}</small> <br>
      <small class="text-warning">Deadline: <span class="deadline">${deadline.toLocaleString()}</span></small>
    </div>
    <button class="btn btn-success btn-sm finish-btn">Finish</button>
    <button class="btn btn-danger btn-sm delete-btn">Delete</button>
  `;

  const countdownSpan = document.createElement('span');
  countdownSpan.classList.add('text-danger');
  li.appendChild(countdownSpan);
  startCountdown(deadline, countdownSpan);

  li.querySelector('.delete-btn').addEventListener('click', function() {
    if (confirm(`Are you sure you want to delete the task "${task}"?`)) {
      li.remove();
      removeTodoFromLocalStorage(task, timestamp, deadline);
      showNotification("Task Deleted", `${task} has been deleted!`);
    }
  });

  li.querySelector('.finish-btn').addEventListener('click', function() {
    alert(`You have finished the task: "${task}"`);
    countdownSpan.textContent = 'Finished'; // Stop countdown display
    li.querySelector('.finish-btn').disabled = true; // Disable finish button
    li.querySelector('.delete-btn').disabled = true; // Disable delete button
    markTodoAsFinishedInLocalStorage(task, timestamp, deadline);
  });

  todoList.appendChild(li);
  showNotification("Task Added", `${task} has been added!`);
}

function startCountdown(deadline, countdownSpan) {
  const interval = setInterval(() => {
    const now = new Date();
    const timeRemaining = deadline - now;

    if (timeRemaining < 0) {
      clearInterval(interval);
      countdownSpan.textContent = 'Deadline Expired!';
      showNotification("Deadline Expired", "A task deadline has expired!");
    } else {
      const seconds = Math.floor((timeRemaining / 1000) % 60);
      const minutes = Math.floor((timeRemaining / 1000 / 60) % 60);
      const hours = Math.floor((timeRemaining / 1000 / 60 / 60) % 24);
      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      countdownSpan.textContent = `Countdown: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
  }, 1000);
}

function saveTodoInLocalStorage(task, timestamp, deadline) {
  let todos = getTodosFromLocalStorage();
  todos.push({ task, timestamp, deadline: deadline.toISOString(), finished: false });
  localStorage.setItem('todos', JSON.stringify(todos));
}

function getTodosFromLocalStorage() {
  let todos;
  if (localStorage.getItem('todos') === null) {
    todos = [];
  } else {
    todos = JSON.parse(localStorage.getItem('todos'));
  }
  return todos;
}

function removeTodoFromLocalStorage(task, timestamp, deadline) {
  let todos = getTodosFromLocalStorage();
  todos = todos.filter(todo => !(todo.task === task && todo.timestamp === timestamp && todo.deadline === deadline.toISOString()));
  localStorage.setItem('todos', JSON.stringify(todos));
}

function markTodoAsFinishedInLocalStorage(task, timestamp, deadline) {
  let todos = getTodosFromLocalStorage();
  todos.forEach(todo => {
    if (todo.task === task && todo.timestamp === timestamp && todo.deadline === deadline.toISOString()) {
      todo.finished = true;
    }
  });
  localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTodos() {
  let todos = getTodosFromLocalStorage();
  todos.forEach(todo => {
    if (!todo.finished) {
      addTodoToList(todo.task, todo.timestamp, new Date(todo.deadline));
    }
  });
}
