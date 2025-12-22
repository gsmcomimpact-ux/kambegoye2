
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Bonjour ! Je suis l'assistant KAMBEGOYE. Comment puis-je vous aider aujourd'hui à Niamey ? Je peux vous conseiller sur le choix d'un ouvrier ou répondre à vos questions sur les travaux." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Ajout immédiat du message utilisateur à l'UI
    const newMessages: Message[] = [...messages, { role: 'user', text: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    try {
      // Initialisation du client avec la clé d'environnement
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemInstruction = `
        Tu es l'assistant intelligent de KAMBEGOYE, la plateforme leader de mise en relation BTP à Niamey, Niger.
        
        TON RÔLE :
        1. Guider l'utilisateur vers le bon corps de métier (ex: "J'ai une fuite" -> Plombier).
        2. Expliquer les frais : 200 FCFA pour débloquer l'accès illimité aux contacts pendant 5 minutes.
        3. Promouvoir la Boutique KAMBEGOYE pour l'achat de matériel (Wadfow, etc.).
        4. Rappeler les consignes de sécurité : Ne jamais payer la totalité avant la fin des travaux.
        
        TON TON :
        - Professionnel mais chaleureux.
        - Utilise quelques mots locaux pour l'accueil/remerciement (Nagode, Barkaye, Fofo).
        - Reste concis (pas de longs paragraphes).
        - Localisation exclusive : NIAMEY.
        
        LIMITES :
        - Ne donne jamais de prix précis pour le travail d'un ouvrier (ils fixent leurs tarifs).
        - Si on te demande quelque chose hors BTP/Maison, redirige poliment vers les services de KAMBEGOYE.
      `;

      // Préparation de l'historique pour l'API (exclure le message système car il va dans config)
      // Gemini attend un format : { role: 'user' | 'model', parts: [{ text: string }] }
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Création d'une session de chat
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: systemInstruction.trim(),
          temperature: 0.7,
          topP: 0.95,
        },
        history: history,
      });

      // Envoi du message
      const result = await chat.sendMessage({ message: userMessage });
      
      // Récupération de la réponse (propriété .text)
      const aiText = result.text || "Désolé, je rencontre une petite difficulté technique. Nagode de réessayer dans un instant.";
      
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (err) {
      console.error("Gemini Production Error:", err);
      setError("Le service Kambe-AI est temporairement indisponible. Nagode pour votre patience.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/* Bouton de bascule */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-brand-600'
        } text-white`}
        aria-label="Ouvrir l'assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
      </button>

      {/* Fenêtre de Chat */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
          {/* Header */}
          <div className="bg-brand-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-none">Assistant Kambe-AI</h3>
                <span className="text-[10px] opacity-80 uppercase tracking-widest font-semibold">Expert Niamey</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">En ligne</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Zone des Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${
                    m.role === 'user' ? 'bg-gray-200 border-gray-300' : 'bg-brand-100 border-brand-200 text-brand-600'
                  }`}>
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-brand-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-600'
                  }`}>
                    {m.text}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2 items-center text-gray-400 text-xs italic">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Kambe-AI analyse votre demande...
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs flex items-center gap-2 border border-red-100 dark:border-red-800">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Formulaire d'envoi */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez votre question..."
                className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-full py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-brand-500 dark:text-white transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-2 bg-brand-600 text-white rounded-full hover:bg-brand-700 disabled:opacity-50 disabled:hover:bg-brand-600 transition-all active:scale-90"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[9px] text-gray-400 text-center mt-2 uppercase tracking-tighter">
              Kambegoye AI • Service Client Niamey
            </p>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
