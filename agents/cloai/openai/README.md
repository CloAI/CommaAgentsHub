# OpenAIAPIAgent Documentation 📘

## Overview 🌐
The OpenAIAPIAgent is a specialized agent for interacting with OpenAI's powerful APIs. OpenAI offers a range of Large Language Models (LLMs) like GPT-3, which are capable of understanding and generating human-like text, making them ideal for various AI-driven tasks. 🤖💬

### What is OpenAI's API?
OpenAI's API provides access to their state-of-the-art language models. It's a gateway to advanced AI functionalities, including text completion, translation, summarization, and more. The API is designed for ease of integration and scalability.

### OpenAIAPIAgent: Bridging Python and OpenAI
The `OpenAIAPIAgent` is a Python class that serves as a bridge between your Python application and OpenAI's API. It simplifies sending requests to and handling responses from OpenAI's language models.

## Example Usage 🚀

```python
from comma_agents.hub.cloai.openai import OpenAIAPIAgent

# Configuration for the OpenAIAPIAgent
config = {
    "model_name": "text-davinci-003",
    "api_key": "YOUR_API_KEY_HERE",
    "base_url": "https://api.openai.com"
}

# Initialize the OpenAIAPIAgent
openai_agent = OpenAIAPIAgent("MyOpenAIAgent", config)

# Send a message to the OpenAI model
message = "Translate 'Hello, world!' to French."
response = openai_agent._call_llm(message)

# Display the model's response
print(f"OpenAI's Response: {response}")
```

This example demonstrates how to set up an `OpenAIAPIAgent`, configure it with your API key and desired model, and receive a response for a given prompt.

## OpenAIAPIAgent Class Documentation 📖

### Class Overview
`OpenAIAPIAgent` is a subclass of `BaseAgent`, tailored for interactions with OpenAI's API. It allows for seamless integration and communication with OpenAI's language models.

### Initialization Parameters
- `name` (str): The name of the agent.
- `config` (OpenAIAPIAgentConfig): Configuration settings for the OpenAI API. Includes `model_name`, `api_key`, and `base_url`.
- `**kwargs`: Additional keyword arguments for BaseAgent configuration.

### Attributes
- `openai_api_client` (OpenAI): The OpenAI API client instance.
- `config` (OpenAIAPIAgentConfig): Configuration settings for the agent.

### Methods
- `_call_llm(message: str)`: Sends a message to the OpenAI model and retrieves its response.