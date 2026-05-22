import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import API_URL, {
    getAuthHeaders
} from "../services/api";

function OrdemDetalhe() {

    const { id } = useParams();

    const [ordem, setOrdem] = useState(null);

    useEffect(() => {
        carregarOrdem();
    }, []);

    const carregarOrdem = async () => {

        const response = await fetch(
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

    if (!ordem) {
        return <h2>Carregando ordem...</h2>;
    }

    return (
        <div style={{
            padding: "30px",
            fontFamily: "Arial"
        }}>

            <h1>
                Ordem de Serviço #{ordem.id}
            </h1>

            <hr />

            <p>
                <strong>Status:</strong> {ordem.status}
            </p>

            <p>
                <strong>Descrição:</strong> {ordem.descricao}
            </p>

            <p>
                <strong>Cliente:</strong> {ordem.cliente?.nome}
            </p>

            <p>
                <strong>Funcionário:</strong> {ordem.funcionario?.nome}
            </p>

            <p>
                <strong>Abertura:</strong> {ordem.dataAbertura}
            </p>

            <p>
                <strong>Fechamento:</strong> {
                    ordem.dataFechamento || "Em aberto"
                }
            </p>

        </div>
    );
}

export default OrdemDetalhe;