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
'use strict';

customElements.define('view-source', class ViewSource extends HTMLElement {
  constructor() {
    super();
    this.built = false;
  }

  connectedCallback() {
    if (this.built) {
      return;
    }
    this.style.display = 'block';
    const me = this;
    const button = document.createElement('button');
    button.style.width = '100%';
    button.style.textAlign = 'left';
    const spinnyArrow = document.createElement('div');
    spinnyArrow.textContent = '\u25b6'; // BLACK RIGHT-POINTING TRIANGLE
    spinnyArrow.style.display = 'inline-block';
    const viewSourceWords = document.createElement('span');
    viewSourceWords.textContent = 'View source';
    viewSourceWords.style.marginLeft = '1em';
    button.appendChild(spinnyArrow);
    button.appendChild(viewSourceWords);
    me.appendChild(button);
    let shown = false;
    let source;
    const animateOptions = {
      duration: 100,
      fill: 'forwards',
      easing: 'ease'
    };
    function toggle() {
      if (shown) {
        hideSource();
        shown = false;
        return;
      }
      loadSource();
      shown = true;
    }
    function hideSource() {
      spinnyArrow.animate({
        transform: ['rotate(90deg)', 'rotate(0deg)']
      }, animateOptions);
      const currentHeight = source.clientHeight;
      source.style.overflow = 'hidden';
      source.animate({
        height: [`${currentHeight}px`, '0px']
      }, animateOptions);
    }
    function loadSource() {
      spinnyArrow.animate({
        transform: ['rotate(0deg)', 'rotate(90deg)']
      }, animateOptions);
      if (source) {
        me.removeChild(source);
        source = undefined;
      }
      source = document.createElement('fetch-code-with-progress');
      me.appendChild(source);
      source.load(me.getAttribute('src'));
    }
    me.addEventListener('click', toggle);
    this.built = true;
  }
});
