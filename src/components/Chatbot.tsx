import { useState, useRef, useEffect } from 'react';
import { FaArrowAltCircleUp, FaHome, FaEnvelope } from "react-icons/fa";
import { Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactMarkdown from 'react-markdown';
import { motion } from "framer-motion";
import { FaChevronRight } from 'react-icons/fa';
import { Send, Home, MessageCircle, HelpCircle, Phone, Mail, Calendar, ChevronRight, Wrench } from 'lucide-react';

type Message = {
  type: 'bot' | 'user';
  text: string;
  feedback: string | null;
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [screen, setScreen] = useState<'chat' | 'intro'>('chat');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingMessage, setTypingMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [messageQueue, setMessageQueue] = useState<string[]>([]);
  const [botBusy, setBotBusy] = useState(false);

  const [userId] = useState(() => {
    const existing = sessionStorage.getItem("user_id");
    if (existing) return existing;
    const random = `user_${Math.random().toString(36).substring(2, 10)}`;
    sessionStorage.setItem("user_id", random);
    return random;
  });

  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(`chat_messages_${userId}`, JSON.stringify(messages));
    }
  }, [messages, userId]);

  useEffect(() => {
    const savedMessages = sessionStorage.getItem(`chat_messages_${userId}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, [userId]);

  const userName = (sessionStorage.getItem("chat_name") || "Guest").charAt(0).toUpperCase() + (sessionStorage.getItem("chat_name") || "Guest").slice(1);

  const faqData = [
    {
      question: "What services does KasselWood Fabricators provide?",
      answer: "We provide residential and commercial renovations, including kitchens, bathrooms, basements, custom cabinetry, woodworking, and architectural millwork."
    },
    {
      question: "Do you handle both design and construction phases of a project?",
      answer: "Yes — we offer full-service solutions from the design and planning stage through material selection, construction, and finishing."
    },
    {
      question: "Can you execute custom cabinetry and woodwork projects?",
      answer: "Absolutely. We specialize in custom cabinets, wardrobes, vanities, and bespoke woodwork tailored to each client’s space and preferences."
    },
    {
      question: "Do you offer services for both residential and commercial properties?",
      answer: "Yes — we cater to both homes and commercial spaces such as offices, shops, restaurants with renovation and custom furniture solutions."
    },
    {
      question: "Do you provide a free quote and initial consultation?",
      answer: "Yes. We offer a free site visit and estimate to evaluate project needs and discuss budgets."
    },
    {
      question: "How do you ensure the quality of workmanship and materials?",
      answer: "We employ experienced craftspeople and use premium-quality materials to guarantee durable, high-quality results."
    },
    {
      question: "Are you licensed and insured?",
      answer: "Yes — we are fully licensed and insured to operate as a renovation contractor."
    },
    {
      question: "Can you handle partial projects (e.g. only cabinetry) or do you require full renovation contracts?",
      answer: "We can take on partial projects, such as cabinetry or specific rooms, as well as full-scale renovations."
    },
    {
      question: "Do you provide custom design ideas and help with material selection?",
      answer: "Yes — we collaborate with clients to design layouts, select materials, and plan finishes tailored to their style and budget."
    },
    {
      question: "How long does a typical cabinetry or renovation project take?",
      answer: "Project timelines vary depending on size and complexity; timelines will be provided after initial evaluation."
    }
  ];


  useEffect(() => {
    if (isOpen) {
      const visited = sessionStorage.getItem("visited_chatbot");

      if (!visited) {
        setScreen("intro");
        sessionStorage.setItem("visited_chatbot", "true");
      } else {
        setScreen("chat");
      }
    }
  }, [isOpen]);


  useEffect(() => {
    const greeted = sessionStorage.getItem("greeted_user");

    if (screen === "chat" && !greeted) {
      handleBotResponse("Hello! 👋 Welcome to Kasselwood Fabricators. How can I help you today?");
      sessionStorage.setItem("greeted_user", "true");
    }
  }, [screen]);



  const handleBotResponse = async (userMessage: string) => {
    setBotBusy(true);
    setTypingMessage("Adam is typing...");

    try {
      const res = await fetch("https://auto.robogrowthpartners.com/webhook/kasselwoodfabricators-chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, message: userMessage })
      });

      const data = await res.json();
      const replies = (data.reply || "").split("\\k").filter((part: string) => part.trim() !== "");

      for (let i = 0; i < replies.length; i++) {
        setTypingMessage("Adam is typing...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTypingMessage(null);
        setMessages(prev => [...prev, { type: 'bot', text: replies[i].trim(), feedback: null }]);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

    } catch {
      setTypingMessage(null);
      setMessages(prev => [...prev, { type: 'bot', text: "Oops! Something went wrong.", feedback: null }]);
    }

    setBotBusy(false);
    setMessageQueue(prev => {
      const [nextMessage, ...rest] = prev;
      if (nextMessage) {
        setTimeout(() => {
          handleBotResponse(nextMessage);
        }, 2000);
      }
      return rest;
    });
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;
    const message = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: message, feedback: null }]);

    if (botBusy) {
      setMessageQueue(prev => [...prev, message]);
    } else {
      await handleBotResponse(message);
    }
  };

  const handleHelpClick = (prompt: string) => {
    setScreen("chat");
    handleBotResponse(prompt);
  };

  const handleFormSubmit = () => {
    setScreen("chat");
    const pendingPrompt = sessionStorage.getItem("pending_prompt");
    const firstMessage = `User info: Name = ${name}, Email = ${email}${pendingPrompt ? `\n\n${pendingPrompt}` : ""}`;
    handleBotResponse(firstMessage);

    sessionStorage.removeItem("pending_prompt");

  };

  // Function to handle direct messaging without form
  const [firstMessageSent, setFirstMessageSent] = useState(true);

  useEffect(() => {
    sessionStorage.setItem("first_message_sent", "true");
  }, []);


  const handleDirectMessage = () => {
    setScreen("chat");

    if (firstMessageSent) return; // prevent re-sending

    const storedName = sessionStorage.getItem("chat_name");
    const storedEmail = sessionStorage.getItem("chat_email");

    if (!storedName || !storedEmail) {
      handleBotResponse("Hello, I'd like to start a conversation.");
    }

    setFirstMessageSent(true);
    sessionStorage.setItem("first_message_sent", "true");
  };


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingMessage]);


  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'fixed',
            bottom: '-0px',
            right: '0px',
            zIndex: 10000,
          }}
        >
          <Card style={{ width: '390px', height: '610px', display: 'flex', flexDirection: 'column', borderRadius: "30px", overflow: "hidden" }}>

            {/* Modern Header */}

            <div className={screen === 'intro' ? '' : ''} style={{
              background: "linear-gradient(135deg, #000000ff, #7a7a7aff)",
              padding: '20px',
              paddingTop: "20px",
              color: 'white',
              minHeight: "100px"
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>

                <img
                  src="./logo.png"
                  alt="Chatbot Logo"
                  style={{
                    width: "250px",
                    height: "50px",
                    // borderRadius: "50%",
                    paddingTop: " 0px",
                    marginTop: "20px",
                    objectFit: "cover",
                    marginRight: "10px"
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              </div>
            </div>

            {/* Main Body */}
            <Card.Body style={{ overflowY: 'auto', flex: 1, padding: '10px' }}>

              {screen === "intro" && (
  <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
    <h5 style={{ textAlign: "center", marginBottom: "20px", fontWeight: "600", fontSize: "18px" }}>Frequently Asked Questions</h5>
    {faqData.map((faq, index) => (
      <div
        key={index}
        style={{
          border: "1px solid #ecebeb",
          borderRadius: "10px",
          marginBottom: "12px",
          overflow: "hidden",
          boxShadow: openIndex === index ? "0 4px 12px rgba(0,0,0,0.1)" : "0 2px 6px rgba(0,0,0,0.05)",
          transition: "box-shadow 0.3s ease",
        }}
      >
        <button
          onClick={() => toggleFAQ(index)}
          style={{
            width: "100%",
            background: "#ffffff",
            border: "none",
            padding: "12px 20px",
            textAlign: "left",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            outline: "none",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {faq.question}
          <span style={{ transform: openIndex === index ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>+</span>
        </button>
        <div
          style={{
            maxHeight: openIndex === index ? "500px" : "0",
            transition: "max-height 0.4s ease, padding 0.4s ease",
            padding: openIndex === index ? "10px 20px 15px" : "0 20px",
            background: "#fafafa",
          }}
        >
          <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>{faq.answer}</p>
        </div>
      </div>
    ))}
  </div>
)}




              {screen === 'chat' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '10px' }}>
                    {messages.map((msg, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start', marginBottom: '8px' }}>

                        <div style={{
                          maxWidth: '75%',
                          paddingLeft: '13px',
                          paddingTop: '14px',
                          paddingRight: '13px',
                          borderRadius: '20px',
                          color: msg.type === 'user' ? 'white' : 'black',
                          background: msg.type === 'user' ? 'linear-gradient(135deg, #000000ff, #7a7a7aff)' : '#f1f1f1',
                          fontSize: "14px"
                        }}>
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                    {typingMessage && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <img src="./chatbot.gif" alt="Bot" style={{ width: '28px', height: '28px', marginRight: '8px', borderRadius: '50%', backgroundColor: 'black' }} />
                        <div className="typing-indicator">
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div style={{
                    display: 'flex',
                    padding: '8px',
                    boxShadow: "0 -4px 10px -4px #dfdfdf8a",
                    background: '#fff'
                  }}>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '20px',
                        border: '1px solid #ccc',
                        outline: 'none',
                        fontSize: '14px'
                      }}
                    />
                    <Button
                      onClick={sendMessage}
                      style={{
                        marginLeft: '8px',
                        borderRadius: '50%',
                        background: "linear-gradient(135deg, #000000ff, #7a7a7aff)",
                        width: '40px',
                        border: "none",
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FaArrowAltCircleUp size={20} />
                    </Button>
                  </div>
                </div>
              )}




            </Card.Body>

            <Card.Footer
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                padding: '10px 0',
                borderTop: '1px solid #ddd',
                background: '#f8f9fa',
                fontFamily: "'Segoe UI', sans-serif",
                fontWeight: 500,
                boxShadow: (screen === 'intro') ? "0 5px 10px #b3b3b3ff" : "none"
              }}
            >
              {[
                { icon: FaEnvelope, label: 'Chat', screenName: 'chat' },
                { icon: HelpCircle, label: 'FAQ', screenName: 'intro' }
              ].map((item, idx) => {
                const Icon = item.icon;
                const isActive = screen === item.screenName;

                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    style={{
                      textAlign: 'center',
                      cursor: 'pointer',
                      color: isActive ? '#000000ff' : '#555',
                      padding: '5px 10px',
                      borderRadius: '8px'
                    }}
                    onClick={() => {
                      if (item.screenName === 'chat') {
                        // Go directly to chat without requiring form
                        handleDirectMessage();
                      } else if (item.screenName) {
                        setScreen(item.screenName);
                      }
                    }}
                  >
                    <Icon size={22} style={{ transition: 'color 0.3s ease' }} />
                    <div style={{ fontSize: 12, marginTop: 2 }}>{item.label}</div>
                  </motion.div>
                );
              })}
            </Card.Footer>

          </Card>
        </motion.div>
      )}
    </>
  );
};

export default Chatbot; 