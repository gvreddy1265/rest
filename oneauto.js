const Joi = require('joi');
const express = require('express');
const app = express();
app.use(express.json());
const employees = require('./data/employees.json');
const PORT = process.env.PORT || 3000;


app.get('/', (req, res) => {
    res.send('hello express');
});

app.get('/api/employees', (req, res) => {
    res.send(employees);
});

app.post('/employees', (req, res) => {
    const schema = Joi.object({
        name: Joi.string().min(3).required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).send(error);
        return;
    }
    const gateway = {
        id: employees.length + 1,
        name: req.body.name
    };
    employees.push(gateway);
    res.send(gateway);
});

app.put('/gateways/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    updateById(employees, id, name);
    res.send(employees);
});
app.get('/gateways/:id', (req, res) => {
    const { id } = req.params;
    console.log(`id ${id}`);
    const result = getById(employees, id);

    res.send(result);
});

app.delete('/gateways/:id', (req, res) => {
    const { id } = req.params;
    console.log(`id ${id}`);
    removeById(employees, id);

    res.send(employees);
});
const removeById = (arr, id) => {
    const requiredIndex = arr.findIndex(el => {
        return el.id === parseInt(id);
    });
    if (requiredIndex === -1) {
        return false;
    };
    return !!employees.splice(requiredIndex, 1);
};

const updateById = (arr, id, name) => {
    const requiredIndex = arr.findIndex(el => {
        return el.id === parseInt(id);
    });
    employees[requiredIndex].name = name;
    return employees;
};

const getById = (arr, id, name) => {
    const requiredIndex = arr.findIndex(el => {
        return el.id === parseInt(id);
    });

    return employees[requiredIndex];
};
app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));