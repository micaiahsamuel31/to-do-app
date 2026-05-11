from pydantic import BaseModel, ConfigDict


class APIModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class WorkspaceCreate(BaseModel):
    name: str


class WorkspaceUpdate(BaseModel):
    name: str


class WorkspaceRead(APIModel):
    id: int
    name: str


class UserCreate(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserRead(APIModel):
    id: int
    username: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TodoCreate(BaseModel):
    title: str
    workspace_id: int
    completed: bool = False


class TodoUpdate(BaseModel):
    title: str | None = None
    workspace_id: int | None = None
    completed: bool | None = None


class TodoRead(APIModel):
    id: int
    title: str
    completed: bool
    workspace_id: int | None = None


class TimetableItemCreate(BaseModel):
    title: str
    day: str
    workspace_id: int
    time: str | None = None


class TimetableItemUpdate(BaseModel):
    title: str | None = None
    day: str | None = None
    workspace_id: int | None = None
    time: str | None = None


class TimetableItemRead(APIModel):
    id: int
    title: str
    day: str
    workspace_id: int
    time: str | None = None
