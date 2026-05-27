import background from "../assets/background.jpeg";
import { toast } from "react-toastify";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../services/api";

function Login() {
    const [login, setLogin] = useState("");
    const [senha, setSenha] = useState("");

    const [carregando, setCarregando] = useState(false);

    const navigate = useNavigate();

    const loginInputRef = useRef(null);

    useEffect(() => {
        loginInputRef.current?.focus();
    }, []);

    const handleLogin = async () => {

        if (carregando) return;

        setCarregando(true);

        try {

            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ login, senha })
            });

            if (!response.ok) {
                toast.error("Login inválido!");
                return;
            }

            const data = await response.json();

            localStorage.setItem("token", data.token);
            localStorage.setItem("usuario", JSON.stringify(data.usuario));

            toast.success("Login realizado com sucesso!");

            navigate("/dashboard");

        } catch (error) {

            toast.error("Erro ao conectar com o servidor.");

        } finally {

            setCarregando(false);
        }
    };

    return (
        <div style={styles.loginPage}>
            <div style={styles.loginCard}>
                <h1 style={styles.logo}>SYSTEC</h1>
                <p style={styles.subtitle}>Sistema de Ordem de Serviço</p>

                <input
                    ref={loginInputRef}
                    style={styles.input}
                    placeholder="Login"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !carregando) {
                            handleLogin();
                        }
                    }}
                />

                <input
                    style={styles.input}
                    type="password"
                    placeholder="Senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !carregando) {
                            handleLogin();
                        }
                    }}
                />

                <button
                    style={{
                        ...styles.button,
                        opacity: carregando ? 0.7 : 1,
                        cursor: carregando ? "not-allowed" : "pointer"
                    }}
                    disabled={carregando}
                    onClick={handleLogin}
                >
                    {carregando ? "Entrando..." : "Entrar"}
                </button>
            </div>
        </div>
    );
}

const styles = {
    loginPage: {
        height: "100vh",
        backgroundImage: `
    linear-gradient(
      rgba(0,0,0,0.45),
      rgba(0,0,0,0.45)
    ),
    url(${background})
  `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    loginCard: {
        background: "#fff",
        width: "340px",
        padding: "35px",
        borderRadius: "14px",
        textAlign: "center"
    },
    logo: {
        color: "#0f2a5f"
    },
    subtitle: {
        color: "#666",
        marginBottom: "25px"
    },
    input: {
        width: "100%",
        padding: "12px",
        marginBottom: "12px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        boxSizing: "border-box"
    },
    button: {
        width: "100%",
        padding: "12px",
        background: "#1e88e5",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer"
    }
};

export default Login;