import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function App() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summaryInput, setSummaryInput] = useState("");
  const [summaryResult, setSummaryResult] = useState("");
  const [model, setModel] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // fetch health to get model name
    axios
      .get(`${API_BASE}/health`)
      .then((res) => {
        if (res.data && res.data.model) setModel(res.data.model);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function sendMessage() {
    if (!message.trim()) return;
    const userMsg = message.trim();
    setHistory((prev) => [...prev, { from: "user", text: userMsg }]);
    setMessage("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/chat`, { message: userMsg });
      if (res.data) {
        const botText = res.data.response;
        setHistory((prev) => [...prev, { from: "bot", text: botText }]);
      }
    } catch (err) {
      console.error(err);
      setHistory((prev) => [
        ...prev,
        { from: "bot", text: "Error: cannot reach server" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSummarize() {
    if (!summaryInput.trim()) return;
    setLoading(true);
    setSummaryResult("");
    try {
      const res = await axios.post(`${API_BASE}/summary`, {
        text: summaryInput,
      });
      setSummaryResult(res.data.summary);
    } catch (err) {
      console.error(err);
      setSummaryResult("Error: cannot reach server");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    await axios.post(`${API_BASE}/reset`).catch(() => {});
    setHistory([]);
    setSummaryResult("");
    setSummaryInput("");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Chat Column */}
        <div className="p-6 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">LLM ChatBot</h2>
            <div className="text-sm text-gray-500">
              Model:{" "}
              <span className="font-medium">{model || "loading..."}</span>
            </div>
          </div>

          <div
            className="mt-4 mb-4 flex-1 overflow-y-auto border border-gray-100 rounded-lg p-4 bg-slate-50"
            style={{ height: "60vh" }}
          >
            {history.length === 0 && (
              <div className="text-gray-400">
                Say hi to start the conversation.
              </div>
            )}
            {history.map((m, i) => (
              <div
                key={i}
                className={`mb-3 max-w-[85%] ${
                  m.from === "user" ? "ml-auto text-right" : "mr-auto text-left"
                }`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-lg ${
                    m.from === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-900 shadow"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send"}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 border rounded-lg"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Summary Column */}
        <div className="p-6 border-l">
          <h3 className="text-xl font-semibold">Summarize Text</h3>
          <p className="text-sm text-gray-500 mt-1">
            Paste any long text and get a short summary.
          </p>

          <textarea
            value={summaryInput}
            onChange={(e) => setSummaryInput(e.target.value)}
            rows={10}
            className="w-full mt-4 p-3 border rounded-lg resize-none"
            placeholder="Paste text here..."
          ></textarea>

          <div className="mt-3 flex gap-2">
            <button
              onClick={handleSummarize}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-60"
            >
              {loading ? "Summarizing..." : "Summarize"}
            </button>
            <button
              onClick={() => {
                setSummaryInput("");
                setSummaryResult("");
              }}
              className="px-4 py-2 border rounded-lg"
            >
              Clear
            </button>
          </div>

          {summaryResult && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
              <h4 className="font-medium mb-2">Summary</h4>
              <div className="text-gray-800 whitespace-pre-wrap">
                {summaryResult}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
