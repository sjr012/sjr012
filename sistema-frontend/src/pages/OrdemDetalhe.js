import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import API_URL, {
    getAuthHeaders,
    apiFetch
} from "../services/api";

function OrdemDetalhe() {

    const { id } = useParams();

    const [ordem, setOrdem] = useState(null);

    const darkMode =
        localStorage.getItem("tema") === "dark";

    useEffect(() => {
        carregarOrdem();
    }, []);

    const carregarOrdem = async () => {

        const response = await apiFetch(
            `${API_URL}/ordens/${id}`,
            {
                headers: getAuthHeaders()
            }
        );

        if (!response.ok) {
            return;
        }

        const data = await response.json();

        setOrdem(data);
    };

    const formatarDataHora = (valor) => {

        if (!valor) return "Em aberto";

        const data = new Date(valor);

        return data.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (!ordem) {

        return (
            <div style={{
                padding: "40px",
                color: darkMode ? "#fff" : "#000"
            }}>
                <h2>Carregando ordem...</h2>
            </div>
        );
    }

    return (
        <div style={{
            padding: "30px",
            background: darkMode ? "#111827" : "#f4f6f9",
            minHeight: "100vh",
            color: darkMode ? "#f9fafb" : "#111827",
            fontFamily: "Arial"
        }}>

            {/* CABEÇALHO */}
            <section style={{
                background: darkMode ? "#1f2937" : "#fff",
                padding: "25px",
                borderRadius: "16px",
                marginBottom: "25px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
            }}>

                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px"
                }}>

                    <div>

                        <h1 style={{
                            margin: 0,
                            fontSize: "32px"
                        }}>
                            Ordem #{ordem.id}
                        </h1>

                        <p style={{
                            marginTop: "8px",
                            opacity: 0.8
                        }}>
                            Visualização detalhada da ordem de serviço
                        </p>

                    </div>

                    <span style={{
                        background:
                            ordem.status === "FECHADA"
                                ? "#198754"
                                : "#fd7e14",

                        color: "#fff",

                        padding: "10px 18px",

                        borderRadius: "999px",

                        fontWeight: "bold",

                        fontSize: "14px"
                    }}>
                        {ordem.status}
                    </span>

                </div>

            </section>

            {/* CARDS */}
            <section style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
                marginBottom: "25px"
            }}>

                <div style={darkMode ? styles.cardDark : styles.card}>
                    <h3>Cliente</h3>

                    <p>
                        {ordem.cliente?.nome || "-"}
                    </p>
                </div>

                <div style={darkMode ? styles.cardDark : styles.card}>
                    <h3>Funcionário</h3>

                    <p>
                        {ordem.funcionario?.nome || "-"}
                    </p>
                </div>

                <div style={darkMode ? styles.cardDark : styles.card}>
                    <h3>Abertura</h3>

                    <p>
                        {formatarDataHora(ordem.dataAbertura)}
                    </p>
                </div>

                <div style={darkMode ? styles.cardDark : styles.card}>
                    <h3>Fechamento</h3>

                    <p>
                        {formatarDataHora(ordem.dataFechamento)}
                    </p>
                </div>

            </section>

            {/* DESCRIÇÃO */}
            <section style={{
                background: darkMode ? "#1f2937" : "#fff",

                padding: "25px",

                borderRadius: "16px",

                marginBottom: "25px",

                boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
            }}>

                <h2>
                    Descrição do Serviço
                </h2>

                <hr style={{
                    marginBottom: "20px",
                    opacity: 0.2
                }} />

                <p style={{
                    lineHeight: "1.8",
                    fontSize: "16px"
                }}>
                    {ordem.descricao}
                </p>

            </section>

            {/* TIMELINE */}
            <section style={{
                background: darkMode ? "#1f2937" : "#fff",

                padding: "25px",

                borderRadius: "16px",

                marginBottom: "25px",

                boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
            }}>

                <h2>
                    Histórico da Ordem
                </h2>

                <div style={{
                    marginTop: "20px"
                }}>

                    <div style={styles.timelineItem}>
                        <div style={styles.timelineDot} />

                        <div>
                            <strong>
                                Ordem aberta
                            </strong>

                            <p>
                                {formatarDataHora(ordem.dataAbertura)}
                            </p>
                        </div>
                    </div>

                    {ordem.status === "FECHADA" && (

                        <div style={styles.timelineItem}>
                            <div style={{
                                ...styles.timelineDot,
                                background: "#198754"
                            }} />

                            <div>
                                <strong>
                                    Ordem finalizada
                                </strong>

                                <p>
                                    {formatarDataHora(ordem.dataFechamento)}
                                </p>
                            </div>
                        </div>
                    )}

                </div>

            </section>

            {/* BOTÕES */}
            <section style={{
                display: "flex",
                gap: "15px",
                flexWrap: "wrap"
            }}>

                <button
                    style={styles.button}
                    onClick={() => window.print()}
                >
                    Imprimir Ordem
                </button>

                <button
                    style={{
                        ...styles.button,
                        background: "#0d6efd"
                    }}
                    onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Link copiado!");
                    }}
                >
                    Compartilhar
                </button>

            </section>

        </div>
    );
}

const styles = {

    card: {
        background: "#fff",

        padding: "22px",

        borderRadius: "16px",

        boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
    },

    cardDark: {
        background: "#1f2937",

        padding: "22px",

        borderRadius: "16px",

        boxShadow: "0 4px 14px rgba(0,0,0,0.35)"
    },

    timelineItem: {
        display: "flex",

        alignItems: "center",

        gap: "15px",

        marginBottom: "20px"
    },

    timelineDot: {
        width: "14px",

        height: "14px",

        borderRadius: "50%",

        background: "#fd7e14"
    },

    button: {
        background: "#198754",

        color: "#fff",

        border: "none",

        padding: "12px 22px",

        borderRadius: "10px",

        cursor: "pointer",

        fontWeight: "bold",

        fontSize: "14px"
    }
};

export default OrdemDetalhe;