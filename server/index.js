const express = require ('express');

const app = express();
const port = 3030;
app.use (express.json());
app.use (express.urlencoded({extended: true}));

app.listen (port, () => {
  console.log(`listening at port: ${port}`);
})