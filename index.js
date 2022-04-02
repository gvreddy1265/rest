const Joi= require('joi');
const express = require('express');
const app= express();
app.use(express.json());
const PORT = process.env.PORT || 5000

const gateways= [
    { id: 1, site: 'Oklahoma'},
    { id: 2, site: 'Newjersey'}
];
app.get('/', (req,res)=>{
res.send('hello express');
});

app.get('/gateways', (req, res)=>{
res.send(gateways);
});

app.post('/gateways', (req,res)=> {
 const schema=Joi.object({
     name: Joi.string().min(3).required(),
 });
 const {error}=schema.validate(req.body);
 if(error){
     res.status(400).send(error);
     return;
 }   
const gateway= {
    id: gateways.length+1,
    name: req.body.name
};
gateways.push(gateway);
res.send(gateway);
});

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}...`));