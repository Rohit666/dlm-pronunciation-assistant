import { useEffect } from "react";

import { useLocation } from "react-router-dom";

import NProgress from "nprogress";

function RouteProgress() {
  const location = useLocation();

  useEffect(() => {
    NProgress.start();

    const timeout = setTimeout(() => {
      NProgress.done();
    }, 400);

    return () => {
      clearTimeout(timeout);

      NProgress.done();
    };
  }, [location]);

  return null;
}

export default RouteProgress;
