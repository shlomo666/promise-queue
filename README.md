# promise-queue

*Example:*

```js
const app = require('express')();

// This code will fail under presure because it cannot handle 1000 uploads at the same time, right?
app.post('/uploadFile', (req, res) => {
    uploadFile(req.body)
    .then(result => res.send(result))
    .catch(err => res.status(500).send(err));
})

// So instead, wrap your async function (function that returns promise) with q.enqueue and limit the concurrency to 100.
const Queue = require('@int/promise-queue');
const q = new Queue(100);

app.post('/uploadFile', (req, res) => {
    q.enqueue(() => uploadFile(req.body)) // wrapped - result will persist on both resolve and reject cases
    .then(result => res.send(result))
    .catch(err => res.status(500).send(err));
})

// As simple as this!
// Now all uploads will be queued and will not fail because of high concurrency.
```

*Example of continue/pause:*

```js
async function func() {
    let q = new Queue(2);
    
    for(let i = 0; i < 40; i++) {
        q.enqueue(async () => {
            await new Promise(res => setTimeout(res, 1000));
            console.log(1);
        });
    }
    await new Promise(res => setTimeout(res, 6000));
    console.log('paused');
    q.pause();
    await new Promise(res => setTimeout(res, 4000));
    console.log('continued');
    q.continue();
    await new Promise(res => setTimeout(res, 6000));
    console.log('paused');
    q.pause();
    await new Promise(res => setTimeout(res, 4000));
    console.log('continued');
    q.continue();
}

func().then(() => console.log('Done!));
```