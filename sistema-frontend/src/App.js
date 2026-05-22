import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Usuarios from "./pages/Usuarios";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Ordens from "./pages/Ordens";
import OrdemDetalhe from "./pages/OrdemDetalhe";
import Clientes from "./pages/Clientes";
import Funcionarios from "./pages/Funcionarios";
import Layout from "./components/Layout";

function getUsuarioLogado() {
  try {
    return JSON.parse(localStorage.getItem("usuario"));
  } catch {
    localStorage.removeItem("usuario");
    return null;
  }
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const usuario = getUsuarioLogado();

  if (!usuario || usuario.tipo !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function ProtectedLayout({ children }) {
  return (
    <PrivateRoute>
      <Layout>
        {children}
      </Layout>
    </PrivateRoute>
  );
}

function AdminLayout({ children }) {
  return (
    <PrivateRoute>
      <AdminRoute>
        <Layout>
          {children}
        </Layout>
      </AdminRoute>
    </PrivateRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />

        <Route
          path="/ordens"
          element={
            <ProtectedLayout>
              <Ordens />
            </ProtectedLayout>
          }
        />

        <Route
          path="/ordens/:id"
          element={
            <ProtectedLayout>
              <OrdemDetalhe />
            </ProtectedLayout>
          }
        />

        <Route
          path="/clientes"
          element={
            <AdminLayout>
              <Clientes />
            </AdminLayout>
          }
        />

        <Route
          path="/usuarios"
          element={
            <AdminLayout>
              <Usuarios />
            </AdminLayout>
          }
        />

        <Route
          path="/funcionarios"
          element={
            <AdminLayout>
              <Funcionarios />
            </AdminLayout>
          }
        />

        <Route
          path="*"
          element={
            localStorage.getItem("token")
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/" replace />
          }
        />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={localStorage.getItem("tema") === "dark" ? "dark" : "light"}
      />
    </BrowserRouter>
  );
}

export default App;