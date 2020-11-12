var url;

async function startQuiz(num){
	
	switch(num){
		case 1: url = {url: 'https://opentdb.com/api.php?amount=50&category=18&type=multiple'};
				break;

		case 2: url = {url: 'https://opentdb.com/api.php?amount=50&category=17&type=multiple'};
				break;

		case 3: url = {url: 'https://opentdb.com/api.php?amount=50&category=9&type=multiple'};
				break;
	}

	const options = {
		method : "POST",
		headers : {
			"Content-Type" : "application/json"
		},
		body : JSON.stringify(url)
	}

	await fetch("/explore", options);

}