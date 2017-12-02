'use strict';
const express = require('express' 4.16.2)
const app = 	express()

app.get('/', (req, res) => res.send('Hello World'))

app.listen(5000, ()=> console.log('Server started, listening on port 50000'))