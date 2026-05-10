import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Usuarios from "./pages/Usuarios";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Ordens from "./pages/Ordens";
import Clientes from "./pages/Clientes";
import Funcionarios from "./pages/Funcionarios";
import Layout from "./components/Layout";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" />;
  }

  return children;
}

function AdminRoute({ children }) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario || usuario.tipo !== "ADMIN") {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/ordens"
          element={
            <PrivateRoute>
              <Layout>
                <Ordens />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/clientes"
          element={
            <PrivateRoute>
              <AdminRoute>
                <Layout>
                  <Clientes />
                </Layout>
              </AdminRoute>
            </PrivateRoute>
          }
        />

        <Route
        path="/usuarios"
        element={
          <PrivateRoute>
            <AdminRoute>
              <Layout>
                <Usuarios />
              </Layout>
            </AdminRoute>
          </PrivateRoute>
        }
      />

        <Route
          path="/funcionarios"
          element={
            <PrivateRoute>
              <AdminRoute>
                <Layout>
                  <Funcionarios />
                </Layout>
              </AdminRoute>
            </PrivateRoute>
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