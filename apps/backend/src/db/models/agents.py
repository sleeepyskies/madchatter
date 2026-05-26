from sqlalchemy import Column, Integer, ForeignKey, String

from db.base import Base


class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True)
    label = Column(String(256), nullable=False)
    # todo: what other fields do we need? prompt, voice_model, llm_model ...

