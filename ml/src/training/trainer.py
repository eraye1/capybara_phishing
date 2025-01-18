import logging
from pathlib import Path
from typing import Optional

import torch
import wandb
from torch.distributed import destroy_process_group, init_process_group
from torch.nn.parallel import DistributedDataParallel as DDP
from torch.optim import AdamW
from torch.utils.data import DataLoader, DistributedSampler
from tqdm.auto import tqdm
from transformers import get_linear_schedule_with_warmup

from ..models.llama_peft import LLaMaPhishingModel


class PhishingModelTrainer:
    """Trainer class for the phishing detection model."""
    
    def __init__(
        self,
        config,
        model: Optional[LLaMaPhishingModel] = None,
        train_dataloader: Optional[DataLoader] = None,
        eval_dataloader: Optional[DataLoader] = None,
        local_rank: int = 0
    ):
        self.config = config
        self.model = model
        self.train_dataloader = train_dataloader
        self.eval_dataloader = eval_dataloader
        self.local_rank = local_rank
        
        self.device = torch.device(f"cuda:{local_rank}" if torch.cuda.is_available() else "cpu")
        self.global_step = 0
        
        # Setup logging
        logging.basicConfig(level=logging.INFO if local_rank == 0 else logging.WARNING)
        self.logger = logging.getLogger(__name__)
        
        # Initialize W&B for monitoring
        if local_rank == 0:
            # Convert config to a serializable dict
            config_dict = {
                "model_name": config.model_name,
                "peft_config": config.peft_config,
                "lora_r": config.lora_r,
                "lora_alpha": config.lora_alpha,
                "lora_dropout": config.lora_dropout,
                "target_modules": config.target_modules,
                "learning_rate": config.learning_rate,
                "weight_decay": config.weight_decay,
                "warmup_steps": config.warmup_steps,
                "max_steps": config.max_steps,
                "batch_size": config.batch_size,
                "max_length": config.max_length,
            }
            wandb.init(
                project="phishing-detection",
                config=config_dict,
                name=f"llama-peft-{config.peft_config}",
                mode="disabled"  # Disable wandb for now
            )
    
    def setup_optimization(self):
        """Setup optimizer and learning rate scheduler."""
        # Create optimizer
        optimizer = AdamW(
            self.model.model.parameters(),  # Access the underlying PyTorch model
            lr=self.config.learning_rate,
            weight_decay=self.config.weight_decay
        )
        
        # Create learning rate scheduler
        num_training_steps = self.config.max_steps
        num_warmup_steps = self.config.warmup_steps
        
        scheduler = get_linear_schedule_with_warmup(
            optimizer,
            num_warmup_steps=num_warmup_steps,
            num_training_steps=num_training_steps
        )
        
        return optimizer, scheduler
    
    def save_checkpoint(self, step: int):
        """Save model checkpoint."""
        if self.local_rank == 0:
            output_dir = Path(self.config.output_dir) / f"checkpoint-{step}"
            output_dir.mkdir(parents=True, exist_ok=True)
            
            # Save model state
            self.model.save_pretrained(output_dir)
            
            self.logger.info(f"Saved checkpoint to {output_dir}")
    
    def train(self):
        """Train the model."""
        # Setup optimizer and scheduler
        optimizer, scheduler = self.setup_optimization()
        
        # Set model to training mode
        self.model.model.train()
        
        # Training loop
        progress_bar = tqdm(range(self.config.max_steps), disable=self.local_rank != 0)
        for step in range(self.config.max_steps):
            batch = next(iter(self.train_dataloader))
            batch = {k: v.to(self.device) for k, v in batch.items()}
            
            # Forward pass
            outputs = self.model.model(**batch)
            loss = outputs.loss
            
            # Backward pass
            loss = loss / self.config.gradient_accumulation_steps
            loss.backward()
            
            if (step + 1) % self.config.gradient_accumulation_steps == 0:
                torch.nn.utils.clip_grad_norm_(
                    self.model.model.parameters(),
                    self.config.max_grad_norm
                )
                optimizer.step()
                scheduler.step()
                optimizer.zero_grad()
            
            # Logging
            if self.local_rank == 0:
                progress_bar.update(1)
                wandb.log(
                    {
                        "loss": loss.item() * self.config.gradient_accumulation_steps,
                        "learning_rate": scheduler.get_last_lr()[0],
                    },
                    step=self.global_step,
                )
            
            # Evaluation
            if (step + 1) % self.config.eval_steps == 0:
                eval_results = self.evaluate()
                if self.local_rank == 0:
                    wandb.log(eval_results, step=self.global_step)
            
            # Save checkpoint
            if (step + 1) % self.config.save_steps == 0:
                self.save_checkpoint(step + 1)
            
            self.global_step += 1
        
        progress_bar.close()
    
    @torch.no_grad()
    def evaluate(self):
        """Evaluate the model."""
        # Set model to evaluation mode
        self.model.model.eval()
        
        total_loss = 0
        num_batches = 0
        
        for batch in self.eval_dataloader:
            batch = {k: v.to(self.device) for k, v in batch.items()}
            outputs = self.model.model(**batch)
            loss = outputs.loss
            total_loss += loss.item()
            num_batches += 1
        
        # Set model back to training mode
        self.model.model.train()
        
        return {
            "eval_loss": total_loss / num_batches,
        } 