(function () {
  "use strict";

  let groupKey = null;
  let socket = null;
  let isWindowActive = true;
  let typingTimeout = null;
  const SALT = "FIXED_SALT_UNDERLAND_2026";

  const chatWindow = document.getElementById("chat-window");
  const messageInput = document.getElementById("message-input");
  const typingIndicator = document.getElementById("typing-indicator");
  const notificationSound = document.getElementById("notification-sound");
  const onlineList = document.getElementById("online-users-list");
  const nickInput = document.getElementById("nick-input");
  const changeNickBtn = document.getElementById("change-nick-button");
  const sendBtn = document.getElementById("send-button");
  const enterChatBtn = document.getElementById("enter-chat-btn");

  // Novos elementos para cumprir a CSP blindada
  const attachBtn = document.getElementById("attach-button");
  const fileInput = document.getElementById("file-input");

  // --- CONTROLE DE JANELA ---
  window.onfocus = () => {
    isWindowActive = true;
    document.title = "E2EE CHAT";
  };
  window.onblur = () => {
    isWindowActive = false;
  };

  // --- CRIPTOGRAFIA ---
  async function derive(pwd) {
    const enc = new TextEncoder();
    const mat = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(pwd),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: enc.encode(SALT),
        iterations: 100000,
        hash: "SHA-256",
      },
      mat,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async function encryptData(data) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded =
      typeof data === "string" ? new TextEncoder().encode(data) : data;
    const enc = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      groupKey,
      encoded
    );
    return {
      iv: btoa(String.fromCharCode(...iv)),
      data: btoa(String.fromCharCode(...new Uint8Array(enc))),
    };
  }

  async function decryptData(payload) {
    try {
      const { iv, data } = JSON.parse(payload);
      const dec = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: Uint8Array.from(atob(iv), (c) => c.charCodeAt(0)),
        },
        groupKey,
        Uint8Array.from(atob(data), (c) => c.charCodeAt(0))
      );
      return dec;
    } catch (e) {
      return null;
    }
  }

  // --- RENDERIZAÇÃO DE MENSAGENS ---
  function appendMessage(nick, time, contentElement) {
    const row = document.createElement("div");
    row.className = "msg-row";
    row.innerHTML = `<span class="time">[${time}]</span> <span class="nick">${nick}:</span> `;
    row.appendChild(contentElement);
    chatWindow.appendChild(row);
    chatWindow.scrollTo(0, chatWindow.scrollHeight);

    if (!isWindowActive && notificationSound) {
      notificationSound.currentTime = 0;
      notificationSound.play().catch(() => {});
      document.title = "(*) NOVA MENSAGEM";
    }
  }

  // NOVA FUNÇÃO: Processa tanto arquivos novos quanto antigos
  async function processFileMessage(data) {
    try {
      const res = await fetch(data.filePath);
      const encryptedText = await res.text();
      const decryptedBuffer = await decryptData(encryptedText);
      if (!decryptedBuffer) return;

      const blob = new Blob([decryptedBuffer], { type: data.fileType });
      const url = URL.createObjectURL(blob);
      let media;

      if (data.fileType.startsWith("image/")) {
        media = document.createElement("img");
      } else if (data.fileType.startsWith("video/")) {
        media = document.createElement("video");
        media.controls = true;
      } else {
        media = document.createElement("a");
        media.href = url;
        media.download = "arquivo_seguro";
        media.textContent = "📎 Download Arquivo";
      }

      media.src = url;
      media.className = "chat-media";
      if (!data.fileType.startsWith("video/")) {
        media.onload = () => URL.revokeObjectURL(url);
      }
      appendMessage(data.nick, data.time, media);
    } catch (e) {
      console.error("Erro ao carregar arquivo do histórico", e);
    }
  }

  function setupSocket() {
    socket = io({ path: "/v1/api/internal/stream", transports: ["websocket"] });

    socket.on("updateOnlineUsers", (users) => {
      if (!onlineList) return;
      onlineList.innerHTML = "";
      users.forEach((nick) => {
        const li = document.createElement("li");
        li.textContent = nick;
        onlineList.appendChild(li);
      });
    });

    socket.on("newMessage", async (data) => {
      if (!groupKey) return;

      if (data.type === "typing") {
        const dec = await decryptData(data.payload);
        if (dec) {
          typingIndicator.textContent = `${data.nick} está digitando...`;
          clearTimeout(typingTimeout);
          typingTimeout = setTimeout(
            () => (typingIndicator.textContent = ""),
            3000
          );
        }
        return;
      }

      if (data.type === "file") {
        await processFileMessage(data);
      } else {
        const dec = await decryptData(data.payload);
        if (!dec) return;
        const text = new TextDecoder().decode(dec);
        const span = document.createElement("span");
        span.textContent = text;
        appendMessage(data.nick, data.time, span);
      }
    });
  }

  // --- ACÕES ---
  messageInput.addEventListener("input", async () => {
    if (socket && groupKey && messageInput.value.length > 0) {
      const encryptedSignal = await encryptData("typing");
      socket.emit("sendMessage", {
        type: "typing",
        payload: JSON.stringify(encryptedSignal),
      });
    }
  });

  async function sendText() {
    const text = messageInput.value.trim();
    if (text && groupKey) {
      const encrypted = await encryptData(text);
      socket.emit("sendMessage", {
        payload: JSON.stringify(encrypted),
        type: "text",
      });
      messageInput.value = "";
    }
  }

  async function sendFile(file) {
    if (!file || !groupKey) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const encrypted = await encryptData(new Uint8Array(e.target.result));
      const blob = new Blob([JSON.stringify(encrypted)], {
        type: "application/json",
      });
      const formData = new FormData();
      formData.append("file", blob, "file.enc");

      const res = await fetch("/upload", { method: "POST", body: formData });
      const result = await res.json();
      if (result.filePath) {
        socket.emit("sendMessage", {
          type: "file",
          filePath: result.filePath,
          fileType: file.type,
          payload: "ENC",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // --- INICIALIZAÇÃO ---
  enterChatBtn.onclick = async () => {
    const pwd = document.getElementById("secret-key-input").value;
    if (!pwd) return;

    if (notificationSound) {
      notificationSound
        .play()
        .then(() => {
          notificationSound.pause();
          notificationSound.currentTime = 0;
        })
        .catch(() => {});
    }

    groupKey = await derive(pwd);
    document.getElementById("password-modal").style.display = "none";
    setupSocket();

    // Atribuição de eventos (Unobtrusive JavaScript) para segurança CSP
    sendBtn.onclick = sendText;
    attachBtn.onclick = () => fileInput.click();

    messageInput.onkeypress = (e) => {
      if (e.key === "Enter") sendText();
    };

    changeNickBtn.onclick = () => {
      const val = nickInput.value.trim();
      if (val) socket.emit("changeNick", val);
    };

    fileInput.onchange = (e) => {
      if (e.target.files[0]) sendFile(e.target.files[0]);
    };
  };
})();
