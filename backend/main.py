from fastapi import FastAPI
from database import engine


app = FastAPI()

@app.get("/")
def home():
    return {"message": "Todo API Running"}