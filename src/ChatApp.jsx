import { useState } from "react";

/* Couleur orange réutilisable */
const ORANGE = "#F16E00";

export default function ChatApp() {
  /* PHASE = "chat" | "email" | "done" */
  const [phase, setPhase] = useState("chat");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Bonjour, je suis ton IA pour évaluer tes connaissances en conception centrée client. Que peux-tu me dire sur ce sujet ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [turn, setTurn] = useState(0); // nombre de réponses utilisateur

  /* Envoi d’un message utilisateur au backend */
  const sendMessage = async () => {
    if (!input.trim()) return;

    // Ajoute le message utilisateur
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setLoading(true);

    try {
      const response = await fetch(
        "https://design-chat-render-backend.onrender.com/message",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input, email: email || "" }),
        }
      );
      const data = await response.json();

      // Ajoute la réponse IA
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);

      // Incrémente le nombre de tours utilisateur
      const newTurn = turn + 1;
      setTurn(newTurn);

      /* Après 5 réponses utilisateur, passe en phase email */
      if (newTurn >= 5 && !email) setPhase("email");
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Erreur de connexion au serveur." },
      ]);
    }

    setLoading(false);
    setInput("");
  };

  /* Envoi de l’email au backend pour déclencher la synthèse */
  const sendEmail = async () => {
    if (!email.trim()) return;
    setLoading(true);

    try {
      // envoie un message vide pour déclencher la synthèse + mail
      await fetch("https://design-chat-render-backend.onrender.com/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "",
          email,
        }),
      });
      setPhase("done");
    } catch (err) {
      alert("Erreur d’envoi de l’email.");
    }

    setLoading(false);
  };

  /* ---------- RENDU ---------- */
  if (phase === "email") {
    /* Vue de collecte e-mail */
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-4 p-4">
        <h2 className="text-xl font-semibold text-center">
          Merci ! Pour recevoir ta synthèse personnalisée, indique ton e-mail :
        </h2>
        <input
          type="email"
          className="w-full max-w-md border rounded p-2"
          placeholder="ton.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={sendEmail}
          disabled={loading || !email.trim()}
          className="px-6 py-3 rounded text-white disabled:opacity-50"
          style={{ backgroundColor: ORANGE }}
        >
          Recevoir ma synthèse
        </button>
      </div>
    );
  }

  if (phase === "done") {
    /* Vue de confirmation */
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <h2 className="text-2xl font-semibold text-center">
          Merci ! Ta synthèse va arriver par e-mail sous peu 🚀
        </h2>
      </div>
    );
  }

  /* Vue Chat */
  return (
    <div className="w-full h-screen flex flex-col">
      {/* Zone messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white shadow">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-${
              msg.sender === "bot" ? "left" : "right"
            } mb-2`}
          >
            <span
              className={`inline-block p-2 rounded-lg ${
                msg.sender === "bot" ? "bg-gray-200" : "bg-orange-100"
              }`}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      {/* Zone saisie */}
      <div className="p-4 flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded p-2"
          placeholder="Écris ta réponse…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-4 py-2 rounded text-white disabled:opacity-50"
          style={{ backgroundColor: ORANGE }}
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
