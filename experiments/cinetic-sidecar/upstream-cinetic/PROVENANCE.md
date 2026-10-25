# Upstream Cinetic technique-picker source snapshot (MIT)

Pinned repository: https://github.com/Leonxlnx/cinetic/tree/ecfa6605de1adb9345ce937724810dc32267d068/skills/cinetic

- Upstream commit: `ecfa6605de1adb9345ce937724810dc32267d068`
- `assets/library/techniques.json`: Git blob `37e7b9bd80539285dbd0e0a0af51f9b0c883155c`, 273 technique metadata entries.
- `scripts/pick.py`: Git blob `4340cabb2fedae4513bd7ddff82bdd8db097dbf1` (read-only source inspection: no subprocess, eval, exec, shutil, network, or delete operations; only stdlib Python file IO).
- `LICENSE.txt`: upstream MIT license verbatim, Git blob `48a2f6640b81ff8eca9ce7f6a96337692713ef5b`.

This is **technique selection data, not an implementation of 273 render algorithms or full upstream Skill**. Use `python3 upstream-cinetic/scripts/pick.py --validate`, then `--format feature --seconds 8 --seed 42 --json OUT.json`; never copy an unreviewed upstream setup/render/delete script into production. The selected techniques must be represented faithfully in original scene code and independently visually checked; IDs alone are not evidence of rendered effects. Private/client content must NOT enter public GitHub. Preserve approved K-series and existing default renderers.
