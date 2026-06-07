import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import API_URL, { getAuthHeaders } from "../services/api";
import useTheme from "../hooks/useTheme";

function Funcionarios() {
    const theme = useTheme();

    const [funcionarios, setFuncionarios] = useState([]);
    const [busca, setBusca] = useState("");

    const [nome, setNome] = useState("");
    const [cargo, setCargo] = useState("");

    const [editando, setEditando] = useState(false);
    const [funcionarioEditando, setFuncionarioEditando] = useState(null);

    useEffect(() => {
        carregarFuncionarios();
    }, []);

    const carregarFuncionarios = async () => {
        const response = await fetch(`${API_URL}/funcionarios`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();
        setFuncionarios(data);
    };

    const salvarFuncionario = async () => {
        if (!nome || !cargo) {
            toast.warning("Preencha todos os campos.");
            return;
        }

        const url = editando
            ? `${API_URL}/funcionarios/${funcionarioEditando}`
            : `${API_URL}/funcionarios`;

        const metodo = editando ? "PUT" : "POST";

        const response = await fetch(url, {
            method: metodo,
            headers: getAuthHeaders(),
            body: JSON.stringify({
                nome,
                cargo
            })
        });

        if (!response.ok) {
            toast.error("Erro ao salvar funcionário.");
            return;
        }

        toast.success(
            editando
                ? "Funcionário atualizado com sucesso!"
                : "Funcionário cadastrado com sucesso!"
        );

        setNome("");
        setCargo("");
        setEditando(false);
        setFuncionarioEditando(null);

        carregarFuncionarios();
    };

    const editarFuncionario = (funcionario) => {
        setEditando(true);
        setFuncionarioEditando(funcionario.id);

        setNome(funcionario.nome);
        setCargo(funcionario.cargo);
    };

    const excluirFuncionario = async (id) => {
        if (!window.confirm("Deseja realmente excluir este funcionário?")) {
            return;
        }

        const response = await fetch(`${API_URL}/funcionarios/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            toast.error("Erro ao excluir funcionário.");
            return;
        }

        toast.success("Funcionário excluído com sucesso!");
        carregarFuncionarios();
    };

    const cancelarEdicao = () => {
        setNome("");
        setCargo("");
        setEditando(false);
        setFuncionarioEditando(null);
    };

    const funcionariosFiltrados = funcionarios.filter((funcionario) =>
        funcionario.nome?.toLowerCase().includes(busca.toLowerCase()) ||
        funcionario.cargo?.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <div>
            <h1 style={theme.pageTitle}>Funcionários</h1>

            <section style={theme.panel}>
                <h2>{editando ? "Editar Funcionário" : "Novo Funcionário"}</h2>

                <input
                    style={theme.input}
                    placeholder="Nome do funcionário"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                />

                <input
                    style={theme.input}
                    placeholder="Cargo"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                />

                <button style={theme.button} onClick={salvarFuncionario}>
                    {editando ? "Salvar Alterações" : "Cadastrar Funcionário"}
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

            <section style={theme.panel}>
                <h2>Funcionários Cadastrados</h2>

                <input
                    style={theme.input}
                    placeholder="Buscar por nome ou cargo"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />

                {funcionariosFiltrados.length === 0 ? (
                    <p>Nenhum funcionário encontrado.</p>
                ) : (
                    <table style={theme.table}>
                        <thead>
                            <tr>
                                <th style={theme.th}>ID</th>
                                <th style={theme.th}>Nome</th>
                                <th style={theme.th}>Cargo</th>
                                <th style={theme.th}>Ação</th>
                            </tr>
                        </thead>

                        <tbody>
                            {funcionariosFiltrados.map((funcionario) => (
                                <tr key={funcionario.id}>
                                    <td style={theme.td}>{funcionario.id}</td>
                                    <td style={theme.td}>{funcionario.nome}</td>
                                    <td style={theme.td}>{funcionario.cargo}</td>
                                    <td style={theme.td}>
                                        <button
                                            style={theme.smallButton}
                                            onClick={() => editarFuncionario(funcionario)}
                                        >
                                            Editar
                                        </button>

                                        <button
                                            style={{
                                                ...theme.smallButton,
                                                background: "#d9534f",
                                                marginLeft: "8px"
                                            }}
                                            onClick={() => excluirFuncionario(funcionario.id)}
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
}

export default Funcionarios;