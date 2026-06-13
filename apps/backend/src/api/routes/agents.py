from fastapi import APIRouter, Depends, HTTPException
from starlette import status

from api.dependencies import get_agent_service
from models.agent import AgentResponse, CreateAgentRequest, UpdateAgentRequest
from services.agent_service import AgentService

AGENT_PREFIX = "/agents"

router = APIRouter(prefix=AGENT_PREFIX, tags=["agents"])


@router.post("/", response_model=AgentResponse)
def create_agent(
        request: CreateAgentRequest,
        agent_service: AgentService = Depends(get_agent_service),
):
    return agent_service.create_agent(request)


@router.get("", response_model=list[AgentResponse])
def list_agents(agent_service: AgentService = Depends(get_agent_service)):
    return agent_service.list_agents()


@router.get("/{agent_id}", response_model=AgentResponse)
def get_agent(
        agent_id: int,
        agent_service: AgentService = Depends(get_agent_service),
):
    return agent_service.get_agent(agent_id)


@router.patch("/{agent_id}", response_model=AgentResponse)
def update_agent(
        agent_id: int,
        request: UpdateAgentRequest,
        agent_service: AgentService = Depends(get_agent_service),
):
    return agent_service.update_agent(agent_id, request)


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_agent(
        agent_id: int,
        agent_service: AgentService = Depends(get_agent_service),
):
    agent_service.delete_agent(agent_id)
