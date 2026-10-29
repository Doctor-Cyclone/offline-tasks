import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
export function PwaStatus() {
  const online = useOnlineStatus();
  const [install, setInstall] = useState<InstallEvent | null>(null);
  const [error, setError] = useState("");
  const {
    offlineReady: [ready],
    needRefresh: [refresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError() {
      setError(
        "Офлайн-кеш недоступен. Повторите загрузку при подключении к сети.",
      );
    },
  });
  useEffect(() => {
    const capture = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallEvent);
    };
    const installed = () => setInstall(null);
    const check = () => {
      if (navigator.onLine)
        void navigator.serviceWorker
          ?.getRegistration()
          .then((r) => r?.update())
          .catch(() => {});
    };
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", installed);
    window.addEventListener("focus", check);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", installed);
      window.removeEventListener("focus", check);
    };
  }, []);
  async function requestInstall() {
    if (!install) return;
    try {
      await install.prompt();
      await install.userChoice;
    } catch {
      setError("Не удалось открыть установку. Попробуйте меню браузера.");
    }
    setInstall(null);
  }
  return (
    <>
      <div className="status-bar">
        <span role="status">
          <i className={`status-dot ${online ? "" : "offline"}`} />
          {online ? "Online" : "Offline"}
        </span>
        <span>
          {ready || Boolean(navigator.serviceWorker?.controller)
            ? "Готово к работе без сети"
            : "Офлайн-режим будет доступен после кеширования"}
        </span>
        {install && (
          <button className="install" onClick={() => void requestInstall()}>
            Установить приложение ↗
          </button>
        )}
      </div>
      {!online && (
        <p className="notice" role="status">
          Вы офлайн. Задачи доступны и сохраняются на этом устройстве.
        </p>
      )}
      {refresh && (
        <p className="notice" role="status">
          Доступна новая версия приложения.
          <button
            onClick={() =>
              void updateServiceWorker(true).catch(() =>
                setError("Не удалось обновить приложение. Попробуйте снова."),
              )
            }
          >
            Обновить
          </button>
        </p>
      )}
      {error && (
        <p role="alert" className="notice warning">
          {error}
        </p>
      )}
    </>
  );
}
