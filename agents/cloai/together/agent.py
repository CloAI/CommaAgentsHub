from comma_agents.agents import BaseAgent
import together

class TogetherAIAgent(BaseAgent):
    def __init__(self, name, config, *args, **kwargs):
        super().__init__(name, *args, **kwargs)
        self.config = config
    
    def _call_llm(self, message: str) -> str:
        response = together.Complete.create(
            prompt=message,
            **self.config,
        )
        return response['output']['choices'][0]['text']
