
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  Streamlit,
  withStreamlitConnection,
} from "streamlit-component-lib";

import App from "./App";
import "./styles.css";

function ChromifyApp(props) {
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      Streamlit.setFrameHeight();
    });

    resizeObserver.observe(document.body);

    Streamlit.setFrameHeight();

    return () => resizeObserver.disconnect();
  }, []);

  return <App {...props} />;
}

const ConnectedApp = withStreamlitConnection(ChromifyApp);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConnectedApp />
  </React.StrictMode>
);

Streamlit.setComponentReady();
