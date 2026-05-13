from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict

class UserSettingsBase(BaseModel):
    full_name: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    theme: Optional[str] = "dark"
    timezone: Optional[str] = "UTC"
    locale: Optional[str] = "en-US"
    notifications_enabled: Optional[bool] = True
    email_reports_enabled: Optional[bool] = True
    connected_accounts_prefs: Optional[Dict[str, Any]] = {}

class UserSettingsUpdate(UserSettingsBase):
    pass

class UserSettingsRead(UserSettingsBase):
    id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)
