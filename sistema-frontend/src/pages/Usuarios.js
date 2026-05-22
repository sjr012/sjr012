import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import API_URL, {
    getAuthHeaders,
    apiFetch
} from "../services/api";

import useTheme from "../hooks/useTheme";

function Usuarios() {

    const theme = useTheme();

    const [usuarios, setUsuarios] = useState([]);
    const [nome, setNome] = useState("");
    const [login, setLogin] = useState("");
    const [senha, setSenha] = useState("");
    const [tipo, setTipo] = useState("");

    useEffect(() => {
        carregarUsuarios();
    }, []);

    const carregarUsuarios = async () => {

        const response = await apiFetch(`${API_URL}/usuarios`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();
        setUsuarios(data);
    };

    const cadastrarUsuario = async () => {

        if (!nome || !login || !senha || !tipo) {

            toast.warning("Preencha todos os campos.");
            return;
        }

        const response = await apiFetch(`${API_URL}/usuarios`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                nome,
                login,
                senha,
                tipo
            })
        });

        if (!response.ok) {

            toast.error("Erro ao cadastrar usuário.");
            return;
        }

        toast.success("Usuário cadastrado com sucesso!");

        setNome("");
        setLogin("");
        setSenha("");
        setTipo("");

        carregarUsuarios();
    };

    return (
        <div>

            <h1 style={theme.pageTitle}>
                Usuários
            </h1>

            <section style={theme.panel}>

                <h2>Novo Usuário</h2>

                <input
                    style={theme.input}
                    placeholder="Nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                />

                <input
                    style={theme.input}
                    placeholder="Login"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                />

                <input
                    style={theme.input}
                    type="password"
                    placeholder="Senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                />

                <select
                    style={{
                        ...theme.input,
                        cursor: "pointer"
                    }}
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                >

                    <option value="" disabled>
                        Selecione o tipo de usuário
                    </option>

                    <option value="ADMIN">
                        Administrador
                    </option>

                    <option value="FUNCIONARIO">
                        Funcionário
                    </option>

                </select>

                <button
                    style={theme.button}
                    onClick={cadastrarUsuario}
                >
                    Cadastrar Usuário
                </button>

            </section>

            <section style={theme.panel}>

                <h2>Usuários Cadastrados</h2>

                <table style={theme.table}>

                    <thead>

                        <tr>
                            <th style={theme.th}>ID</th>
                            <th style={theme.th}>Nome</th>
                            <th style={theme.th}>Login</th>
                            <th style={theme.th}>Tipo</th>
                        </tr>

                    </thead>

                    <tbody>

                        {usuarios.map((usuario) => (

                            <tr key={usuario.id}>

                                <td style={theme.td}>
                                    {usuario.id}
                                </td>

                                <td style={theme.td}>
                                    {usuario.nome}
                                </td>

                                <td style={theme.td}>
                                    {usuario.login}
                                </td>

                                <td style={theme.td}>
                                    {usuario.tipo}
                                </td>

                            </tr>
                        ))}

                    </tbody>

                </table>

            </section>

        </div>
    );
}

export default Usuarios;