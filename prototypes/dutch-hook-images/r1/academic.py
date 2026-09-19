# PROTOTYPE — send infographic style code 12 (STYLE_ACADEMIC), which the CLI cannot name.
import asyncio, sys, time
from notebooklm import NotebookLMClient
from notebooklm._types.enums import InfographicOrientation, InfographicDetail

class Code:  # the param builder only reads .value
    def __init__(self, v): self.value = v

async def main(nb, source, prompt, out):
    async with NotebookLMClient.from_storage() as c:
        t = time.time()
        st = await c.artifacts.generate_infographic(nb, source_ids=[source], instructions=prompt,
            orientation=InfographicOrientation.SQUARE, detail_level=InfographicDetail.CONCISE, style=Code(12))
        print("started", repr(st), flush=True)
        st = await c.artifacts.wait_for_completion(nb, st.task_id, timeout=900)
        print("final", repr(st), f"{int(time.time()-t)}s", flush=True)
        if getattr(st, "is_complete", False) or str(getattr(st, "status", "")) in ("completed", "GenerationState.COMPLETED"):
            print("saved", await c.artifacts.download_infographic(nb, out, st.task_id))

asyncio.run(main(*sys.argv[1:5]))
