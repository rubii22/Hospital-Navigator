import os
import sys

# Auto-activate local .venv if executed with system python
venv_python = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".venv", "bin", "python")
if os.path.exists(venv_python) and sys.executable != venv_python and "VIRTUAL_ENV" not in os.environ:
    os.execv(venv_python, [venv_python] + sys.argv)

import uvicorn
from app.main import app

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

__all__ = ["app"]
