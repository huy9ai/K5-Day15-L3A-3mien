"""Run with: python -m unittest discover -s tests -v"""
import json
from pathlib import Path
import tempfile
import threading
import unittest
from unittest.mock import patch
from urllib.request import urlopen

from frontend import server


class LectureTests(unittest.TestCase):
    def test_nested_course_files_are_listed_and_served_for_all_15_days(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            names = {}
            for day in range(1, 16):
                key = f"Day{day:02d}"
                name = f"Day {day} Bài học AI & LLM.html"
                folder = root / "data" / "data-btc" / "lectures" / key
                folder.mkdir(parents=True)
                (folder / name).write_text(
                    f"<html><head></head><body>Bài học {key}</body></html>",
                    encoding="utf-8",
                )
                names[key] = name
            # Reproduce the repo layout, retaining the server's configured roots.
            roots = [str(root / Path(p).relative_to(server.ROOT_DIR)) for p in server.LECTURE_ROOTS]
            with patch.object(server, "LECTURE_ROOTS", roots), patch.object(server, "_LECTURES_CACHE", None):
                httpd = server.ThreadingHTTPServer(("127.0.0.1", 0), server.TutorHandler)
                thread = threading.Thread(target=httpd.serve_forever, daemon=True)
                thread.start()
                base = f"http://127.0.0.1:{httpd.server_port}"
                try:
                    with urlopen(base + "/api/info") as response:
                        info = json.load(response)
                    self.assertEqual(set(info["lectures"]), set(names))
                    self.assertEqual(info["default_lecture_day"], "Day01")
                    for day, lecture in info["lectures"].items():
                        with self.subTest(day=day), urlopen(base + lecture["html_url"]) as response:
                            self.assertEqual(response.status, 200)
                            self.assertIn(f"Bài học {day}", response.read().decode("utf-8"))
                finally:
                    httpd.shutdown()
                    httpd.server_close()
                    thread.join()


if __name__ == "__main__":
    unittest.main()
