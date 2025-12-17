
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

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
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const modelName = 'gemini-3-flash-preview';
      
      const chatContext = messages.map(m => `${m.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${m.text}`).join('\n');

      const systemInstruction = `
        Tu es l'assistant intelligent de KAMBEGOYE, une plateforme de mise en relation entre ouvriers et clients à Niamey, Niger.
        Ton but est d'aider les clients à :
        1. Identifier la spécialité d'ouvrier nécessaire (ex: problème électrique -> Électricien, fuite d'eau -> Plombier).
        2. Expliquer comment fonctionne la plateforme (200 FCFA pour débloquer les contacts, boutique disponible, demande de devis gratuite).
        3. Donner des conseils généraux de sécurité pour les chantiers.
        
        Ton ton doit être professionnel, chaleureux, et typiquement sahélien/nigérien dans l'accueil (usage de "Nagode", "Barkaye", etc. occasionnellement).
        Répond de manière concise. Ne donne jamais de prix fixes pour les prestations des ouvriers car ils fixent leurs propres tarifs.
        Les spécialités disponibles sur KAMBEGOYE sont : Électricien, Plombier, Maçon, Menuisier, Peintre, Frigoriste, Soudeur, Mécanicien, Jardinier, Personnel de maison, Antenniste, Vidéosurveillance.
      `;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: `${systemInstruction}\n\nHistorique de la conversation :\n${chatContext}\n\nUtilisateur: ${userMessage}\nAssistant:`,
      });

      const aiText = response.text || "Désolé, je n'ai pas pu générer de réponse. Réessayez bientôt.";
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (err) {
      console.error("Gemini Error:", err);
      setError("Désolé, le service d'IA est momentanément indisponible.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-brand-600'
        } text-white`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
          {/* Header */}
          <div className="bg-brand-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-none">Assistant Kambe-AI</h3>
                <span className="text-[10px] opacity-80 uppercase tracking-widest font-semibold">Conseiller Niamey</span>
              </div>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
          </div>

          {/* Messages */}
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
                  Kambe-AI réfléchit...
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez votre question..."
                className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-full py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-brand-500 dark:text-white transition-all"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-2 bg-brand-600 text-white rounded-full hover:bg-brand-700 disabled:opacity-50 disabled:hover:bg-brand-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2">
              L'IA peut faire des erreurs. Vérifiez les informations importantes.
            </p>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
