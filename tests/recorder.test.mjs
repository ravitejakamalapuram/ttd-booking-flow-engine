import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const source = await fs.readFile(new URL('../apps/admin-extension/recorder-utils.js', import.meta.url), 'utf8');
const context = { URL, globalThis: {}, location: { href: 'https://example.test/start' } };
context.globalThis = context;
vm.runInNewContext(source, context);
const recorder = context.BookingFlowRecorder;

test('sensitive form values are never returned by the recorder', () => {
  const password = { tagName: 'INPUT', value: 'secret', type: 'password', getAttribute(name) { return name === 'type' ? this.type : ''; } };
  const otp = { tagName: 'INPUT', value: '123456', getAttribute(name) { return name === 'name' ? 'otpCode' : ''; } };
  assert.equal(recorder.captureValue(password).sensitive, true);
  assert.equal(recorder.captureValue(password).value, undefined);
  assert.equal(recorder.captureValue(otp).sensitive, true);
  assert.equal(recorder.captureValue(otp).value, undefined);
});

test('ordinary form values and checkbox state remain authorable', () => {
  const input = { tagName: 'INPUT', value: '2027-01-01', type: 'date', getAttribute(name) { return name === 'type' ? this.type : ''; } };
  const checkbox = { tagName: 'INPUT', value: 'yes', type: 'checkbox', checked: true, getAttribute(name) { return name === 'type' ? this.type : ''; } };
  assert.equal(recorder.captureValue(input).value, '2027-01-01');
  assert.deepEqual({ ...recorder.captureValue(checkbox) }, { checked: true, value: 'yes' });
});

test('recordings coalesce field input/change noise and use deterministic IDs', () => {
  const events = recorder.normalizeRecordedEvents([
    { sequence: 2, at: 100, type: 'input', url: 'https://example.test/form?session=secret', element: { selectors: [{ kind: 'name', value: 'date' }] }, value: '2027-01-01' },
    { sequence: 3, at: 120, type: 'change', url: 'https://example.test/form?session=secret', element: { selectors: [{ kind: 'name', value: 'date' }] }, value: '2027-01-02' },
    { sequence: 4, at: 130, type: 'navigation', url: 'https://example.test/next#fragment' },
    { sequence: 5, at: 140, type: 'navigation', url: 'https://example.test/next#other-fragment' }
  ]);
  assert.equal(events.length, 2);
  assert.equal(events[0].id, 'recorded.1');
  assert.equal(events[0].type, 'input');
  assert.deepEqual([...events[0].sourceTypes], ['input', 'change']);
  assert.equal(events[0].url, 'https://example.test/form');
  assert.equal(events[1].url, 'https://example.test/next');
});

test('sensitive metadata is identified without depending on a website', () => {
  const element = { tagName: 'INPUT', getAttribute(name) { return name === 'autocomplete' ? 'cc-number' : ''; } };
  assert.equal(recorder.isSensitiveElement(element), true);
  assert.equal(recorder.sanitizeUrl('https://example.test/path?token=secret#step'), 'https://example.test/path');
});
