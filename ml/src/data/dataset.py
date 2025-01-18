from pathlib import Path
from typing import Dict, List, Optional, Union
import json

import torch
from torch.utils.data import Dataset
from transformers import PreTrainedTokenizer


class PhishingDataset(Dataset):
    """Dataset for phishing detection fine-tuning."""
    
    def __init__(
        self,
        data_files: Union[str, List[str], Dict[str, str]],
        tokenizer: PreTrainedTokenizer,
        max_length: int = 2048,
        cache_dir: Optional[str] = None
    ):
        """
        Initialize the dataset.
        
        Args:
            data_files: Path(s) to data files. Can be a string, list of strings, or dict.
            tokenizer: Tokenizer to use for encoding.
            max_length: Maximum sequence length.
            cache_dir: Directory to cache processed features.
        """
        self.tokenizer = tokenizer
        self.max_length = max_length
        self.cache_dir = Path(cache_dir) if cache_dir else None
        
        # Load and process data
        self.examples = self._load_data(data_files)
        
    def _load_data(self, data_files: Union[str, List[str], Dict[str, str]]) -> List[dict]:
        """Load and preprocess the data files."""
        examples = []
        
        # Convert to list if string or dict
        if isinstance(data_files, str):
            data_files = [data_files]
        elif isinstance(data_files, dict):
            data_files = list(data_files.values())
        
        for file_path in data_files:
            # Check cache first
            if self.cache_dir:
                cache_path = self.cache_dir / f"{Path(file_path).stem}_processed.pt"
                if cache_path.exists():
                    examples.extend(torch.load(cache_path))
                    continue
            
            # Load and process file
            file_examples = self._process_file(file_path)
            examples.extend(file_examples)
            
            # Cache processed examples
            if self.cache_dir:
                self.cache_dir.mkdir(parents=True, exist_ok=True)
                torch.save(file_examples, cache_path)
        
        return examples
    
    def _process_file(self, file_path: str) -> List[dict]:
        """Process a single data file."""
        examples = []
        
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                example = json.loads(line.strip())
                processed = self._create_example(example)
                if processed:
                    examples.append(processed)
        
        return examples
    
    def _create_example(self, example: dict) -> Optional[dict]:
        """Create a single training example from a JSON record."""
        try:
            # Combine subject and content
            email_text = f"Subject: {example['subject']}\n\n{example['content']}"
            
            # Format as instruction
            instruction = "Analyze this email for phishing attempts:"
            response = example['analysis']
            
            # Format full text
            text = f"### Instruction: {instruction}\n\n{email_text}\n\n### Response: {response}"
            
            # Tokenize
            encodings = self.tokenizer(
                text,
                max_length=self.max_length,
                padding="max_length",
                truncation=True,
                return_tensors="pt"
            )
            
            # Create labels (same as input_ids for causal LM)
            encodings["labels"] = encodings["input_ids"].clone()
            
            # Mask prompt tokens (instruction and email content)
            prompt = f"### Instruction: {instruction}\n\n{email_text}\n\n### Response:"
            prompt_len = len(self.tokenizer(prompt).input_ids)
            encodings["labels"][:, :prompt_len] = -100
            
            # Convert to regular tensors (not batched)
            return {k: v.squeeze(0) for k, v in encodings.items()}
            
        except Exception as e:
            print(f"Error processing example: {e}")
            return None
    
    def __len__(self) -> int:
        return len(self.examples)
    
    def __getitem__(self, idx: int) -> dict:
        return self.examples[idx] 