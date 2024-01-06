from comma_agents.agents.base_agent import BaseAgent
from comma_agents.prompts.base_prompt import PromptTemplate
from generate import generate
from models import load
from typing import TypedDict
import mlx.core as mx

class MLXAgent(BaseAgent):
    class Config(TypedDict):
        model_path: str
        max_tokens: int
        temp: float
        seed: int
    
    def __init__(self, name, config: "MLXAgent.Config", **kwargs):
        super().__init__(name, prompt_template=PromptTemplate("{user_message} {assistant_message}"), **kwargs)
        self.model, self.tokenizer = load(config["model_path"])
        self.config = config
        if self.config["seed"] is not None:
            mx.random.seed(self.config["seed"])
        if self.config["temp"] is None:
            self.config["temp"] = 0.0
        if self.config["max_tokens"] is None:
            self.config["max_tokens"] = 256
        
        
    def _call_llm(self, message: str) -> str:
        response = generate(self.model, self.tokenizer, message, self.config["max_tokens"], self.config["temp"])
        return response
    

    
   