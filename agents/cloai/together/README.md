# TogetherAIAgent Documentation 📘

## Overview 🌐
`TogetherAIAgent` is a custom agent designed for interfacing with the Together AI platform, which enables the use of various machine learning models for tasks like language generation, chat, and image processing. This agent is built on Python and extends the `BaseAgent` class from the `comma_agents.agents` module.

### What is Together AI?
Together AI provides an accessible platform for running and fine-tuning a variety of leading open-source models. It offers features like serverless model inference and support for advanced GPU clusters, making it ideal for a range of AI applications.

### TogetherAIAgent: Enhancing Integration with Together AI
The `TogetherAIAgent` facilitates efficient communication between Python applications and the Together AI platform. It simplifies the process of sending requests to and processing responses from the platform's diverse machine learning models.

## Example Usage 🚀

```python
from comma_agents.hub.agents.cloai.together import TogetherAIAgent
# Configuration for TogetherAIAgent
config = {
    "model": "model_name_here",
    "max_tokens": 128,
    "temperature": 0.7,
    # ... other configuration parameters
}

# Initialize the TogetherAIAgent
together_ai_agent = TogetherAIAgent("MyTogetherAIAgent", config=config)

# Send a message to the model
message = "What is the meaning of life?"
response = together_ai_agent.call(message)

# Display the model's response
print(response)
```

This example shows how to initialize the `TogetherAIAgent`, configure it with the necessary parameters, and receive a response for a given prompt.

## TogetherAIAgent Class Documentation 📖

### Class Overview
- `TogetherAIAgent` extends `BaseAgent`, specifically tailored for interactions with the Together AI platform.

### Initialization Parameters
- `name` (str): The name of the agent.
- `config` (dict): Configuration settings for the Together AI model. Includes parameters like `model`, `max_tokens`, and other optional settings.

### Attributes
- `config` (dict): Configuration settings for the agent.

### Methods
- `_call_llm(message: str)`: Sends a message to the Together AI model and retrieves its response.

### Config Parameters
- `prompt` (str): The prompt to send to the model.
- `model` (str, optional): The model to use for the task.
- `max_tokens` (int, optional): The maximum number of tokens to generate.
- Other optional parameters like `temperature`, `top_p`, `top_k`, `repetition_penalty`, etc., to fine-tune the response behavior.

---

For more detailed information about the available models and configurations, refer to the [Together AI's Documentation](https://docs.together.ai/docs/inference-models).