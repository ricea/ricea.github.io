const jsonToElementTransform = new TransformStream({
  transform(chunk, controller) {
    const tr = document.createElement('tr');
    for (const cell of ['hash', 'date', 'author', 'subject']) {
      const td = document.createElement('td');
      td.textContent = chunk[cell];
      tr.appendChild(td);
    }
    controller.enqueue(tr);
  }
});

const result = await fetch('commits.json');

result.body
    .pipeThrough(new TextDecoder())
    .pipeThrough(splitStream('\n'))
    .pipeThrough(parseJSON())
    .pipeThrough(jsonToElementTransform)
    .pipeTo(appendChildWritableStream(table));
