var gameHistory = [] ;
var newGame = {};

// User Input & Check Section:
var gameNameInput = document.querySelector(".gameName input");
var playtimeInput = document.querySelector(".playtime input");
var categorySelect = document.getElementById("selectCategory");
var enterErrorMessage = document.getElementById("enterErrorMessage");
var gameNameOutput = document.getElementById("gameNameOutput");
var categoryOutput = document.getElementById("categoryOutput");
var playtimeOutput = document.getElementById("playtimeOutput");
var totalPlaytimeOutput = document.getElementById("totalPlaytimeOutput");
var dateOutput = document.getElementById("dateOutput");
var checkErrorMessage = document.getElementById("checkErrorMessage");

var checkButton = document.getElementById("checkButton");
checkButton.addEventListener("click", () => {
    var playtimeValue = playtimeInput.value.trim();
    var regex = /^\d+(\.\d{1})?$/;

    // check if all input boxes and selection boxes are not blank or default options
    if (gameNameInput.value.trim() === "" && playtimeInput.value.trim() === "" && categorySelect.value === "Click to select") {
        gameNameInput.style.borderColor = "red";
        playtimeInput.style.borderColor = "red";
        categorySelect.style.borderColor = "red";
        enterErrorMessage.textContent = "Please enter the game information.";
    }
    // check if the game name is not blank
    else if (gameNameInput.value.trim() === "") {
        gameNameInput.style.borderColor = "red";
        enterErrorMessage.textContent = "Please enter the Game Name.";
    }
    // check if playtime is not blank
    else if (playtimeInput.value.trim() === "") {
        playtimeInput.style.borderColor = "red";
        enterErrorMessage.textContent = "Please enter the Playtime.";
    }
    // check if the playtimeInput contains only one decimal digit
    else if (!regex.test(playtimeValue)) {
        playtimeInput.style.borderColor = "red";
        enterErrorMessage.textContent = "Please enter a numeric value with one decimal place.";
    }
    // check if the category is not the default option
    else if (categorySelect.value === "Click to select") {
        categorySelect.style.borderColor = "red";
        enterErrorMessage.textContent = "Please select the Category.";
    }
    // if all info are correct, the card will be filled with user inputs
    else {
        // remove the error message
        enterErrorMessage.textContent = "";

        // change the border to black
        gameNameInput.style.borderColor = "black";
        playtimeInput.style.borderColor = "black";
        categorySelect.style.borderColor = "black";

        // output = input
        gameNameOutput.textContent = gameNameInput.value.trim();
        categoryOutput.textContent = categorySelect.value;
        playtimeOutput.textContent = playtimeInput.value.trim() + " Hours";

        // add output to object
        newGame.gameName = gameNameOutput.textContent.trim();
        newGame.category = categoryOutput.textContent.trim();
        newGame.playtime = playtimeOutput.textContent.trim();
        newGame.totalPlaytime = 0;
        

        // check if the game has been added in the local storage(gameHistory)
        var checkGameHistory = JSON.parse(localStorage.getItem('gameHistory'));
        // if the localStorage is empty or does not has the game with same name, total playtime = playtime
        if (checkGameHistory == null || !checkGameHistory.find(game => game.gameName === newGame.gameName)) {
            
            newGame.totalPlaytime = parseFloat(newGame.playtime);
        } else {
            // if the localStorage has the game with same name, total playtime = playtime + total playtime
            const existingGame = gameHistory.find(game => game.gameName === newGame.gameName);
            newGame.totalPlaytime = parseFloat(newGame.playtime) + existingGame.totalPlaytime;
        }
        
        totalPlaytimeOutput.textContent = newGame.totalPlaytime + " Hours";
        
        
        dateOutput.textContent = getCurrentDate();
        newGame.date = dateOutput.textContent.trim();

        // change the text color to black
        gameNameOutput.style.color = "black";
        categoryOutput.style.color = "black";
        playtimeOutput.style.color = "black";
        totalPlaytimeOutput.style.color = "black";
        dateOutput.style.color = "black";
    }
});


// get the date that user checked
function getCurrentDate() {
    var currentDate = new Date();
    var year = currentDate.getFullYear();
    var month = 1 + currentDate.getMonth(); 
    var day = currentDate.getDate();
    var formattedDate = day + "/" + month + "/" + year;
    return formattedDate;
}


// clear all game info by clicking clear button
var clearButton = document.getElementById("clearButton");
clearButton.addEventListener("click", () => {
    var gameNameInput = document.querySelector(".gameName input");
    var playtimeInput = document.querySelector(".playtime input");
    var categorySelect = document.getElementById("selectCategory");
    var enterErrorMessage = document.getElementById("enterErrorMessage");
    // change the input value and select value to empty and default.
    gameNameInput.value = "";
    playtimeInput.value = "";
    categorySelect.value = "Click to select";
    // remove the error message
    enterErrorMessage.textContent = "";
    // change the border to black
    gameNameInput.style.borderColor = "black";
    playtimeInput.style.borderColor = "black";
    categorySelect.style.borderColor = "black";
});




//show localstorage. when the page is refreshed, still show localStorage
updateGameHis();


// if user click add button
var addButton = document.getElementById("addButton");
addButton.addEventListener("click", () => {
    // if the card is empty, pop up error message
    if (gameNameOutput.textContent.trim() === "NA") {
        checkErrorMessage.textContent = "Cannot be added to game history. Please finish step 1 first.";
        return; 
      }
      gameHistory = JSON.parse(localStorage.getItem("gameHistory")) || [];
      // add the newGame object to the gameHistory array
      gameHistory.unshift(newGame);
  
      // put the gameHistory array to localStorage
      localStorage.setItem("gameHistory", JSON.stringify(gameHistory));
  
      // show localstorage
      updateGameHis();

      // return the values in the check card to NA
      gameNameOutput.textContent = "NA";
      categoryOutput.textContent = "NA";
      playtimeOutput.textContent = "NA";
      totalPlaytimeOutput.textContent = "NA";
      dateOutput.textContent = "NA";
      gameNameOutput.style.color = "gray";
      categoryOutput.style.color = "gray";
      playtimeOutput.style.color = "gray";
      totalPlaytimeOutput.style.color = "gray";
      dateOutput.style.color = "gray";
});

  




function updateGameHis() {
    var list = document.getElementById("gameHisList");
    list.innerHTML = "";
    // get localStorage value
    gameHistory = JSON.parse(localStorage.getItem("gameHistory"));
    // set the totalHour in one day to 0
    var totalHourNumber = 0;
    var totalHour = 0;

    if (gameHistory !== null){
        // totalHour will be the sum of playtime in one day 
        gameHistory.forEach((game, index) => {
            totalHourNumber = totalHourNumber + parseFloat(game.playtime);
            //totalHourNumber = parseFloat(game.playtime);
            totalHour = totalHourNumber.toFixed(1);
        })

        //show every game history
        gameHistory.forEach((game, index) => {
            var listItem = document.createElement("li");
            
            // content in each game history
            listItem.innerHTML = `
                <div class="top" >
                    <div id="gameDate">
                        ${game.date} 
                    </div>
                    <div id="totalHours">
                        ${totalHour} Hours 
                    </div>
                </div>
            
                <div class="gameCard">
                    <div id="defaultInfo">
                        
                        <div id="gameName">
                            <strong>Game Name: </strong> <br/>${game.gameName} 
                        </div>
                        <div id="palytime">
                            <strong>Playtime: </strong> <br/>${game.playtime}
                        </div>
                    </div>
                    <button><i class="fas fa-chevron-down"></i></button>
                    <div id="details">
                        <div id="detailInfo">
                            <div id="category">
                                <strong>Category: </strong> <br/>${game.category}
                            </div>
                            <div id="totalPlaytime">
                                <strong>Total Playtime: </strong> <br/>${game.totalPlaytime} Hours
                            </div>
                        </div>
                        <button class="deleteButton">Delete</button>
                    </div>
                </div>`;
        
            var button = listItem.querySelector("button");
            var details = listItem.querySelector("#details");
            var deleteButton = listItem.querySelector(".deleteButton");
            
            // the default state is without details
            details.style.display = "none";
            
            // when user click the arrow, default to expanded/ expanded to default
            button.addEventListener("click", () => {
                if (details.style.display === "none") {
                    details.style.display = "block";
                    button.innerHTML = '<i class="fas fa-chevron-up"></i>'; 
                } else {
                    details.style.display = "none";
                    button.innerHTML = '<i class="fas fa-chevron-down"></i>'; 
                }
            });
            //when user click delete button, delete it from the list and the localStorage
            deleteButton.addEventListener('click', () => {
                listItem.remove();
                gameHistory.splice(index, 1);
                // After delete, localStorage need to be updated
                updateLocalStorage();
            });
            list.appendChild(listItem);
        }); 
    }

    function updateLocalStorage() {
        localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
    }
  }
  

// if user click "Clear All History" button, the localStorage will be null and nothing showed on the page
var clearAllGameHisButton = document.getElementById("clearGameHis");
clearAllGameHisButton.addEventListener("click", (event) =>{
    localStorage.removeItem("gameHistory");
    updateGameHis();
})


// if user clicks other part in web, error message gone
document.addEventListener("click", function (event) {
    var target = event.target;
    var userEnter = document.querySelector(".userEnter");
    var userAdd = document.querySelector(".userAdd");
    // if not userEnter section
    if (!userEnter.contains(target)) {
       var inputs = document.querySelectorAll(".userEnter input");
       var select = document.getElementById("selectCategory");
       inputs.forEach(function (input) {
           input.style.borderColor = "black";
       });
       select.style.borderColor = "black";
       enterErrorMessage.textContent = "";
    }
    // if not userAdd section
    if (!userAdd.contains(target)) {
       checkErrorMessage.textContent = "";
    }
});



