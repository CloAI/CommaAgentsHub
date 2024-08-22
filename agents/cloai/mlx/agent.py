import mlx.core as mx
from mlx_lm import load, generate, stream_generate
from comma_agents.agents.base_agent import BaseAgent
from typing import TypedDict
from comma_agents.prompts.base_prompt import PromptTemplate

class MLXAgent(BaseAgent):
    class Config(TypedDict):
        model_path: str
        max_tokens: int
        temp: float
        seed: int
        stream: bool
    
    def __init__(self, name, config: "MLXAgent.Config", **kwargs):
        super().__init__(name, **kwargs)
        self.config = config
        self.model = None
        
        if kwargs.get("prompt_template") is None:
            self.prompt_template = PromptTemplate("{user_message} {assistant_message}")
        if self.config["seed"] is not None:
            mx.random.seed(self.config["seed"])
        if self.config["temp"] is None:
            self.config["temp"] = 0.0
        if self.config["max_tokens"] is None:
            self.config["max_tokens"] = 256
        if self.config.get("stream") is None:
            self.config["stream"] = False
        
        
    def _call_llm(self, message: str) -> str:
        if self.model is None:
            self.model, self.tokenizer = load(self.config["model_path"])
        
        mlx_lm_config = {k: v for k, v in self.config.items() if k not in ["model_path", "stream", "seed"]}
        
        if self.config.get("stream") is not None and self.config["stream"]:
            response = stream_generate(self.model, self.tokenizer, message, **mlx_lm_config)
        else:
            response = generate(self.model, self.tokenizer, message, **mlx_lm_config)
            
        return response
