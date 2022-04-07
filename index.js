const Joi = require('joi');
const express = require('express');
const app = express();
app.use(express.json());
let employeesJsonObj = require('./data/employees.json');
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('hello oneauto');
});

app.get('/api/employees', (req, res) => {
    res.send(employeesJsonObj);
});

app.post('/api/employees', (req, res) => {
    const schema = Joi.object({
        userId: Joi.string().min(3).required(),
        jobTitleName: Joi.string().min(3).required(),
        firstName: Joi.string().min(3).required(),
        lastName: Joi.string().optional(),
        preferredFullName: Joi.string().optional(),
        employeeCode: Joi.string().length(5).required(),
        region: Joi.string().optional(),
        phoneNumber: Joi.string().min(10).required(),
        emailAddress: Joi.string().email().optional()
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).send(error);
        return;
    }
    const emp = {
        id: employeesJsonObj.Employees.length + 1,
        userId: req.body.userId,
        jobTitleName: req.body.jobTitleName,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        preferredFullName: req.body.preferredFullName,
        employeeCode: req.body.employeeCode,
        region: req.body.region,
        phoneNumber: req.body.phoneNumber,
        emailAddress: req.body.emailAddress
    };
    employeesJsonObj.Employees.push(emp);
    res.send(emp);
});

app.put('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    const { firstName } = req.body;

    updateById(employeesJsonObj.Employees, id, firstName);
    res.send(getById(employeesJsonObj.Employees,id));
});
app.get('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    console.log(`id ${id}`);
    const result = getById(employeesJsonObj.Employees, id);

    res.send(result);
});

app.delete('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    console.log(`id ${id}`);
    removeById(employeesJsonObj.Employees, id);

    res.send('No content');
});
const removeById = (arr, id) => {
    const requiredIndex = arr.findIndex(el => {
        return el.id === parseInt(id);
    });
    if (requiredIndex === -1) {
        return false;
    };
    return !!arr.splice(requiredIndex, 1);
};

const updateById = (arr, id, name) => {
    const requiredIndex = arr.findIndex(el => {
        return el.id === parseInt(id);
    });
    arr[requiredIndex].firstName = name;
    return arr;
};

const getById = (arr, id) => {
    const requiredIndex = arr.findIndex(el => {
        return el.id === parseInt(id);
    });

    return arr[requiredIndex];
};
app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));