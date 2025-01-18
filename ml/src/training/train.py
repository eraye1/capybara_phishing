import logging
import os
from pathlib import Path

import hydra
import torch
from omegaconf import DictConfig
from torch.utils.data import DataLoader
from transformers import set_seed

from ..data.dataset import PhishingDataset
from ..models.llama_peft import LLaMaPhishingModel
from .trainer import PhishingModelTrainer


# Setup logging
logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
    datefmt="%m/%d/%Y %H:%M:%S",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)


# Set environment variable to disable tokenizer parallelism
os.environ["TOKENIZERS_PARALLELISM"] = "false"


@hydra.main(config_path="../config", config_name="model_config", version_base="1.1")
def main(config: DictConfig) -> None:
    """Main training function."""
    # Set random seed
    set_seed(config.seed)
    
    # Get local rank for distributed training
    local_rank = int(os.environ.get("LOCAL_RANK", 0))
    
    logger.info("Initializing model...")
    model = LLaMaPhishingModel(config)
    model.setup_model()
    
    logger.info("Loading datasets...")
    # Initialize tokenizer (already done in model setup)
    tokenizer = model.tokenizer
    
    # Setup data paths - use absolute paths since Hydra changes working directory
    project_root = Path(__file__).parent.parent.parent
    data_dir = project_root / "data" / "synthetic"
    
    # Load training data
    train_dataset = PhishingDataset(
        data_files=str(data_dir / "train.jsonl"),
        tokenizer=tokenizer,
        max_length=config.max_length,
        cache_dir=Path(config.output_dir) / "cache"
    )
    
    # Load evaluation data
    eval_dataset = PhishingDataset(
        data_files=str(data_dir / "val.jsonl"),
        tokenizer=tokenizer,
        max_length=config.max_length,
        cache_dir=Path(config.output_dir) / "cache"
    )
    
    logger.info(f"Train dataset size: {len(train_dataset)}")
    logger.info(f"Eval dataset size: {len(eval_dataset)}")
    
    # Create data loaders with minimal workers since we're CPU bound
    train_dataloader = DataLoader(
        train_dataset,
        batch_size=config.batch_size,
        shuffle=True,
        num_workers=0,  # No workers since we're CPU bound
        pin_memory=False,  # Disable pin_memory since we're on CPU
    )
    
    eval_dataloader = DataLoader(
        eval_dataset,
        batch_size=config.eval_batch_size,
        shuffle=False,
        num_workers=0,  # No workers since we're CPU bound
        pin_memory=False,  # Disable pin_memory since we're on CPU
    )
    
    # Initialize trainer
    trainer = PhishingModelTrainer(
        config=config,
        model=model,
        train_dataloader=train_dataloader,
        eval_dataloader=eval_dataloader,
        local_rank=local_rank,
    )
    
    logger.info("Starting training...")
    trainer.train()
    logger.info("Training completed!")


if __name__ == "__main__":
    # First generate synthetic data if it doesn't exist
    from ..data.synthetic_data import generate_dataset
    
    project_root = Path(__file__).parent.parent.parent
    data_dir = project_root / "data" / "synthetic"
    if not data_dir.exists() or not list(data_dir.glob("*.jsonl")):
        logger.info("Generating synthetic dataset...")
        generate_dataset(
            num_samples=1000,
            output_dir=str(data_dir),
            phishing_ratio=0.5
        )
    
    main() 