*Example:*

```js
const app = require('express')();

// This code will fail under presure because it cannot handle millions of uploads at the same time, right?
app.post('/uploadFile', (req, res) => {
    uploadFile(req.body)
    .then(result => res.send(result))
    .catch(err => res.status(500).send(err));
})

// So wrap your async/non-async function with q.enqueue and limit the concurrency to 100.
const Queue = require('@int/promise-queue');
const q = new Queue(100);

app.post('/uploadFile', (req, res) => {
    q.enqueue(() => uploadFile(req.body))
    .then(result => res.send(result))
    .catch(err => res.status(500).send(err));
})

// As simple as this!
```

*Example of continue/stop:*

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