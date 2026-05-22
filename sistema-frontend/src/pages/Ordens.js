import { toast } from "react-toastify";
import useTheme from "../hooks/useTheme";
import { useEffect, useState } from "react";
import API_URL, { getAuthHeaders } from "../services/api";
import jsPDF from "jspdf";
import QRCode from "qrcode";

function Ordens() {

    const theme = useTheme();

    const [clientes, setClientes] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [ordens, setOrdens] = useState([]);

    const [arquivoSelecionado, setArquivoSelecionado] = useState(null);
    const [anexos, setAnexos] = useState([]);
    const [ordemSelecionada, setOrdemSelecionada] = useState(null);

    const [descricao, setDescricao] = useState("");
    const [clienteId, setClienteId] = useState("");
    const [funcionarioId, setFuncionarioId] = useState("");

    const [editando, setEditando] = useState(false);
    const [ordemEditando, setOrdemEditando] = useState(null);

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

    const styles = {
        actionButtons: {
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            alignItems: "center"
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

        doc.setFontSize(18);

        doc.text(
            "SYSTEC - Ordem de Serviço",
            20,
            20
        );

        doc.setFontSize(12);

        doc.text(`Número da OS: ${ordem.id}`, 20, 40);

        doc.text(
            `Descrição: ${ordem.descricao}`,
            20,
            50
        );

        doc.text(
            `Status: ${ordem.status}`,
            20,
            60
        );

        doc.text(
            `Cliente: ${ordem.cliente?.nome || ""}`,
            20,
            70
        );

        doc.text(
            `Funcionário: ${ordem.funcionario?.nome || ""}`,
            20,
            80
        );

        doc.text(
            `Data de Abertura: ${formatarDataHora(ordem.dataAbertura)}`,
            20,
            90
        );

        doc.text(
            `Data de Fechamento: ${ordem.dataFechamento
                ? formatarDataHora(ordem.dataFechamento)
                : "Em aberto"
            }`,
            20,
            100
        );

        // QR CODE
        doc.addImage(
            qrCode,
            "PNG",
            140,
            30,
            40,
            40
        );

        doc.text(
            "Escaneie para visualizar a OS",
            120,
            75
        );

        doc.line(20, 130, 180, 130);

        doc.text(
            "Assinatura do responsável",
            20,
            140
        );

        const pdfBlob = doc.output("blob");

        const pdfUrl = URL.createObjectURL(pdfBlob);

        window.open(pdfUrl, "_blank");
    };

    const pdfBlob = doc.output("blob");

    const pdfUrl = URL.createObjectURL(pdfBlob);

    window.open(pdfUrl, "_blank");
};

const usuarioLogado = JSON.parse(localStorage.getItem("usuario"));
const isAdmin = usuarioLogado?.tipo === "ADMIN";

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

            {ordens.length === 0 ? (
                <p>Nenhuma ordem cadastrada.</p>
            ) : (
                <table style={theme.table}>
                    <thead>
                        <tr>
                            <th style={theme.th}>ID</th>

                            <th style={theme.th}>Descrição</th>

                            <th style={theme.th}>Status</th>

                            <th style={theme.th}>Cliente</th>

                            <th style={theme.th}>Funcionário</th>

                            <th style={theme.th}>Abertura</th>

                            <th style={theme.th}>Fechamento</th>

                            <th style={theme.th}>Ação</th>
                        </tr>
                    </thead>

                    <tbody>
                        {ordens.map((ordem) => (
                            <tr key={ordem.id}>

                                <td style={theme.td}>
                                    {ordem.id}
                                </td>

                                <td style={theme.td}>
                                    {ordem.descricao}
                                </td>

                                <td style={theme.td}>
                                    <span
                                        style={
                                            ordem.status === "FECHADA"
                                                ? theme.statusFechada
                                                : theme.statusAberta
                                        }
                                    >
                                        {ordem.status}
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

                                        {ordem.status !== "FECHADA" && (
                                            <button
                                                style={theme.smallButton}
                                                onClick={() => fecharOrdem(ordem.id)}
                                            >
                                                Fechar
                                            </button>
                                        )}
                                    </div>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
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