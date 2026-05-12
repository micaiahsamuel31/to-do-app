from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, inspect, text
from sqlalchemy.orm import Session

from auth.routes import router as auth_router
from auth.security import get_current_user
from database import Base, engine, get_db
import models
import schemas


def normalize_text(value: str) -> str:
    return value.strip()


def get_workspace_or_404(
    db: Session,
    workspace_id: int,
    current_user: models.User,
) -> models.Workspace:
    workspace = (
        db.query(models.Workspace)
        .filter(
            models.Workspace.id == workspace_id,
            models.Workspace.user_id == current_user.id,
        )
        .first()
    )

    if workspace is None:
        raise HTTPException(status_code=404, detail="Workspace not found")

    return workspace


def get_todo_or_404(
    db: Session,
    todo_id: int,
    current_user: models.User,
) -> models.Todo:
    todo = (
        db.query(models.Todo)
        .join(models.Workspace)
        .filter(
            models.Todo.id == todo_id,
            models.Workspace.user_id == current_user.id,
        )
        .first()
    )

    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    return todo


def get_timetable_item_or_404(
    db: Session,
    item_id: int,
    current_user: models.User,
) -> models.TimetableItem:
    item = (
        db.query(models.TimetableItem)
        .join(models.Workspace)
        .filter(
            models.TimetableItem.id == item_id,
            models.Workspace.user_id == current_user.id,
        )
        .first()
    )

    if item is None:
        raise HTTPException(status_code=404, detail="Timetable item not found")

    return item


def add_missing_sqlite_columns() -> None:
    inspector = inspect(engine)

    table_names = inspector.get_table_names()

    if "workspaces" not in table_names:
        return

    workspace_columns = {
        column["name"] for column in inspector.get_columns("workspaces")
    }
    workspace_indexes = inspector.get_indexes("workspaces")
    todo_columns = set()

    if "todos" in table_names:
        todo_columns = {
            column["name"] for column in inspector.get_columns("todos")
        }

    with engine.begin() as connection:
        if "user_id" not in workspace_columns:
            connection.execute(
                text("ALTER TABLE workspaces ADD COLUMN user_id INTEGER")
            )

        if "todos" in table_names and "time_left_minutes" not in todo_columns:
            connection.execute(
                text("ALTER TABLE todos ADD COLUMN time_left_minutes INTEGER")
            )

        for index in workspace_indexes:
            is_global_name_index = (
                index["name"] == "ix_workspaces_name"
                and index.get("unique")
                and index.get("column_names") == ["name"]
            )

            if is_global_name_index:
                connection.execute(text("DROP INDEX IF EXISTS ix_workspaces_name"))
                connection.execute(
                    text(
                        "CREATE INDEX IF NOT EXISTS "
                        "ix_workspaces_name ON workspaces (name)"
                    )
                )

        connection.execute(
            text(
                "CREATE UNIQUE INDEX IF NOT EXISTS "
                "ix_workspaces_user_id_name ON workspaces (user_id, name) "
                "WHERE user_id IS NOT NULL"
            )
        )


def ensure_default_workspaces(db: Session, current_user: models.User) -> None:
    for workspace_name in ("Home", "Work"):
        existing_workspace = (
            db.query(models.Workspace)
            .filter(
                models.Workspace.user_id == current_user.id,
                func.lower(models.Workspace.name) == workspace_name.lower(),
            )
            .first()
        )

        if existing_workspace is None:
            db.add(models.Workspace(name=workspace_name, user_id=current_user.id))

    db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    add_missing_sqlite_columns()

    yield


app = FastAPI(title="Todo API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://to-do-app-frontend-8tuw.onrender.com"
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.get("/")
def home():
    return {"message": "Todo API Running"}


@app.get("/workspaces", response_model=list[schemas.WorkspaceRead])
def list_workspaces(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    ensure_default_workspaces(db, current_user)

    return (
        db.query(models.Workspace)
        .filter(models.Workspace.user_id == current_user.id)
        .order_by(models.Workspace.id)
        .all()
    )


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
        .filter(
            models.Workspace.user_id == current_user.id,
            func.lower(models.Workspace.name) == workspace_name.lower(),
        )
        .first()
    )

    if duplicate_workspace is not None:
        raise HTTPException(status_code=409, detail="Workspace already exists")

    workspace = models.Workspace(name=workspace_name, user_id=current_user.id)
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
    workspace = get_workspace_or_404(db, workspace_id, current_user)
    workspace_name = normalize_text(workspace_data.name)

    if workspace_name == "":
        raise HTTPException(status_code=400, detail="Workspace name is required")

    duplicate_workspace = (
        db.query(models.Workspace)
        .filter(
            models.Workspace.id != workspace_id,
            models.Workspace.user_id == current_user.id,
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
    workspace = get_workspace_or_404(db, workspace_id, current_user)

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
    query = (
        db.query(models.Todo)
        .join(models.Workspace)
        .filter(models.Workspace.user_id == current_user.id)
    )

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

    if todo_data.time_left_minutes is not None and todo_data.time_left_minutes < 1:
        raise HTTPException(
            status_code=400,
            detail="Time left must be at least 1 minute",
        )

    get_workspace_or_404(db, todo_data.workspace_id, current_user)

    todo = models.Todo(
        title=todo_title,
        completed=todo_data.completed,
        time_left_minutes=todo_data.time_left_minutes,
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
    todo = get_todo_or_404(db, todo_id, current_user)

    if todo_data.title is not None:
        todo_title = normalize_text(todo_data.title)

        if todo_title == "":
            raise HTTPException(status_code=400, detail="Todo title is required")

        todo.title = todo_title

    if todo_data.completed is not None:
        todo.completed = todo_data.completed

    if todo_data.time_left_minutes is not None:
        if todo_data.time_left_minutes < 1:
            raise HTTPException(
                status_code=400,
                detail="Time left must be at least 1 minute",
            )

        todo.time_left_minutes = todo_data.time_left_minutes

    if todo_data.workspace_id is not None:
        get_workspace_or_404(db, todo_data.workspace_id, current_user)
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
    todo = get_todo_or_404(db, todo_id, current_user)

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
    query = (
        db.query(models.TimetableItem)
        .join(models.Workspace)
        .filter(models.Workspace.user_id == current_user.id)
    )

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

    get_workspace_or_404(db, item_data.workspace_id, current_user)

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
    item = get_timetable_item_or_404(db, item_id, current_user)

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
        get_workspace_or_404(db, item_data.workspace_id, current_user)
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
    item = get_timetable_item_or_404(db, item_id, current_user)

    db.delete(item)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
