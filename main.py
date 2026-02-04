
import os
import pandas as pd
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import backend_models as models
from backend_database import engine, get_db
from passlib.context import CryptContext
import datetime

# 初始化数据库
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="学令教育 API")

# 跨域设置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 辅助函数
def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# --- 认证接口 ---

@app.post("/auth/register")
def register(username: str = Form(...), phone: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.phone == phone).first()
    if db_user:
        raise HTTPException(status_code=400, detail="手机号已注册")
    
    hashed_pwd = get_password_hash(password)
    new_user = models.User(username=username, phone=phone, hashed_password=hashed_pwd, role="user")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "注册成功", "user_id": new_user.id}

@app.post("/auth/login")
def login(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    # 管理员硬编码验证
    if username == "xueling" and password == "xl123456":
        return {"id": 0, "username": "xueling", "role": "admin", "token": "admin-token-mock"}
    
    db_user = db.query(models.User).filter(models.User.username == username).first()
    if not db_user or not verify_password(password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    
    return {"id": db_user.id, "username": db_user.username, "role": db_user.role, "token": "user-token-mock"}

# --- 论坛接口 ---

@app.get("/forum/posts")
def get_posts(db: Session = Depends(get_db)):
    return db.query(models.Post).order_by(models.Post.created_at.desc()).all()

@app.post("/forum/posts")
def create_post(title: str, content: str, author: str, link: Optional[str] = None, db: Session = Depends(get_db)):
    # 实际应用中应校验是否为admin
    new_post = models.Post(title=title, content=content, author=author, link=link)
    db.add(new_post)
    db.commit()
    return {"message": "发布成功"}

@app.get("/forum/quote")
def get_quote(db: Session = Depends(get_db)):
    quote = db.query(models.Quote).first()
    return {"content": quote.content if quote else "书山有路勤为径"}

@app.put("/forum/quote")
def update_quote(content: str, db: Session = Depends(get_db)):
    quote = db.query(models.Quote).first()
    if quote:
        quote.content = content
    else:
        quote = models.Quote(content=content)
        db.add(quote)
    db.commit()
    return {"message": "更新成功"}

# --- 资料接口 ---

@app.get("/resources")
def list_resources(module: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Resource)
    if module:
        query = query.filter(models.Resource.module == module)
    return query.all()

@app.post("/resources")
async def upload_resource(title: str = Form(...), module: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_location = f"uploads/resources/{file.filename}"
    os.makedirs(os.path.dirname(file_location), exist_ok=True)
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())
    
    new_res = models.Resource(title=title, module=module, file_path=file_location)
    db.add(new_res)
    db.commit()
    return {"message": "资料上传成功"}

# --- 建议与反馈 ---

@app.post("/suggestions")
def submit_suggestion(user_id: int, content: str, db: Session = Depends(get_db)):
    new_sug = models.UserSuggestion(user_id=user_id, content=content)
    db.add(new_sug)
    db.commit()
    return {"message": "提交成功"}

@app.get("/admin/suggestions")
def admin_get_suggestions(db: Session = Depends(get_db)):
    return db.query(models.UserSuggestion).all()

@app.put("/admin/suggestions/{sug_id}/feedback")
def admin_feedback(sug_id: int, feedback: str, db: Session = Depends(get_db)):
    sug = db.query(models.UserSuggestion).filter(models.UserSuggestion.id == sug_id).first()
    if sug:
        sug.feedback = feedback
        db.commit()
    return {"message": "反馈成功"}

# --- 单词默写器 ---

@app.post("/words/upload")
async def upload_words_excel(module: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    # 读取 Excel
    df = pd.read_excel(file.file)
    # 假设 Excel 列为: english, chinese, pos, ipa
    for _, row in df.iterrows():
        word = models.Word(
            english=str(row['english']),
            chinese=str(row['chinese']),
            pos=str(row.get('pos', '')),
            ipa=str(row.get('ipa', '')),
            module=module
        )
        db.add(word)
    db.commit()
    return {"message": f"成功从 {file.filename} 导入单词到模块 {module}"}

@app.get("/words/quiz")
def get_quiz_words(module: str, limit: int = 20, db: Session = Depends(get_db)):
    return db.query(models.Word).filter(models.Word.module == module).order_by(models.Word.id).limit(limit).all()

@app.post("/mistakes")
def add_to_mistake_book(user_id: int, word_id: int, db: Session = Depends(get_db)):
    entry = models.MistakeBook(user_id=user_id, word_id=word_id)
    db.add(entry)
    db.commit()
    return {"message": "已加入错题本"}

@app.get("/mistakes/{user_id}")
def get_mistakes(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.MistakeBook).filter(models.MistakeBook.user_id == user_id).all()

@app.delete("/mistakes/{mistake_id}")
def delete_mistake(mistake_id: int, db: Session = Depends(get_db)):
    db.query(models.MistakeBook).filter(models.MistakeBook.id == mistake_id).delete()
    db.commit()
    return {"message": "删除成功"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
