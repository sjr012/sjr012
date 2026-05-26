import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";

import API_URL, {
    apiFetch
} from "../services/api";

function Dashboard() {

    const [loading, setLoading] = useState(true);

    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("tema") === "dark"
    );

    const [clientes, setClientes] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [ordens, setOrdens] = useState([]);

    useEffect(() => {
        carregarDados();
    }, []);

    useEffect(() => {
        const atualizarTema = () => {
            setDarkMode(localStorage.getItem("tema") === "dark");
        };

        window.addEventListener("temaAlterado", atualizarTema);

        return () => {
            window.removeEventListener("temaAlterado", atualizarTema);
        };
    }, []);

    const carregarDados = async () => {
        try {
            setLoading(true);

            const usuario = JSON.parse(localStorage.getItem("usuario"));

            if (usuario?.tipo === "ADMIN") {
                const [ordensRes, clientesRes, funcionariosRes] = await Promise.all([
                    apiFetch(`${API_URL}/ordens`),
                    apiFetch(`${API_URL}/clientes`),
                    apiFetch(`${API_URL}/funcionarios`)
                ]);

                if (ordensRes.ok) {
                    setOrdens(await ordensRes.json());
                }

                if (clientesRes.ok) {
                    setClientes(await clientesRes.json());
                }

                if (funcionariosRes.ok) {
                    setFuncionarios(await funcionariosRes.json());
                }

            } else {
                const ordensRes = await apiFetch(`${API_URL}/ordens`);

                if (ordensRes.ok) {
                    setOrdens(await ordensRes.json());
                }
            }

        } finally {
            setLoading(false);
        }
    };

    const ordensAbertas = ordens.filter((ordem) =>
        ["ABERTA", "EM_ANDAMENTO", "AGUARDANDO_PECA"].includes(ordem.status)
    );

    const ordensFechadas = ordens.filter((ordem) =>
        ["FECHADA", "FINALIZADA", "ENTREGUE"].includes(ordem.status)
    );

    const totalOrdens = ordens.length;

    const percentualFechadas =
        totalOrdens === 0
            ? 0
            : Math.round((ordensFechadas.length / totalOrdens) * 100);

    const contarStatus = (status) =>
        ordens.filter((ordem) => ordem.status === status).length;

    const dadosStatus = [
        { name: "Aberta", value: contarStatus("ABERTA") },
        { name: "Em andamento", value: contarStatus("EM_ANDAMENTO") },
        { name: "Aguardando peça", value: contarStatus("AGUARDANDO_PECA") },
        { name: "Finalizada", value: contarStatus("FINALIZADA") },
        { name: "Entregue", value: contarStatus("ENTREGUE") },
        { name: "Cancelada", value: contarStatus("CANCELADA") },
        { name: "Fechada antiga", value: contarStatus("FECHADA") }
    ].filter((item) => item.value > 0);

    const dadosFuncionarios = funcionarios.map((funcionario) => {
        const total = ordens.filter(
            (ordem) => ordem.funcionario?.id === funcionario.id
        ).length;

        return {
            nome: funcionario.nome,
            total
        };
    });

    const obterEstiloStatus = (status) => {

        switch (status) {

            case "ABERTA":
                return {
                    background: "#0d6efd",
                    color: "#fff"
                };

            case "EM_ANDAMENTO":
                return {
                    background: "#fd7e14",
                    color: "#fff"
                };

            case "AGUARDANDO_PECA":
                return {
                    background: "#6f42c1",
                    color: "#fff"
                };

            case "FINALIZADA":
                return {
                    background: "#198754",
                    color: "#fff"
                };

            case "ENTREGUE":
                return {
                    background: "#20c997",
                    color: "#fff"
                };

            case "CANCELADA":
                return {
                    background: "#dc3545",
                    color: "#fff"
                };

            case "FECHADA":
                return {
                    background: "#6c757d",
                    color: "#fff"
                };

            default:
                return {
                    background: "#6c757d",
                    color: "#fff"
                };
        }
    };

    const formatarStatus = (status) => {

        switch (status) {

            case "ABERTA":
                return "Aberta";

            case "EM_ANDAMENTO":
                return "Em andamento";

            case "AGUARDANDO_PECA":
                return "Aguardando peça";

            case "FINALIZADA":
                return "Finalizada";

            case "ENTREGUE":
                return "Entregue";

            case "CANCELADA":
                return "Cancelada";

            case "FECHADA":
                return "Fechada";

            default:
                return status;
        }
    };



    if (loading) {
        return <h2>Carregando dados...</h2>;
    }

    return (
        <div>
            <h1 style={{ color: darkMode ? "#fff" : "#000" }}>
                Dashboard
            </h1>

            <p style={{ color: darkMode ? "#d1d5db" : "#444" }}>
                Sistema de ordens de serviço, podendo se tornar um sistema de gestão completo para pequenas empresas, com módulos de estoque, financeiro e relatórios personalizados.
            </p>

            <section style={styles.cards}>
                <div style={darkMode ? styles.cardDark : styles.card}>
                    <h3>Clientes</h3>
                    <strong>{clientes.length}</strong>
                    <p>Total de clientes cadastrados</p>
                </div>

                <div style={darkMode ? styles.cardDark : styles.card}>
                    <h3>Funcionários</h3>
                    <strong>{funcionarios.length}</strong>
                    <p>Total de funcionários cadastrados</p>
                </div>

                <div style={darkMode ? styles.cardDark : styles.card}>
                    <h3>OS Abertas</h3>
                    <strong>{ordensAbertas.length}</strong>
                    <p>Ordens em andamento</p>
                </div>

                <div style={darkMode ? styles.cardDark : styles.card}>
                    <h3>OS Fechadas</h3>
                    <strong>{ordensFechadas.length}</strong>
                    <p>Ordens finalizadas</p>
                </div>
            </section>

            <section style={styles.chartsGrid}>
                <div style={darkMode ? styles.panelDark : styles.panel}>
                    <h2>Ordens por Status</h2>

                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={dadosStatus}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={90}
                                label
                            >
                                {dadosStatus.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={[
                                            "#0d6efd",
                                            "#fd7e14",
                                            "#6f42c1",
                                            "#198754",
                                            "#20c997",
                                            "#dc3545",
                                            "#6c757d"
                                        ][index]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div style={darkMode ? styles.panelDark : styles.panel}>
                    <h2>Ordens por Funcionário</h2>

                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={dadosFuncionarios}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nome" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="total" fill="#1e88e5" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <section style={darkMode ? styles.panelDark : styles.panel}>
                <h2>Indicador de Finalização</h2>

                <div style={styles.progressContainer}>
                    <div
                        style={{
                            ...styles.progressBar,
                            width: `${percentualFechadas}%`
                        }}
                    >
                        {percentualFechadas}%
                    </div>
                </div>

                <p>
                    {ordensFechadas.length} de {totalOrdens} ordens foram finalizadas.
                </p>
            </section>

            <section style={darkMode ? styles.panelDark : styles.panel}>
                <h2>Últimas Ordens de Serviço</h2>

                {ordens.length === 0 ? (
                    <p>Nenhuma ordem cadastrada.</p>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={darkMode ? styles.thDark : styles.th}>ID</th>
                                <th style={darkMode ? styles.thDark : styles.th}>Descrição</th>
                                <th style={darkMode ? styles.thDark : styles.th}>Status</th>
                                <th style={darkMode ? styles.thDark : styles.th}>Cliente</th>
                                <th style={darkMode ? styles.thDark : styles.th}>Funcionário</th>
                            </tr>
                        </thead>

                        <tbody>
                            {ordens.slice(-5).reverse().map((ordem) => (
                                <tr key={ordem.id}>
                                    <td style={darkMode ? styles.tdDark : styles.td}>{ordem.id}</td>
                                    <td style={darkMode ? styles.tdDark : styles.td}>{ordem.descricao}</td>
                                    <td style={darkMode ? styles.tdDark : styles.td}>
                                        <span
                                            style={{
                                                ...obterEstiloStatus(ordem.status),
                                                padding: "8px 16px",
                                                borderRadius: "999px",
                                                fontWeight: "bold",
                                                fontSize: "12px",
                                                display: "inline-block",
                                                whiteSpace: "nowrap",
                                                textAlign: "center",
                                                minWidth: "120px"
                                            }}
                                        >
                                            {formatarStatus(ordem.status)}
                                        </span>
                                    </td>
                                    <td style={darkMode ? styles.tdDark : styles.td}>{ordem.cliente?.nome}</td>
                                    <td style={darkMode ? styles.tdDark : styles.td}>{ordem.funcionario?.nome}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
}

const styles = {
    cards: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        marginBottom: "25px"
    },

    card: {
        background: "#fff",
        padding: "22px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
    },

    cardDark: {
        background: "#1f2937",
        color: "#f9fafb",
        padding: "22px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.35)"
    },

    chartsGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        marginBottom: "25px"
    },

    panel: {
        background: "#fff",
        padding: "25px",
        borderRadius: "12px",
        marginBottom: "25px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
    },

    panelDark: {
        background: "#1f2937",
        color: "#f9fafb",
        padding: "25px",
        borderRadius: "12px",
        marginBottom: "25px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.35)"
    },

    progressContainer: {
        width: "100%",
        background: "#e9ecef",
        borderRadius: "20px",
        overflow: "hidden",
        marginBottom: "10px"
    },

    progressBar: {
        background: "#1e88e5",
        color: "#fff",
        padding: "10px",
        textAlign: "center",
        borderRadius: "20px"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse"
    },

    th: {
        textAlign: "left",
        padding: "12px",
        background: "#f1f4f8",
        color: "#111827",
        borderBottom: "1px solid #ddd"
    },

    td: {
        padding: "12px",
        color: "#111827",
        borderBottom: "1px solid #eee"
    },

    thDark: {
        textAlign: "left",
        padding: "12px",
        background: "#374151",
        color: "#fff",
        borderBottom: "1px solid #555"
    },

    tdDark: {
        padding: "12px",
        color: "#f9fafb",
        borderBottom: "1px solid #444"
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
    }
};

export default Dashboard;