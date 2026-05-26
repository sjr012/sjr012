import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useTheme from "../hooks/useTheme";
import { useEffect, useState } from "react";
import API_URL, { getAuthHeaders } from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

function Ordens() {

    const theme = useTheme();
    const navigate = useNavigate();

    const [clientes, setClientes] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [ordens, setOrdens] = useState([]);

    const [arquivoSelecionado, setArquivoSelecionado] = useState(null);
    const [anexos, setAnexos] = useState([]);
    const [ordemSelecionada, setOrdemSelecionada] = useState(null);

    const [descricao, setDescricao] = useState("");
    const [clienteId, setClienteId] = useState("");
    const [funcionarioId, setFuncionarioId] = useState("");
    const [busca, setBusca] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");

    const [editando, setEditando] = useState(false);
    const [ordemEditando, setOrdemEditando] = useState(null);

    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 10;

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        const usuario = JSON.parse(localStorage.getItem("usuario"));

        const ordensRes = await fetch(`${API_URL}/ordens`, {
            headers: getAuthHeaders()
        });

        if (ordensRes.ok) {
            setOrdens(await ordensRes.json());
        }

        if (usuario?.tipo === "ADMIN") {
            const clientesRes = await fetch(`${API_URL}/clientes`, {
                headers: getAuthHeaders()
            });

            const funcionariosRes = await fetch(`${API_URL}/funcionarios`, {
                headers: getAuthHeaders()
            });

            if (clientesRes.ok) {
                setClientes(await clientesRes.json());
            }

            if (funcionariosRes.ok) {
                setFuncionarios(await funcionariosRes.json());
            }
        }
    };

    const obterEstiloStatus = (status) => {
        switch (status) {
            case "ABERTA":
                return { background: "#0d6efd", color: "#fff" };

            case "EM_ANDAMENTO":
                return { background: "#fd7e14", color: "#fff" };

            case "AGUARDANDO_PECA":
                return { background: "#6f42c1", color: "#fff" };

            case "FINALIZADA":
                return { background: "#198754", color: "#fff" };

            case "ENTREGUE":
                return { background: "#20c997", color: "#fff" };

            case "CANCELADA":
                return { background: "#dc3545", color: "#fff" };

            case "FECHADA":
                return { background: "#6c757d", color: "#fff" };

            default:
                return { background: "#6c757d", color: "#fff" };
        }
    };

    const styles = {
        actionButtons: {
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            alignItems: "center",
            justifyContent: "center"
        }
    };

    const salvarOrdem = async () => {
        if (!descricao || !clienteId || !funcionarioId) {
            toast.warning("Preencha todos os campos.");
            return;
        }

        const url = editando
            ? `${API_URL}/ordens/${ordemEditando}`
            : `${API_URL}/ordens`;

        const metodo = editando ? "PUT" : "POST";

        const response = await fetch(url, {
            method: metodo,
            headers: getAuthHeaders(),
            body: JSON.stringify({
                descricao,
                cliente: {
                    id: Number(clienteId)
                },
                funcionario: {
                    id: Number(funcionarioId)
                }
            })
        });

        if (!response.ok) {
            toast.error("Erro ao salvar ordem.");
            return;
        }

        toast.success(
            editando
                ? "Ordem atualizada com sucesso!"
                : "Ordem cadastrada com sucesso!"
        );

        setDescricao("");
        setClienteId("");
        setFuncionarioId("");

        setEditando(false);
        setOrdemEditando(null);

        carregarDados();
    };

    const editarOrdem = (ordem) => {
        setEditando(true);
        setOrdemEditando(ordem.id);

        setDescricao(ordem.descricao);
        setClienteId(ordem.cliente?.id || "");
        setFuncionarioId(ordem.funcionario?.id || "");
    };

    const cancelarEdicao = () => {
        setDescricao("");
        setClienteId("");
        setFuncionarioId("");

        setEditando(false);
        setOrdemEditando(null);
    };

    const excluirOrdem = async (id) => {
        if (!window.confirm("Deseja realmente excluir esta ordem?")) {
            return;
        }

        const response = await fetch(`${API_URL}/ordens/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            toast.error("Erro ao excluir ordem.");
            return;
        }

        toast.success("Ordem excluída com sucesso!");
        carregarDados();
    };

    const fecharOrdem = async (id) => {
        await fetch(`${API_URL}/ordens/${id}/fechar`, {
            method: "PUT",
            headers: getAuthHeaders()
        });

        toast.success("Ordem de serviço fechada com sucesso!");
        carregarDados();
    };

    const atualizarStatus = async (id, status) => {

        const response = await fetch(
            `${API_URL}/ordens/${id}/status`,
            {
                method: "PUT",

                headers: getAuthHeaders(),

                body: JSON.stringify({
                    status
                })
            }
        );

        if (!response.ok) {
            toast.error("Erro ao atualizar status.");
            return;
        }

        toast.success("Status atualizado!");

        carregarDados();
    };

    const carregarAnexos = async (ordemId) => {
        const response = await fetch(`${API_URL}/anexos/ordem/${ordemId}`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();

        setAnexos(data);
        setOrdemSelecionada(ordemId);
    };

    const enviarAnexo = async () => {
        if (!ordemSelecionada) {
            toast.warning("Selecione uma ordem primeiro.");
            return;
        }

        if (!arquivoSelecionado) {
            toast.warning("Selecione um arquivo.");
            return;
        }

        const formData = new FormData();
        formData.append("arquivo", arquivoSelecionado);

        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/anexos/upload/${ordemSelecionada}`, {
            method: "POST",
            headers: {
                Authorization: token ? `Bearer ${token}` : ""
            },
            body: formData
        });

        if (!response.ok) {
            toast.error("Erro ao enviar anexo.");
            return;
        }

        toast.success("Anexo enviado com sucesso!");

        setArquivoSelecionado(null);
        carregarAnexos(ordemSelecionada);
    };

    const baixarAnexo = async (id, nomeArquivo) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/anexos/download/${id}`,
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : ""
                    }
                }
            );

            if (!response.ok) {
                toast.error("Erro ao baixar arquivo.");
                return;
            }

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = nomeArquivo;

            document.body.appendChild(link);
            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (error) {
            toast.error("Erro ao baixar anexo.");
        }
    };

    const formatarDataHora = (valor) => {

        if (!valor) return "-";

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

    const usuarioLogado = JSON.parse(localStorage.getItem("usuario"));
    const isAdmin = usuarioLogado?.tipo === "ADMIN";

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

    const ordensFiltradas = ordens
        .filter((ordem) => {
            const textoBusca = busca.toLowerCase();

            const correspondeBusca =
                ordem.descricao?.toLowerCase().includes(textoBusca) ||
                ordem.cliente?.nome?.toLowerCase().includes(textoBusca) ||
                ordem.funcionario?.nome?.toLowerCase().includes(textoBusca) ||
                String(ordem.id).includes(textoBusca);

            const correspondeStatus =
                filtroStatus === "" || ordem.status === filtroStatus;

            return correspondeBusca && correspondeStatus;
        })
        .sort((a, b) => b.id - a.id);

    const totalPaginas = Math.ceil(ordensFiltradas.length / itensPorPagina);

    const ordensPaginadas = ordensFiltradas.slice(
        (paginaAtual - 1) * itensPorPagina,
        paginaAtual * itensPorPagina
    );

    return (

        <div>
            <h1>Ordens de Serviço</h1>

            {isAdmin && (
                <section style={theme.panel}>
                    <h2>
                        {editando ? "Editar Ordem" : "Nova Ordem"}
                    </h2>

                    <input
                        style={theme.input}
                        placeholder="Descrição do problema"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                    />

                    <select
                        style={theme.input}
                        value={clienteId}
                        onChange={(e) => setClienteId(e.target.value)}
                    >
                        <option value="">Selecione o cliente</option>

                        {clientes.map((cliente) => (
                            <option key={cliente.id} value={cliente.id}>
                                {cliente.nome}
                            </option>
                        ))}
                    </select>

                    <select
                        style={theme.input}
                        value={funcionarioId}
                        onChange={(e) => setFuncionarioId(e.target.value)}
                    >
                        <option value="">Selecione o funcionário</option>

                        {funcionarios.map((funcionario) => (
                            <option key={funcionario.id} value={funcionario.id}>
                                {funcionario.nome}
                            </option>
                        ))}
                    </select>

                    <button style={theme.button} onClick={salvarOrdem}>
                        {editando ? "Salvar Alterações" : "Abrir Ordem"}
                    </button>

                    {editando && (
                        <button
                            style={{
                                ...theme.button,
                                background: "#6c757d",
                                marginTop: "10px"
                            }}
                            onClick={cancelarEdicao}
                        >
                            Cancelar Edição
                        </button>
                    )}
                </section>
            )}

            <section style={theme.panel}>
                <h2>Ordens Cadastradas</h2>
                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                        marginBottom: "20px"
                    }}
                >
                    <input
                        style={{
                            ...theme.input,
                            flex: "1",
                            minWidth: "220px"
                        }}
                        placeholder="Buscar por ID, descrição, cliente ou funcionário"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />

                    <select
                        style={{
                            ...theme.input,
                            maxWidth: "220px"
                        }}
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                    >
                        <option value="">Todos os status</option>
                        <option value="ABERTA">Aberta</option>
                        <option value="EM_ANDAMENTO">Em andamento</option>
                        <option value="AGUARDANDO_PECA">Aguardando peça</option>
                        <option value="FINALIZADA">Finalizada</option>
                        <option value="ENTREGUE">Entregue</option>
                        <option value="CANCELADA">Cancelada</option>
                        <option value="FECHADA">Fechada</option>
                    </select>
                </div>

                <p>
                    Exibindo {ordensFiltradas.length} de {ordens.length} ordens.
                </p>

                {ordens.length === 0 ? (
                    <p>Nenhuma ordem cadastrada.</p>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                ...theme.table,
                                minWidth: "1200px"
                            }}
                        >
                            <thead>
                                <tr>
                                    <th style={theme.th}>ID</th>

                                    <th style={theme.th}>Descrição</th>

                                    <th
                                        style={{
                                            ...theme.th,
                                            minWidth: "160px"
                                        }}
                                    >
                                        Status
                                    </th>

                                    <th style={theme.th}>Cliente</th>

                                    <th style={theme.th}>Funcionário</th>

                                    <th style={theme.th}>Abertura</th>

                                    <th style={theme.th}>Fechamento</th>

                                    <th style={theme.th}>Ação</th>
                                </tr>
                            </thead>

                            <tbody>
                                {ordensPaginadas.map((ordem) => (
                                    <tr key={ordem.id}>

                                        <td style={theme.td}>
                                            {ordem.id}
                                        </td>

                                        <td style={theme.td}>
                                            {ordem.descricao}
                                        </td>

                                        <td style={theme.td}>
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

                                        <td style={theme.td}>
                                            {ordem.cliente?.nome}
                                        </td>

                                        <td style={theme.td}>
                                            {ordem.funcionario?.nome}
                                        </td>

                                        <td style={theme.td}>
                                            {formatarDataHora(ordem.dataAbertura)}
                                        </td>

                                        <td style={theme.td}>
                                            {ordem.dataFechamento
                                                ? formatarDataHora(ordem.dataFechamento)
                                                : "Em aberto"}
                                        </td>

                                        <td style={theme.td}>
                                            <div style={styles.actionButtons}>

                                                <button
                                                    style={theme.smallButton}
                                                    onClick={() => navigate(`/ordens/${ordem.id}`)}
                                                >
                                                    Detalhes
                                                </button>

                                                <button
                                                    style={theme.smallButton}
                                                    onClick={() => gerarPdfOrdem(ordem)}
                                                >
                                                    PDF
                                                </button>

                                                <button
                                                    style={theme.smallButton}
                                                    onClick={() => carregarAnexos(ordem.id)}
                                                >
                                                    Anexos
                                                </button>

                                                {isAdmin && (
                                                    <>
                                                        <button
                                                            style={theme.smallButton}
                                                            onClick={() => editarOrdem(ordem)}
                                                        >
                                                            Editar
                                                        </button>

                                                        <button
                                                            style={{
                                                                ...theme.smallButton,
                                                                background: "#d9534f"
                                                            }}
                                                            onClick={() => excluirOrdem(ordem.id)}
                                                        >
                                                            Excluir
                                                        </button>
                                                    </>
                                                )}

                                                <select
                                                    value={ordem.status}
                                                    onChange={(e) =>
                                                        atualizarStatus(ordem.id, e.target.value)
                                                    }
                                                    style={{
                                                        padding: "8px",
                                                        borderRadius: "8px",
                                                        border: "1px solid #ccc",
                                                        fontWeight: "bold"
                                                    }}
                                                >

                                                    <option value="ABERTA">
                                                        Aberta
                                                    </option>

                                                    <option value="EM_ANDAMENTO">
                                                        Em andamento
                                                    </option>

                                                    <option value="AGUARDANDO_PECA">
                                                        Aguardando peça
                                                    </option>

                                                    <option value="FINALIZADA">
                                                        Finalizada
                                                    </option>

                                                    <option value="ENTREGUE">
                                                        Entregue
                                                    </option>

                                                    <option value="CANCELADA">
                                                        Cancelada
                                                    </option>

                                                    <option value="FECHADA">
                                                        Fechada
                                                    </option>

                                                </select>
                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "10px",
                                marginTop: "20px",
                                flexWrap: "wrap"
                            }}
                        >
                            <button
                                style={theme.smallButton}
                                disabled={paginaAtual === 1}
                                onClick={() => setPaginaAtual(paginaAtual - 1)}
                            >
                                Anterior
                            </button>

                            <span
                                style={{
                                    fontWeight: "bold"
                                }}
                            >
                                Página {paginaAtual} de {totalPaginas}
                            </span>

                            <button
                                style={theme.smallButton}
                                disabled={paginaAtual === totalPaginas}
                                onClick={() => setPaginaAtual(paginaAtual + 1)}
                            >
                                Próxima
                            </button>
                        </div>
                    </div>

                )}
            </section>

            {ordemSelecionada && (
                <section style={theme.panel}>
                    <h2>Anexos da Ordem #{ordemSelecionada}</h2>

                    <input
                        style={theme.input}
                        type="file"
                        onChange={(e) => setArquivoSelecionado(e.target.files[0])}
                    />

                    <button style={theme.button} onClick={enviarAnexo}>
                        Enviar Anexo
                    </button>

                    <h3 style={{ marginTop: "20px" }}>
                        Arquivos anexados
                    </h3>

                    {anexos.length === 0 ? (
                        <p>Nenhum anexo encontrado.</p>
                    ) : (
                        <table style={theme.table}>
                            <thead>
                                <tr>
                                    <th style={theme.th}>ID</th>
                                    <th style={theme.th}>Arquivo</th>
                                    <th style={theme.th}>Tipo</th>
                                    <th style={theme.th}>Ação</th>
                                </tr>
                            </thead>

                            <tbody>
                                {anexos.map((anexo) => (
                                    <tr key={anexo.id}>
                                        <td style={theme.td}>{anexo.id}</td>
                                        <td style={theme.td}>{anexo.nomeArquivo}</td>
                                        <td style={theme.td}>{anexo.tipoArquivo}</td>

                                        <td style={theme.td}>
                                            <button
                                                style={theme.smallButton}
                                                onClick={() =>
                                                    baixarAnexo(anexo.id, anexo.nomeArquivo)
                                                }
                                            >
                                                Baixar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            )}
        </div>
    );
}

export default Ordens;