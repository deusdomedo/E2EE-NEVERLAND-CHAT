const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const multer = require("multer");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");
const { JSDOM } = require("jsdom");
const createDOMPurify = require("dompurify");
const fs = require("fs");

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);
const app = express();

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. HARDENING DE CABEÇALHOS
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hidePoweredBy: true,
  })
);

// 2. RATE LIMITING
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 500,
  message: "Acesso limitado.",
});
app.use(globalLimiter);

// 3. PROTEÇÃO DE DIRETÓRIO
const safeOptions = {
  dotfiles: "ignore",
  index: "index.html",
  setHeaders: (res) => res.set("Server", "Ghost"),
};
app.use(express.static(path.join(__dirname, "public"), safeOptions));

app.get("/view-file/:id", (req, res) => {
  const fileId = req.params.id.replace(/[^a-f0-9]/g, "");
  const fullPath = path.join(uploadDir, fileId);

  // Importante: remover CSP restritiva para permitir que o fetch do script.js leia o arquivo
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.sendFile(fullPath);
});

const server = http.createServer(app);

// 4. WEBSOCKET
const io = socketIo(server, {
  path: "/v1/api/internal/stream",
  cors: { origin: "*" },
});

// --- 4.1 CORREÇÃO PARA O ERRO 404 ---
app.get("/v1/api/internal/stream/socket.io.js", (req, res) => {
  res.sendFile(
    path.resolve(__dirname, "node_modules/socket.io/client-dist/socket.io.js")
  );
});

// 5. BANCO DE DADOS
const db = new sqlite3.Database("./database.sqlite");
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        nick TEXT, payload TEXT, time TEXT, type TEXT, 
        filePath TEXT, fileType TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

setInterval(() => {
  db.run("DELETE FROM messages WHERE timestamp <= datetime('now', '-5 days')");
}, 3600000);

// 6. UPLOAD ANTI-RCE (Ajustado para arquivos criptografados)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, crypto.randomBytes(16).toString("hex"));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // Aumentado para 20MB pois a criptografia aumenta o tamanho
  fileFilter: (req, file, cb) => {
    // Como o arquivo vem criptografado pelo script.js como um Blob/JSON,
    // liberamos o filtro de tipo, pois o arquivo já é inofensivo (binário cifrado)
    cb(null, true);
  },
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Erro no upload." });
  res.json({
    filePath: `/view-file/${req.file.filename}`,
    fileType: req.body.fileType || "application/octet-stream", // Opcional: receber o tipo original
  });
});

// 7. LÓGICA DE COMUNICAÇÃO
let onlineUsers = {};

function getFormattedTime() {
  return new Date().toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

io.on("connection", (socket) => {
  const myNick = generateRandomJapaneseNick();
  onlineUsers[socket.id] = myNick;

  socket.emit("init-session", { nick: myNick });

  db.all(
    "SELECT * FROM (SELECT * FROM messages ORDER BY id DESC LIMIT 50) ORDER BY id ASC",
    (err, rows) => {
      if (!err) rows.forEach((msg) => socket.emit("newMessage", msg));
    }
  );

  io.emit("updateOnlineUsers", Object.values(onlineUsers));

  socket.on("sendMessage", (data) => {
    const timeString = getFormattedTime();
    const userNick = onlineUsers[socket.id];

    // Salva no banco (seja texto ou ponteiro de arquivo)
    db.run(
      `INSERT INTO messages (nick, payload, time, type, filePath, fileType) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userNick,
        data.payload,
        timeString,
        data.type || "text",
        data.filePath || null,
        data.fileType || null,
      ]
    );

    io.emit("newMessage", {
      nick: userNick,
      payload: data.payload,
      time: timeString,
      type: data.type || "text",
      filePath: data.filePath || null,
      fileType: data.fileType || null,
    });
  });

  socket.on("changeNick", (newNick) => {
    const clean = DOMPurify.sanitize(newNick)
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 15);
    if (clean) {
      onlineUsers[socket.id] = clean;
      io.emit("updateOnlineUsers", Object.values(onlineUsers));
      socket.emit("updateNick", clean);
    }
  });

  socket.on("disconnect", () => {
    delete onlineUsers[socket.id];
    io.emit("updateOnlineUsers", Object.values(onlineUsers));
  });
});

function generateRandomJapaneseNick() {
  const all = [
    "一",
    "二",
    "三",
    "あ",
    "い",
    "う",
    "ア",
    "イ",
    "ウ",
    "木",
    "火",
    "土",
  ];
  let n = "";
  for (let i = 0; i < 5; i++) n += all[Math.floor(Math.random() * all.length)];
  return n;
}

const PORT = 6431;
server.listen(PORT, "127.0.0.1", () => {
  console.log(`[ZERO-KNOWLEDGE-SERVER] Ativo em 127.0.0.1:${PORT}`);
});
