#!/usr/bin/env python
import subprocess
import sys

result = subprocess.run(
    [sys.executable, "-m", "pytest", "tests/test_api.py", "-v", "--tb=short"],
    cwd="C:\\Project\\Moola"
)
sys.exit(result.returncode)
