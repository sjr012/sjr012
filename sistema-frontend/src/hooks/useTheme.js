import { useEffect, useState } from "react";
import { getTheme } from "../styles/theme";

export default function useTheme() {
    const [theme, setTheme] = useState(getTheme());

    useEffect(() => {
        const atualizarTema = () => {
            setTheme(getTheme());
        };

        window.addEventListener("temaAlterado", atualizarTema);

        return () => {
            window.removeEventListener("temaAlterado", atualizarTema);
        };
    }, []);

    return theme;
}