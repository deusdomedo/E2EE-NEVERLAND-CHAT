# 🥀 E2EE NEVERLAND CHAT

![Security Badge](https://img.shields.io/badge/Security-OPSEC%20Ready-red)
![Encryption](https://img.shields.io/badge/Encryption-AES--256--GCM-green)
![Status](https://img.shields.io/badge/Status-Operational-blue)

O **NEVERLAND** é uma plataforma de comunicação efêmera baseada em arquitetura de **Conhecimento Zero (Zero-Knowledge)**. O sistema garante que a privacidade não dependa da confiança no administrador, mas sim da criptografia aplicada diretamente no cliente.

---

## ⚡ Funcionalidades Ativas

### 🛡️ Criptografia de Camada Total (Full-Payload)
Diferente de outros chats, o Neverland cifra o pacote completo de dados antes do envio. Isso inclui:
* **Conteúdo da Mensagem** (Texto e links).
* **Metadados de Identidade** (Seu Nick, sua cor e seus efeitos visuais).
* **Timestamp e Identificadores** (Hora do envio e IDs de sessão).
> Um interceptador de rede verá apenas um bloco binário de ruído, sem saber quem enviou ou o que foi dito.

### 🖼️ Sistema de Mídia e Stickers
O chat possui suporte nativo para comunicação visual sem comprometer a segurança:
* **Neural Stickers:** Menu rápido de figurinhas temáticas (Makima, Saber, etc.) pré-carregadas.
* **Upload Temporário:** Integração com API de armazenamento efêmero. Arquivos são enviados, criptografados no link e têm vida útil de 24h.
* **Inline Rendering:** Visualização direta de imagens e stickers dentro da timeline do chat com proteção de overflow.

### 🎭 Identidade Visual Dinâmica
Os usuários possuem controle total sobre sua presença no "Abismo":
* **Cores Customizadas:** Seletor de cores via paleta hexadecimal para o Nick e bordas de mensagens.
* **Efeitos de Status:** Comandos secretos para aplicar estados visuais permanentes no seu perfil (como o `effect-fire` e `effect-glitch`).
* **Visual Hacker:** Opção de envio de mensagens com o comando `/hacker`, que exibe uma animação de decodificação em tempo real para os destinatários.

### ☣️ Protocolo de Incineração (/burn)
O sistema conta com uma função de autodestruição física:
* Ao executar o comando `/burn`, o servidor localiza o arquivo `.enc` da sala e o deleta permanentemente do disco.
* O comando dispara um sinal de limpeza para todos os clientes conectados, removendo o histórico da memória RAM dos navegadores instantaneamente.

---

## 🛠️ Arquitetura do Sistema

| Componente | Implementação |
| :--- | :--- |
| **Real-time Core** | Socket.io com isolamento de salas por hashes SHA-256. |
| **Crypto Engine** | Web Crypto API (AES-GCM 256-bit) com derivação de chave via PBKDF2. |
| **Storage Layer** | Filesystem persistente via arquivos `.enc` (Cofres Cifrados). |
| **Anti-Abuse** | Lógica de Anti-Flood e Anti-DDOS implementada no servidor e no cliente. |
| **UI/UX** | React + Tailwind com motor de animação Framer Motion e efeitos CRT. |

---

## 🕹️ Comandos de Interação Global

Gatilhos que afetam a interface de todos os usuários na sala:

* `/expurgo`: Dispara um alerta sonoro e visual de emergência com tremor de tela.
* `/win`: Ativa a estética de vitória com chamas e brilho intenso na interface.
* `/jasabe`: Ativa o modo de intrusão hacker com scanlines de terminal.

---
