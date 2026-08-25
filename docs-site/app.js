'use strict';

(() => {
  const samples = {
    unicode: JSON.stringify({ version: 3, file: 'bundle.js', sources: ['src/cafe.ts'], names: [], mappings: 'AAAA', sourcesContent: ['const label = "caf\u00e9";'] }, null, 2),
    block: '/*# sourceMappingURL=data:application/json;charset=utf-8,%7B%22version%22%3A3%2C%22sources%22%3A%5B%22input.js%22%5D%2C%22names%22%3A%5B%5D%2C%22mappings%22%3A%22AAAA%22%7D */',
    source: ['const answer = 42;', 'console.log(answer);', '//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImlucHV0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBIn0='].join('\n')
  };
  const elements = {
    input: document.querySelector('#source-input'), output: document.querySelector('#result-output'),
    kind: document.querySelector('#input-kind'), status: document.querySelector('#status-text'),
    indicator: document.querySelector('#status-indicator'), inputCount: document.querySelector('#input-count'),
    outputCount: document.querySelector('#output-count')
  };
  let mode = 'encode';

  document.querySelector('#process-button').addEventListener('click', processInput);
  document.querySelector('#reset-button').addEventListener('click', reset);
  document.querySelector('#copy-output-button').addEventListener('click', () => copyText(elements.output.textContent));
  document.querySelectorAll('[data-copy]').forEach((button) => button.addEventListener('click', () => copyText(button.dataset.copy, button)));
  document.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => selectMode(button.dataset.mode)));
  document.querySelectorAll('[data-preset]').forEach((button) => button.addEventListener('click', () => applyPreset(button.dataset.preset)));
  reset();

  function selectMode(nextMode) {
    mode = nextMode;
    document.querySelectorAll('[data-mode]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    elements.kind.textContent = mode === 'encode' ? 'Source Map JSON' : mode === 'decode' ? 'Inline comment' : 'JavaScript or CSS source';
    elements.input.value = mode === 'encode' ? samples.unicode : mode === 'decode' ? samples.block : samples.source;
    processInput();
  }

  function applyPreset(name) {
    const presetMode = name === 'unicode' ? 'encode' : name === 'block' ? 'decode' : 'remove';
    selectMode(presetMode);
    elements.input.value = samples[name];
    processInput();
  }

  function reset() { selectMode('encode'); }

  function processInput() {
    try {
      const convert = globalThis.StacklineConvertSourceMap;
      const input = elements.input.value;
      let output;
      if (mode === 'encode') output = convert.fromJSON(input).toComment();
      else if (mode === 'decode') output = JSON.stringify(convert.fromComment(input).toObject(), null, 2);
      else output = convert.removeComments(input);
      elements.output.textContent = output;
      elements.status.textContent = mode === 'encode' ? 'Comment encoded' : mode === 'decode' ? 'Comment decoded' : 'Comments removed';
      elements.indicator.classList.remove('error');
      elements.inputCount.textContent = `${byteLength(input)} input bytes`;
      elements.outputCount.textContent = `${byteLength(output)} output bytes`;
    } catch (error) {
      elements.output.textContent = error instanceof Error ? error.message : String(error);
      elements.status.textContent = 'Conversion failed';
      elements.indicator.classList.add('error');
      elements.outputCount.textContent = '0 output bytes';
    }
  }

  function byteLength(value) { return new TextEncoder().encode(value).length; }
  async function copyText(value, button) {
    await navigator.clipboard.writeText(value);
    if (!button) return;
    const previous = button.textContent;
    button.textContent = 'Copied';
    window.setTimeout(() => { button.textContent = previous; }, 1200);
  }
})();
