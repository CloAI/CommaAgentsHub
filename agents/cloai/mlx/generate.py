# Copyright © 2023 Apple Inc.

import argparse
import time

import mlx.core as mx
from .models import Model, load, generate as model_generate
import transformers


def generate(
    model: Model,
    tokenizer: transformers.AutoTokenizer,
    input_prompt: str,
    max_tokens: int,
    temp: float = 0.0,
):
    prompt = tokenizer(
        input_prompt,
        return_tensors="np",
        return_attention_mask=False,
    )[
        "input_ids"
    ][0]
    prompt = mx.array(prompt)

    tokens = []
    skip = 0
    for token, n in zip(
        model_generate(prompt, model, temp),
        range(max_tokens),
    ):
        if token == tokenizer.eos_token_id:
            break

        tokens.append(token.item())
    return tokenizer.decode(tokens)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="inference script")
    parser.add_argument(
        "--model",
        type=str,
        default="mlx_model",
        help="The path to the local model directory or Hugging Face repo.",
    )
    parser.add_argument(
        "--prompt",
        help="The message to be processed by the model",
        default="In the beginning the Universe was created.",
    )
    parser.add_argument(
        "--max-tokens",
        "-m",
        type=int,
        default=100,
        help="Maximum number of tokens to generate",
    )
    parser.add_argument(
        "--temp",
        help="The sampling temperature.",
        type=float,
        default=0.0,
    )
    parser.add_argument("--seed", type=int, default=0, help="The PRNG seed")

    args = parser.parse_args()
    mx.random.seed(args.seed)
    model, tokenizer = load(args.model)
    generate(model, tokenizer, args.prompt, args.max_tokens, args.temp)