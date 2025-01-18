import hydra
from omegaconf import DictConfig
from pathlib import Path


@hydra.main(config_path="../config", config_name="model_config")
def main(cfg: DictConfig) -> None:
    print(f"Working directory: {Path.cwd()}")
    print(f"Absolute path to outputs: {Path('outputs').absolute()}")


if __name__ == "__main__":
    main() 