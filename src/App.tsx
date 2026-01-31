import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import listenSound from './listen.mp3';
import reactSound from './reacao.mp3'; 
import expurgoSound from './expurgo.mp3';
import winSound from './win.mp3';
import jasabeSound from './jasabe.mp3';

const socket = io({ 
    path: '/socket.io',
    transports: ['websocket', 'polling'] 
});

const K1 = ["闇", "影", "死", "霊", "獄", "骸", "毒", "血", "幽", "冥"];
const K2 = ["侍", "者", "魂", "鬼", "王", "兵", "神", "幻", "影", "殺"];

const STICKERS = {
    MAKIMA: [
        "https://i.pinimg.com/736x/ef/26/71/ef2671102b52b630f6d2590b9e09678b.jpg",
        "https://i.pinimg.com/736x/b4/a4/0c/b4a40caca675e43285fde112d939e6df.jpg",
        "https://i.pinimg.com/1200x/48/bd/1a/48bd1aa827205c31a7d6b82076775d6e.jpg",
        "https://i.pinimg.com/736x/fc/ad/0d/fcad0def3978a4fd9baacff417381edf.jpg",
        "https://i.pinimg.com/736x/39/48/f6/3948f6848fddb5128d32c49288d939d7.jpg"
    ],
    SABER: [
        "https://i.pinimg.com/736x/03/22/53/0322533d1450015dcf61639adab444cc.jpg",
        "https://i.pinimg.com/736x/86/b4/34/86b434b6eef278a51a926a87e44bc8a9.jpg",
        "https://i.pinimg.com/736x/3e/a6/ef/3ea6efda232656aa86756abed6e44a92.jpg",
        "https://i.pinimg.com/736x/cf/03/ba/cf03ba18cd6b534afc92ba4316ab0bb1.jpg",
        "https://i.pinimg.com/736x/e3/e7/4a/e3e74a4c2c458fd44a5cd7b966880d09.jpg",
        "https://i.pinimg.com/736x/5d/bf/8d/5dbf8d9eefc0c1eb1fa7ebfb77f3e3cd.jpg",
        "https://i.pinimg.com/736x/8f/5e/8c/8f5e8c2d0318cef6b6cc29a026003297.jpg",
        "https://i.pinimg.com/736x/0e/c1/56/0ec156677c44f0072aa2b6a8efcc9d1a.jpg",
        "https://i.pinimg.com/736x/c6/44/30/c64430ced0225bd6ce5dc890e388189e.jpg",
        "https://i.pinimg.com/736x/8b/e3/b7/8be3b7c28a3cea96ead967fad4744a55.jpg",
        "https://i.pinimg.com/736x/04/19/a8/0419a8a48b5977d1bd6e5f939d22839c.jpg",
        "https://i.pinimg.com/736x/56/b2/5a/56b25ac505c8369fdc1c5c7d94118e24.jpg",
        "https://i.pinimg.com/736x/8a/76/1b/8a761b73987b89f2bf895234226cda0e.jpg",
        "https://i.pinimg.com/736x/19/1c/c1/191cc11bf346781730551a38ece0427e.jpg",
        "https://i.pinimg.com/736x/96/62/cb/9662cb6834445bb2e51a50972726ffe1.jpg",
        "https://i.pinimg.com/736x/cf/31/db/cf31db5e7159e62a3353b2145e0f5a16.jpg",
        "https://i.pinimg.com/736x/21/80/e1/2180e1daac0c2e2c1183f5db192b7fbc.jpg",
        "https://i.pinimg.com/736x/c1/ff/52/c1ff524ecc56752b70f6cfc402b8dc5b.jpg",
        "https://i.pinimg.com/736x/ef/06/2e/ef062e3d14e29c0581b648d82332f2e6.jpg",
        "https://i.pinimg.com/736x/ab/2a/c1/ab2ac17976aa643238602d77d9f7d34c.jpg",
        "https://i.pinimg.com/736x/60/f7/18/60f718bb67c93e864826bf18b5b2cb5c.jpg",
        "https://i.pinimg.com/736x/40/f0/90/40f090647ad92f78410802835fbe53c1.jpg",
        "https://i.pinimg.com/736x/d5/92/3c/d5923c842137b95e88c350e7d9a20a2c.jpg",
        "https://i.pinimg.com/1200x/d3/39/26/d33926323953881dbc11ddb0d9c181cd.jpg",
        "https://i.pinimg.com/736x/86/cb/7c/86cb7cb04e478c67d8717e7819224ecd.jpg",
        "https://i.pinimg.com/736x/17/3b/cb/173bcba49043643065423f351f3d2107.jpg",
        "https://i.pinimg.com/736x/aa/ab/9a/aaab9ad876118c67df557ef95e021add.jpg",
        "https://i.pinimg.com/736x/1b/18/52/1b18528e69a1c09b5d80dc63358e9908.jpg",
    ]
};

const REACTION_EMOJIS = ["💀", "🔥", "⛓️", "👁️", "🍷", "⚠️", "🖤"];

const Spoiler = ({ content }) => {
    const [revealed, setRevealed] = useState(false);
    return (
        <span 
            className={`md-spoiler ${revealed ? 'revealed' : ''}`} 
            onClick={() => setRevealed(true)}
        >
            {content}
        </span>
    );
};

const HackerText = ({ text, type = 'hacker' }) => {
    const [display, setDisplay] = useState(text);
    const chars = "!<>-_\\/[]{}—=+*^?#________";
    
    useEffect(() => {
        let iteration = 0;
        const interval = setInterval(() => {
            setDisplay(text.split("").map((letter, index) => {
                if (index < iteration) return text[index];
                return chars[Math.floor(Math.random() * chars.length)];
            }).join(""));
            if (iteration >= text.length) clearInterval(interval);
            iteration += 1 / 3;
        }, 30);
        return () => clearInterval(interval);
    }, [text]);

    return <span className={type === 'glitch' ? 'glitch-text' : ''}>{display}</span>;
};

const BootSequence = ({ onComplete }) => {
    const [logs, setLogs] = useState([]);
    const bootLines = [
        "[OK] INITIALIZING UNDERLAND KERNEL 6.6.6",
        "[OK] MOUNTING CRYPTO_VAULT AT /DEV/VOID",
        "[WAIT] ESTABLISHING WEBSOCKET HANDSHAKE...",
        "[OK] CONNECTION ESTABLISHED: ADDR 0.0.0.0",
        "[OK] LOADING NEURAL_ASSETS (MAKIMA/SABER)",
        "[WARN] TRACING BYPASS DETECTED...",
        "[OK] ENCRYPTING SESSION KEYS [AES-GCM-256]",
        "[SYSTEM] ACCESS GRANTED TO THE ABYSS.",
        "WELCOME TO UNDERLAND."
    ];

    useEffect(() => {
        let currentLine = 0;
        const timer = setInterval(() => {
            if (currentLine < bootLines.length) {
                setLogs(prev => [...prev, bootLines[currentLine]]);
                currentLine++;
            } else {
                clearInterval(timer);
                setTimeout(onComplete, 1000);
            }
        }, 400);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 99999, padding: '20px', color: '#f00', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', textShadow: '0 0 5px #f00', overflowY: 'auto' }}>
            <div className="glitch-text" style={{ fontSize: '20px', marginBottom: '20px' }}>SYSTEM_BOOT_SEQUENCE</div>
            {logs.map((log, i) => (
                <div key={i} style={{ borderLeft: '2px solid #300', paddingLeft: '10px' }}>
                    <span style={{ opacity: 0.5 }}>[{new Date().toLocaleTimeString()}]</span> {log}
                </div>
            ))}
            <div className="cursor-blink" style={{ width: '10px', height: '20px', background: '#f00', marginTop: '10px' }}></div>
        </div>
    );
};

export default function Underland() {
    const [isBooting, setIsBooting] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [input, setInput] = useState("");
    const [roomName, setRoomName] = useState("hell");
    const [roomPass, setRoomPass] = useState(""); 
    const [groupKey, setGroupKey] = useState(null);
    const [channelHash, setChannelHash] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [stickerOpen, setStickerOpen] = useState(false);
    const [isSending, setIsSending] = useState(false); // Anti-flood state
    const lastSendRef = useRef(0); // Anti-flood timestamp
    
    const [nick, setNick] = useState(() => {
        const saved = localStorage.getItem('ud_nick');
        return saved ? saved.substring(0, 20) : K1[Math.floor(Math.random()*K1.length)] + K2[Math.floor(Math.random()*K2.length)];
    });
    const [nickColor, setNickColor] = useState(() => localStorage.getItem('ud_color') || "#ff0000");
    const [nickEffect, setNickEffect] = useState(() => localStorage.getItem('ud_effect') || "");
    const [isVerified, setIsVerified] = useState(() => localStorage.getItem('ud_verified') === 'true');
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verifyPass, setVerifyPass] = useState("");
    const [screenEffect, setScreenEffect] = useState("");
    const [showColorPalette, setShowColorPalette] = useState(false);
    const [dmTarget, setDmTarget] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);

    const scrollRef = useRef(null);
    const audioRef = useRef(new Audio(listenSound));
    const reactAudioRef = useRef(new Audio(reactSound));
    const expurgoAudioRef = useRef(new Audio(expurgoSound));
    const winAudioRef = useRef(new Audio(winSound));
    const jasabeAudioRef = useRef(new Audio(jasabeSound));

    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
            * { box-sizing: border-box; font-family: 'JetBrains Mono', monospace; cursor: crosshair !important; }
            body { margin: 0; background: #050505; color: #444; overflow: hidden; height: 100vh; width: 100vw; }
            .no-scroll::-webkit-scrollbar { display: none; }
            .no-scroll { scrollbar-width: none; overflow-y: auto; }
            .main-container { display: flex; height: 100vh; background: #050505; position: relative; }
            .sidebar { 
                width: 300px; 
                border-right: 1px solid #111; 
                background: #080808; 
                display: flex; 
                flex-direction: column; 
                transition: transform 0.3s ease;
                z-index: 1000;
            }
            @media (max-width: 768px) {
                .sidebar {
                    position: fixed;
                    left: 0; top: 0; bottom: 0;
                    transform: translateX(${sidebarOpen ? '0' : '-100%'});
                }
                .chat-area { width: 100% !important; }
                .desktop-only { display: none !important; }
                .mobile-header { display: flex !important; }
            }
            .mobile-header { 
                display: none; padding: 10px 20px; background: #0a0a0a; 
                border-bottom: 1px solid #200; align-items: center; 
                justify-content: space-between; height: 60px;
            }
            .sticker-img { width: 220px !important; height: auto; border-radius: 8px; border: 1px solid #222; margin-top: 5px; }
            .msg-content img { max-width: 300px; max-height: 300px; border-radius: 8px; margin-top: 5px; object-fit: contain; border: 1px solid #222; }
            .banner-container { width: 100%; height: 150px; background: url('https://m.media-amazon.com/images/I/51TfCSvITIL._AC_UF894,1000_QL80_.jpg') center/cover; filter: grayscale(1) contrast(1.2) brightness(0.4); position: relative; border-bottom: 1px solid #200; }
            .banner-overlay { position: absolute; inset: 0; background: linear-gradient(transparent, #080808); }
            .logo-text { color: #f00; font-size: 22px; letter-spacing: 5px; text-align: center; margin: 15px 0; font-weight: 700; text-shadow: 0 0 10px #f00; }
            .msg-container { margin-bottom: 20px; border-left: 2px solid #111; padding-left: 15px; position: relative; word-break: break-word; }
            .unread-badge { background: #f00; color: #fff; font-size: 9px; padding: 1px 4px; border-radius: 2px; font-weight: bold; margin-left: auto; animation: pulse 1s infinite; }
            .effect-glitch { animation: glitch-anim 0.2s infinite; text-shadow: 2px 0 #f0f, -2px 0 #0ff; }
            .effect-fire { color: #ff4400 !important; text-shadow: 0 0 8px #ff0000, 0 -2px 4px #ffaa00; animation: fire-flicker 0.1s infinite alternate; }
            .glitch-text { color: #fff; text-shadow: 1px 0 #f00, -1px 0 #00f; }
            .btn-action { background: #000; color: #f00; border: 1px solid #300; cursor: pointer; padding: 10px; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
            .btn-action:hover { border-color: #f00; box-shadow: 0 0 5px #f00; }
            .btn-action:active { background: #f00; color: #000; }
            .md-h1 { color: #fff; font-size: 24px; font-weight: 900; margin: 10px 0; display: block; text-shadow: 0 0 10px #f00; }
            .md-code { background: #111; color: #0f0; padding: 2px 5px; border-radius: 4px; font-size: 0.85em; border: 1px solid #040; }
            .md-spoiler { background: #222; color: #222; cursor: pointer; padding: 0 5px; border-radius: 2px; transition: 0.3s; }
            .md-spoiler.revealed { background: #300; color: #eee; }
            @keyframes pulse { 50% { opacity: 0.5; } }
            @keyframes fire-flicker { from { opacity: 0.8; } to { opacity: 1; filter: brightness(1.2); } }
            .shake-screen { animation: shake 0.5s infinite; }
            @keyframes shake { 0% { transform: translate(1px, 1px); } 20% { transform: translate(-3px, 0); } 100% { transform: translate(1px, -1px); } }
/* Tremor que começa forte e vai parando (Decay) */
@keyframes brutal-shake {
    0% { transform: translate(0, 0) rotate(0deg); }
    10% { transform: translate(-8px, -8px) rotate(-1deg); }
    20% { transform: translate(8px, 5px) rotate(1deg); }
    30% { transform: translate(-10px, 8px) rotate(0deg); }
    40% { transform: translate(10px, -5px) rotate(-1deg); }
    50% { transform: translate(-8px, 2px) rotate(1deg); }
    60% { transform: translate(8px, -8px) rotate(0deg); }
    70% { transform: translate(-10px, 5px) rotate(-1deg); }
    80% { transform: translate(10px, 8px) rotate(1deg); }
    90% { transform: translate(-5px, -2px) rotate(0deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
}

.expurgo-active {
    /* Tremor rápido e forte */
    animation: brutal-shake 0.1s infinite;
    /* Adiciona um borrão de movimento para parecer mais caótico */
    filter: blur(0.5px);
    background: radial-gradient(circle, #100 0%, #000 100%);
}        



/* Efeito de Fogo Agressivo */
.win-vitoria {
    position: relative;
    /* Brilho interno vermelho/laranja */
    box-shadow: inset 0 0 150px #f50, 0 0 60px #f20 !important;
    /* Tremor leve de calor */
    animation: fire-shake 0.2s infinite alternate !important;
    overflow: hidden;
}

/* Camada de labaredas subindo */
.win-vitoria::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(255, 50, 0, 0.7), rgba(255, 150, 0, 0.3), transparent 80%);
    pointer-events: none;
    z-index: 9999;
    mix-blend-mode: color-dodge;
}

@keyframes fire-shake {
    0% { transform: translate(1px, 1px) scale(1); filter: brightness(1.1); }
    100% { transform: translate(-1px, -1px) scale(1.002); filter: brightness(1.4); }
}

/* Efeito Hacker JASABE */
.jasabe-active {
    position: relative;
    background-color: #000 !important;
    color: #0f0 !important; /* Verde neon clássico */
    text-shadow: 0 0 8px #0f0;
    overflow: hidden;
}

.jasabe-active {
    position: relative;
    background-color: #000 !important;
    color: #0f0 !important;
    text-shadow: 0 0 10px #0f0;
    font-family: 'Courier New', monospace !important;
    animation: hacker-shake 0.1s infinite !important;
}

/* Linhas de terminal */
.jasabe-active::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(rgba(0,255,0,0.1) 50%, transparent 50%);
    background-size: 100% 4px;
    z-index: 1000;
    pointer-events: none;
}

@keyframes hacker-shake {
    0% { transform: skew(0.5deg); filter: hue-rotate(0deg); }
    50% { transform: skew(-0.5deg); filter: hue-rotate(10deg); }
    100% { transform: skew(0deg); }
}


`;
        document.head.appendChild(style);
    }, [sidebarOpen]);

    const triggerEffect = (type) => {
    // Limpa qualquer efeito que já esteja rodando antes de começar
    setScreenEffect("");

    if (type === "/expurgo") {
        setScreenEffect("expurgo-active");
        expurgoAudioRef.current.volume = 1.0;
        expurgoAudioRef.current.play().catch(() => {});

        setTimeout(() => {
            setScreenEffect("");
            console.log("SYSTEM_RECOVERED_FROM_PURGE");
        }, 5000);
    } 
    
    // BLOCO NOVO E DEDICADO PARA O WIN
    else if (type === "/win") {
        // Nome da classe CSS que cria o fogo
        setScreenEffect("win-vitoria"); 
        
        // Toca o áudio da vitória
        if (winAudioRef.current) {
            winAudioRef.current.currentTime = 0;
            winAudioRef.current.play().catch(() => {});
        }

        // Mantém a tela pegando fogo por 5 segundos
        setTimeout(() => {
            setScreenEffect("");
            console.log("VICTORY_DISPLAY_COMPLETE");
        }, 5000);
    }

// NOVO COMANDO: /jasabe
    else if (type === "/jasabe") {
        setScreenEffect("jasabe-active");
        
        // Se tiver um som de "teclado rápido" ou "digital", use aqui
        // hackAudioRef.current?.play().catch(()=>{});

        setTimeout(() => {
            // No final do efeito, dá um susto com glitch
            setScreenEffect("jasabe-active jasabe-glitch");
            
            setTimeout(() => {
                setScreenEffect("");
                console.log("JASABE_PROTOCOL_EXECUTED");
            }, 1000);
        }, 4000);
    }
};



    const renderContent = (m) => {
        if (m.type === 'hacker') return <HackerText text={m.text} />;
        if (m.type === 'glitch') return <HackerText text={m.text} type="glitch" />;
        
        const text = m.text || "";
        const parts = text.split(/(\|\|.*?\|\||`.*?`|\*\*.*?\*\*|\*.*?\*|^# .*$)/gm);
        
        return (
            <div>
                {parts.map((part, i) => {
                    if (part.startsWith('# ')) return <span key={i} className="md-h1">{part.replace('# ', '')}</span>;
                    if (part.startsWith('**') && part.endsWith('**')) return <b key={i}>{part.slice(2, -2)}</b>;
                    if (part.startsWith('*') && part.endsWith('*')) return <i key={i}>{part.slice(1, -1)}</i>;
                    if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="md-code">{part.slice(1, -1)}</code>;
                    if (part.startsWith('||') && part.endsWith('||')) return <Spoiler key={i} content={part.slice(2, -2)} />;
                    return <span key={i}>{part}</span>;
                })}
            </div>
        );
    };

    useEffect(() => {
        const init = async () => {
            if (!roomName) return;
            const encoder = new TextEncoder();
            const salt = encoder.encode(roomName + "_V_FINAL_SALT");
            const hBuf = await window.crypto.subtle.digest('SHA-256', encoder.encode(roomName));
            const hash = Array.from(new Uint8Array(hBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
            const keyMat = await window.crypto.subtle.importKey("raw", encoder.encode(roomPass || "void"), "PBKDF2", false, ["deriveKey"]);
            const key = await window.crypto.subtle.deriveKey(
                { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
                keyMat, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
            );
            setChannelHash(hash);
            setGroupKey(key);
            setMessages([]);
            socket.emit('join-channel', hash);
            socket.emit('register-user', { nick, color: nickColor, effect: nickEffect, channelHash: hash });
        };
        init();
    }, [roomName, roomPass, nick, nickEffect]);

    useEffect(() => {
        if (!groupKey) return;
        const decrypt = async (m) => {
            try {
                // Descriptografia do PAYLOAD INTEIRO (Metadados inclusos)
                const dec = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(m.iv) }, groupKey, new Uint8Array(m.ciphertext));
                return JSON.parse(new TextDecoder().decode(dec));
            } catch { return null; }
        };
        socket.on('history', async (list) => {
            const decs = await Promise.all(list.map(m => decrypt(m)));
            setMessages(decs.filter(Boolean));
        });
        socket.on('new-message', async (p) => {
            const msg = await decrypt(p);
            if (msg) {
                if (msg.text === "/expurgo") { triggerEffect("/expurgo"); expurgoAudioRef.current.play().catch(()=>{}); }
                if (msg.text === "/win") { triggerEffect("/win"); winAudioRef.current.play().catch(()=>{}); }
                if (msg.text === "/jasabe") { triggerEffect("/jasabe"); jasabeAudioRef.current.play().catch(()=>{}); }
                if (msg.isPrivate && msg.targetId === socket.id) {
                    if (!dmTarget || dmTarget.id !== msg.senderId) {
                        setUnreadCounts(prev => ({ ...prev, [msg.senderId]: (prev[msg.senderId] || 0) + 1 }));
                    }
                }
                setMessages(prev => [...prev, msg]);
                if (document.hidden) audioRef.current.play().catch(()=>{});
            }
        });
        socket.on('online-list', setOnlineUsers);
        socket.on('update-reaction', ({ msgId, emoji }) => {
            reactAudioRef.current.play().catch(()=>{});
            setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions: { ...m.reactions, [emoji]: (m.reactions[emoji] || 0) + 1 } } : m));
        });
        return () => { 
            socket.off('new-message'); socket.off('online-list'); 
            socket.off('history'); socket.off('update-reaction'); 
        };
    }, [groupKey, dmTarget]);

    const handleSend = async (val, custom = {}) => {
        // --- BLOQUEIO FLOOD/DDOS ---
        const now = Date.now();
        if (isSending || (now - lastSendRef.current < 500)) return; 
        if (!val.trim() && Object.keys(custom).length === 0) return;
        
        setIsSending(true);
        lastSendRef.current = now;

        const cleanVal = val.replace(/<[^>]*>?/gm, '');

        let type = custom.type || 'text';
        let textToSend = cleanVal;

// Verifica se é o comando de apagar
    if (cleanVal === "/burn") {
        if (window.confirm("INCINERAR HISTÓRICO? Esta ação é irreversível.")) {
            socket.emit('send-message', { 
                channelHash, 
                payload: {}, // Vazio pois o arquivo será deletado
                isBurnCommand: true 
            });
        }
        setInput("");
        setIsSending(false);
        return;
    }

        if (cleanVal.startsWith("/hacker ")) { textToSend = cleanVal.replace("/hacker ", ""); type = "hacker"; }
        else if (cleanVal.startsWith("/glitch ")) { textToSend = cleanVal.replace("/glitch ", ""); type = "glitch"; }
        
        if (["/userglitchsecret", "/userfiresecret", "/usernotsecret"].includes(cleanVal)) {
            const effects = { "/userglitchsecret": "effect-glitch", "/userfiresecret": "effect-fire", "/usernotsecret": "" };
            updateIdentity(nick, nickColor, effects[cleanVal]);
            setInput(""); 
            setIsSending(false);
            return;
        }

        // --- CRIPTOGRAFIA DE METADADOS ---
        // Construímos o objeto completo aqui dentro para que TUDO seja cifrado
        let fullPayload = { 
            id: Date.now() + Math.random(), 
            sender: nick, 
            color: nickColor, 
            effect: nickEffect, 
            senderId: socket.id,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
            isPrivate: !!dmTarget, 
            targetId: dmTarget?.id,
            text: textToSend, 
            type: type, 
            reactions: {}, 
            ...custom 
        };

        try {
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const encodedPayload = new TextEncoder().encode(JSON.stringify(fullPayload));
            const enc = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv }, 
                groupKey, 
                encodedPayload
            );

            // Enviamos apenas o Envelope Criptografado. Metadados agora são invisíveis no tráfego.
            socket.emit('send-message', { 
                channelHash, 
                payload: { 
                    iv: Array.from(iv), 
                    ciphertext: Array.from(new Uint8Array(enc)) 
                } 
            });
        } catch (e) {
            console.error("CRYPTO_ERROR", e);
        }

        setInput("");
        setStickerOpen(false);
        setIsSending(false);
    };

    const updateIdentity = (newNick, newColor, newEffect = nickEffect) => {
        const safeNick = newNick.replace(/[^a-zA-Z0-9闇影死霊獄骸毒血幽冥侍者魂鬼王兵神幻影殺 ]/g, "").substring(0, 15);
        setNick(safeNick); setNickColor(newColor); setNickEffect(newEffect);
        localStorage.setItem('ud_nick', safeNick); localStorage.setItem('ud_color', newColor); localStorage.setItem('ud_effect', newEffect);
        socket.emit('register-user', { nick: safeNick, color: newColor, effect: newEffect, channelHash });
    };

    const uploadFile = async (e) => {
        const file = e.target.files[0];
        if (!file || file.size > 5000000) return alert("File too large (Max 5MB)");
        setIsUploading(true);
        const formData = new FormData();
        formData.append('fileToUpload', file);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const url = await res.text();
            if (url.startsWith('http')) handleSend(`[IMG]${url}`);
        } catch { alert("UPLOAD_FAILED"); }
        setIsUploading(false);
    };

    const filteredMessages = messages.filter(m => {
        if (["/expurgo", "/win", "/jasabe"].includes(m.text)) return false;
        if (dmTarget) return m.isPrivate && ((m.senderId === socket.id && m.targetId === dmTarget.id) || (m.senderId === dmTarget.id && m.targetId === socket.id));
        return !m.isPrivate;
    });

    useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [filteredMessages]);

    const getSafeImg = (raw) => {
        const url = raw.replace('[IMG]', '').trim();
        return url.startsWith('http') ? url : '';
    };

    return (
        <>
            {isBooting && <BootSequence onComplete={() => setIsBooting(false)} />}
            
            <div className={`main-container ${screenEffect}`} style={{ visibility: isBooting ? 'hidden' : 'visible' }}>
                
                <div className="mobile-header">
                    <button className="btn-action" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
                    <span style={{ color: '#f00', fontSize: '12px' }}>{dmTarget ? `DM: ${dmTarget.nick}` : `ROOM: ${roomName}`}</span>
                    <div style={{ width: '40px' }}></div>
                </div>

                <div className="sidebar no-scroll">
                    <div className="banner-container"><div className="banner-overlay"></div></div>
                    <div style={{ padding: '20px', flex: 1 }}>
                        <h1 className="logo-text">UNDERLAND</h1>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ fontSize: '9px', color: '#333' }}>ROOM / PASS</p>
                            <input value={roomName} onChange={e => setRoomName(e.target.value.substring(0, 30))} style={{ background:'#000', border:'1px solid #111', color:'#f00', padding:'10px', width:'100%', marginBottom: '5px' }} />
                            <input type="password" value={roomPass} onChange={e => setRoomPass(e.target.value)} style={{ background:'#000', border:'1px solid #111', color:'#f00', padding:'10px', width:'100%' }} />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ fontSize: '9px', color: '#333' }}>IDENTITY</p>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <input className={nickEffect} value={nick} onChange={e => updateIdentity(e.target.value, nickColor)} style={{ background:'#000', border:'1px solid #111', color:nickColor, padding:'10px', flex: 1 }} />
                                <button className="btn-action" onClick={() => setShowColorPalette(!showColorPalette)}>🎨</button>
                            </div>
                            {showColorPalette && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px', marginTop: '10px' }}>
                                    {["#ff0000", "#00ff00", "#00ffff", "#ffff00", "#ff00ff", "#ffffff", "#ff4400", "#8800ff", "#00ff88", "#ff0088"].map(c => (
                                        <div key={c} onClick={() => { updateIdentity(nick, c); setShowColorPalette(false); }} style={{ background: c, aspectRatio: '1', cursor: 'pointer', border: '1px solid #222' }} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <p style={{ fontSize: '10px', color: '#f00', borderBottom: '1px solid #200', paddingBottom: '5px' }}>ONLINE</p>
                        <div className="no-scroll" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {onlineUsers.map((u) => (
                                <div key={u.id} onClick={() => { if(u.id !== socket.id) { setDmTarget({id: u.id, nick: u.nick}); setSidebarOpen(false); } }} 
                                     style={{ color: dmTarget?.id === u.id ? '#f0f' : u.color, fontSize: '12px', padding: '8px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #0f0f0f' }}>
                                    <span style={{ width: '6px', height: '6px', background: u.color, borderRadius: '50%' }}></span>
                                    <span className={u.effect}>{u.nick}</span>
                                    {unreadCounts[u.id] > 0 && <span className="unread-badge">+{unreadCounts[u.id]}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="btn-action" style={{ margin: '10px', display: window.innerWidth < 768 ? 'block' : 'none' }} onClick={() => setSidebarOpen(false)}>FECHAR [X]</button>
                </div>

                <div className="chat-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <header className="desktop-only" style={{ padding: '15px 30px', borderBottom: '1px solid #111', background: '#060606', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: dmTarget ? '#f0f' : '#f00', fontSize: '11px', fontWeight: 'bold' }}>
                            {dmTarget ? `DM // ${dmTarget.nick.toUpperCase()}` : `CHANNEL // ${roomName.toUpperCase()}`}
                        </span>
                        {dmTarget && <button className="btn-action" onClick={() => setDmTarget(null)} style={{ padding: '2px 10px', fontSize: '10px' }}>EXIT DM</button>}
                    </header>

                    <div className="no-scroll" style={{ flex: 1, padding: '20px', overflowY: 'auto' }} ref={scrollRef}>
                        {filteredMessages.map((m, i) => (
                            <div key={i} className="msg-container" style={{ borderLeftColor: m.color }} onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, msgId: m.id }); }}>
                                <div style={{ fontSize: '10px', color: m.color, marginBottom: '5px' }}>
                                    <span className={m.effect}>{m.sender}</span> <span style={{ color: '#222', marginLeft: '10px' }}>[{m.timestamp}]</span>
                                </div>
                                <div className="msg-content" style={{ color: '#aaa', fontSize: '14px' }}>
                                    {m.type === 'sticker' ? <img src={getSafeImg(m.text)} className="sticker-img" loading="lazy" alt="sticker" /> : 
                                     m.text?.startsWith('[IMG]') ? <img src={getSafeImg(m.text)} loading="lazy" alt="upload" /> : renderContent(m)}
                                </div>
                                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                    {m.reactions && Object.entries(m.reactions).map(([emoji, count]) => (
                                        <div key={emoji} className="reaction-badge" style={{ background: '#100', border: '1px solid #300', color: '#f00', padding: '2px 5px', fontSize: '10px' }}>{emoji} {count}</div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} style={{ padding: '15px', display: 'flex', gap: '10px', background: '#080808', borderTop: '1px solid #111' }}>
                        <label className="btn-action" style={{ padding: '10px 15px' }}>📸 <input type="file" hidden onChange={uploadFile} accept="image/*" /></label>
                        <button type="button" className="btn-action" onClick={() => setStickerOpen(!stickerOpen)}>🎭</button>
                        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Send a message..." style={{ flex: 1, background: '#000', border: '1px solid #222', color: '#f00', padding: '10px', fontSize: '14px' }} />
                        <button type="submit" className="btn-action" style={{ padding: '10px 15px' }} disabled={isSending}>{isSending ? '...' : '➤'}</button>
                    </form>

                    {stickerOpen && (
                        <div style={{ position: 'absolute', bottom: '80px', left: '10px', right: '10px', maxWidth: '400px', background: '#0a0a0a', border: '1px solid #f00', height: '350px', zIndex: 1001, padding: '15px', boxShadow: '0 0 20px #000' }}>
                            <div className="no-scroll" style={{ height: '100%', overflowY: 'auto' }}>
                                {Object.entries(STICKERS).map(([cat, urls]) => (
                                    <div key={cat} style={{ marginBottom: '15px' }}>
                                        <p style={{ fontSize: '9px', color: '#444', marginBottom: '8px', borderBottom: '1px solid #200' }}>{cat}</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '10px' }}>
                                            {urls.map(u => <img key={u} src={u} loading="lazy" style={{ width: '70px', height: '70px', cursor: 'pointer', objectFit: 'cover', borderRadius: '4px' }} onClick={() => handleSend(u, { type: 'sticker' })} alt="sticker-opt" />)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {contextMenu && (
                        <div style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, background: '#0a0a0a', border: '1px solid #f00', display: 'flex', gap: '8px', padding: '10px', zIndex: 2000 }}>
                            {REACTION_EMOJIS.map(emoji => (
                                <span key={emoji} onClick={() => { socket.emit('add-reaction', { channelHash, msgId: contextMenu.msgId, emoji }); setContextMenu(null); }} style={{ cursor: 'pointer', fontSize: '20px' }}>{emoji}</span>
                            ))}
                            <button onClick={() => setContextMenu(null)} style={{ background: '#f00', color: '#000', border: 'none', padding: '2px 5px' }}>X</button>
                        </div>
                    )}
                </div>
            </div>

            {showVerifyModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#0a0a0a', border: '1px solid #f00', padding: '20px', width: '100%', maxWidth: '350px' }}>
                        <h2 style={{ color: '#f00', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>ACCESS_RESTRICTED</h2>
                        <input type="password" value={verifyPass} onChange={e => setVerifyPass(e.target.value)} style={{ background:'#000', border:'1px solid #300', color:'#f00', padding:'12px', width:'100%', marginBottom:'20px' }} placeholder="CREDENTIALS..." />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-action" style={{ flex: 1 }} onClick={() => {
                                socket.emit('validate-nick-pass', { pass: verifyPass }, (res) => {
                                    if(res.success) { setIsVerified(true); localStorage.setItem('ud_verified', 'true'); setShowVerifyModal(false); }
                                    else alert("DENIED");
                                });
                            }}>LOGIN</button>
                            <button className="btn-action" style={{ flex: 1, color: '#444', borderColor: '#444' }} onClick={() => setShowVerifyModal(false)}>EXIT</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}