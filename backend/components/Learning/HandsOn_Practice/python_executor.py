# backend/components/Learning/HandsOn_Practice/python_executor.py

import subprocess
import tempfile
import textwrap


def execute_python(code: str) -> dict:
    """
    PLACEHOLDER: Replace with Docker / Firejail / gVisor sandbox.
    """

    with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False) as f:
        f.write(textwrap.dedent(code))
        path = f.name

    try:
        proc = subprocess.run(
            ["python", path],
            capture_output=True,
            text=True,
            timeout=2,
        )

        return {
            "stdout": proc.stdout,
            "stderr": proc.stderr or None,
        }
    except Exception as e:
        return {"stdout": "", "stderr": str(e)}
