from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        protected_namespaces=("settings_",),
    )

    ai_service_port: int = 8000
    model_path: str = "./models/model.pth"
    model_version: str = "v1.0.0"


settings = Settings()
