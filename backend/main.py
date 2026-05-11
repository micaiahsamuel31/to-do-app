from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
import os

from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import Base, SessionLocal, engine, get_db
import models
import schemas


SECRET_KEY = os.getenv("SECRET_KEY", "change-this-development-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def normalize_text(value: str) -> str:
    return value.strip()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    return password_context.hash(password)


def get_user_by_username(db: Session, username: str) -> models.User | None:
    return (
        db.query(models.User)
        .filter(func.lower(models.User.username) == username.lower())
        .first()
    )


def authenticate_user(db: Session, username: str, password: str) -> models.User | None:
    user = get_user_by_username(db, normalize_text(username))

    if user is None:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    token_data = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    token_data.update({"exp": expire})

    return jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")

        if username is None:
            raise credentials_exception
    except JWTError as exc:
        raise credentials_exception from exc

    user = get_user_by_username(db, username)

    if user is None:
        raise credentials_exception

    return user


def create_user_token(user: models.User) -> schemas.Token:
    access_token = create_access_token(data={"sub": user.username})

    return schemas.Token(access_token=access_token, token_type="bearer")


def get_workspace_or_404(
    db: Session,
    workspace_id: int,
) -> models.Workspace:
    workspace = db.query(models.Workspace).filter(models.Workspace.id == workspace_id).first()

    if workspace is None:
        raise HTTPException(status_code=404, detail="Workspace not found")

    return workspace


def get_todo_or_404(db: Session, todo_id: int) -> models.Todo:
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()

    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    return todo


def get_timetable_item_or_404(db: Session, item_id: int) -> models.TimetableItem:
    item = db.query(models.TimetableItem).filter(models.TimetableItem.id == item_id).first()

    if item is None:
        raise HTTPException(status_code=404, detail="Timetable item not found")

    return item


def ensure_default_workspaces(db: Session) -> None:
    for workspace_name in ("Home", "Work"):
        existing_workspace = (
            db.query(models.Workspace)
            .filter(func.lower(models.Workspace.name) == workspace_name.lower())
            .first()
        )

        if existing_workspace is None:
            db.add(models.Workspace(name=workspace_name))

    db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        ensure_default_workspaces(db)
    finally:
        db.close()

    yield


app = FastAPI(title="Todo API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Todo API Running"}


@app.post(
    "/auth/register",
    response_model=schemas.Token,
    status_code=status.HTTP_201_CREATED,
)
def register_user(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    username = normalize_text(user_data.username)

    if username == "":
        raise HTTPException(status_code=400, detail="Username is required")

    if len(user_data.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters",
        )

    if get_user_by_username(db, username) is not None:
        raise HTTPException(status_code=409, detail="Username already exists")

    user = models.User(
        username=username,
        hashed_password=hash_password(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return create_user_token(user)


@app.post("/auth/login", response_model=schemas.Token)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = authenticate_user(db, form_data.username, form_data.password)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return create_user_token(user)


@app.post("/auth/login-json", response_model=schemas.Token)
def login_user_json(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_data.username, user_data.password)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return create_user_token(user)


@app.get("/auth/me", response_model=schemas.UserRead)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user


@app.get("/workspaces", response_model=list[schemas.WorkspaceRead])
def list_workspaces(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.Workspace).order_by(models.Workspace.id).all()


@app.post(
    "/workspaces",
    response_model=schemas.WorkspaceRead,
    status_code=status.HTTP_201_CREATED,
)
def create_workspace(
    workspace_data: schemas.WorkspaceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    workspace_name = normalize_text(workspace_data.name)

    if workspace_name == "":
        raise HTTPException(status_code=400, detail="Workspace name is required")

    duplicate_workspace = (
        db.query(models.Workspace)
        .filter(func.lower(models.Workspace.name) == workspace_name.lower())
        .first()
    )

    if duplicate_workspace is not None:
        raise HTTPException(status_code=409, detail="Workspace already exists")

    workspace = models.Workspace(name=workspace_name)
    db.add(workspace)
    db.commit()
    db.refresh(workspace)

    return workspace


@app.patch("/workspaces/{workspace_id}", response_model=schemas.WorkspaceRead)
def update_workspace(
    workspace_id: int,
    workspace_data: schemas.WorkspaceUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    workspace = get_workspace_or_404(db, workspace_id)
    workspace_name = normalize_text(workspace_data.name)

    if workspace_name == "":
        raise HTTPException(status_code=400, detail="Workspace name is required")

    duplicate_workspace = (
        db.query(models.Workspace)
        .filter(
            models.Workspace.id != workspace_id,
            func.lower(models.Workspace.name) == workspace_name.lower(),
        )
        .first()
    )

    if duplicate_workspace is not None:
        raise HTTPException(status_code=409, detail="Workspace already exists")

    workspace.name = workspace_name
    db.commit()
    db.refresh(workspace)

    return workspace


@app.delete("/workspaces/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workspace(
    workspace_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    workspace = get_workspace_or_404(db, workspace_id)

    db.delete(workspace)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/todos", response_model=list[schemas.TodoRead])
def list_todos(
    workspace_id: int | None = None,
    completed: bool | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Todo)

    if workspace_id is not None:
        query = query.filter(models.Todo.workspace_id == workspace_id)

    if completed is not None:
        query = query.filter(models.Todo.completed == completed)

    return query.order_by(models.Todo.id).all()


@app.post(
    "/todos",
    response_model=schemas.TodoRead,
    status_code=status.HTTP_201_CREATED,
)
def create_todo(
    todo_data: schemas.TodoCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    todo_title = normalize_text(todo_data.title)

    if todo_title == "":
        raise HTTPException(status_code=400, detail="Todo title is required")

    get_workspace_or_404(db, todo_data.workspace_id)

    todo = models.Todo(
        title=todo_title,
        completed=todo_data.completed,
        workspace_id=todo_data.workspace_id,
    )
    db.add(todo)
    db.commit()
    db.refresh(todo)

    return todo


@app.patch("/todos/{todo_id}", response_model=schemas.TodoRead)
def update_todo(
    todo_id: int,
    todo_data: schemas.TodoUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    todo = get_todo_or_404(db, todo_id)

    if todo_data.title is not None:
        todo_title = normalize_text(todo_data.title)

        if todo_title == "":
            raise HTTPException(status_code=400, detail="Todo title is required")

        todo.title = todo_title

    if todo_data.completed is not None:
        todo.completed = todo_data.completed

    if todo_data.workspace_id is not None:
        get_workspace_or_404(db, todo_data.workspace_id)
        todo.workspace_id = todo_data.workspace_id

    db.commit()
    db.refresh(todo)

    return todo


@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    todo = get_todo_or_404(db, todo_id)

    db.delete(todo)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/timetable-items", response_model=list[schemas.TimetableItemRead])
def list_timetable_items(
    workspace_id: int | None = None,
    day: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.TimetableItem)

    if workspace_id is not None:
        query = query.filter(models.TimetableItem.workspace_id == workspace_id)

    if day is not None:
        query = query.filter(models.TimetableItem.day == normalize_text(day).lower())

    return query.order_by(models.TimetableItem.time, models.TimetableItem.id).all()


@app.post(
    "/timetable-items",
    response_model=schemas.TimetableItemRead,
    status_code=status.HTTP_201_CREATED,
)
def create_timetable_item(
    item_data: schemas.TimetableItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    item_title = normalize_text(item_data.title)
    item_day = normalize_text(item_data.day).lower()
    item_time = normalize_text(item_data.time or "")

    if item_title == "":
        raise HTTPException(status_code=400, detail="Timetable title is required")

    if item_day == "":
        raise HTTPException(status_code=400, detail="Timetable day is required")

    get_workspace_or_404(db, item_data.workspace_id)

    item = models.TimetableItem(
        title=item_title,
        day=item_day,
        time=item_time,
        workspace_id=item_data.workspace_id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    return item


@app.patch("/timetable-items/{item_id}", response_model=schemas.TimetableItemRead)
def update_timetable_item(
    item_id: int,
    item_data: schemas.TimetableItemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    item = get_timetable_item_or_404(db, item_id)

    if item_data.title is not None:
        item_title = normalize_text(item_data.title)

        if item_title == "":
            raise HTTPException(status_code=400, detail="Timetable title is required")

        item.title = item_title

    if item_data.day is not None:
        item_day = normalize_text(item_data.day).lower()

        if item_day == "":
            raise HTTPException(status_code=400, detail="Timetable day is required")

        item.day = item_day

    if item_data.time is not None:
        item.time = normalize_text(item_data.time)

    if item_data.workspace_id is not None:
        get_workspace_or_404(db, item_data.workspace_id)
        item.workspace_id = item_data.workspace_id

    db.commit()
    db.refresh(item)

    return item


@app.delete("/timetable-items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_timetable_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    item = get_timetable_item_or_404(db, item_id)

    db.delete(item)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
