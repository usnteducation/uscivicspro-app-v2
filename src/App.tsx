import { useState, useEffect } from 'react';
import { Mic, CheckCircle, BookOpen, Star, ChevronRight, Share2, Lock, ShieldCheck, Mail, ChevronDown, ChevronUp } from 'lucide-react';
// Importiamo Firebase
import { db } from './firebaseConfig';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'; 
// Importiamo le domande vere
import { REAL_QUESTIONS } from './questions';

// --- TIPI E INTERFACCE ---
interface Question {
  id: number;
  question: string;
  answers: string[];
}

interface UserData {
  name: string;
  email: string;
}

// --- DATI TESTIMONIANZE (MOCK) ---
const TESTIMONIALS = [
  { id: 1, name: "Maria Garcia", text: "I was so nervous about the speaking part. This app helped me practice my pronunciation correctly. I passed!", stars: 5 },
  { id: 2, name: "Ahmed Khan", text: "The questions are exactly like the real test. The voice recognition is a game changer.", stars: 5 },
  { id: 3, name: "Elena Rossi", text: "Simple and effective. I studied for 3 days using this and got 100%.", stars: 5 }
];

// --- DATI FAQ ---
const FAQS = [
  { q: "Is this updated for the 2026 test?", a: "Yes, we use the latest official USCIS question bank suitable for the 2026 examination cycle." },
  { q: "Is it really free?", a: "Yes, the simulation is 100% free. We believe education should be accessible to everyone." },
  { q: "How does the voice recognition work?", a: "We use your browser's advanced speech API to listen to your answer and check it against the official correct answers." },
  { q: "Can I use it on my phone?", a: "Absolutely! USCivicsPro is designed to work perfectly on iPhone and Android." }
];

// --- COMPONENTE PRINCIPALE ---
function App() {
  const [step, setStep] = useState<'landing' | 'register' | 'quiz' | 'result'>('landing');
  const [user, setUser] = useState<UserData>({ name: '', email: '' });
  
  // Stato per le domande del gioco corrente
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [inputAnswer, setInputAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  // Stato per l'apertura delle FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Inizializza il gioco prendendo 20 domande a caso
  const initGame = () => {
    const shuffled = [...REAL_QUESTIONS].sort(() => 0.5 - Math.random());
    setGameQuestions(shuffled.slice(0, 20));
    setScore(0);
    setCurrentQIndex(0);
    setInputAnswer('');
  };

  useEffect(() => {
    initGame();
  }, []);

  // Gestione Riconoscimento Vocale
  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputAnswer(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        alert("Microphone error. Please type your answer.");
      };

      recognition.start();
    } else {
      alert("Speech recognition not supported in this browser. Please use Chrome or Safari.");
    }
  };

  // Gestione Risposte
  const handleNextQuestion = () => {
    const currentQ = gameQuestions[currentQIndex];
    const isCorrect = currentQ.answers.some(ans => inputAnswer.toLowerCase().includes(ans.toLowerCase()));
    
    if (isCorrect) setScore(score + 1);

    if (currentQIndex < gameQuestions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
      setInputAnswer('');
    } else {
      setStep('result');
    }
  };

  // Funzione Share (Nativa o Clipboard)
  const handleShare = async () => {
    const text = `I just scored ${score}/20 on the US Citizenship Practice Test! 🇺🇸 Can you beat me? Try it at uscivicspro.com`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'USCivicsPro Result',
          text: text,
          url: 'https://www.uscivicspro.com',
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert("Result copied to clipboard!");
    }
  };

  // --- UI COMPONENTS ---

  // 1. LANDING PAGE
  if (step === 'landing') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
        {/* Header */}
        <header className="p-6 flex justify-between items-center border-b border-slate-800 sticky top-0 bg-slate-950/90 backdrop-blur z-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-bold tracking-tight">USCivics<span className="text-blue-500">Pro</span></span>
          </div>
          <button onClick={() => setStep('register')} className="text-sm font-semibold text-slate-300 hover:text-white transition">Login</button>
        </header>

        {/* Hero */}
        <main className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-700 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-medium text-slate-300">Updated for 2026 Season</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 text-transparent bg-clip-text">
            Pass Your Citizenship <br className="hidden md:block"/> Interview with Confidence.
          </h1>
          
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Practice with the official USCIS questions using our <span className="text-blue-400">Voice Recognition Simulator</span>. 
            Don't just memorize. Speak like a citizen.
          </p>

          <button 
            onClick={() => setStep('register')}
            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-blue-600 px-8 font-medium text-white transition-all duration-300 hover:bg-blue-700 hover:ring-2 hover:ring-blue-400 hover:ring-offset-2 hover:ring-offset-slate-900"
          >
            <span className="mr-2">Start Free Simulation</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Social Proof */}
          <div className="mt-12 flex flex-col items-center gap-3">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />)}
            </div>
            <p className="text-sm text-slate-500">Trusted by <span className="text-slate-300 font-semibold">1,000+ future citizens</span> on TikTok & FB</p>
          </div>
        </main>

        {/* Testimonials Section */}
        <section className="py-16 bg-slate-900/50">
            <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-center mb-12">Success Stories</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((t) => (
                        <div key={t.id} className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                            <div className="flex gap-1 mb-4">
                                {[...Array(t.stars)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />)}
                            </div>
                            <p className="text-slate-300 mb-4 italic">"{t.text}"</p>
                            <p className="font-bold text-white">- {t.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Features Preview */}
        <section className="py-16 border-t border-slate-800">
          <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">How it works</h3>
              <ul className="space-y-4">
                {[
                  { title: 'Register Free', desc: 'Save your progress and access the community.' },
                  { title: 'Speak Your Answers', desc: 'Use your microphone to test your pronunciation.' },
                  { title: 'Get Instant Feedback', desc: 'Know immediately if you passed or failed.' }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-blue-500 font-bold shrink-0">{i+1}</div>
                    <div>
                      <h4 className="font-semibold text-slate-200">{item.title}</h4>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[500px] w-[280px] shadow-xl">
                 <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                <div className="rounded-[2rem] overflow-hidden w-[252px] h-[472px] bg-slate-950 flex flex-col items-center justify-center p-4">
                    <p className="text-center text-slate-400 text-sm mb-4">Question 4/20</p>
                    <p className="text-center font-bold text-lg mb-8">What is an amendment?</p>
                    <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mb-4">
                        <Mic className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-xs text-slate-600">Tap to speak</p>
                </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-slate-900/50">
            <div className="max-w-3xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {FAQS.map((faq, i) => (
                        <div key={i} className="border border-slate-800 rounded-lg overflow-hidden">
                            <button 
                                onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                                className="w-full flex justify-between items-center p-4 bg-slate-950 hover:bg-slate-900 transition text-left"
                            >
                                <span className="font-semibold">{faq.q}</span>
                                {openFaqIndex === i ? <ChevronUp className="w-5 h-5 text-blue-500"/> : <ChevronDown className="w-5 h-5 text-slate-500"/>}
                            </button>
                            {openFaqIndex === i && (
                                <div className="p-4 bg-slate-900 text-slate-400 text-sm">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
        
        <footer className="py-8 text-center text-slate-600 text-sm border-t border-slate-800">
          © 2025 USCivicsPro. All rights reserved.
        </footer>
      </div>
    );
  }

  // 2. REGISTER / LEAD GEN
  if (step === 'register') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <Lock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white">Create Free Account</h2>
            <p className="text-slate-400 mt-2">To track your score and access the 2026 simulator.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
              <input 
                type="text" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="John Doe"
                onChange={(e) => setUser({...user, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
              <input 
                type="email" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="john@example.com"
                onChange={(e) => setUser({...user, email: e.target.value})}
              />
            </div>
            <button 
              onClick={async () => {
                if(user.email) {
                    try {
                        // 1. Controlla se l'utente esiste già
                        const q = query(collection(db, "leads"), where("email", "==", user.email));
                        const querySnapshot = await getDocs(q);

                        if (querySnapshot.empty) {
                             // 2. Se NON esiste, salvalo
                             await addDoc(collection(db, "leads"), {
                                name: user.name || "Anonymous",
                                email: user.email,
                                date: new Date().toISOString(),
                                source: "USCivicsPro Landing"
                            });
                        } else {
                            console.log("Utente già registrato, skip salvataggio.");
                        }

                        // 3. Salva in locale e procedi
                        localStorage.setItem('uscivicspro_user', JSON.stringify(user));
                        setStep('quiz');
                    } catch (e) {
                        console.error("Errore Firebase:", e);
                        // In caso di errore (es. adblock), procedi comunque
                        setStep('quiz'); 
                    }
                } else {
                    alert("Please enter your email");
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors mt-2"
            >
              Start Practice Test
            </button>
            <p className="text-xs text-center text-slate-600 mt-4">We respect your privacy. No spam.</p>
          </div>
        </div>
      </div>
    );
  }

  // 3. QUIZ INTERFACE
  if (step === 'quiz') {
    if (gameQuestions.length === 0) return <div className="text-white text-center mt-20">Loading questions...</div>;

    const q = gameQuestions[currentQIndex];
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center p-6">
        <div className="w-full max-w-2xl mt-10">
          {/* Progress */}
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Question {currentQIndex + 1} of {gameQuestions.length}</span>
            <span>Score: {score}</span>
          </div>
          <div className="h-2 bg-slate-900 rounded-full overflow-hidden mb-12">
            <div 
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${((currentQIndex + 1) / gameQuestions.length) * 100}%` }}
            ></div>
          </div>

          {/* Question Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-12 shadow-xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 leading-relaxed">
              {q.question}
            </h2>

            <div className="relative mb-8">
              <input 
                type="text"
                value={inputAnswer}
                onChange={(e) => setInputAnswer(e.target.value)}
                placeholder="Type answer or tap mic..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 pr-12 text-lg text-white placeholder-slate-600 focus:border-blue-500 outline-none transition-colors"
              />
              <button 
                onClick={startListening}
                className={`absolute right-2 top-2 p-2 rounded-lg transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                <Mic className="w-6 h-6" />
              </button>
            </div>

            <button 
              onClick={handleNextQuestion}
              className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold py-4 rounded-xl transition-colors text-lg"
            >
              Confirm Answer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. RESULTS
  if (step === 'result') {
    const passed = score >= 12; 
    
    // Link mailto per inviarsi il risultato da soli (Budget Zero Solution)
    const mailSubject = "My USCivicsPro Test Results";
    const mailBody = `I just practiced for the US Citizenship Test on USCivicsPro.\n\nMy Score: ${score}/20\nResult: ${passed ? 'PASSED' : 'FAILED'}\n\nStudy hard!`;
    const mailToLink = `mailto:${user.email}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-lg text-center shadow-2xl">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${passed ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
            {passed ? <CheckCircle className="w-10 h-10" /> : <BookOpen className="w-10 h-10" />}
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">{passed ? 'Congratulations!' : 'Keep Practicing!'}</h2>
          <p className="text-slate-400 mb-8">You scored <span className="text-white font-bold text-xl">{score}</span> out of {gameQuestions.length}</p>

          <div className="grid gap-4">
             {/* Share Button (Nativo o Clipboard) */}
             <button 
                onClick={handleShare}
                className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition-colors border border-slate-700"
             >
              <Share2 className="w-5 h-5" /> Share Result
            </button>

            {/* Email Result Button (Mailto) */}
            <a 
                href={mailToLink}
                className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition-colors border border-slate-700"
            >
                <Mail className="w-5 h-5" /> Save Result via Email
            </a>

            {/* UPSELL SECTION */}
            <div className="bg-gradient-to-r from-blue-900/50 to-slate-900 p-4 rounded-xl border border-blue-500/30 mt-4">
                <p className="text-sm text-blue-200 mb-3">Want to study all 128 questions?</p>
                <a 
                    href="https://www.amazon.com/Citizenship-Test-Study-Guide-2026/dp/B0FQHZ9K6V/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                >
                    Get the 2026 Study Guide
                </a>
            </div>
            
            <button 
                onClick={() => {
                    initGame();
                    setStep('quiz');
                }}
                className="text-slate-500 text-sm hover:text-white mt-2"
            >
                Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;