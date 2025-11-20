# backend/app/main.py
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from google import genai

load_dotenv()

API_KEY = os.getenv("LLM_API_KEY")
if not API_KEY:
    raise RuntimeError("LLM_API_KEY missing in backend/.env")

LLM_MODEL = "gemini-2.0-flash-lite"

client = genai.Client(api_key=API_KEY)

app = FastAPI(title="LLM Chatbot")

# Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory chat history
chat_history = []


class ChatRequest(BaseModel):
    message: str


class SummaryRequest(BaseModel):
    text: str


@app.get("/health")
async def health():
    return {"status": "ok", "model": LLM_MODEL}


@app.post("/chat")
async def chat(req: ChatRequest):
    user_message = req.message
    chat_history.append({"from": "user", "text": user_message})

    # build dialogue
    history_text = "\n".join([f"{h['from']}: {h['text']}" for h in chat_history])
    prompt = f"{history_text}\nbot:"

    result = client.models.generate_content(model=LLM_MODEL, contents=prompt)

    bot_text = result.text.strip()
    chat_history.append({"from": "bot", "text": bot_text})

    return {"response": bot_text, "history": chat_history}


@app.post("/summary")
async def summarize(req: SummaryRequest):
    text = req.text.strip()
    if not text:
        return {"summary": ""}

    prompt = f"Summarize the following:\n\n{text}"

    result = client.models.generate_content(model=LLM_MODEL, contents=prompt)

    return {"summary": result.text.strip()}


@app.post("/reset")
async def reset():
    chat_history.clear()
    return {"status": "reset"}
