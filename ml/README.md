# ML Pipeline for Phishing Detection

This directory contains the machine learning pipeline for phishing detection using TinyLLaMA.

## Quick Start

1. Setup environment:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. Generate synthetic training data:
```bash
python src/data/generate_synthetic.py
```
This will create synthetic data in `data/synthetic/`:
- train.jsonl (800 samples)
- val.jsonl (100 samples)
- test.jsonl (100 samples)

3. Train the model:
```bash
python src/training/train.py
```

## Project Structure

```
ml/
├── data/               # Data directory
│   ├── raw/           # Raw data sources
│   └── synthetic/     # Generated synthetic data
├── src/               # Source code
│   ├── data/          # Data processing
│   ├── models/        # Model definitions
│   └── training/      # Training scripts
└── outputs/           # Training outputs
```

## Configuration

Training configuration is managed through Hydra. See `src/config/` for configuration files:
- `config.yaml`: Main configuration
- `model.yaml`: Model-specific settings
- `training.yaml`: Training hyperparameters

## Development Workflow

1. Data Preparation
   - Generate synthetic data
   - Validate data format and quality
   - Check data distribution

2. Training
   - Configure hyperparameters
   - Run training
   - Monitor with WandB

3. Evaluation
   - Validate on test set
   - Generate metrics
   - Export model

4. Deployment
   - Convert to MLC format
   - Optimize for browser
   - Package for WebLLM

## Monitoring

Training progress can be monitored through:
- Command line output
- WandB dashboard (when enabled)
- Training logs in outputs/

## Model Export

After training, models can be exported in two formats:
1. Hugging Face format (for API deployment)
2. MLC format (for browser deployment)

See the deployment section in ML.md for detailed deployment instructions.
