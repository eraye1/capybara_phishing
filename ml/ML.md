# LLaMA Fine-tuning for Phishing Detection: Technical Design Document

> ⚠️ **WARNING: Active Development Area**
>
> This document describes features and capabilities that are actively being developed. Many components may be:
>
> - Incomplete or non-functional
> - Subject to major changes
> - Not yet implemented
> - Experimental in nature
>
> Please treat this as a technical planning document rather than a description of current functionality. If you're interested in using these features, check the repository's current status or open an issue for the latest implementation details.

## 1. Project Overview

### 1.1 Objective

Fine-tune a LLaMA foundation model to create a state-of-the-art phishing detection system with superior instruction-following capabilities and domain adaptation for security contexts.

### 1.2 Key Technical Goals

- Achieve >98% accuracy on phishing detection
- Minimize false positives (<0.1%)
- Fast inference time (<100ms)
- Robust against adversarial attacks
- Excellent instruction following for security analysis tasks
- Memory-efficient inference (<200MB)
- Support for quantized deployment

## 2. Model Architecture

### 2.1 Base Model Selection

- **Foundation Model**: TinyLlama/TinyLlama-1.1B-intermediate-step-1431k-3T
- **Rationale**:
  - Superior instruction-following capabilities
  - Strong zero-shot performance
  - Open weights availability
  - Excellent context window (4K tokens)
  - Small memory footprint
  - Efficient inference characteristics

### 2.2 Architecture Modifications

- **LoRA Adaptation Layers**
  - Rank: 64
  - Alpha: 32
  - Target modules: q_proj, v_proj
  - Dropout: 0.05

- **Additional Components**
  - Custom tokenizer extensions for security terminology
  - Specialized classification head
  - URL encoding layer

- **Model Compression Pipeline**
  - 4-bit quantization
  - Selective layer pruning
  - Knowledge distillation to smaller backbone
  - Optimized model checkpoint format

## 3. Training Infrastructure

### 3.1 Hardware Requirements

- 8x NVIDIA A100 80GB GPUs
- 2TB NVMe SSD
- 512GB RAM
- InfiniBand interconnect

### 3.2 Software Stack

- PyTorch 2.0+
- DeepSpeed ZeRO-3
- Hugging Face Transformers
- Flash Attention 2.0
- NVIDIA Apex

### 3.3 Distributed Training Setup

- DeepSpeed ZeRO-3 configuration
- Gradient checkpointing
- Mixed precision training (bf16)
- Gradient accumulation steps: 32

## 4. Dataset Engineering

### 4.1 Data Sources

1. OpenPhish corpus (1M+ samples)
2. PhishTank database
3. Internal security incident reports
4. Clean email corpus (negative samples)
5. Synthetic data generation

### 4.2 Data Processing Pipeline

1. URL extraction and normalization
2. HTML content parsing
3. Text cleaning and standardization
4. Language detection and filtering
5. Deduplication
6. Token length optimization

### 4.3 Data Augmentation

- Back-translation
- URL mutation
- Content paraphrasing
- Template-based generation
- Adversarial example injection

## 5. Training Methodology

### 5.1 Pre-training Phase

1. Domain adaptive pre-training on security corpus
2. Masked language modeling on phishing-specific vocabulary
3. Contrastive learning for URL patterns

### 5.2 Fine-tuning Phase

1. Instruction tuning using security-focused prompts
2. Supervised fine-tuning on phishing data
3. RLHF (Reinforcement Learning from Human Feedback)
4. DPO (Direct Preference Optimization)

### 5.3 Hyperparameters

- Learning rate: 2e-5
- Batch size: 1024 (global)
- Warmup steps: 1000
- Weight decay: 0.01
- Max sequence length: 2048
- Gradient clipping: 1.0

## 6. Evaluation Framework

### 6.1 Metrics

- Accuracy
- Precision
- Recall
- F1 Score
- ROC-AUC
- Inference latency
- Memory usage
- Instruction following score

### 6.2 Test Sets

1. Hold-out validation set
2. Zero-shot evaluation set
3. Adversarial test set
4. Time-shifted test set
5. Cross-domain test set

### 6.3 Evaluation Protocols

- Regular validation during training
- A/B testing with current solutions
- Human evaluation of instruction following
- Red team assessment

## 7. Model Export and Deployment

### 7.1 Model Optimization

- Knowledge distillation
- Quantization (INT8/INT4)
- Pruning
- ONNX export
- Optimized checkpoint format

### 7.2 Model Versioning

- Semantic versioning for releases
- Compatibility tracking
- Performance regression testing
- Size and memory benchmarking

### 7.3 Deployment Platforms

#### 7.3.1 Hugging Face Hub Deployment
- Model weights and tokenizer pushed to Hub
- Model card with:
  - Performance metrics
  - Usage examples
  - Deployment instructions
  - Hardware requirements
- Inference API endpoints
- Spaces demo deployment

#### 7.3.2 MLC Format Deployment
- TinyLLaMA model compilation to MLC format
- WebLLM integration setup
- Quantization profiles:
  - INT4 for memory efficiency
  - INT8 for balanced performance
- Browser-optimized inference
- WASM/WebGPU acceleration

#### 7.3.3 Deployment Pipeline
1. Export trained model checkpoints
2. Convert to Hugging Face format
3. Optimize and quantize
4. Generate MLC compilation
5. Push to Hugging Face Hub
6. Deploy WebLLM integration
7. Setup monitoring and logging

## 8. Monitoring and Maintenance

### 8.1 Production Metrics

- Model performance metrics
- Inference latency tracking
- Memory usage monitoring
- Data drift detection
- Concept drift detection

### 8.2 Update Strategy

- Regular retraining schedule
- Online learning capabilities
- Emergency update protocol
- Version control and rollback

## 9. References

1. LLaMA 2: Open Foundation and Fine-Tuned Chat Models
2. QLoRA: Efficient Finetuning of Quantized LLMs
3. Scaling Laws for Neural Language Models
4. RLHF: Constitutional AI: A Framework for Machine Learning Systems
5. Flash Attention: Fast and Memory-Efficient Exact Attention
