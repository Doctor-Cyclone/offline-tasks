import { useState } from "react";
import { useTasks } from "./hooks/useTasks";
import "./App.css";
import { PwaStatus } from "./components/PwaStatus";

export default function App() {
  const { tasks, error, add, toggle, remove, rename } = useTasks();
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all");
  const completed = tasks.filter((t) => t.done).length;
  const visible = tasks.filter(
    (t) => filter === "all" || (filter === "done" ? t.done : !t.done),
  );
  return (
    <main className="workspace">
      <header>
        <a className="brand" href="./">
          <span className="logo">✓</span> OFFLINE TASKS
        </a>
        <span className="edition">YOUR SPACE TO FOCUS</span>
      </header>
      <section className="intro">
        <p className="eyebrow">МЕНЬШЕ ШУМА. БОЛЬШЕ ДЕЛА.</p>
        <h1>
          Всё начинается
          <br />с одного дела<span>.</span>
        </h1>
        <p className="subtitle">
          Освободите голову. Запишите важное.
          <br />
          Ваши планы всегда с вами — даже без интернета.
        </p>
      </section>
      <PwaStatus />
      <section className="board" aria-label="Мои задачи">
        <div className="board-heading">
          <h2>
            Мои задачи <span>{tasks.length.toString().padStart(2, "0")}</span>
          </h2>
          <span className="local-label">↳ Только на этом устройстве</span>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim()) {
              add(text.trim());
              setText("");
            }
          }}
        >
          <label className="sr-only" htmlFor="task">
            Новая задача
          </label>
          <input
            id="task"
            maxLength={240}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Что нужно сделать?"
            autoComplete="off"
          />
          <button className="primary" disabled={!text.trim()}>
            Добавить ＋
          </button>
        </form>
        {error && (
          <p role="alert" className="notice warning">
            {error}
          </p>
        )}
        <nav aria-label="Фильтр задач" className="filters">
          {[
            ["all", "Все"],
            ["active", "Активные"],
            ["done", "Выполненные"],
          ].map(([v, l]) => (
            <button
              key={v}
              aria-pressed={filter === v}
              onClick={() => setFilter(v)}
            >
              {l}
            </button>
          ))}
        </nav>
        <ul className="tasks">
          {visible.map((t) => (
            <li key={t.id} className={t.done ? "done" : ""}>
              <input
                aria-label={`Выполнено: ${t.text}`}
                type="checkbox"
                checked={t.done}
                onChange={() => toggle(t.id)}
              />
              <span className="task-text">{t.text}</span>
              <button
                className="icon-button"
                aria-label={`Редактировать: ${t.text}`}
                onClick={() => {
                  const next = window.prompt("Изменить задачу", t.text);
                  if (next?.trim()) rename(t.id, next.trim().slice(0, 240));
                }}
              >
                ✎
              </button>
              <button
                className="icon-button"
                aria-label={`Удалить: ${t.text}`}
                onClick={() => remove(t.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        {!visible.length && (
          <div className="empty">
            <span aria-hidden="true">✓</span>
            <h3>
              {tasks.length ? "Здесь пока ничего" : "Место для ваших планов"}
            </h3>
            <p>
              {tasks.length
                ? "Выберите другой фильтр или добавьте задачу."
                : "Добавьте первое дело. Остальное — по порядку."}
            </p>
          </div>
        )}
        <footer className="board-footer" aria-live="polite">
          <span>
            {tasks.length - completed} активных / {completed} выполнено
          </span>
          <span>ШАГ ЗА ШАГОМ ↗</span>
        </footer>
      </section>
      <p className="footnote">
        Никаких аккаунтов. Никакой синхронизации. Просто ваши дела.
      </p>
    </main>
  );
}
