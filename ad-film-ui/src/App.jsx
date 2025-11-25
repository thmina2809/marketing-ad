// src/App.jsx
import { useState } from "react";
import "./App.css";

const AGENT_API_URL =
  "https://ad-agent-backend-723049337857.us-central1.run.app/api/agent-chat"; // <-- keep this

// Map of scenes you want to highlight
const SCENES = [
  {
    id: "london",
    title: "London at Christmas",
    description: "The city skyline glowing with festive lights.",
    image: "https://storage.googleapis.com/holiday_add_assets/image1-frame.png",
  },
  {
    id: "living-room",
    title: "Cozy Living Room",
    description: "Jay working while his family decorates the tree.",
    image: "https://storage.googleapis.com/holiday_add_assets/image3-frame.png",
  },
  {
    id: "money-animation",
    title: "Money at Work",
    description: "Savings tree, rewards as gifts, investments graph.",
    image: "https://storage.googleapis.com/holiday_add_assets/image3-frame.png",
  },
];

const MAIN_VIDEO =
  "https://storage.googleapis.com/marketing-project-1/marketing-video2.mp4"; // your Veo video

function App() {
  const [messages, setMessages] = useState([
    {
      from: "agent",
      text: "Hi! I’m your Holiday Ad Assistant. Ask me about any scene, the story, or how the ad was created.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [highlightedScene, setHighlightedScene] = useState(null);
  const [highlightedMediaUrl, setHighlightedMediaUrl] = useState(null);

  const detectSceneFromText = (text) => {
    const t = text.toLowerCase();
    if (t.includes("london") || t.includes("skyline")) return "london";
    if (t.includes("living room") || t.includes("family") || t.includes("tree"))
      return "living-room";
    if (
      t.includes("money") ||
      t.includes("invest") ||
      t.includes("savings") ||
      t.includes("rewards")
    )
      return "money-animation";
    return null;
  };

  const extractFirstUrl = (text) => {
    const urlRegex = /(https?:\/\/[^\s)]+)/i;
    const match = text.match(urlRegex);
    return match ? match[1] : null;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    const userMsg = { from: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const sceneId = detectSceneFromText(userText);
    if (sceneId) {
      setHighlightedScene(SCENES.find((s) => s.id === sceneId) || null);
      setHighlightedMediaUrl(null);
    }

    try {
      const res = await fetch(AGENT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();
      const replyText =
        data.reply || "I couldn’t get a reply from the agent.";
      const agentMsg = { from: "agent", text: replyText };
      setMessages((prev) => [...prev, agentMsg]);

      const url = extractFirstUrl(replyText);
      if (url) {
        setHighlightedMediaUrl(url);
        setHighlightedScene(null);
      } else {
        const replyScene = detectSceneFromText(replyText);
        if (replyScene) {
          setHighlightedScene(
            SCENES.find((s) => s.id === replyScene) || null
          );
          setHighlightedMediaUrl(null);
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          from: "agent",
          text: "Sorry, something went wrong contacting the agent.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMessageText = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, idx) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={idx}
            href={part}
            target="_blank"
            rel="noreferrer"
            className="msg-link"
          >
            {part}
          </a>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="page-bg">
      <div className="shell">
        {/* HERO – full width */}
        <section className="hero-card full-width">
          <div className="hero-copy">
            <h1>Holiday Smart Money</h1>
            <p className="hero-tagline">
              Make your money work harder, even while you’re enjoying the
              season.
            </p>
            <p className="hero-sub">
              An AI-generated festive film showing how smart investments keep
              going in the background.
            </p>
            <div className="hero-badges">
              <span className="badge">Vertex AI · Veo 3.1</span>
              <span className="badge">Generative images</span>
              <span className="badge">Conversational agent</span>
            </div>
          </div>
          <div className="hero-video-wrapper">
            <video src={MAIN_VIDEO} controls className="hero-video" />
          </div>
        </section>

        {/* LOWER GRID – scenes / chat / info */}
        <div className="lower-grid">
          {/* LEFT: scenes */}
          <main className="column scenes-column">
            <div className="section-header">
              <h2>Scenes from the Film</h2>
              <p>Explore key festive moments highlighted in the ad.</p>
            </div>
            <div className="scene-grid">
              {SCENES.map((scene) => (
                <article key={scene.id} className="scene-card">
                  <div className="scene-thumb-wrapper">
                    <img
                      src={scene.image}
                      alt={scene.title}
                      className="scene-thumb"
                    />
                    <div className="scene-gradient" />
                  </div>
                  <div className="scene-body">
                    <h3>{scene.title}</h3>
                    <p>{scene.description}</p>
                    <button
                      className="link-button"
                      onClick={() => {
                        setHighlightedScene(scene);
                        setHighlightedMediaUrl(null);
                      }}
                    >
                      Preview this scene
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </main>

          {/* MIDDLE: chat */}
          <aside className="column chat-column">
            <header className="chat-header">
              <h2>Ask the Ad Assistant</h2>
              <p>Ask about any scene, line of script, or how it was made.</p>
            </header>

            <div className="chat-window">
              {messages.map((m, i) => (
                <div key={i} className={`msg ${m.from}`}>
                  {renderMessageText(m.text)}
                </div>
              ))}
              {loading && <div className="msg agent">Thinking…</div>}
            </div>

            {(highlightedScene || highlightedMediaUrl) && (
              <div className="suggested-media">
                <h3>Suggested view</h3>
                {highlightedMediaUrl ? (
                  highlightedMediaUrl.match(/\.(mp4|webm)$/i) ? (
                    <video
                      src={highlightedMediaUrl}
                      controls
                      className="suggested-video"
                    />
                  ) : (
                    <img
                      src={highlightedMediaUrl}
                      alt="Suggested media"
                      className="suggested-image"
                    />
                  )
                ) : (
                  highlightedScene && (
                    <>
                      <img
                        src={highlightedScene.image}
                        alt={highlightedScene.title}
                        className="suggested-image"
                      />
                      <p className="suggested-caption">
                        {highlightedScene.title}: {highlightedScene.description}
                      </p>
                    </>
                  )
                )}
              </div>
            )}

            <div className="chat-input-area">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about a scene, the script, or how the ad was generated..."
              />
              <button onClick={sendMessage} disabled={loading}>
                {loading ? "Sending…" : "Send"}
              </button>
            </div>
          </aside>

          {/* RIGHT: attractive info panel */}
          <aside className="column info-column">
            <div className="info-card">
              <h2>Behind the Film</h2>
              <p className="info-sub">
                A multichannel experience produced entirely with Generative AI.
              </p>
              <ul className="info-list">
                <li>
                  <span className="info-label">35s</span>
                  <span className="info-text">AI-generated holiday story</span>
                </li>
                <li>
                  <span className="info-label">3</span>
                  <span className="info-text">Key scenes: home, city, money</span>
                </li>
                <li>
                  <span className="info-label">4</span>
                  <span className="info-text">
                    Technologies: Veo, images, agents, Cloud Run
                  </span>
                </li>
              </ul>
              <div className="info-steps">
                <h3>How it was made</h3>
                <ol>
                  <li>Script & prompts crafted for each scene.</li>
                  <li>Video generated with Veo on Vertex AI.</li>
                  <li>Images & assets stored in Cloud Storage.</li>
                  <li>Interactive assistant built with agents.</li>
                </ol>
              </div>
              <div className="info-logos">
                <span>Infosys</span>
                <span>Techzooka</span>
                <span>Aster</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;
