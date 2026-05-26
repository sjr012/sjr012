import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import { useNavigate, useParams } from "react-router-dom";

import API_URL, {
    getAuthHeaders,
    apiFetch
} from "../services/api";

function OrdemDetalhe() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [ordem, setOrdem] = useState(null);

    const [anexos, setAnexos] = useState([]);

    const darkMode =
        localStorage.getItem("tema") === "dark";

    useEffect(() => {
        carregarOrdem();
        carregarAnexos();
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

    const carregarAnexos = async () => {

        const response = await apiFetch(
            `${API_URL}/anexos/ordem/${id}`,
            {
                headers: getAuthHeaders()
            }
        );

        if (!response.ok) {
            return;
        }

        const data = await response.json();

        setAnexos(data);
    };

    const visualizarAnexo = async (anexo) => {
        const response = await apiFetch(`${API_URL}/anexos/download/${anexo.id}`);

        if (!response.ok) {
            alert("Erro ao visualizar anexo.");
            return;
        }

        const url = await response.text();
        window.open(url, "_blank");
    };

    const baixarAnexo = async (anexo) => {
        const response = await apiFetch(`${API_URL}/anexos/download/${anexo.id}`);

        if (!response.ok) {
            alert("Erro ao baixar anexo.");
            return;
        }

        const url = await response.text();

        const arquivoResponse = await fetch(url);

        if (!arquivoResponse.ok) {
            alert("Erro ao baixar arquivo do Cloudinary.");
            return;
        }

        const blob = await arquivoResponse.blob();
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = anexo.nomeArquivo;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(blobUrl);
    };

    const obterIconeAnexo = (tipoArquivo) => {

        if (!tipoArquivo) return "📎";

        if (tipoArquivo.startsWith("image/")) {
            return "🖼️";
        }

        if (tipoArquivo === "application/pdf") {
            return "📄";
        }

        if (
            tipoArquivo === "application/zip" ||
            tipoArquivo === "application/x-zip-compressed"
        ) {
            return "🗜️";
        }

        return "📎";
    };

    const isImagem = (tipoArquivo) => {

        return tipoArquivo?.startsWith("image/");
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

    const gerarPdfOrdem = async (ordem) => {


        const doc = new jsPDF();

        const urlOrdem =
            `https://sistema-frontend-orjl.onrender.com/ordens/${ordem.id}`;

        const qrCode = await QRCode.toDataURL(urlOrdem);

        // CABEÇALHO
        doc.setFillColor(15, 42, 95);

        doc.rect(
            0,
            0,
            210,
            28,
            "F"
        );

        doc.setTextColor(255, 255, 255);

        doc.setFontSize(20);

        doc.text(
            "SYSTEC",
            20,
            14
        );

        doc.setFontSize(11);

        doc.text(
            "Sistema de Ordem de Serviço",
            20,
            22
        );

        // TÍTULO
        doc.setTextColor(0, 0, 0);

        doc.setFontSize(16);

        doc.text(
            `Ordem de Serviço #${ordem.id}`,
            20,
            42
        );

        doc.setFontSize(10);

        doc.text(
            `Gerado em: ${formatarDataHora(new Date())}`,
            20,
            49
        );

        // QR CODE
        doc.addImage(
            qrCode,
            "PNG",
            160,
            35,
            32,
            32
        );

        doc.setFontSize(8);

        doc.text(
            "Escaneie para abrir a OS",
            152,
            71
        );

        // TABELA
        autoTable(doc, {
            startY: 78,

            head: [
                ["Campo", "Informação"]
            ],

            body: [
                ["Número da OS", ordem.id],

                ["Status", ordem.status],

                [
                    "Cliente",
                    ordem.cliente?.nome || "-"
                ],

                [
                    "Funcionário",
                    ordem.funcionario?.nome || "-"
                ],

                [
                    "Data de Abertura",
                    formatarDataHora(ordem.dataAbertura)
                ],

                [
                    "Data de Fechamento",
                    ordem.dataFechamento
                        ? formatarDataHora(ordem.dataFechamento)
                        : "Em aberto"
                ]
            ],

            styles: {
                fontSize: 10,
                cellPadding: 4
            },

            headStyles: {
                fillColor: [15, 42, 95],
                textColor: [255, 255, 255]
            },

            alternateRowStyles: {
                fillColor: [245, 247, 250]
            }
        });

        // DESCRIÇÃO
        const finalY =
            doc.lastAutoTable.finalY + 12;

        doc.setFontSize(12);

        doc.text(
            "Descrição do Serviço",
            20,
            finalY
        );

        doc.setFontSize(10);

        const descricaoFormatada =
            doc.splitTextToSize(
                ordem.descricao || "-",
                170
            );

        doc.text(
            descricaoFormatada,
            20,
            finalY + 8
        );

        // ASSINATURAS
        const assinaturaY =
            finalY + 45;

        doc.line(
            20,
            assinaturaY,
            90,
            assinaturaY
        );

        doc.text(
            "Assinatura do responsável",
            25,
            assinaturaY + 7
        );

        doc.line(
            120,
            assinaturaY,
            190,
            assinaturaY
        );

        doc.text(
            "Assinatura do cliente",
            135,
            assinaturaY + 7
        );

        // RODAPÉ
        doc.setFontSize(8);

        doc.setTextColor(100);

        doc.text(
            "Documento gerado automaticamente pelo sistema SYSTEC.",
            20,
            285
        );

        // ABRIR PDF
        const pdfBlob = doc.output("blob");

        const pdfUrl = URL.createObjectURL(pdfBlob);

        window.open(
            pdfUrl,
            "_blank"
        );
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

            {/* ANEXOS */}
            <section style={{
                background: darkMode ? "#1f2937" : "#fff",
                padding: "25px",
                borderRadius: "16px",
                marginBottom: "25px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
            }}>

                <h2>Anexos</h2>

                {anexos.length === 0 ? (

                    <p>Nenhum anexo encontrado.</p>

                ) : (

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "20px",
                        marginTop: "20px"
                    }}>

                        {anexos.map((anexo) => (

                            <div
                                key={anexo.id}
                                style={darkMode ? styles.anexoCardDark : styles.anexoCard}
                            >
                                {isImagem(anexo.tipoArquivo) ? (
                                    <img
                                        src={anexo.caminhoArquivo}
                                        alt={anexo.nomeArquivo}
                                        style={styles.anexoImagem}
                                    />
                                ) : (
                                    <div style={styles.anexoIcone}>
                                        {obterIconeAnexo(anexo.tipoArquivo)}
                                    </div>
                                )}

                                <h4 style={styles.anexoNome}>
                                    {anexo.nomeArquivo}
                                </h4>

                                <p style={styles.anexoTipo}>
                                    {anexo.tipoArquivo}
                                </p>

                                <div style={styles.anexoAcoes}>
                                    <button
                                        style={styles.linkButton}
                                        onClick={() => visualizarAnexo(anexo)}
                                    >
                                        Visualizar
                                    </button>

                                    <button
                                        style={{
                                            ...styles.linkButton,
                                            background: "#198754"
                                        }}
                                        onClick={() => baixarAnexo(anexo)}
                                    >
                                        Baixar
                                    </button>
                                </div>
                            </div>

                        ))}

                    </div>
                )}

            </section>

            {/* BOTÕES */}
            <section style={{
                display: "flex",
                gap: "15px",
                flexWrap: "wrap"
            }}>

                <button
                    style={{
                        ...styles.button,
                        background: "#6c757d"
                    }}
                    onClick={() => navigate("/ordens")}
                >
                    Voltar
                </button>

                <button
                    style={styles.button}
                    onClick={() => gerarPdfOrdem(ordem)}
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

    linkButton: {
        background: "#0d6efd",
        color: "#fff",
        textDecoration: "none",
        padding: "10px 14px",
        borderRadius: "8px",
        fontWeight: "bold",
        display: "inline-block"
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
    },

    anexoCard: {
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        padding: "15px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
    },

    anexoCardDark: {
        background: "#111827",
        border: "1px solid #374151",
        borderRadius: "14px",
        padding: "15px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.35)"
    },

    anexoImagem: {
        width: "100%",
        height: "160px",
        objectFit: "cover",
        borderRadius: "10px",
        marginBottom: "12px"
    },

    anexoIcone: {
        height: "160px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "56px",
        background: "#f3f4f6",
        borderRadius: "10px",
        marginBottom: "12px"
    },

    anexoNome: {
        margin: "0 0 6px",
        wordBreak: "break-word"
    },

    anexoTipo: {
        fontSize: "13px",
        opacity: 0.75,
        marginBottom: "12px"
    },

    anexoAcoes: {
        display: "flex",
        gap: "10px",
        flexWrap: "wrap"
    }

};

export default OrdemDetalhe;