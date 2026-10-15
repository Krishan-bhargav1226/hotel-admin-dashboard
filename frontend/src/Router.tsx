import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppEndPoints } from "./utils/rout-endpoints/AppEndPoints";
import Layout from "./pages/layouts/Layout";
import { StaticRoutes } from "./utils/routes/StaticRoutes";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path={AppEndPoints.DASHBOARD} element={<Layout />}>
          {StaticRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
          <Route path="*" element={<Navigate to={AppEndPoints.DASHBOARD} replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
