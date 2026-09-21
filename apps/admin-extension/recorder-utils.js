(() => {
  const SENSITIVE_FIELD_PATTERN = /password|passcode|otp|one[-_ ]?time|verification|captcha|cvv|cvc|card|credit|debit|cc[-_ ]?(number|name|exp)|expiry|expiration|payment|pin|secret|token|aadhaar|passport|id[-_ ]?number|identity|date[-_ ]?of[-_ ]?birth|\bdob\b/i;

  const getAttribute = (element, name) => element?.getAttribute?.(name) || '';
  const normalized = (value) => String(value || '').trim().replace(/\s+/g, ' ');
  const escapeCss = (value) => {
    if (globalThis.CSS?.escape) return globalThis.CSS.escape(value);
    return String(value).replace(/[^a-zA-Z0-9_-]/g, (character) => `\\${character}`);
  };

  const isFormControl = (element) => element && (
    ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(element.tagName) ||
    element.getAttribute?.('role') === 'combobox'
  );

  const isSensitiveElement = (element) => {
    if (!isFormControl(element)) return false;
    const type = getAttribute(element, 'type').toLowerCase();
    if (type === 'password') return true;
    const metadata = [
      type,
      getAttribute(element, 'name'),
      getAttribute(element, 'id'),
      getAttribute(element, 'aria-label'),
      getAttribute(element, 'autocomplete'),
      getAttribute(element, 'placeholder'),
      getAttribute(element, 'data-testid'),
      getAttribute(element, 'data-test'),
      getAttribute(element, 'data-qa')
    ].join(' ');
    return SENSITIVE_FIELD_PATTERN.test(metadata);
  };

  const sanitizeUrl = (value) => {
    try {
      const url = new URL(value, globalThis.location?.href);
      return `${url.origin}${url.pathname}`;
    } catch {
      return String(value || '').split(/[?#]/, 1)[0];
    }
  };

  const isStableIdentifier = (value) => {
    const identifier = normalized(value);
    if (!identifier || /^\d+$/.test(identifier)) return false;
    if (/^(react|ember|vue|ng)[-_]/i.test(identifier)) return false;
    if (/[a-f0-9]{8,}/i.test(identifier) || /\d{5,}/.test(identifier)) return false;
    return true;
  };

  const selectorIsUnique = (documentRef, selector) => {
    try {
      return documentRef.querySelectorAll(selector).length === 1;
    } catch {
      return false;
    }
  };

  const cssPath = (element) => {
    if (isStableIdentifier(element.id)) return `#${escapeCss(element.id)}`;
    const parts = [];
    let current = element;
    while (current && current !== current.ownerDocument?.body && current.parentElement) {
      let index = 1;
      for (let sibling = current.previousElementSibling; sibling; sibling = sibling.previousElementSibling) {
        if (sibling.tagName === current.tagName) index += 1;
      }
      parts.unshift(`${current.tagName.toLowerCase()}:nth-of-type(${index})`);
      current = current.parentElement;
    }
    return parts.join(' > ');
  };

  const xpath = (element) => {
    if (isStableIdentifier(element.id)) return `//*[@id=${JSON.stringify(element.id)}]`;
    const parts = [];
    let current = element;
    while (current && current.nodeType === 1) {
      let index = 1;
      for (let sibling = current.previousElementSibling; sibling; sibling = sibling.previousElementSibling) {
        if (sibling.tagName === current.tagName) index += 1;
      }
      parts.unshift(`${current.tagName.toLowerCase()}[${index}]`);
      current = current.parentElement;
    }
    return `/${parts.join('/')}`;
  };

  const labelText = (element) => {
    const labels = [];
    const id = getAttribute(element, 'id');
    const documentRef = element.ownerDocument;
    if (id && documentRef?.querySelector) {
      const label = documentRef.querySelector(`label[for="${escapeCss(id)}"]`);
      if (label) labels.push(normalized(label.textContent));
    }
    const parentLabel = element.closest?.('label');
    if (parentLabel) labels.push(normalized(parentLabel.textContent));
    const ariaLabel = getAttribute(element, 'aria-label');
    if (ariaLabel) labels.push(normalized(ariaLabel));
    const labelledBy = getAttribute(element, 'aria-labelledby');
    if (labelledBy && documentRef?.getElementById) {
      const referenced = labelledBy.split(/\s+/).map((idValue) => documentRef.getElementById(idValue)).filter(Boolean);
      labels.push(...referenced.map((label) => normalized(label.textContent)));
    }
    return [...new Set(labels.filter(Boolean))].join(' / ');
  };

  const nearbyText = (element) => {
    const parent = element.parentElement;
    if (!parent) return '';
    return normalized(parent.textContent).slice(0, 240);
  };

  const selectorsFor = (element, documentRef = element.ownerDocument || globalThis.document) => {
    const selectors = [];
    const add = (selector, priority) => {
      if (!selector || selectors.some((candidate) => candidate.kind === selector.kind && candidate.value === selector.value)) return;
      if (selector.kind === 'css' && documentRef && !selectorIsUnique(documentRef, selector.value)) return;
      selectors.push({ ...selector, priority });
    };
    const id = element.id || getAttribute(element, 'id');
    const name = getAttribute(element, 'name');
    const testId = getAttribute(element, 'data-testid') || getAttribute(element, 'data-test') || getAttribute(element, 'data-qa');
    const ariaLabel = getAttribute(element, 'aria-label');
    const role = getAttribute(element, 'role');
    const text = normalized(element.textContent);

    if (isStableIdentifier(id)) add({ kind: 'id', value: id }, 1);
    if (testId) add({ kind: 'css', value: `[data-testid="${escapeCss(testId)}"]` }, 2);
    if (name) add({ kind: 'name', value: name }, 3);
    if (role) add({ kind: 'role', value: role }, 4);
    if (ariaLabel && ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
      add({ kind: 'text', value: ariaLabel }, 5);
    }
    if (text && ['BUTTON', 'A', 'LABEL', 'OPTION'].includes(element.tagName) && text.length <= 120) {
      add({ kind: 'text', value: text }, 6);
    }
    const path = cssPath(element);
    if (path) add({ kind: 'css', value: path }, 20);
    const elementPath = xpath(element);
    if (elementPath) add({ kind: 'xpath', value: elementPath }, 30);
    return selectors;
  };

  const describeElement = (element, documentRef = element.ownerDocument || globalThis.document) => {
    const type = getAttribute(element, 'type') || undefined;
    const attributes = {
      id: element.id || undefined,
      name: getAttribute(element, 'name') || undefined,
      type,
      role: getAttribute(element, 'role') || undefined,
      ariaLabel: getAttribute(element, 'aria-label') || undefined,
      ariaLabelledBy: getAttribute(element, 'aria-labelledby') || undefined,
      placeholder: getAttribute(element, 'placeholder') || undefined,
      autocomplete: getAttribute(element, 'autocomplete') || undefined,
      testId: getAttribute(element, 'data-testid') || getAttribute(element, 'data-test') || getAttribute(element, 'data-qa') || undefined,
      required: element.required === true || getAttribute(element, 'required') === 'true' || undefined,
      inputMode: getAttribute(element, 'inputmode') || undefined,
      pattern: getAttribute(element, 'pattern') || undefined
    };
    const description = {
      tag: String(element.tagName || '').toLowerCase(),
      text: normalized(element.textContent).slice(0, 120),
      label: labelText(element),
      nearbyText: nearbyText(element),
      selectors: selectorsFor(element, documentRef),
      attributes,
      sensitive: isSensitiveElement(element)
    };
    if (element.tagName === 'SELECT') {
      description.options = [...(element.options || [])].map((option) => ({
        value: option.value,
        text: normalized(option.textContent || option.text),
        selected: option.selected === true
      }));
    }
    if (element.tagName === 'INPUT' && ['checkbox', 'radio'].includes(type)) {
      description.checked = element.checked === true;
      description.inputValue = element.value || undefined;
    }
    return description;
  };

  const captureValue = (element) => {
    if (!isFormControl(element)) return {};
    if (isSensitiveElement(element)) return { sensitive: true };
    if (element.tagName === 'INPUT' && ['checkbox', 'radio'].includes(getAttribute(element, 'type').toLowerCase())) {
      return { checked: element.checked === true, value: element.value || undefined };
    }
    if ('value' in element) return { value: String(element.value ?? '') };
    return {};
  };

  const eventKey = (event) => {
    const firstSelector = event.element?.selectors?.[0];
    if (firstSelector) return `${firstSelector.kind}:${firstSelector.value}`;
    return `${event.type}:${event.element?.tag || ''}:${event.element?.attributes?.name || ''}`;
  };

  const normalizeRecordedEvents = (events) => {
    const normalizedEvents = [];
    for (const event of events || []) {
      const clean = { ...event };
      delete clean.at;
      delete clean.sequence;
      delete clean.internalKey;
      if (clean.url) clean.url = sanitizeUrl(clean.url);
      if (clean.fromUrl) clean.fromUrl = sanitizeUrl(clean.fromUrl);
      if ((clean.type === 'input' || clean.type === 'change') && normalizedEvents.length) {
        const previous = normalizedEvents[normalizedEvents.length - 1];
        if ((previous.type === 'input' || previous.type === 'change') && eventKey(previous) === eventKey(clean)) {
          normalizedEvents[normalizedEvents.length - 1] = {
            ...previous,
            ...clean,
            type: 'input',
            sourceTypes: [...new Set([...(previous.sourceTypes || [previous.type]), ...(clean.sourceTypes || [clean.type])])]
          };
          continue;
        }
        clean.type = 'input';
        clean.sourceTypes = [...new Set(clean.sourceTypes || [event.type])];
      }
      if (clean.type === 'navigation' && normalizedEvents.at(-1)?.type === 'navigation' && normalizedEvents.at(-1).url === clean.url) continue;
      normalizedEvents.push(clean);
    }
    return normalizedEvents.map((event, index) => ({
      ...event,
      id: `recorded.${index + 1}`
    }));
  };

  globalThis.BookingFlowRecorder = {
    captureValue,
    describeElement,
    isSensitiveElement,
    normalizeRecordedEvents,
    sanitizeUrl,
    selectorsFor
  };
})();
