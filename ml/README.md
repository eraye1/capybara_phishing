# Phishing Detection with LLaMA

This project fine-tunes a TinyLLaMA model for phishing detection using LoRA (Low-Rank Adaptation) and the PEFT (Parameter-Efficient Fine-Tuning) framework.

## Project Structure

```
ml/
├── data/
│   └── synthetic/      # Generated synthetic dataset
├── src/
│   ├── config/         # Configuration files
│   ├── data/           # Data loading and processing
│   ├── models/         # Model architecture
│   └── training/       # Training scripts
├── outputs/            # Training outputs and checkpoints
└── tests/             # Unit tests
```

## Setup

1. Create a Python virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate  # On Unix/macOS
```

2. Install dependencies:

```bash
pip install -e .
```

## Training

The project uses Hydra for configuration management. The main configuration file is `src/config/model_config.py`.

To train the model:

```bash
python3 -m src.training.train
```

This will:

1. Generate synthetic training data if it doesn't exist
2. Initialize the TinyLLaMA model with LoRA adapters
3. Train the model using the specified configuration

### Configuration

Key configuration parameters:

- Model: TinyLLaMA 1.1B with LoRA adapters
- Training:
  - Learning rate: 2e-5
  - Batch size: 1 (optimized for CPU training)
  - Max sequence length: 512
  - Training steps: 1000
  - Warmup steps: 100
  - Gradient accumulation steps: 4

### Data

The project uses synthetic data for training, generated with:

- 800 training examples
- 100 validation examples
- 100 test examples
- 50/50 split between phishing and non-phishing examples

## Model Architecture

The model uses:

- Base model: TinyLLaMA 1.1B
- LoRA adaptation with:
  - Rank: 64
  - Alpha: 32
  - Target modules: query and value projections
  - Dropout: 0.05

## Development

The project uses:

- Black for code formatting
- isort for import sorting
- ruff for linting
- pytest for testing

## Outputs

Training outputs are saved in the `outputs/` directory, including:

- Model checkpoints
- Training logs
- Evaluation metrics
- Hydra configuration snapshots
