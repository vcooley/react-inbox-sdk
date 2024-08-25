import { createRoot } from "react-dom/client";

import App from "./App";

const rootElement = document.createElement("div");
rootElement.id = "react-inbox-sdk-example-root";
document.body.appendChild(rootElement);

const root = createRoot(rootElement);
root.render(<App />);
