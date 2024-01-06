# MLXAgent Documentation 📘

## Overview 🌐
The MLXAgent is a specialized agent for utilizing Large Language Models (LLMs) on Apple Silicon, leveraging the MLX framework developed by Apple. It provides access to a range of LLMs available on the [MLX Community](https://huggingface.co/mlx-community) hosted by Hugging Face.

### What is MLX?
MLX is an array framework designed for machine learning on Apple Silicon, created by Apple's machine learning research team. It offers a Python API similar to NumPy and higher-level packages akin to PyTorch, making it user-friendly yet efficient for training and deploying models.

### Key Features of MLX
- **Familiar APIs:** Python API resembling NumPy, and C++ API mirroring Python's functionality.
- **Composable Function Transformations:** Supports automatic differentiation, vectorization, and computation graph optimization.
- **Lazy Computation & Dynamic Graph Construction:** Efficient execution with lazy computations and dynamic graph construction for adaptable argument shapes.
- **Multi-Device Compatibility:** Functions can run on supported devices like CPU and GPU.
- **Unified Memory Model:** Shared memory arrays for operations across different device types without data transfer.
- **User-Friendly for Researchers:** Simplified framework design for easy extension and exploration of new ideas.

## Example Usage 🚀

```python
from comma_agents.hub.cloai.mlx import MLXAgent

# Initialize the MLXAgent
mlx_agent = MLXAgent("mlx test", {
    "model_path": "mlx-community/TinyLlama-1.1B-Chat-v1.0-4bit", # Local path or MLX Community path
    "max_tokens": 256,
    "temp": 0.0,
    "seed": 0
})

# Send a prompt to the model
prompt = "What's the meaning of life?"
response = mlx_agent.call(prompt)

# Display the model's response
print(f"MLX Agent's Response: {response}")
```

This example demonstrates the initialization of an `MLXAgent`, configuration with model path and settings, and how to obtain a response for a prompt.

## MLXAgent Class Documentation 📖

### Class Overview
`MLXAgent` is designed to interact with LLMs optimized for Apple Silicon, specifically integrating with models from the MLX Community on Hugging Face.

### Initialization Parameters
- `name` (str): The name of the agent.
- `config` (dict): Configuration settings including `model_path`, `max_tokens`, `temp`, and `seed`.

### Methods
- `call(prompt: str)`: Sends a prompt to the chosen LLM and retrieves its response.

---

For further details on the MLX framework and available LLMs, visit [MLX Community on Hugging Face](https://huggingface.co/mlx-community). Or checkout out MLX main repo for more machine learning related applications [MLX Main Repo](https://github.com/ml-explore/mlx)