from comma_agents.agents.base_agent import BaseAgent
from comma_agents.prompts.base_prompt import PromptTemplate

from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
import torch
from typing import TypedDict

class HFAgent(BaseAgent):
    class HFConfig(TypedDict):
        model_path: str
        quantized: bool
        quantize_config: dict
        tokenizer_path: str
        tokenizer_model_config: dict
        tokenizer_config: dict
        hugging_face_model_config: dict
        generation_config: dict

    
    def __init__(self, name, config: HFConfig, **kwargs):
        super().__init__(name, **kwargs)
        self.model = None
        self.tokenizer = None
        self.config = config
        
        
    def _call_llm(self, message: str):
        if self.model is None:
            if self.config.get("quantized", False):
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.config["model_path"],
                    quantization_config=BitsAndBytesConfig(**self.config.get("quantize_config", {"load_in_8bit": True})),
                    **self.config.get("hugging_face_model_config", {
                        "device_map":"auto"
                    })
                )
            else:
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.config["model_path"],
                    **self.config.get("hugging_face_model_config", {
                        "device_map":"auto",
                        "torch_dtype": torch.float32,
                    })
                )
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.config["tokenizer_path"] if self.config.get("tokenizer_path") else self.config["model_path"],
                **self.config.get("tokenizer_model_config", {})
            )

        inputs = self.tokenizer(
            message, 
            **self.config.get("tokenizer_config", {
                "return_tensors":"pt",
                "add_special_tokens":False
            })
        )
        inputs = {key: tensor.to(self.model.device) for key, tensor in inputs.items()}
        model_outputs = self.model.generate(**inputs, **self.config.get("generation_config", {
            "max_length": 256,
            "temperature": 0.0,
        }))
        response = self.tokenizer.decode(model_outputs[0][inputs['input_ids'].size(1):], skip_special_tokens=True)

        return response
    

    
   