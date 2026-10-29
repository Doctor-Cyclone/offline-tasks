import { useState } from 'react'
export interface Task { id: string; text: string; done: boolean }
const key = 'offline-tasks:v1'
function read(): { tasks: Task[]; error: string } {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return { tasks: [], error: '' }
    const data: unknown = JSON.parse(raw)
    if (!Array.isArray(data) || !data.every(t => t && typeof t.id === 'string' && typeof t.text === 'string' && typeof t.done === 'boolean')) throw new Error('Invalid tasks')
    return { tasks: data, error: '' }
  } catch { return { tasks: [], error: 'Не удалось прочитать задачи. Исходные данные не изменены; новые задачи заменят их при сохранении.' } }
}
export function useTasks() {
  const [initial] = useState(read)
  const [tasks, setTasks] = useState(initial.tasks)
  const [error, setError] = useState(initial.error)
  function save(next: Task[]) {
    try { localStorage.setItem(key, JSON.stringify(next)); setError('') }
    catch { setError('Не удалось сохранить данные. Задачи доступны в этой вкладке, но могут исчезнуть после перезагрузки.') }
    setTasks(next)
  }
  return { tasks, error,
    add: (text: string) => save([...tasks, { id: crypto.randomUUID(), text, done: false }]),
    toggle: (id: string) => save(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)),
    rename: (id: string, text: string) => save(tasks.map(t => t.id === id ? { ...t, text } : t)),
    remove: (id: string) => save(tasks.filter(t => t.id !== id)),
  }
}
