import App from "../server/index.js";

export default function handler(req, res) {
  return App(req, res);
}

