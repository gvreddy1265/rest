const Joi = require('joi');
const express = require('express');
const app = express();
app.use(express.json());
const gateways = require('./data/gateways.json');
const PORT = process.env.PORT || 3000;


app.get('/', (req, res) => {
    res.send('hello express');
});

app.get('/gateways', (req, res) => {
    res.send(gateways);
});

app.post('/gateways', (req, res) => {
    const schema = Joi.object({
        name: Joi.string().min(3).required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).send(error);
        return;
    }
    const gateway = {
        id: gateways.length + 1,
        name: req.body.name
    };
    gateways.push(gateway);
    res.send(gateway);
});

app.put('/gateways/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    updateById(gateways, id, name);
    res.send(gateways);
});
app.get('/gateways/:id', (req, res) => {
    const { id } = req.params;
    console.log(`id ${id}`);
    const result = getById(gateways, id);

    res.send(result);
});

app.delete('/gateways/:id', (req, res) => {
    const { id } = req.params;
    console.log(`id ${id}`);
    removeById(gateways, id);

    res.send(gateways);
});
const removeById = (arr, id) => {
    const requiredIndex = arr.findIndex(el => {
        return el.id === parseInt(id);
    });
    if (requiredIndex === -1) {
        return false;
    };
    return !!gateways.splice(requiredIndex, 1);
};

const updateById = (arr, id, name) => {
    const requiredIndex = arr.findIndex(el => {
        return el.id === parseInt(id);
    });
    gateways[requiredIndex].name = name;
    return gateways;
};

const getById = (arr, id, name) => {
    const requiredIndex = arr.findIndex(el => {
        return el.id === parseInt(id);
    });

    return gateways[requiredIndex];
};
app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));