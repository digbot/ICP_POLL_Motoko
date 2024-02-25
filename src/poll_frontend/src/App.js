import { html, render } from 'lit-html';
import { poll_backend } from 'declarations/poll_backend';
import logo from './logo2.svg';

class App {
  greeting = '';

  constructor() {
    this.#render();
  }

  #handleSubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    this.greeting = await poll_backend.greet(name);
    this.#render();
  };

  #render() {
    let body = html`
        <div class="container">
          <div class="title-container">
            <h1>Simple Voting Poll</h1>
          </div>
          <h2 id="question">What is your favorite programming language?</h2>
    
          <!-- Form where users vote -->
          <div class="form-container">
            <form id="radioForm">
                <label>
                    <input type="radio" name="option" value="Rust"> Rust
                </label><br>
                <label>
                    <input type="radio" name="option" value="Motoko"> Motoko
                </label><br>
                <label>
                    <input type="radio" name="option" value="TypeScript"> TypeScript
                </label><br>
                <label>
                    <input type="radio" name="option" value="Python"> Python
                </label><br>
                <button type="submit">Vote</button>
            </form>
          </div>
    
          <!-- Poll results appear here-->
          <h2 id="results-title">Results</h2>
          <div id="results"></div>
        </div>
        <button id="reset">Reset Poll</button>
    `;
    render(body, document.getElementById('root'));
    //document
    ///  .querySelector('form')
     // .addEventListener('submit', this.#handleSubmit);

     const pollForm = document.getElementById("radioForm");
     const resultsDiv = document.getElementById('results');
     const resetButton = document.getElementById('reset');
     

     console.log('PB: ', poll_backend);

     
     //1. LOCAL DATA
     const pollResults = {
         "Rust": 0,
         "Motoko": 0,
         "TypeScript": 0,
         "Python": 0
     };
     
     //2. EVENT LISTENERS
     
     //Load the Simple Poll's question from the backend when the app loads
     document.addEventListener('DOMContentLoaded', async (e) => {
          //note that this is at beginning of the submit callback, this is deliberate
        //This is so the default behavior is set BEFORE the awaits are called below
        e.preventDefault();
        
        // Query the question from the backend
        const question = await poll_backend.getQuestion();
        document.getElementById("question").innerText = question;
      
        //Query the vote counts for each option
        // Example JSON that the frontend will get using the values above
        // [["Motoko","0"],["Python","0"],["Rust","0"],["TypeScript","0"]]
        const voteCounts = await poll_backend.getVotes();
        updateLocalVoteCounts(voteCounts);
        displayResults();
        return false;
      }, false);
      
      //Event listener that listens for when the form is submitted.
      //When the form is submitted with an option, it calls the backend canister
      //via "await poll_backend.vote(selectedOption)"
      pollForm.addEventListener('submit', async (e) => {
        //note that this is at beginning of the submit callback, this is deliberate
        //This is so the default behavior is set BEFORE the awaits are called below
        e.preventDefault(); 
      
        const formData = new FormData(pollForm);
        const checkedValue = formData.get("option");
      
        const updatedVoteCounts = await poll_backend.vote(checkedValue);
        console.log("Returning from await...")
        console.log(updatedVoteCounts);
        updateLocalVoteCounts(updatedVoteCounts);
        displayResults();
        return false;
      }, false);
      
      resetButton.addEventListener('click', async (e) => {
      
          e.preventDefault();
          
          //Reset the options in the backend
          await poll_backend.resetVotes();
          const voteCounts = await poll_backend.getVotes();
          updateLocalVoteCounts(voteCounts);
      
          //re-render the results once the votes are reset in the backend
          displayResults();
          return false;
      }, false);
      
      //3. HELPER FUNCTIONS
      
      //Helper vanilla JS function to create the HTML to render the results of the poll
      function displayResults() {
        let resultHTML = '<ul>';
        for (let key in pollResults) {
            resultHTML += '<li><strong>' + key + '</strong>: ' + pollResults[key] + '</li>';
        }
        resultHTML += '</ul>';
        resultsDiv.innerHTML = resultHTML;
      };
      
      //This helper updates the local JS object that the browser holds
      // Example JSON that the frontend will get using the values above
        // [["Motoko","0"],["Python","0"],["Rust","0"],["TypeScript","0"]]
      function updateLocalVoteCounts(arrayOfVoteArrays){
      
        for (let voteArray of arrayOfVoteArrays) {
          //Example voteArray -> ["Motoko","0"]
          let voteOption = voteArray[0];
          let voteCount = voteArray[1];
          pollResults[voteOption] = voteCount;
        }
     
     };



     

  }
}

export default App;
