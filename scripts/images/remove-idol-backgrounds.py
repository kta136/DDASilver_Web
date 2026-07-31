"""Batch background removal for the DDA Silver idol image pipeline.

The Node.js orchestrator starts this process once per batch so the rembg model
and ONNX Runtime session are reused for every image.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

import onnxruntime as ort
from PIL import Image, ImageOps
from rembg import new_session, remove
from rembg.sessions import sessions_class


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tasks", type=Path)
    parser.add_argument("--model", default="u2net")
    parser.add_argument("--device", choices=("gpu", "cpu"), default="gpu")
    parser.add_argument("--warmup", action="store_true")
    parser.add_argument("--alpha-matting", action="store_true")
    return parser.parse_args()


def emit(payload: dict[str, Any]) -> None:
    print(json.dumps(payload, ensure_ascii=False), flush=True)


def create_session(model_name: str, device: str):
    if device == "cpu":
        session = new_session(model_name, providers=["CPUExecutionProvider"])
    elif "DmlExecutionProvider" in ort.get_available_providers():
        session_class = next(
            (
                candidate
                for candidate in sessions_class
                if candidate.name() == model_name
            ),
            None,
        )
        if session_class is None:
            raise ValueError(f"No session class found for model '{model_name}'")
        session_options = ort.SessionOptions()
        session_options.enable_mem_pattern = False
        session_options.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
        session = session_class(
            model_name,
            session_options,
            providers=["DmlExecutionProvider", "CPUExecutionProvider"],
        )
    else:
        session = new_session(
            model_name,
            providers=["CUDAExecutionProvider", "CPUExecutionProvider"],
        )

    active_providers = session.inner_session.get_providers()
    if device == "gpu" and not any(
        provider in active_providers
        for provider in ("DmlExecutionProvider", "CUDAExecutionProvider")
    ):
        raise RuntimeError(
            "No GPU execution provider became active; "
            f"active providers: {active_providers}"
        )
    return session


def run_task(
    task: dict[str, Any],
    session: Any,
    alpha_matting: bool,
    index: int,
    total: int,
) -> None:
    input_path = Path(task["input"]).resolve()
    output_path = Path(task["output"]).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(input_path) as source:
        source.load()
        source = ImageOps.exif_transpose(source).convert("RGBA")
        result = remove(
            source,
            session=session,
            alpha_matting=alpha_matting,
            post_process_mask=False,
        )
        if not isinstance(result, Image.Image):
            raise TypeError("rembg returned an unexpected result type")
        result.save(output_path, format="PNG", optimize=True)

    emit(
        {
            "event": "processed",
            "index": index,
            "total": total,
            "input": str(input_path),
            "output": str(output_path),
        }
    )


def main() -> int:
    args = parse_args()
    emit(
        {
            "event": "loading-model",
            "model": args.model,
            "device": args.device,
        }
    )
    session = create_session(args.model, args.device)
    emit(
        {
            "event": "model-ready",
            "model": args.model,
            "device": args.device,
            "providers": session.inner_session.get_providers(),
        }
    )

    if args.warmup:
        return 0
    if args.tasks is None:
        raise ValueError("--tasks is required unless --warmup is used")

    task_payload = json.loads(args.tasks.read_text(encoding="utf-8"))
    if not isinstance(task_payload, list) or not task_payload:
        raise ValueError("Task file must contain a non-empty JSON array")

    for index, task in enumerate(task_payload, start=1):
        if not isinstance(task, dict):
            raise TypeError(f"Task {index} must be an object")
        run_task(task, session, args.alpha_matting, index, len(task_payload))

    emit({"event": "complete", "processed": len(task_payload)})
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:  # noqa: BLE001 - surface batch failures to Node
        emit(
            {
                "event": "error",
                "type": type(error).__name__,
                "message": str(error),
            }
        )
        print(str(error), file=sys.stderr, flush=True)
        raise
