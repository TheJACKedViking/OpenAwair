"""Optional real-browser UI smoke test; firmware/device inputs are synthetic, not hardware validation."""
import json
import os
from pathlib import Path
import socket
import subprocess
import tempfile
import time
from urllib.request import urlopen
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[3]


def main():
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        port = sock.getsockname()[1]
    server = subprocess.Popen(['node', str(ROOT / 'tools/migration/cli.mjs'), 'serve', '--port', str(port)],
                              stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    origin = f'http://127.0.0.1:{port}'
    try:
        for _ in range(100):
            try:
                with urlopen(origin, timeout=0.2):
                    break
            except OSError:
                if server.poll() is not None:
                    raise RuntimeError('Workbench server failed to start')
                time.sleep(0.05)
        else:
            raise RuntimeError('Workbench server did not become ready')
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True, executable_path=os.environ.get('CHROMIUM_EXECUTABLE'))
            page = browser.new_page(viewport={'width': 1280, 'height': 1000}, accept_downloads=True)
            errors = []
            requests = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('request', lambda request: requests.append(request.url))
            page.goto(origin)
            page.get_by_role('button', name='View research status').click()
            page.wait_for_function("document.querySelector('#report').textContent.includes('qualifiedStockMigrationProfiles')")
            assert json.loads(page.locator('#report').text_content())['observations']['flashAvailable'] is False
            page.locator('#firmware').set_input_files({
                'name': 'synthetic.bin', 'mimeType': 'application/octet-stream',
                'buffer': b'WICED\x00https://ota.awair.is/private?token=do-not-export\x00',
            })
            page.get_by_role('button', name='Analyze file locally').click()
            page.wait_for_function("document.querySelector('#report').textContent.includes('firmware-static')")
            result = json.loads(page.locator('#report').text_content())
            assert result['stockMigration'] == 'unverified'
            assert 'do-not-export' not in json.dumps(result)
            with page.expect_download() as download:
                page.get_by_role('button', name='Save minimized report').click()
            assert download.value.suggested_filename.endswith('-report.json')
            page.locator('#device-ip').fill('192.168.1.50')
            page.locator('#capture').set_input_files({
                'name': 'synthetic-capture.json', 'mimeType': 'application/json', 'buffer': b'[]',
            })
            page.get_by_role('button', name='Summarize locally').click()
            page.wait_for_function("document.querySelector('#message').textContent.includes('No matching device packets')")
            assert not errors, errors
            assert all(url.startswith(origin + '/') or url == origin for url in requests), requests
            artifacts = Path(tempfile.gettempdir()) / 'openawair-browser-smoke'
            artifacts.mkdir(exist_ok=True)
            page.screenshot(path=str(artifacts / 'desktop.png'), full_page=True)
            page.set_viewport_size({'width': 390, 'height': 844})
            page.screenshot(path=str(artifacts / 'mobile.png'), full_page=True)
            assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
            browser.close()
            print(f'Browser smoke passed: status, local firmware, minimized download, capture, privacy and mobile layout. Screenshots: {artifacts}')
    finally:
        server.terminate()
        try:
            server.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server.kill()
            server.wait()


if __name__ == '__main__':
    main()
