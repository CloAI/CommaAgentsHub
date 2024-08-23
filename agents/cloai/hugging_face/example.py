import sys
sys.path.insert(0, './')

from agent import HFAgent
from comma_agents.prompts import Llama31PromptTemplate
from transformers import LlamaConfig

agent_instance = HFAgent(
    name="Hugging Face Agent Example",
    prompt_template=Llama31PromptTemplate(),
    config={
        "model_path": "lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF",
        "hugging_face_model_config": {
            "gguf_file": "Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf",
            "config": LlamaConfig.from_pretrained("meta-llama/Meta-Llama-3.1-8B-Instruct")
        },
        "tokenizer_model_config": {
           "gguf_file": "Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf",
           "config": LlamaConfig.from_pretrained("meta-llama/Meta-Llama-3.1-8B-Instruct")
        }
    }
)

agent_instance.call("What is the capital of France? Thank you!")