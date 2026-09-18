import asyncio
import importlib.util
import json
import pathlib
import unittest
from types import SimpleNamespace

MODULE_PATH = pathlib.Path(__file__).resolve().parents[1] / 'ble_inventory.py'


def load():
    spec = importlib.util.spec_from_file_location('ble_inventory', MODULE_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class FakeClient:
    def __init__(self, fail=False):
        self.fail = fail
        self.address = 'AA:BB:CC:DD:EE:FF'
        self.name = 'private-awair-name'
        self.disconnected = False
        self.services = [SimpleNamespace(
            uuid='0000180a-0000-1000-8000-00805f9b34fb',
            characteristics=[SimpleNamespace(
                uuid='00002a26-0000-1000-8000-00805f9b34fb', properties=['read', 'write', 'notify']
            )]
        )]

    async def __aenter__(self):
        if self.fail:
            raise RuntimeError('connection failed')
        return self

    async def __aexit__(self, *args):
        self.disconnected = True

    async def read_gatt_char(self, *args):
        raise AssertionError('Characteristic reads are forbidden')

    async def write_gatt_char(self, *args):
        raise AssertionError('Characteristic writes are forbidden')

    async def start_notify(self, *args):
        raise AssertionError('Subscriptions are forbidden')


class InventoryTests(unittest.IsolatedAsyncioTestCase):
    async def test_only_metadata_and_disconnect(self):
        module = load()
        client = FakeClient()
        result = await module.collect(client, 'glow-c', 1)
        self.assertTrue(client.disconnected)
        self.assertEqual(result['deviceWriteOperations'], 0)
        self.assertEqual(result['stockMigration'], 'unverified')
        self.assertEqual(result['observations']['coverage'], 'os-exposed')
        self.assertEqual(result['observations']['services'][0]['characteristics'][0]['properties'], ['read', 'write', 'notify'])
        self.assertNotIn(client.address, json.dumps(result))
        self.assertNotIn(client.name, json.dumps(result))

    async def test_failure_does_not_invent_report(self):
        with self.assertRaises(RuntimeError):
            await load().collect(FakeClient(fail=True), 'glow-c', 1)

    async def test_metadata_bounds(self):
        client = FakeClient()
        client.services *= 65
        with self.assertRaises(ValueError):
            await load().collect(client, 'glow-c', 1)
        self.assertTrue(client.disconnected)

    async def test_timeout_cancels_collection_and_disconnects(self):
        class SlowClient(FakeClient):
            async def __aenter__(self):
                try:
                    await asyncio.sleep(5)
                except asyncio.CancelledError:
                    self.disconnected = True
                    raise
        client = SlowClient()
        with self.assertRaises(asyncio.TimeoutError):
            await load().collect(client, 'glow-c', 0.01)
        self.assertTrue(client.disconnected)

    def test_explicit_device_selection_and_finite_timeouts(self):
        module = load()
        for args in [[], ['--address', 'abc'], ['--list', '--timeout', 'nan'], ['--list', '--timeout', '0']]:
            with self.assertRaises(SystemExit):
                module.parse_arguments(args)
        self.assertTrue(module.parse_arguments(['--list']).list)
        self.assertEqual(module.parse_arguments(['--address', 'abc', '--model', 'glow-c']).model, 'glow-c')


if __name__ == '__main__':
    unittest.main()
