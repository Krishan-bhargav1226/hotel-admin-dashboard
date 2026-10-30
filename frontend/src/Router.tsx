import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppEndPoints } from "./utils/route-endpoints/AppEndPoints";
import Layout from "./pages/layouts/Layout";
import { StaticRoutes } from "./utils/routes/StaticRoutes";
import ProtectedRoute from "./utils/auth/ProtectedRoute";
import PageLoading from "./components/ui/PageLoading";

const LoginPage = lazy(() => import("./pages/login/LoginPage"));
const NotFoundPage = lazy(() => import("./pages/not-found/NotFoundPage"));

const AppRouter = () => {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* Public Authentication Route */}
        <Route
          path={AppEndPoints.LOGIN}
          element={
            <Suspense fallback={<PageLoading />}>
              <LoginPage />
            </Suspense>
          }
        />

        {/* Protected Dashboard & Operations Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path={AppEndPoints.DASHBOARD} element={<Layout />}>
            {StaticRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
            <Route
              path="*"
              element={
                <Suspense fallback={<PageLoading />}>
                  <NotFoundPage />
                </Suspense>
              }
            />
          </Route>
        </Route>

        {/* Fallback for unauthenticated access */}
        <Route path="*" element={<Navigate to={AppEndPoints.LOGIN} replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
