import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import background from "../assets/background.jpeg";

function Layout({ children }) {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const [menuAberto, setMenuAberto] = useState(false);
    const [menuRecolhido, setMenuRecolhido] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const temaSalvo = localStorage.getItem("tema");

        if (temaSalvo === "dark") {
            setDarkMode(true);
        }
    }, []);

    const alternarTema = () => {
        const novoTema = !darkMode;

        setDarkMode(novoTema);
        localStorage.setItem("tema", novoTema ? "dark" : "light");

        window.dispatchEvent(new Event("temaAlterado"));
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/");
    };

    const textoMenu = !menuRecolhido;

    return (
        <div style={darkMode ? styles.appDark : styles.app}>
            <button
                style={styles.mobileMenuButton}
                onClick={() => setMenuAberto(!menuAberto)}
            >
                ☰
            </button>

            <aside
                style={{
                    ...styles.sidebar,
                    width: menuRecolhido ? "70px" : "240px",
                    ...(menuAberto ? styles.sidebarAberto : {})
                }}
            >
                <div>
                    <button
                        style={styles.toggleButton}
                        onClick={() => setMenuRecolhido(!menuRecolhido)}
                    >
                        {menuRecolhido ? "»" : "«"}
                    </button>

                    <h2 style={styles.logo}>{menuRecolhido ? "S" : "SYSTEC"}</h2>

                    <nav>
                        <Link style={styles.link} to="/dashboard">
                            🏠 {textoMenu && "Dashboard"}
                        </Link>

                        <Link style={styles.link} to="/ordens">
                            🛠️ {textoMenu && "Ordens"}
                        </Link>

                        {usuario?.tipo === "ADMIN" && (
                            <>
                                <Link style={styles.link} to="/clientes">
                                    👥 {textoMenu && "Clientes"}
                                </Link>

                                <Link style={styles.link} to="/funcionarios">
                                    👨‍🔧 {textoMenu && "Funcionários"}
                                </Link>

                                <Link style={styles.link} to="/usuarios">
                                    🔐 {textoMenu && "Usuários"}
                                </Link>
                            </>
                        )}
                    </nav>
                </div>

                <div>
                    <button style={styles.themeButton} onClick={alternarTema}>
                        {darkMode ? "☀️" : "🌙"} {textoMenu && (darkMode ? "Claro" : "Escuro")}
                    </button>

                    <button style={styles.logout} onClick={logout}>
                        🚪 {textoMenu && "Sair"}
                    </button>
                </div>
            </aside>

            <main style={darkMode ? styles.mainDark : styles.main}>
                <header style={darkMode ? styles.headerDark : styles.header}>
                    <div>
                        <h2 style={styles.title}>Bem-vindo, {usuario?.nome}</h2>
                        <p style={darkMode ? styles.userTypeDark : styles.userType}>
                            Perfil: {usuario?.tipo}
                        </p>
                    </div>
                </header>

                {children}
            </main>
        </div>
    );
}

const isMobile = window.innerWidth <= 768;

const styles = {
    app: {
        display: "flex",
        minHeight: "100vh",
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        fontFamily: "Arial, sans-serif"
    },

    appDark: {
        display: "flex",
        minHeight: "100vh",
        backgroundImage: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.75)), url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        fontFamily: "Arial, sans-serif",
        color: "#f5f5f5"
    },

    mobileMenuButton: {
        display: isMobile ? "block" : "none",
        position: "fixed",
        top: "15px",
        left: "15px",
        zIndex: 1000,
        background: "#0f2a5f",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "10px 14px",
        fontSize: "20px",
        cursor: "pointer"
    },

    sidebar: {
        background: "#0f2a5f",
        color: "#fff",
        padding: "20px",
        display: isMobile ? "none" : "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100vh",
        position: "sticky",
        top: 0,
        transition: "width 0.3s ease",
        overflow: "hidden",
        boxSizing: "border-box"
    },

    sidebarAberto: {
        display: "flex",
        position: "fixed",
        zIndex: 999,
        left: 0,
        top: 0,
        bottom: 0
    },

    toggleButton: {
        background: "rgba(255,255,255,0.15)",
        color: "#fff",
        border: "none",
        padding: "8px",
        borderRadius: "8px",
        cursor: "pointer",
        marginBottom: "20px",
        width: "100%"
    },

    logo: {
        marginBottom: "30px",
        textAlign: "center"
    },

    link: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        textDecoration: "none",
        padding: "12px",
        borderRadius: "8px",
        background: "rgba(255,255,255,0.08)",
        marginBottom: "10px",
        whiteSpace: "nowrap",
        gap: "8px"
    },

    themeButton: {
        background: "#1e88e5",
        color: "#fff",
        border: "none",
        padding: "12px",
        borderRadius: "8px",
        cursor: "pointer",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        marginBottom: "10px",
        width: "100%"
    },

    logout: {
        background: "#d9534f",
        color: "#fff",
        border: "none",
        padding: "12px",
        borderRadius: "8px",
        cursor: "pointer",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        width: "100%"
    },

    main: {
        flex: 1,
        padding: isMobile ? "70px 15px 20px" : "30px",
        overflowX: "hidden",
        maxWidth: "100%",
        background: "transparent"
    },

    mainDark: {
        flex: 1,
        padding: isMobile ? "70px 15px 20px" : "30px",
        overflowX: "hidden",
        maxWidth: "100%",
        background: "transparent",
        color: "#f5f5f5"
    },

    header: {
        background: "#fff",
        padding: "18px 22px",
        borderRadius: "12px",
        marginBottom: "25px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
    },

    headerDark: {
        background: "#1f2937",
        padding: "18px 22px",
        borderRadius: "12px",
        marginBottom: "25px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        color: "#fff"
    },

    title: {
        margin: 0
    },

    userType: {
        margin: "6px 0 0",
        color: "#666"
    },

    userTypeDark: {
        margin: "6px 0 0",
        color: "#d1d5db"
    }
};

export default Layout;