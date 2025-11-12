const storageKey = 'modernTodoItems';
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const counter = document.getElementById('todo-counter');
const itemTemplate = document.getElementById('todo-item-template');
const startInput = document.getElementById('start-time');
const endInput = document.getElementById('end-time');
const timeFeedback = document.getElementById('time-feedback');

let todos = loadTodos();
render();

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) {
        form.classList.add('shake');
        setTimeout(() => form.classList.remove('shake'), 300);
        return;
    }

    const startTime = startInput.value;
    const endTime = endInput.value;
    if (!isTimeRangeValid(startTime, endTime)) {
        showTimeFeedback('结束时间需晚于开始时间');
        return;
    }

    const newTodo = {
        id: createId(),
        text: value,
        completed: false,
        createdAt: Date.now(),
        timeRange: { start: startTime, end: endTime }
    };
    todos.unshift(newTodo);
    persist();
    render();
    form.reset();
    hideTimeFeedback();
    input.focus();
});

startInput.addEventListener('input', () => hideTimeFeedback());
endInput.addEventListener('input', () => hideTimeFeedback());

list.addEventListener('click', (event) => {
    const item = event.target.closest('.todo-item');
    if (!item) return;

    const id = item.dataset.id;
    if (event.target.closest('.delete-btn')) {
        todos = todos.filter((todo) => todo.id !== id);
        persist();
        render();
        return;
    }

    if (event.target.closest('.status-btn')) {
        todos = todos.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
        persist();
        render();
    }
});

function render() {
    list.innerHTML = '';
    if (!todos.length) {
        const empty = document.createElement('li');
        empty.className = 'todo-empty';
        empty.textContent = '暂无任务，开始创建吧！';
        list.appendChild(empty);
    } else {
        todos.forEach((todo) => {
            const clone = itemTemplate.content.firstElementChild.cloneNode(true);
            clone.dataset.id = todo.id;
            clone.querySelector('.todo-text').textContent = todo.text;
            const timeEl = clone.querySelector('.todo-time');
            if (timeEl) {
                timeEl.textContent = formatTimeRange(todo);
            }
            if (todo.completed) {
                clone.classList.add('completed');
            }
            list.appendChild(clone);
        });
    }
    counter.textContent = `${todos.length} 项`;
}

function loadTodos() {
    try {
        const raw = localStorage.getItem(storageKey);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        console.warn('无法读取本地存储，已重置。', error);
        return [];
    }
}

function persist() {
    localStorage.setItem(storageKey, JSON.stringify(todos));
}

function createId() {
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isTimeRangeValid(start, end) {
    if (start && end) {
        return end > start;
    }
    return true;
}

function showTimeFeedback(message) {
    if (!timeFeedback) return;
    timeFeedback.textContent = message;
    timeFeedback.hidden = !message;
}

function hideTimeFeedback() {
    showTimeFeedback('');
}

function formatTimeRange(todo) {
    const range = todo.timeRange || {};
    const start = range.start || '';
    const end = range.end || '';

    if (start && end) {
        return `${start} - ${end}`;
    }
    if (start) {
        return `${start} 开始`;
    }
    if (end) {
        return `截止 ${end}`;
    }
    return '全天';
}

