import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import API_URL, { getAuthHeaders } from "../services/api";
import useTheme from "../hooks/useTheme";

function Clientes() {
  const theme = useTheme();

  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  const [editando, setEditando] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    const response = await fetch(`${API_URL}/clientes`, {
      headers: getAuthHeaders()
    });

    const data = await response.json();
    setClientes(data);
  };

  const formatarTelefone = (valor) => {
    if (!valor) return "";

    valor = valor.replace(/\D/g, "");
    valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
    valor = valor.replace(/(\d{5})(\d)/, "$1-$2");

    return valor.substring(0, 15);
  };

  const salvarCliente = async () => {
    if (!nome || !telefone || !email) {
      toast.warning("Preencha todos os campos.");
      return;
    }

    const url = editando
      ? `${API_URL}/clientes/${clienteEditando}`
      : `${API_URL}/clientes`;

    const metodo = editando ? "PUT" : "POST";

    const response = await fetch(url, {
      method: metodo,
      headers: getAuthHeaders(),
      body: JSON.stringify({
        nome,
        telefone,
        email
      })
    });

    if (!response.ok) {
      toast.error("Erro ao salvar cliente.");
      return;
    }

    toast.success(
      editando
        ? "Cliente atualizado com sucesso!"
        : "Cliente cadastrado com sucesso!"
    );

    setNome("");
    setTelefone("");
    setEmail("");
    setEditando(false);
    setClienteEditando(null);

    carregarClientes();
  };

  const editarCliente = (cliente) => {
    setEditando(true);
    setClienteEditando(cliente.id);

    setNome(cliente.nome);
    setTelefone(cliente.telefone);
    setEmail(cliente.email);
  };

  const excluirCliente = async (id) => {
    if (!window.confirm("Deseja realmente excluir este cliente?")) {
      return;
    }

    const response = await fetch(`${API_URL}/clientes/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      toast.error("Erro ao excluir cliente.");
      return;
    }

    toast.success("Cliente excluído com sucesso!");
    carregarClientes();
  };

  const cancelarEdicao = () => {
    setNome("");
    setTelefone("");
    setEmail("");
    setEditando(false);
    setClienteEditando(null);
  };

  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.telefone?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      <h1 style={theme.pageTitle}>Clientes</h1>

      <section style={theme.panel}>
        <h2>{editando ? "Editar Cliente" : "Novo Cliente"}</h2>

        <input
          style={theme.input}
          placeholder="Nome do cliente"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          style={theme.input}
          placeholder="(00) 00000-0000"
          value={telefone}
          onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
        />

        <input
          style={theme.input}
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button style={theme.button} onClick={salvarCliente}>
          {editando ? "Salvar Alterações" : "Cadastrar Cliente"}
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
        <h2>Clientes Cadastrados</h2>

        <input
          style={theme.input}
          placeholder="Buscar por nome, telefone ou e-mail"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        {clientesFiltrados.length === 0 ? (
          <p>Nenhum cliente encontrado.</p>
        ) : (
          <table style={theme.table}>
            <thead>
              <tr>
                <th style={theme.th}>ID</th>
                <th style={theme.th}>Nome</th>
                <th style={theme.th}>Telefone</th>
                <th style={theme.th}>E-mail</th>
                <th style={theme.th}>Ação</th>
              </tr>
            </thead>

            <tbody>
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id}>
                  <td style={theme.td}>{cliente.id}</td>
                  <td style={theme.td}>{cliente.nome}</td>
                  <td style={theme.td}>
                    {formatarTelefone(cliente.telefone)}
                  </td>
                  <td style={theme.td}>{cliente.email}</td>
                  <td style={theme.td}>
                    <button
                      style={theme.smallButton}
                      onClick={() => editarCliente(cliente)}
                    >
                      Editar
                    </button>

                    <button
                      style={{
                        ...theme.smallButton,
                        background: "#d9534f",
                        marginLeft: "8px"
                      }}
                      onClick={() => excluirCliente(cliente.id)}
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

export default Clientes;