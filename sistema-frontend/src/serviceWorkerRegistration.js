export function register() {
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker
                .register("/service-worker.js")
                .then(() => {
                    console.log("Service Worker registrado com sucesso.");
                })
                .catch((error) => {
                    console.log("Erro ao registrar Service Worker:", error);
                });
        });
    }
}