export function isDarkMode() {
    return localStorage.getItem("tema") === "dark";
}

export function getTheme() {
    const dark = isDarkMode();

    return {
        dark,

        pageTitle: {
            color: dark ? "#f9fafb" : "#111827"
        },

        pageSubtitle: {
            color: dark ? "#d1d5db" : "#4b5563"
        },

        panel: {
            background: dark ? "#1f2937" : "#fff",
            color: dark ? "#f9fafb" : "#111827",
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "25px",
            boxShadow: dark
                ? "0 4px 12px rgba(0,0,0,0.35)"
                : "0 4px 12px rgba(0,0,0,0.08)"
        },

        card: {
            background: dark ? "#1f2937" : "#fff",
            color: dark ? "#f9fafb" : "#111827",
            padding: "22px",
            borderRadius: "12px",
            boxShadow: dark
                ? "0 4px 12px rgba(0,0,0,0.35)"
                : "0 4px 12px rgba(0,0,0,0.08)"
        },

        input: {
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "8px",
            border: dark ? "1px solid #4b5563" : "1px solid #ccc",
            background: dark ? "#111827" : "#fff",
            color: dark ? "#f9fafb" : "#111827",
            boxSizing: "border-box",
            outline: "none",
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none"
        },

        button: {
            background: "#1e88e5",
            color: "#fff",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            width: "100%"
        },

        smallButton: {
            background: "#0f2a5f",
            color: "#fff",
            border: "none",
            padding: "8px 12px",
            borderRadius: "6px",
            cursor: "pointer"
        },

        table: {
            width: "100%",
            borderCollapse: "collapse"
        },

        th: {
            textAlign: "left",
            padding: "12px",
            background: dark ? "#374151" : "#f1f4f8",
            color: dark ? "#fff" : "#111827",
            borderBottom: dark ? "1px solid #555" : "1px solid #ddd"
        },

        statusAberta: {
            background: "#fff3cd",
            color: "#856404",
            padding: "5px 10px",
            borderRadius: "20px",
            fontSize: "12px"
        },

        statusFechada: {
            background: "#d4edda",
            color: "#155724",
            padding: "5px 10px",
            borderRadius: "20px",
            fontSize: "12px"
        },

        td: {
            padding: "12px",
            color: dark ? "#f9fafb" : "#111827",
            borderBottom: dark ? "1px solid #444" : "1px solid #eee"
        }
    };
}