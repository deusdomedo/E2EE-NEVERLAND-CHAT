# 🥀 E2EE NEVERLAND CHAT

![Security Badge](https://img.shields.io/badge/Security-OPSEC%20Ready-red)
![Encryption](https://img.shields.io/badge/Encryption-AES--256--GCM-green)
![Tech Stack](https://img.shields.io/badge/Stack-TS%20%7C%20Tailwind%20%7C%20Vite%20%7C%20Node-blue)

O **E2EE NEVERLAND CHAT** é um sistema de comunicação IRC ultra-privado, projetado sob os princípios de **Zero-Knowledge Architecture**. Diferente de chats convencionais, aqui a privacidade não é uma opção, é a fundação matemática do projeto.

## 🛡️ Pilares de Segurança (OPSEC)

* **Criptografia de Ponta a Ponta (E2EE):** Todas as mensagens e arquivos são cifrados via `AES-256-GCM` no navegador do remetente. O servidor atua apenas como um relay cego.
* **Zero-Knowledge Storage:** A VPS armazena apenas payloads `.enc`. Mesmo em caso de invasão total da infraestrutura, o conteúdo permanece inacessível sem a chave privada.
* **Proteção Anti-XSS (Hardened CSP):** Implementação rigorosa de **Content Security Policy**, bloqueando execuções `unsafe-inline` e `unsafe-eval` para impedir o roubo de chaves da memória RAM.
* **Derivação de Chave Robusta:** Utiliza `PBKDF2` com 100.000 iterações e `SALT` dinâmico para garantir resiliência contra ataques de força bruta.

<img src="https://i.ibb.co.com/ks25HrzG/image.png" width="400">

## 🚀 Funcionalidades

* 💬 **Chat em Tempo Real:** Engine baseada em WebSockets de baixa latência.
* 📁 **Mídia Segura:** Processamento de imagens, vídeos e documentos via `Uint8Array` e `Blobs` criptografados.
* 🔔 **Notificações Stealth:** Alertas sonoros e visuais inteligentes que respeitam o foco da janela.
* ⌨️ **Indicador de Atividade:** Monitoramento de digitação em tempo real integrado ao socket.

## 🛠️ Stack Tecnológica

* **Frontend:** React + **TypeScript** + **Vite** (Performance e Tipagem Segura).
* **Styling:** **Tailwind CSS** (Arquitetura Utilitária e Design Dark).
* **Backend:** **Node.js** + Socket.io (Stream interno de alta performance).
* **Crypto API:** Web Crypto API (`window.crypto.subtle`).



## 🔧 Instalação e Deploy

1.  **Clonar o repositório:**
    ```bash
    git clone https://github.com/deusdomedo/e2ee-neverland-chat.git
    ```
2.  **Instalar dependências:**
    ```bash
    npm install
    ```
3.  **Configuração de Segurança:**
    Altere a constante `SALT` no core do projeto para uma string única antes do deploy na VPS.
4.  **Build e Start:**
    ```bash
    npm run build
    ```

## ⚠️ Aviso Legal (Disclaimer)

Este projeto foi desenvolvido para fins de investigação digital e privacidade extrema. A segurança final depende do comportamento do usuário. **Recomenda-se o uso de chaves complexas e navegação em modo incôgnito para mitigar rastros forenses de memória local (Blobs/Cache).**

---
<p align="center">
  Desenvolvido por <strong>Deusdomedo</strong> | Neverland Investigação Cibernética
</p>
