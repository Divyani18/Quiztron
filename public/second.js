let questions = [];
var radioValue;
let correct = 0;
let incorrect = 0;
let skipped = 0;
let i;
let ques = [];
let isSubmitted = 0;

function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for(var i = 0; i <ca.length; i++) {
	  var c = ca[i];
	  while (c.charAt(0) == ' ') {
		c = c.substring(1);
	  }
	  if (c.indexOf(name) == 0) {
		return c.substring(name.length, c.length);
	  }
	}
	return "";
  }

let url = getCookie("url");


const fetchQuestions = async (url) => {

	const res = await fetch(url);
	var data = await res.json();
	console.log(data);
	questions = data.results.map((data) => {
			
		const answerChoices = [...data.incorrect_answers];
				
		const correctChoice = Math.floor((Math.random()*4) + 1)
				
		answerChoices.splice(correctChoice-1,0,data.correct_answer)
			
		const formattedQuestion = {
			question: data.question,
			answerChoices: answerChoices,
			correctChoice: correctChoice,
				
		}
	
		return formattedQuestion;
	});
			
	return questions;
}

	
async function assignQuestion(url){

	ques = await fetchQuestions(url);
	console.log("Questions fetched");
		
	$(document).ready(() => {

		function displayQuestion() {
			i = Math.floor((Math.random()*9)) + 1;
			$("#ansResult").hide();
			$("input:radio[name='ans']").each(function(i) {
				this.checked = false;
			});
			radioValue = -1;
			
			$("#qDescription").text("Q. ").append(ques[i].question);
			
			$("#A").text(ques[i].answerChoices[0]);
			$("#B").text(ques[i].answerChoices[1]);
			$("#C").text(ques[i].answerChoices[2]);
			$("#D").text(ques[i].answerChoices[3]);
			isSubmitted = 0;
	
		}
	
		function changeProgress() {
			let sum = correct + incorrect + skipped;
			let p1 = (correct/sum)*100;
			let p2 = (incorrect/sum)*100;
			let p3 = (skipped/sum)*100;
	
			$("#prog1").css("width", p1+"%");
			$("#prog1").attr("aria-valuenow", p1);
	
			$("#prog2").css("width", p2+"%");
			$("#prog2").attr("aria-valuenow", p2);
	
			$("#prog3").css("width", p3+"%");
			$("#prog3").attr("aria-valuenow", p3);
		}
		
		async function dbUpdate(correct, incorrect, skipped) {
			const data = {correct, incorrect, skipped};
			const options = {
				method : "POST",
				headers : {
					"Content-Type" : "application/json"
				},
				body : JSON.stringify(data)
			}
	
			await fetch("/updateDb", options);
		}
		
		$("input[type='radio']").on("click", () => {
		
			radioValue = $("input[name='ans']:checked").val();
				
		})

		$(".submit").on("click", () => {

			if(!isSubmitted){
				isSubmitted = 1;
					
				if(radioValue == ques[i].correctChoice){
					$("#ansResult").show();
					$("#ansResult").text("Congratulations! It's the RIGHT answer.");
					$("#ansResult").css("color", "rgba(88, 145, 31, 1)");

					correct++;

					$(".correctCount").text(correct);
					//console.log("Congratulations! It's CORRECT.", radioValue);

				}
				else if(radioValue != -1 && radioValue != ques[i].correctChoice){
					$("#ansResult").show();	
					$("#ansResult").text("OOPs! It's not the right answer.");
					$("#ansResult").css("color", "rgba(163, 22, 3, 1)");
								
					incorrect++;

					$(".incorrectCount").text(incorrect);
					//console.log("OOPs! It's not the right answer.", radioValue)
				
				}
				else{
					$("#ansResult").show();
					$("#ansResult").text("You haven't answered the question.");
					$("#ansResult").css("color", "rgba(130, 76, 25, 1)");
					isSubmitted = 0;
					
				}
				
				changeProgress();
			}
				
		})
			
		$(".viewSol").on("click", () => {

			if(isSubmitted == 1){
				$(".sol").text("Option "+"("+ques[i].correctChoice+")");
			}
			else{
				$(".sol").text("You can view the correct answer after submitting your answer.");
			}

			$(".sol").show();
			
		})

		$("#btnNext").on("click", () => {
			if(isSubmitted == 0){	
				skipped++;
				$(".skipCount").text(skipped);
			}

			$(".sol").hide();
			displayQuestion();
		});

		$(".skip").on("click", () => {
			$(".sol").hide();	
			displayQuestion();
			
			skipped++;
			changeProgress();
			$(".skipCount").text(skipped);
							
		})

		$("#navDashboard").on("click", () => {
			dbUpdate(correct, incorrect, skipped);
		})

		displayQuestion();
	});
};

assignQuestion(url);

