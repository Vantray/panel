# DO NOT RUN THIS SCRIPT
# This supposed to be used for development

import argparse, subprocess, sys, tarfile, tempfile, io, re
import shutil
from pathlib import Path
import requests

ROOT = Path(__file__).resolve().parent
PKG = f"{ROOT.parent.name}.{ROOT.name}"

def get_version(arg):
    if arg != "latest":
        return arg
    r = requests.get("https://api.github.com/repos/XTLS/xray-core/releases/latest", timeout=30)
    r.raise_for_status()
    return r.json()["tag_name"]

def download(version, dest):
    url = f"https://github.com/XTLS/xray-core/archive/refs/tags/{version}.tar.gz"
    r = requests.get(url, timeout=120)
    r.raise_for_status()
    with tarfile.open(fileobj=io.BytesIO(r.content)) as tar:
        top = tar.getnames()[0]
        tar.extractall(dest, filter="data")
    return Path(dest) / top

def compile_proto(src, out):
    protos = [str(p) for p in src.rglob("*.proto")]
    if not protos:
        raise FileNotFoundError("no .proto files")
    plugin = shutil.which("protoc-gen-mypy")
    if plugin is None:
        raise RuntimeError("protoc-gen-mypy not found — mypy-protobuf not installed")
    subprocess.run(
        [sys.executable, "-m", "grpc_tools.protoc", f"-I={src}",
         f"--plugin=protoc-gen-mypy={plugin}",
         f"--python_out={out}", f"--grpc_python_out={out}",
         f"--mypy_out={out}", *protos],
        check=True,
    )

def fix_imports(out):
    tops = [d.name for d in out.iterdir() if d.is_dir() and not d.name.startswith("__")]
    for path in [p for pat in ("*.py", "*.pyi") for p in out.rglob(pat)]:
        if path.name == "compile.py":
            continue
        text = path.read_text(encoding="utf-8")
        for t in tops:
            text = re.sub(rf"^from {t}\b", f"from {PKG}.{t}", text, flags=re.M)
            text = text.replace(f"import_module('{t}", f"import_module('{PKG}.{t}")
        path.write_text(text, encoding="utf-8")

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--version", default="latest")
    args = ap.parse_args()
    with tempfile.TemporaryDirectory() as tmp:
        src = download(get_version(args.version), tmp)
        compile_proto(src, ROOT)
    fix_imports(ROOT)
