from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base


class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, index=True)

    todos = relationship(
        "Todo",
        back_populates="workspace",
        cascade="all, delete-orphan"
    )
    timetable_items = relationship(
        "TimetableItem",
        back_populates="workspace",
        cascade="all, delete-orphan"
    )


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False, unique=True, index=True)
    hashed_password = Column(String, nullable=False)


class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=True)

    workspace = relationship("Workspace", back_populates="todos")


class TimetableItem(Base):
    __tablename__ = "timetable_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    time = Column(String, nullable=True)
    day = Column(String, nullable=False, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=False)

    workspace = relationship("Workspace", back_populates="timetable_items")
