// scratch/test_private_chat.js
const { baseDeDatos } = require('../configuracion/base-de-datos');
const { Amistad } = require('../modelos/Amistad');

async function runTests() {
    console.log("🧪 Starting Private Chat System Integration Tests...\n");

    const API_URL = "http://localhost:3000/api";

    // Helper for login
    async function login(mail) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mail, contraseña: "123456" })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(`Login failed for ${mail}: ${JSON.stringify(data)}`);
        }
        return data.token;
    }

    try {
        // 1. Iniciar sesión como Mateo (Usuario 9) y Maria (Usuario 7)
        console.log("1. Logging in as Mateo...");
        const tokenMateo = await login("mateo@gmail.com");
        console.log("✅ Mateo logged in successfully.\n");

        console.log("2. Logging in as Maria...");
        const tokenMaria = await login("maria.gomez@mail.com");
        console.log("✅ Maria logged in successfully.\n");

        // 3. Asegurar de que Mateo (9) y Maria (7) sean amigos en la DB
        console.log("3. Ensuring Mateo (9) and Maria (7) are friends in the database...");
        await baseDeDatos.sync();
        const [amistad, created] = await Amistad.findOrCreate({
            where: {
                id_usuario_origen: 9,
                id_usuario_destino: 7
            },
            defaults: {
                estado: 'aceptado'
            }
        });
        if (amistad.estado !== 'aceptado') {
            amistad.estado = 'aceptado';
            await amistad.save();
        }
        console.log("✅ Mateo and Maria are confirmed friends in DB.\n");

        // 3.5. Obtener las notificaciones pendientes de mensajes privados (debería ser 0 inicialmente)
        console.log("3.5. Fetching pending private message notifications for Mateo...");
        const notifRes = await fetch(`${API_URL}/chat-privado/notificaciones/pendientes`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${tokenMateo}`,
                "Content-Type": "application/json"
            }
        });
        const pendingNotifs = await notifRes.json();
        console.log(`✅ Pending notifications fetched. Status: ${notifRes.status}, Count: ${pendingNotifs.length}\n`);

        // 4. Obtener el historial de chat privado como Mateo
        console.log("4. Fetching private chat history between Mateo (9) and Maria (7)...");
        const historyRes = await fetch(`${API_URL}/chat-privado/7`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${tokenMateo}`,
                "Content-Type": "application/json"
            }
        });
        const history = await historyRes.json();
        console.log(`✅ Private chat history fetched. Status: ${historyRes.status}, Messages count: ${history.length}\n`);

        // 5. Mateo envía un mensaje privado a Maria
        console.log("5. Sending a private message from Mateo (9) to Maria (7)...");
        const sendRes = await fetch(`${API_URL}/chat-privado/7`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${tokenMateo}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ contenido: "Hola Maria! ¿Coordinamos para estudiar mañana?" })
        });
        const sentMessage = await sendRes.json();
        console.log(`✅ Message sent. Status: ${sendRes.status}, Content: "${sentMessage.contenido}"\n`);

        // 6. Maria responde a Mateo
        console.log("6. Sending a reply message from Maria (7) to Mateo (9)...");
        const replyRes = await fetch(`${API_URL}/chat-privado/9`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${tokenMaria}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ contenido: "Hola Mateo! Dale, me parece perfecto. ¿A qué hora?" })
        });
        const replyMessage = await replyRes.json();
        console.log(`✅ Reply sent. Status: ${replyRes.status}, Content: "${replyMessage.contenido}"\n`);

        // 7. Intentar chatear con un usuario que no es amigo
        // Supongamos que eliminamos temporalmente la amistad con Maria para testear seguridad
        console.log("7. Temporarily breaking friendship to test unauthorized access blocking...");
        await amistad.destroy();
        
        console.log("8. Attempting to fetch chat history as Mateo after breaking friendship...");
        const blockedGetRes = await fetch(`${API_URL}/chat-privado/7`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${tokenMateo}`,
                "Content-Type": "application/json"
            }
        });
        const blockedGetData = await blockedGetRes.json();
        console.log(`✅ PASS: Access correctly blocked. Status: ${blockedGetRes.status}, Message: "${blockedGetData.error}"\n`);

        console.log("9. Attempting to send private message as Mateo after breaking friendship...");
        const blockedPostRes = await fetch(`${API_URL}/chat-privado/7`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${tokenMateo}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ contenido: "Intento no autorizado" })
        });
        const blockedPostData = await blockedPostRes.json();
        console.log(`✅ PASS: Sending correctly blocked. Status: ${blockedPostRes.status}, Message: "${blockedPostData.error}"\n`);

        // Restaurar amistad al finalizar
        console.log("10. Restoring friendship between Mateo and Maria...");
        await Amistad.create({
            id_usuario_origen: 9,
            id_usuario_destino: 7,
            estado: 'aceptado'
        });
        console.log("✅ Friendship restored.\n");

        console.log("🎉 ALL PRIVATE CHAT INTEGRATION TESTS PASSED SUCCESSFULLY!");

    } catch (err) {
        console.error("❌ Test execution failed:", err);
        process.exit(1);
    }
}

runTests();
