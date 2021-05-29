const infoSection = document.querySelector(".info-section");
const listSection = document.querySelector(".list-section");
const actionSection = document.querySelector(".action-section");

let state={
    planets:[],
    starships:[],
    starshipsReadyToLaunch:[],
    approvedApplicant:[],
    people:[],
    selectedShipCrewList: [],
    toBeOnboard: [],
    removedCrew:[]
}

function setState(newState) {
    state = { ...state, ...newState };
    renderCrew();
}

function setStateStarShip(newState) {
    state = { ...state, ...newState };
    renderShip();
}

function addPeopleToState(dataFromServer){
    for(applicant of dataFromServer.results){
        applicant.approved = false

        setState({people:[...state.people, applicant]})
    }
}

function addReadyStarShipsToState(people){
    let starshipsOfApplicant = []
    for (starship of people.starships){
       let starshipDetail = state.starships.find(function(target){
            return target.url === starship
        })

        starshipCheck = state.starshipsReadyToLaunch.findIndex(function(target){
            return target === starshipDetail.name
        })
        
        if (starshipCheck === -1){
        starshipsOfApplicant = [...starshipsOfApplicant, starshipDetail.name]
        }
    }
    setState({starshipsReadyToLaunch:[...state.starshipsReadyToLaunch, ...starshipsOfApplicant]})
    // state.starshipsReadyToLaunch = [...state.starshipsReadyToLaunch, ...starshipsOfApplicant]
}

function getPeople(){
    fetch("https://swapi.dev/api/people/")
    .then(response => response.json())
    .then(function(data){
        listSection.innerHTML=""
        addPeopleToState(data)
        getAllPeople(data)
    })
}

function getAllPeople(data){
    if (data.next !== null){
        fetch(`${data.next}`)
        .then(response => response.json())
        .then(function(data){
            getAllPeople(data)
            addPeopleToState(data)
        })
    }
    else{
        renderAllPeople()
        getPlants()
        getStarship()
    }
}

function getPlants(){
    for (people of state.people){
        fetch(people.homeworld)
        .then(response => response.json())
        .then(function(planetData){
            let plantIndex = state.planets.findIndex(function(planet){
                    return  planet.name === planetData.name
                })
            if(plantIndex === -1) setState({planets:[...state.planets, planetData]})
            // state.planets = [...state.planets, planetData]
        })
    } 
}

function getStarship(){
    for (people of state.people){
        for(starship of people.starships)
        fetch(starship)
        .then(response => response.json())
        .then(function(starshipData){
            let starshipIndex = state.starships.findIndex(function(target){
                    return  target.name === starshipData.name
                })
            if(starshipIndex === -1) setState({starships:[...state.starships, starshipData]})
            // state.starships = [...state.starships, starshipData]
        })
    } 
}

function renderAllPeople(){    
    let peopleUl = document.createElement("ul")
    peopleUl.className = "people-list"
    listSection.append(peopleUl)

    let h2El = document.createElement("h2")
    h2El.innerText = "Applicant List"
    peopleUl.append(h2El)
   
    for (people of state.people){
        let peopleIndex = state.removedCrew.findIndex(function(target){
            return target === people.name
        })
        if (peopleIndex === -1) peopleUl.append(renderPeople(people))
        
    }
}

function renderPeople(people){
    let peopleLi = document.createElement("li")
    peopleLi.className = "people"
    let peopleName = document.createElement("span")
    peopleName.innerText = people.name
    let viewBtn = document.createElement("button")
    viewBtn.innerText = "View"
    viewBtn.addEventListener("click", function(){
        renderPeopleInfo(people)
        if(people.approved === false) renderApprovalForm(people)
        if(people.approved === true) renderApprovalResult(people)
    })

    peopleLi.append(peopleName,viewBtn)
    return peopleLi
}

function renderApprovalForm(people){
    actionSection.innerHTML = ""
    let approvalForm = document.createElement("form")
    approvalForm.className = "approval-form"

    let h2El = document.createElement("h2")
    h2El.innerText = "IMMIGRATION FORM"
    let nameH3 = document.createElement("h3")
    nameH3.innerText = "Applicant name: " + people.name
    
    let destinationLabel = document.createElement("label")
    destinationLabel.setAttribute("for", "destination")
    destinationLabel.innerText = "Destination:"
    let destinationInput = document.createElement("input")
    destinationInput.setAttribute("id", "destination")
    destinationInput.setAttribute("name", "destination")
    destinationInput.setAttribute("type", "text")
    destinationInput.required = true

    let purposeLabel = document.createElement("label")
    purposeLabel.setAttribute("for", 'purpose')
    purposeLabel.innerText = "Travel purpose:"

    let selectList = document.createElement("select")
    selectList.setAttribute("name", "purpose")
    selectList.setAttribute("id", "purpose")
    selectList.required = true

    let emptyOption = document.createElement("option")
    emptyOption.setAttribute("value", "")
    emptyOption.innerText = "Please Select"
    let vacation = document.createElement("option")
    vacation.setAttribute("value", "vacation")
    vacation.innerText = "Vacation"
    let business = document.createElement("option")
    business.setAttribute("value", "business")
    business.innerText = "Business"
    let migration = document.createElement("option")
    migration.setAttribute("value", "migration")
    migration.innerText = "Migration"
    selectList.append(emptyOption, vacation, business, migration)

    let terroristDiv = document.createElement("div")
    let terroristPara = document.createElement("p")
    terroristPara.innerText = "Terrorist activity: "
    let yesRadio = document.createElement("input")
    yesRadio.setAttribute("type","radio")
    yesRadio.setAttribute("id","yes")
    yesRadio.setAttribute("value",true)
    yesRadio.setAttribute("name","terrorist")
    let yesLabel = document.createElement("label")
    yesLabel.setAttribute("for", "yes")
    yesLabel.innerText = "Yes"
    yesRadio.required = true

    let noRadio = document.createElement("input")
    noRadio.setAttribute("type","radio")
    noRadio.setAttribute("id","no")
    noRadio.setAttribute("value",false)
    noRadio.setAttribute("name","terrorist")
    let noLabel = document.createElement("label")
    noLabel.setAttribute("for", "no")
    noLabel.innerText = "No"
    terroristDiv.append(terroristPara, yesRadio, yesLabel, noRadio, noLabel)

    let submitBtn = document.createElement("button")
    submitBtn.setAttribute("type","submit")
    submitBtn.innerText = "Approve"

    actionSection.append(approvalForm)
    approvalForm.append(h2El, nameH3, destinationLabel, destinationInput, purposeLabel, selectList, terroristDiv, submitBtn)
    approvalForm.addEventListener("submit", function(event){
        event.preventDefault()
        
        let approvalDetail={
            destination: destinationInput.value,
            purpose: selectList.value,
        }

        yesRadio.checked 
        ? approvalDetail.terroristActivity = true 
        : approvalDetail.terroristActivity = false

        let updatedPeople = {...people, approvalDetail, approved:true}
        let statePeopleWithoutPeople = state.people.filter(function(target){
            return target.name !== people.name
        })

        statePeopleWithoutPeople.push(updatedPeople)

        setState({people:[...statePeopleWithoutPeople], approvedApplicant:[...state.approvedApplicant, people.name]})
        addReadyStarShipsToState(people)
        
        approvalForm.reset()
        submitBtn.disabled = true
    })
}

function renderApprovalResult(people){
    actionSection.innerHTML = ""

    let container = document.createElement("div")
    container.className = "approval-form"

    let h2El = document.createElement("h2")
    h2El.innerText = "IMMIGRATION FORM"
    let nameH3 = document.createElement("h3")
    nameH3.innerText = "Applicant name: " + people.name

    let status = document.createElement("h3")
    status.className = "status"
    status.innerText = "APPROVED"

    container.append(h2El, nameH3, status)
    actionSection.append(container)
}

function renderPeopleInfo(people){
    infoSection.innerHTML = ""
    let infoDiv = document.createElement("div")
    infoDiv.className = "info-card"
    let nameH2 = document.createElement("h2")
    nameH2.innerText = people.name
    
    let detailUl = document.createElement("ul")
    detailUl.className = "detail-list"
    let gender = document.createElement("li")
    gender.innerText = `Gender: ${people.gender}`
    let DOB = document.createElement("li")
    DOB.innerText = `DOB: ${people.birth_year}`
    let height = document.createElement("li")
    height.innerText = `Height: ${people.height}`
    let mass = document.createElement("li")
    mass.innerText = `Mass: ${people.mass}`

    let peoplePlanet = state.planets.find(function(planet){
        return planet.url === people.homeworld
    })
    let homeWorldName= peoplePlanet.name
    
    let homeWorld = document.createElement("li")
    homeWorld.innerText = `HomeWorld: ${homeWorldName}`
    
    detailUl.append(gender, DOB, height, mass, homeWorld)
    infoDiv.append(nameH2, detailUl)
    infoSection.append(infoDiv)
}

function renderAllStarships(){
    listSection.innerHTML = ""
        
    let starshipsUl = document.createElement("ul")
    starshipsUl.className = "starships-list"
    listSection.append(starshipsUl)

    let h2El = document.createElement("h2")
    h2El.innerText = "Starships List"
    starshipsUl.append(h2El)
   
    for (starshipName of state.starshipsReadyToLaunch){
        starshipLi = renderStarShip(starshipName)
        starshipsUl.append(starshipLi)
    } 
}

function renderStarShip(starshipName){
    let starshipLi = document.createElement("li")
    starshipLi.className = "starship"
    let starshipNameSpan = document.createElement("span")
    starshipNameSpan.innerText = starshipName
    let viewBtn = document.createElement("button")
    viewBtn.innerText = "View"
    viewBtn.addEventListener("click", function(){

        starshipDetail = state.starships.find(function(target){
            return target.name === starshipName
         })
        renderStarShipInfo(starshipDetail)
        renderStarShipCrewList(starshipDetail) 
    })

    starshipLi.append(starshipNameSpan,viewBtn)
    return starshipLi
}

function renderStarShipInfo(starshipDetail){
    infoSection.innerHTML = ""
    let infoDiv = document.createElement("div")
    infoDiv.className = "info-card"
    let nameH2 = document.createElement("h2")
    nameH2.innerText = starshipDetail.name

    let detailUl = document.createElement("ul")
    detailUl.className = "detail-list"
    let manufacturer = document.createElement("li")
    manufacturer.innerText = `Manufacturer: ${starshipDetail.manufacturer}`
    let maxSpeed = document.createElement("li")
    maxSpeed.innerText = `Max Speed: ${starshipDetail.max_atmosphering_speed}`
    let cargoCapacity = document.createElement("li")
    cargoCapacity.innerText = `Cargo Capacity: ${starshipDetail.cargo_capacity}`
    let starshipClass = document.createElement("li")
    starshipClass.innerText = `Class: ${starshipDetail.starship_class}`

    detailUl.append(manufacturer, maxSpeed, cargoCapacity, starshipClass)
    infoDiv.append(nameH2, detailUl)
    infoSection.append(infoDiv)
}

function renderStarShipCrewList(starshipDetail){
    state.selectedShipCrewList = []
    state.toBeOnboard = []

    for (applicant of state.approvedApplicant){
        applicantDetail = state.people.find(function(target){
            return target.name === applicant
        })
        for (starship of applicantDetail.starships){
            if (starship === starshipDetail.url) setStateStarShip({selectedShipCrewList:[...state.selectedShipCrewList, applicantDetail.name]})
            // state.selectedShipCrewList = [...state.selectedShipCrewList, applicantDetail.name]
        }

        if(applicantDetail.starships.length === 0) setStateStarShip({toBeOnboard:[...state.toBeOnboard, applicantDetail.name]})
        // state.toBeOnboard = [...state.toBeOnboard, applicantDetail.name]
    }
    renderStarShipAction(starshipDetail)
    
}

function renderStarShipAction(starshipDetail){
    actionSection.innerHTML = ""

    let actionContainer = document.createElement("div")
    actionContainer.className = "action-container"
    actionSection.append(actionContainer)
    
    let starshipName = document.createElement("h3")
    starshipName.innerText = starshipDetail.name
    let crewPara = document.createElement("p")
    crewPara.innerText = `Crew: ${state.selectedShipCrewList.join(" , ")} `

    let launchBtn = document.createElement("button")
    launchBtn.innerText = "Departure Now"
    launchBtn.addEventListener("click",function(){
        setStateStarShip({removedCrew:[...state.removedCrew, ...state.selectedShipCrewList]})
        removeStarShip(starshipDetail, removeApplicant())
    })

    let toBeOnboardUl = document.createElement("ul")
    toBeOnboardUl.className = "to-onboard"
    let toBeOnboardTitle = document.createElement("h3")
    toBeOnboardTitle.innerText = "Approved Applicant waiting to onboard"
    toBeOnboardUl.append(toBeOnboardTitle)

    for(crew of state.toBeOnboard){
        let peopleLi = renderToBeOnboardList(crew)
        toBeOnboardUl.append(peopleLi)
    }

    actionContainer.append(starshipName, crewPara,launchBtn, toBeOnboardUl)
}

function renderToBeOnboardList(crew){
    let peopleLi = document.createElement("li")
    let peopleName = document.createElement("p")
    peopleName.innerText = crew
    let addBtn = document.createElement("button")
    addBtn.innerText = "Onboard"
    addBtn.addEventListener("click", function(){
        setStateStarShip({selectedShipCrewList:[...state.selectedShipCrewList, crew], toBeOnboard :[...state.toBeOnboard.filter(function(target){
            return target !== crew
        })]})
        // state.selectedShipCrewList = [...state.selectedShipCrewList, crew]
        // state.toBeOnboard = [...state.toBeOnboard.filter(function(target){
        //     return target !== crew
        // })]
        renderStarShipAction(starshipDetail)
        })

    peopleLi.append(peopleName, addBtn)
    return peopleLi
}

function removeStarShip(starshipDetail, removedArray){
    let newStarShipArray = state.starshipsReadyToLaunch.filter(function(ele){
        return starshipDetail.name !== ele
    })

    for (starship of newStarShipArray){
        let numberOfCrew = 0
        let starshipDetail = state.starships.find(function(target){
            return target.name === starship
        })

        for (applicant of removedArray){
            let applicantDetail = state.people.find(function(target){
                return target.name === applicant
            })
         
            for(starshipUrl of applicantDetail.starships){
                if (starshipUrl === starshipDetail.url) numberOfCrew++
            }
        }
        
        if (numberOfCrew === 0) {
            newStarShipArray = newStarShipArray.filter(function(target){
            return target !== starship
            })
        }
    }

    setStateStarShip({starshipsReadyToLaunch:newStarShipArray})
    // state.starshipsReadyToLaunch = newStarShipArray
    // renderShip()
}

function  removeApplicant(){
    let removedArray=[]
    for(crew of state.removedCrew){
        removedArray = state.approvedApplicant.filter(function(people){
            return people !== crew
        })
    }
    setStateStarShip({approvedApplicant:removedArray})
    // state.approvedApplicant = removedArray
    return removedArray
}

function enableSideBarBtn(){
    let crewDeck = document.getElementById("crew-deck-btn")
    crewDeck.addEventListener("click", function(){
        renderCrew()
    })

    let starshipHangar = document.getElementById("starship-hangar-btn")
    starshipHangar.addEventListener("click", function(){
        renderShip()
    })
}

function renderCrew(){
    infoSection.innerHTML = ""
    actionSection.innerHTML = ""
    listSection.innerHTML = ""
    renderAllPeople()
    console.log("log State:", state)
}

function renderShip(){
    infoSection.innerHTML = ""
    actionSection.innerHTML = ""
    listSection.innerHTML = ""
    renderAllStarships()
    console.log("log State:", state)
}

function runPage(){
    renderCrew()
    getPeople() 
    enableSideBarBtn()
}

runPage()
