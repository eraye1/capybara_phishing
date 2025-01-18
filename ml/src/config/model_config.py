from dataclasses import dataclass
from typing import Optional

from hydra.core.config_store import ConfigStore


@dataclass
class ModelConfig:
    """Configuration for the LLaMA model and training setup."""
    
    # Model configuration
    model_name: str = "TinyLlama/TinyLlama-1.1B-intermediate-step-1431k-3T"
    peft_config: str = "lora"  # Options: lora, prefix, prompt-tuning
    lora_r: int = 64
    lora_alpha: int = 32
    lora_dropout: float = 0.05
    target_modules: list = ["q_proj", "v_proj"]
    
    # Training configuration
    learning_rate: float = 2e-5
    weight_decay: float = 0.01
    warmup_steps: int = 100
    max_steps: int = 1000
    gradient_accumulation_steps: int = 4
    max_grad_norm: float = 1.0
    
    # Data configuration
    max_length: int = 512
    batch_size: int = 1
    eval_batch_size: int = 2
    
    # Optimization configuration
    mixed_precision: str = "no"
    gradient_checkpointing: bool = False
    
    # Quantization configuration
    load_in_4bit: bool = False
    bnb_4bit_compute_dtype: str = "float32"
    bnb_4bit_quant_type: str = "nf4"
    
    # Directories
    output_dir: str = "outputs"
    logging_dir: str = "logs"
    
    # Miscellaneous
    seed: int = 42
    logging_steps: int = 10
    eval_steps: int = 100
    save_steps: int = 1000
    num_workers: int = 4


cs = ConfigStore.instance()
cs.store(name="model_config", node=ModelConfig) 