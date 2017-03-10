// Copyright 2016 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// The files are expected to be small, so gzip doesn't gain that much.
const EXPECTED_GZIP_COMPRESSION_FACTOR = 1.15;

customElements.define('fetch-code-with-progress', class FetchCodeWithProgress extends HTMLElement {
  constructor() {
    super();

    this.load = async url => {
      this.reset();
      const progressBar = document.createElement('div');
      progressBar.style.height = '2pt';
      const progressBarBar = document.createElement('div');
      progressBarBar.style.width = '0%';
      progressBarBar.style.height = '100%';
      progressBarBar.style.backgroundColor = 'blue';
      progressBar.appendChild(progressBarBar);
      const streamingElement =
          document.createElement('streaming-element-backpressure');
      streamingElement.style.whiteSpace = 'pre';
      this.appendChild(progressBar);
      this.appendChild(streamingElement);
      function moveBar(newWidth, duration) {
        let oldWidth = progressBarBar.style.width;
        progressBarBar.animate({
          width: [oldWidth, newWidth]
        }, {
          duration,
          fill: 'backwards'
        });
      }
      moveBar('10%', 1);
      const response = await fetch(url);
      let expectedSize = parseInt(response.headers.get('Content-Length'));
      if (response.headers.get('Content-Encoding') === 'gzip') {
        expectedSize = expectedSize * EXPECTED_GZIP_COMPRESSION_FACTOR;
      }
      let gotSize = 0;

      function barUpdate() {
        let width = 10 + 90 * gotSize / expectedSize;
        if (width < 0) {
          width = 0;
        }
        if (width > 100) {
          width = 100;
        }
        moveBar(`${width}%`, 100);
      }

      function barDone() {
        moveBar('100%', 100);
        progressBarBar.animate({
          opacity: [ 1, 0 ]
        }, {
          duration: 100,
          fill: 'forwards'
        });
      }

      barUpdate();
      response.body
          .pipeThrough(new TransformStream({
            transform(chunk, controller) {
              gotSize += chunk.length;
              barUpdate();
              controller.enqueue(chunk);
            },
            flush() {
              barDone();
            }
          }))
              .pipeThrough(new TextDecoder())
              .pipeTo(streamingElement.writable);
    };

    this.reset = () => {
      while (this.lastElementChild) {
        this.removeChild(this.lastElementChild);
      }
    }
  }

  connectedCallback() {
    this.style.display = 'block';
  }
});
