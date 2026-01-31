import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import cors from 'cors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" }, path: '/socket.io' });

app.use(cors(), express.json());

const upload = multer({ storage: multer.memoryStorage() });
const VAULT = path.join(__dirname, 'vault');
if (!fs.existsSync(VAULT)) fs.mkdirSync(VAULT);

// A senha mestra para provar que merece ter um nick
const MASTER_PASS = "lealdade"; 

// --- CONFIGURAÇÃO ANTI-FLOOD ---
const FLOOD_LIMIT = 5; // Máximo de mensagens por janela
const FLOOD_WINDOW = 2000; // Janela de 2 segundos
const userMessageLog = new Map(); // Mapa para monitorar timestamps por socket

app.post('/api/upload', upload.single('fileToUpload'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send("No file");
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('time', '24h');
        form.append('fileToUpload', req.file.buffer, { filename: req.file.originalname, contentType: req.file.mimetype });
        const response = await axios.post('https://litterbox.catbox.moe/resources/internals/api.php', form, { headers: form.getHeaders(), timeout: 60000 });
        res.send(response.data);
    } catch (error) { res.status(500).send("Upload failed"); }
});



io.on('connection', (socket) => {
    // Inicializa log de mensagens para o novo socket
    userMessageLog.set(socket.id, []);

    // Registro inicial do usuário
    socket.on('register-user', (data) => { 
        socket.userData = { ...data, id: socket.id }; 
        updateOnline(); 
    });

    socket.on('join-channel', (hash) => {
        socket.join(hash);
        const file = path.join(VAULT, `${hash}.enc`);
        if (fs.existsSync(file)) {
            const history = fs.readFileSync(file, 'utf-8').trim().split('\n').map(line => {
                try { return JSON.parse(line); } catch (e) { return null; }
            }).filter(Boolean);
            socket.emit('history', history);
        }
    });

    socket.on('send-message', ({ channelHash, payload, isBurnCommand }) => {
        // --- LÓGICA ANTI-FLOOD/DDOS NO BACKEND ---
        const now = Date.now();
        const timestamps = userMessageLog.get(socket.id) || [];
        
        // Filtra timestamps dentro da janela permitida
        const recentMessages = timestamps.filter(ts => now - ts < FLOOD_WINDOW);
        
        if (recentMessages.length >= FLOOD_LIMIT) {
            console.warn(`[WARN] Flood detectado do socket: ${socket.id}. Bloqueando pacote.`);
            // Opcional: Desconectar o engraçadinho
            // socket.disconnect(); 
            return; 
        }

// COMANDO DE AUTODESTRUIÇÃO
    if (isBurnCommand === true) {
        const file = path.join(VAULT, `${channelHash}.enc`);
        if (fs.existsSync(file)) {
            fs.unlinkSync(file); // Apaga o arquivo fisicamente
            console.log(`[BURN] Histórico da sala ${channelHash} foi incinerado.`);
            
            // Avisa a todos na sala para limparem suas telas
            io.to(channelHash).emit('history', []); 
            return; 
        }
    }

        // Adiciona o timestamp atual ao log do usuário
        recentMessages.push(now);
        userMessageLog.set(socket.id, recentMessages);

        // --- SALVAMENTO E TRANSMISSÃO (Metadados já estão dentro do payload cifrado) ---
        const file = path.join(VAULT, `${channelHash}.enc`);
        
        // O servidor apenas salva o "envelope" (iv + ciphertext) sem saber o que tem dentro
        fs.appendFileSync(file, JSON.stringify(payload) + '\n');
        
        // Retransmite para os outros usuários na sala
        io.to(channelHash).emit('new-message', payload);
    });

    // Validação de Identidade
    socket.on('validate-nick-pass', ({ pass }, callback) => {
        if (pass === MASTER_PASS) {
            if (callback) callback({ success: true });
        } else {
            if (callback) callback({ success: false });
        }
    });

    // Sistema de Reação e Votos
    socket.on('cast-vote', ({ channelHash, msgId, optionIndex }) => {
        io.to(channelHash).emit('update-poll', { msgId, optionIndex });
    });

    socket.on('add-reaction', ({ channelHash, msgId, emoji }) => {
        io.to(channelHash).emit('update-reaction', { msgId, emoji });
    });

    socket.on('disconnect', () => {
        userMessageLog.delete(socket.id); // Limpa rastro de flood ao sair
        updateOnline();
    });

    function updateOnline() {
        const users = Array.from(io.sockets.sockets.values())
            .map(s => s.userData)
            .filter(Boolean);
        io.emit('online-list', users);
    }
});

const PORT = 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`
    🌑 UNDERLAND 
    PORT: ${PORT}
    MASTER_KEY: ${MASTER_PASS}
    ANTI-FLOOD: ENABLED (${FLOOD_LIMIT} msg / ${FLOOD_WINDOW}ms)
    `);
});