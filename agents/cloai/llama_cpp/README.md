# LLaMaAgent Documentation 📘

## Overview 🌐
LLaMa Cpp is an exciting Python wrapper for LLaMa-based Large Language Models (LLMs). It enables running LLMs locally and processing their responses efficiently. This powerful tool brings the capabilities of LLaMa models right to your local environment, making AI interactions more accessible and customizable. 🚀🤖

### What is LLaMa?
LLaMa (Large Language Model) is a type of language model known for its ability to understand and generate human-like text. It's a key player in the world of natural language processing and AI.

### What is LLaMa Cpp?
LLaMa Cpp is a Python wrapper for these LLaMa models. It provides a convenient way to integrate LLaMa's capabilities into Python projects, allowing for local running and processing of LLM responses. 🐍✨

## Example Usage 🚀

```python
from comma_agents.hub.cloai.llama_cpp import LLaMaAgent

# Initialize the LLaMaAgent
llama_agent = LLaMaAgent("MyLLaMaAgent", llama_config={})

# Send a prompt to the LLaMa model
prompt = "What's the meaning of life?"
response = llama_agent.call(prompt)

# Display the LLaMa's wisdom
print(f"LLaMa's Response: {response}")
```

This example demonstrates creating an instance of `LLaMaAgent`, sending a prompt, and displaying the response from the LLaMa model.

## LLaMaAgent Class Documentation 📖

### Class Overview
`LLaMaAgent` is a subclass of `BaseAgent` designed specifically for interactions with LLaMa models. It extends the basic functionalities of a BaseAgent by integrating with LLaMa, facilitating easy handling and processing of interactions with this language model.

### Initialization Parameters
- `name` (str): Name of the agent, used for identification and logging.
- `llama_config` (dict, optional): Configuration settings for the LLaMa model that is passed into [llama-cpp-python API](https://llama-cpp-python.readthedocs.io/en/latest/api-reference/). Defaults to an empty dictionary.
- `unload_on_completion` (bool, optional): Whether to unload the LLaMa model from memory after each call. Defaults to `False`.
- `**kwargs`: Additional keyword arguments for BaseAgent configuration.

### Attributes
- `llama_config` (dict): Configuration settings for the LLaMa model.
- `llm` (Llama): An instance of the LLaMa model.

### Methods
- `_call_llm(prompt='', *args, **kwargs)`: Sends a prompt to the LLaMa model and returns its response.
