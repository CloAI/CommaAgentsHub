# HuggingFace Documentation 📘

## Overview 🌐

The HuggingFaceAgent is a specialized agent for utilizing Large Language Models (LLMs) on many different devices, leveraging the Hugging Face Transformers library. It provides access to a range of LLMs available on the [Hugging Face Model Hub](https://huggingface.co/models).

```python
from comma_agents.hub.agents.cloai.hugging_face import HFAgent
from comma_agents.prompts import Llama31PromptTemplate

agent_instance = HFAgent(
    name="Hugging Face Agent Example",
    prompt_template=Llama31PromptTemplate(),
    config={
        "model_path": "meta-llama/Meta-Llama-3.1-8B-Instruct",
    }
)

agent_instance.call("What is the capital of France? Thank you!")
```