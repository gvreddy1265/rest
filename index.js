const Joi = require('joi');
const express = require('express');
global.crypto = require('crypto')
const app = express();
app.use(express.json());
let employeesJsonObj = require('./data/employees.json');
let oauthJsonObj = require('./data/Auth.json');
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
	res.send('hello oneauto');
});

app.get('/employees', (req, res) => {
	let token = req.headers.authorization;
	if(validateToken(token, res)==true){
		res.send(employeesJsonObj);
	}
		
});



app.post('/employees', (req, res) => {
	let token = req.headers.authorization;
	if(validateToken(token, res, req.method)==true){
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
		res.status(400).send(error.details[0].message);
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
	}
});

app.put('/employees/:id', (req, res) => {
	const { id } = req.params;
	const { firstName } = req.body;


	updateById(employeesJsonObj.Employees, id, firstName);
	res.send(getById(employeesJsonObj.Employees, id));
});

app.post('/token', (req, res) => {
	const { clientId } = req.body.clientId;
	//const { secret } = req.body.secret;

	const schema = Joi.object({
		clientId: Joi.string().equal("oneauto").required(),
		secret: Joi.string().equal("welcome123").required()
	});
	const { error } = schema.validate(req.body);
	if (error) {
		res.status(400).send(error.details[0].message);
		return;
	}

	// base64 encode the header
	let bs64header = bs64encode({
		alg: "HS256",
		typ: "JWT"
	});

	console.log("bs64header :>>\n ", bs64header);

let digits = Math.floor(Math.random() * 9000000000) + 1;
	// base64 encode the payload
	let bs64payload = bs64encode({
		id: digits,
		iat: 1589125343,
		exp: 1589989343,
		jti: "37743739b1476caa18ca899c7bc934e1aba63ba1"
	});

	console.log("bs64payload :>> \n", bs64payload);


	// generate the signature from the header and payload
	let secret = req.body.secret;
	let signature = bs64header + "." + bs64payload;

	let bs64signature = bs64escape(crypto
		.createHmac("sha256", secret)
		.update(signature)
		.digest("base64"));

	console.log("bs64signature>>", bs64signature);


	let jwt = bs64header + "." + bs64payload + "." + bs64signature;

	console.log("jwt>>", jwt);
	//add to tokens
	let tokenObj = {
		token: jwt,
		"access":"Admin"
	};
	oauthJsonObj.tokens.push(tokenObj);

	res.status(201).send(jwt);

});
app.get('/employees/:id', (req, res) => {
	const { id } = req.params;
	console.log(`id ${id}`);
	const result = getById(employeesJsonObj.Employees, id);

	res.send(result);
});

app.delete('/employees/:id', (req, res) => {
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

const getToken = (arr, token) => {
	const requiredIndex = arr.findIndex(el => {
		return el.token === token;
	});
	console.log(requiredIndex);

	return requiredIndex;
};

const getAccessLevel = (arr,token) => {
	const requiredIndex = getToken(oauthJsonObj.tokens, token);
	console.log(arr[requiredIndex].access);
	return  arr[requiredIndex].access;
};

const validateToken=(token, res, method)=>{
	//check
	if (token==undefined) {
		res.status(401).send("Autorization header is required");
		return false;
	}else if(getToken(oauthJsonObj.tokens, token)<0){
		res.status(401).send("Invalid or Expired token");
		return false;
	}else{
		//check the access
		let access=getAccessLevel(oauthJsonObj.tokens, token);
		console.log(access)
		if(method=='POST'|| method=='PUT'||method=='DELETE'){
			//access must be admin
			if(access=='Admin'){
				return true;
			}else{
				res.status(403).send("Access Denied");
				return false;
			}
		}else{
			return true;
		}
	}
}

// base64 encode the data
function bs64encode(data) {
	if (typeof data === "object") {
		data = JSON.stringify(data);
	}

	return bs64escape(Buffer.from(data).toString("base64"));
}

// modify the base64 string to be URL safe
function bs64escape(string) {
	return string.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));