const Joi = require('joi');
const express = require('express');
global.crypto = require('crypto')
const app = express();
app.use(express.json());
let employeesJsonObj = require('./data/employees.json');
let employeesJsonObjEmpty = require('./data/employeesEmpty.json');
let users = require('./data/users.json');
let oauthJsonObj = require('./data/Auth.json');
const PORT = process.env.PORT || 3000;


//************************************WELCOME-START******************************************* */
app.get('/', (req, res) => {
	res.send('hello oneauto');
});
//************************************WELCOME-ENDS******************************************* */

// get paginated results
app.get("/users", paginatedResults(users), (req, res) => {
  res.json(res.paginatedResults);
});


//************************************GET-START******************************************* */
app.get('/employees', (req, res) => {
	var query = require('url').parse(req.url,true).query;
	var region = query.region;
	console.log(region);
	let token = req.headers.authorization;
	if (validateToken(token, res) == true) {
		
		if(region){
			console.log('in reg');
			var output = employeesJsonObj.Employees.filter(x => x.region == region );
			
			res.send(employeesJsonObjEmpty.Employees.push(output));
		}else{
			res.send(employeesJsonObj);
		}
	}
});
//************************************GET-ENDS******************************************* */



//************************************GET-ID-STARTS******************************************* */
app.get('/employees/:id', (req, res) => {
	const { id } = req.params;
	let acceptHeader = req.headers.accept;
	let token = req.headers.authorization;
	if (validateToken(token, res, req.method) == true) {
		if (acceptHeader == '*/*' || acceptHeader == 'application/json') {
			const result = getById(employeesJsonObj.Employees, id);
			if (result == null) {
				res.status(404).send('No such employee found');
			} else {
				res.status(200).send(result);
			}
		} else {
			res.status(406).send("Invalid Accept Header");
		}

	}
});
//************************************GET-ID-ENDS******************************************* */


//************************************POST-START******************************************* */
app.post('/employees', (req, res) => {
	let token = req.headers.authorization;
	if (validateToken(token, res, req.method) == true) {
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
		}else{
			//check if username already exists, 
			let uname=req.body.userId;
			console.log(uname);
			const exist=getByUserName(employeesJsonObj.Employees, req.body.userId);
			if(exist==null){
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
		res.status(201).send(emp);
			}else{
				res.status(409).send('userID alraedy exists');
			}
		}
		
	}
});
//************************************POST-ENDS******************************************* */


//************************************PUT-STARTS******************************************* */
app.put('/employees/:id', (req, res) => {
	const { id } = req.params;
	const { firstName } = req.body;

	let acceptHeader = req.headers.accept;
	let contentHeader = req.headers['content-type'];
	let token = req.headers.authorization;
	if (validateToken(token, res, req.method) == true) {
		if (acceptHeader == '*/*' || acceptHeader == 'application/json') {
			//if (contentHeader == '*/*' || contentHeader == 'application/json') {
				const result = getById(employeesJsonObj.Employees, id);
				if (result == null) {
					res.status(404).send('No such employee found');
				} else {
					updateById(employeesJsonObj.Employees, id, firstName);
					res.status(200).send(getById(employeesJsonObj.Employees, id));
				}
			// } else {
			// 	res.status(415).send("Invalid Content-type header");
			// }
		} else {
			res.status(406).send("Invalid Accept Header");
		}

	}

});
//************************************PUT-ENDS******************************************* */


//************************************DELETE-STARTS******************************************* */
app.delete('/employees/:id', (req, res) => {
	const { id } = req.params;
	let token = req.headers.authorization;
	if (validateToken(token, res, req.method) == true) {
		removeById(employeesJsonObj.Employees, id);

		res.status(204).send('Employee has been deleted');
	}
});
//************************************DELETE-ENDS******************************************* */


//************************************POST-TOKEN-STARTS******************************************* */
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
		"access": "Admin"
	};
	oauthJsonObj.tokens.push(tokenObj);

	res.status(201).send(jwt);

});
//************************************POST-TOKEN-ENDS******************************************* */

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
	if (requiredIndex < 0) {
		return null;
	} else {
		return arr[requiredIndex];
	}

};

const getByUserName = (arr, userId) => {
	const requiredIndex = arr.findIndex(el => {
		return el.userId === userId;
	});
	if (requiredIndex < 0) {
		return null;
	} else {
		return arr[requiredIndex];
	}

};

const getToken = (arr, token) => {
	const requiredIndex = arr.findIndex(el => {
		return el.token === token;
	});
	console.log(requiredIndex);

	return requiredIndex;
};

const getAccessLevel = (arr, token) => {
	const requiredIndex = getToken(oauthJsonObj.tokens, token);
	console.log(arr[requiredIndex].access);
	return arr[requiredIndex].access;
};

const validateToken = (token, res, method) => {
	//check
	if (token == undefined) {
		res.status(401).send("Autorization header is required");
		return false;
	} else if (getToken(oauthJsonObj.tokens, token) < 0) {
		res.status(401).send("Invalid or Expired token");
		return false;
	} else {
		//check the access
		let access = getAccessLevel(oauthJsonObj.tokens, token);
		console.log(access)
		if (method == 'POST' || method == 'PUT' || method == 'DELETE') {
			//access must be admin
			if (access == 'Admin') {
				return true;
			} else {
				res.status(403).send("Access Denied");
				return false;
			}
		} else {
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

function paginatedResults(model) {
  // middleware function
  return (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
 
    // calculating the starting and ending index
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
 
    const results = {};
    if (endIndex < model.length) {
      results.next = {
        page: page + 1,
        limit: limit
      };
    }
 
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      };
    }
 
    results.results = model.slice(startIndex, endIndex);
 
    res.paginatedResults = results;
    next();
  };
}



app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));
