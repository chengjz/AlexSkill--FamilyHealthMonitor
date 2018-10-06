const alexaSDK = require('alexa-sdk');
const awsSDK = require('aws-sdk');
// const promisify = require('es6-promisify');
const AWSregion = 'us-east-1';  
awsSDK.config.update({
    region: "us-east-1",

});
const appId = 'amzn1.ask.skill.94a87880-14e3-4d55-85bd-ff47668b927d';
const docClient = new awsSDK.DynamoDB.DocumentClient();

// convert callback style functions to promises
// const dbScan = promisify(docClient.scan, docClient);
// const dbGet = promisify(docClient.get, docClient);
// const dbPut = promisify(docClient.put, docClient);
// const dbDelete = promisify(docClient.delete, docClient);

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
		 
//     if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.05aecccb3-1461-48fb-a008-822ddrt6b516") {
//         context.fail("Invalid Application ID");
//      }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    var cardTitle = "Welcome";
    var speechOutput = "Welcome to the Family Health Mamagement Skill.";
    callback(session.attributes,
        buildSpeechletResponse(cardTitle, speechOutput, "", false));
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    if (intentName == 'MemberInfoIntent') {
        getMemberInfoResponse(intent, session, callback);
    }
    else if (intent.name == "MemberSicknessInfoIntent"){
        getMemberSicknessInfoResponse(intent, session, callback);
    }
     else if (intent.name == "SicknessInfoIntent"){
        getSicknessInfoResponse(intent, session, callback);
    }
     else if (intent.name == "SicknessHealIntent"){
        getSicknessHealResponse(intent, session, callback);
    }
     else if (intent.name == "SicknessPreventIntent"){
        getSicknessPrevResponse(intent, session, callback);
    }
     else if (intent.name == "SportMemberIntent"){
        getSportMemberResponse(intent, session, callback);
    }
     else if (intent.name == "FoodMemberIntent"){
        getFoodMemberResponse(intent, session, callback);
    }
     else if (intent.name == "SportsIntent"){
        getSportsInfoResponse(intent, session, callback);
    }
     else if (intent.name =="SportBenefitIntent"){
        getSportBeneResponse(intent, session, callback);
    }
     else if (intent.name == "FoodIntent"){
        getFoodInfoResponse(intent, session, callback);
    }
     else if (intent.name == "AMAZON.HelpIntent"){
        getHelpResponse(intent, session, callback);
    }
     else if (intent.name == "AMAZON.CancelIntent" || intent.name == "AMAZON.StopIntent"){
        handleSessionEndRequest(intent, session, callback);
    }
    else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Add any cleanup logic here
}

function getMemberInfoResponse(intent, session, callback){
    var memberName = intent.slots.name.value;
    console.log("memberName",memberName);
    const familyMemberParams = {
        TableName: "familyMember",
        Key:{
            "name":memberName
        }
    };
    console.log("familyMemberParams",familyMemberParams);
    var scanFamilyMember = new Promise(function(resolve,reject){
        var results = [];
        var onScan = (err, data) => {
        if (err) {
          return reject(err);
        }
        data.Items.forEach(function (Item) {
            if (Item.name == memberName){
            results = results.concat(Item);
            console.log("Item",Item);
            }
        });
        // results = results.concat(data.Items);
        // if (typeof data.LastEvaluatedKey != 'undefined') {
        //   params.ExclusiveStartKey = data.LastEvaluatedKey
        //   docClient.scan(params, onScan)
        // } else {
          return resolve(results[0]);
        
        };
        docClient.scan(familyMemberParams, onScan);
    });
        scanFamilyMember
          .then((results) => {
                console.log("scanFamilyMember",results);
                var speechOutput = results.name + " is " +  results.Age + " years old. ";
                if (results.Gender == "Male") {
                    speechOutput += "He is " +  results.Height + " cm tall ";
                    speechOutput += "and He is " + results.Weight + " kg.";
                } else if (results.Gender == "Female") {
                    speechOutput += "She is " +  results.Height + " cm tall ";
                    speechOutput += " and She is " + results.Weight + " kg.";
                }
                // this.response.speak(speechOutput).listen('try again');
                // this.emit(':responseReady');
                callback(session.attributes,
                buildSpeechletResponseWithoutCard(speechOutput,"", "false"));
          })
          .catch((err) => {
            console.log("Didn't find the familyMember",err);
          });
}

function getMemberSicknessInfoResponse(intent, session, callback){
    var familyMemberName = intent.slots.name.value;
    console.log("familyMemberName",familyMemberName);
    const familyMemberParams = {
        TableName: "familyMember",
        Key:{
            "name":familyMemberName
        }
    };
    var scanFamilyMember = new Promise(function(resolve,reject){
        var results = [];
        var onScan = (err, data) => {
        if (err) {
          return reject(err);
        }
        data.Items.forEach(function (Item) {
            if (Item.name == familyMemberName){
            results = results.concat(Item);
            console.log("Item",Item);
            }
        });
        // if (typeof data.LastEvaluatedKey != 'undefined') {
        //   params.ExclusiveStartKey = data.LastEvaluatedKey
        //   docClient.scan(params, onScan)
        // } else {
          return resolve(results);
        
        };
        docClient.scan(familyMemberParams, onScan);
    });

    var scanMemberSickness = function(results){
        const memberId = results[0].id;
        console.log("memberId",memberId);
        const memberSicknessInfoParams = {
            TableName: "sickInformation",
            Key:{
                "memberId":results.id
            }
        };
        var scanMemberSicknessPromise = new Promise(function(resolve,reject){
        var onScan = (err, data) => {
        if (err) {
          return reject(err);
        }
        data.Items.forEach(function (Item) {
            if (Item.memberId == memberId){
            results = results.concat(Item);
            console.log("Item",Item);
            }
        });
        // if (typeof data.LastEvaluatedKey != 'undefined') {
        //   params.ExclusiveStartKey = data.LastEvaluatedKey
        //   docClient.scan(params, onScan)
        // } else {
          return resolve(results);
        
        };
        docClient.scan(memberSicknessInfoParams, onScan);
        });
        return scanMemberSicknessPromise;
    };
    var scanSicknessInfo = function(results){
        const deseaseId = results[1].diseaseId;
        console.log("deseaseId",deseaseId);
        const memberSicknessInfoParams = {
            TableName: "Disease",
            Key:{
                "id":deseaseId
            }
        };
        var scanSicknessInfoPromise = new Promise(function(resolve,reject){
        var onScan = (err, data) => {
        if (err) {
          return reject(err);
        }
        // console.log("check if the scanSicknessInfo works",data.Items);
        data.Items.forEach(function (Item) {
            if (Item.DiseaseId == deseaseId){
            results = results.concat(Item);
            console.log("Item",Item);
            console.log("check if the Item exists",Item);
            }
        });
        // if (typeof data.LastEvaluatedKey != 'undefined') {
        //   params.ExclusiveStartKey = data.LastEvaluatedKey
        //   docClient.scan(params, onScan)
        // } else {
          return resolve(results);
        
        };
        docClient.scan(memberSicknessInfoParams, onScan);
        });
        return scanSicknessInfoPromise;
            
        
    };

        scanFamilyMember
          .then(function(results) {
            console.log("scanFamilyMember",results);
            return scanMemberSickness(results);
          })
          .then(function(results) {
            console.log("scanMemberSickness",results);
            if (results.length <= 1){
                return new Promise(function(resolve, reject) {
                    resolve(results);
                });
            }
            else {
                console.log("scanSicknessInfo",results);
                return scanSicknessInfo(results);
                
            }
          })
          .then(function(results){
            console.log("scanSicknessInfo",results);
            

            var speechOutput = '';
            if (results.length <= 1) {
                speechOutput = results[0].name + " is not sick.";   
            } else {
                speechOutput = results[0].name + " is sick on " + results[1].Date + ", ";
                console.log("results[1].Date", results[1].Date);
                if (results[0].Gender == "Male") {
                    speechOutput += "He gets a " + results[2].DiseaseName;
                } else if (results[0].Gender == "Female") {
                    speechOutput += "She gets a " + results[2].DiseaseName;
                }
            }
            callback(session.attributes,
                buildSpeechletResponseWithoutCard(speechOutput, "", "true"));

          })
          .catch((err) => {
            console.log("Didn't find the familyMember",err);
          });
}

function getSicknessInfoResponse(intent, session, callback){
    var sicknessName = intent.slots.name.value;
    console.log("sicknessName",sicknessName);
    const Params = {
        TableName: "Disease",
        Key:{
            "DiseaseName":sicknessName
        }
    };
    console.log("Params",Params);
    var scanDisease = new Promise(function(resolve,reject){
        var results = [];
        var onScan = (err, data) => {
        if (err) {
          return reject(err);
        }
        data.Items.forEach(function (Item) {
            if (Item.DiseaseName == sicknessName){
            results = results.concat(Item);
            console.log("Item",Item);
            }
        });
        // results = results.concat(data.Items);
        // if (typeof data.LastEvaluatedKey != 'undefined') {
        //   params.ExclusiveStartKey = data.LastEvaluatedKey
        //   docClient.scan(params, onScan)
        // } else {
          return resolve(results[0]);
        
        };
        docClient.scan(Params, onScan);
    });
        scanDisease
          .then((results) => {
                console.log("scanFamilyMember",results);
                var speechOutput = results.DiseaseName + " is " +  results.Description;
                speechOutput += ", and the symptoms are " + results.Symptoms;
                // this.response.speak(speechOutput).listen('try again');
                // this.emit(':responseReady');
                callback(session.attributes,
                buildSpeechletResponseWithoutCard(speechOutput,"", "false"));
          })
          .catch((err) => {
            console.log("err",err);
          });
}

function getSicknessHealResponse(intent, session, callback){
    var sicknessName = intent.slots.name.value;
    console.log("sicknessName",sicknessName);
    const Params = {
        TableName: "Disease",
        Key:{
            "DiseaseName":sicknessName
        }
    };
    console.log("Params",Params);
    var scanDisease = new Promise(function(resolve,reject){
        var results = [];
        var onScan = (err, data) => {
        if (err) {
          return reject(err);
        }
        data.Items.forEach(function (Item) {
            if (Item.DiseaseName == sicknessName){
            results = results.concat(Item);
            console.log("Item",Item);
            }
        });
        // results = results.concat(data.Items);
        // if (typeof data.LastEvaluatedKey != 'undefined') {
        //   params.ExclusiveStartKey = data.LastEvaluatedKey
        //   docClient.scan(params, onScan)
        // } else {
          return resolve(results[0]);
        
        };
        docClient.scan(Params, onScan);
    });
        scanDisease
          .then((results) => {
                console.log("scanFamilyMember",results);
                var speechOutput = results.DiseaseName + " can be healed by ";
                speechOutput += results.Management;
                // this.response.speak(speechOutput).listen('try again');
                // this.emit(':responseReady');
                callback(session.attributes,
                buildSpeechletResponseWithoutCard(speechOutput,"", "false"));
          })
          .catch((err) => {
            console.log("err",err);
          });
}

function getSicknessPrevResponse(intent, session, callback){
    var sicknessName = intent.slots.name.value;
    console.log("sicknessName",sicknessName);
    const Params = {
        TableName: "Disease",
        Key:{
            "DiseaseName":sicknessName
        }
    };
    console.log("Params",Params);
    var scanDisease = new Promise(function(resolve,reject){
        var results = [];
        var onScan = (err, data) => {
        if (err) {
          return reject(err);
        }
        data.Items.forEach(function (Item) {
            if (Item.DiseaseName == sicknessName){
            results = results.concat(Item);
            console.log("Item",Item);
            }
        });
        // results = results.concat(data.Items);
        // if (typeof data.LastEvaluatedKey != 'undefined') {
        //   params.ExclusiveStartKey = data.LastEvaluatedKey
        //   docClient.scan(params, onScan)
        // } else {
          return resolve(results[0]);
        
        };
        docClient.scan(Params, onScan);
    });
        scanDisease
          .then((results) => {
                console.log("scanFamilyMember",results);
                var speechOutput = results.DiseaseName + " can be prevented by ";
                speechOutput += results.Prevention;
                // this.response.speak(speechOutput).listen('try again');
                // this.emit(':responseReady');
                callback(session.attributes,
                buildSpeechletResponseWithoutCard(speechOutput,"", "false"));
          })
          .catch((err) => {
            console.log("err",err);
          });
}

function getSportsInfoResponse(intent, session, callback){
    var sportName = intent.slots.Sports.value;
    console.log("sportName",sportName);
    const Params = {
        TableName: "Sports",
        Key:{
            "name":sportName
        }
    };
    console.log("Params",Params);
    var scanFamilyMember = new Promise(function(resolve,reject){
        var results = [];
        var onScan = (err, data) => {
        if (err) {
          return reject(err);
        }
        data.Items.forEach(function (Item) {
            if (Item.name == sportName){
            results = results.concat(Item);
            console.log("Item",Item);
            }
        });
        // results = results.concat(data.Items);
        // if (typeof data.LastEvaluatedKey != 'undefined') {
        //   params.ExclusiveStartKey = data.LastEvaluatedKey
        //   docClient.scan(params, onScan)
        // } else {
          return resolve(results[0]);
        
        };
        docClient.scan(Params, onScan);
    });
        scanFamilyMember
          .then((results) => {
                console.log("scanSports",results);
                var speechOutput = results.name + " : " + results.description;
                // this.response.speak(speechOutput).listen('try again');
                // this.emit(':responseReady');
                callback(session.attributes,
                buildSpeechletResponseWithoutCard(speechOutput,"", "false"));
          })
          .catch((err) => {
            console.log("Didn't find the familyMember",err);
          });
}

function getSportBeneResponse(intent, session, callback){
    var sportName = intent.slots.Sports.value;
    console.log("sportName",sportName);
    const Params = {
        TableName: "Sports",
        Key:{
            "name":sportName
        }
    };
    console.log("Params",Params);
    var scanFamilyMember = new Promise(function(resolve,reject){
        var results = [];
        var onScan = (err, data) => {
        if (err) {
          return reject(err);
        }
        data.Items.forEach(function (Item) {
            if (Item.name == sportName){
            results = results.concat(Item);
            console.log("Item",Item);
            }
        });
        // results = results.concat(data.Items);
        // if (typeof data.LastEvaluatedKey != 'undefined') {
        //   params.ExclusiveStartKey = data.LastEvaluatedKey
        //   docClient.scan(params, onScan)
        // } else {
          return resolve(results[0]);
        
        };
        docClient.scan(Params, onScan);
    });
        scanFamilyMember
          .then((results) => {
                console.log("scanSports",results);
                var speechOutput = results.name + "'s benefits are " + results.benefits;
                // this.response.speak(speechOutput).listen('try again');
                // this.emit(':responseReady');
                callback(session.attributes,
                buildSpeechletResponseWithoutCard(speechOutput,"", "false"));
          })
          .catch((err) => {
            console.log("Didn't find the familyMember",err);
          });
}

function getFoodInfoResponse(intent, session, callback){
    var foodName = intent.slots.food.value;
    var infoCate= intent.slots.infoCate.value;
    console.log("foodName & infoCate",foodName + infoCate);
    const Params = {
        TableName: "Food",
        Key:{
            "name":foodName
        }
    };
    console.log("Params",Params);
    var scanFamilyMember = new Promise(function(resolve,reject){
        var results = [];
        var onScan = (err, data) => {
        if (err) {
          return reject(err);
        }
        data.Items.forEach(function (Item) {
            if (Item.name == foodName){
            results = results.concat(Item);
            console.log("Item",Item);
            }
        });
        // results = results.concat(data.Items);
        // if (typeof data.LastEvaluatedKey != 'undefined') {
        //   params.ExclusiveStartKey = data.LastEvaluatedKey
        //   docClient.scan(params, onScan)
        // } else {
          return resolve(results[0]);
        
        };
        docClient.scan(Params, onScan);
    });
        scanFamilyMember
          .then((results) => {
                console.log("scanSports",results);
                var speechOutput = ''; 
                if (infoCate == "recipe") {
                    speechOutput = "The recipe of " + results.name + " is " + results.recipe;   
                } else if (infoCate == "ingredient"){
                    speechOutput = "The ingredients of " + results.name + "are " + results.ingredient;  
                } else if (infoCate == "calorie"){
                    speechOutput = "The calorie of " + results.name + " is " + results.calorie;  
                }
                // this.response.speak(speechOutput).listen('try again');
                // this.emit(':responseReady');
                callback(session.attributes,
                buildSpeechletResponseWithoutCard(speechOutput,"", "false"));
          })
          .catch((err) => {
            console.log("Didn't find the familyMember",err);
          });
}

function getSportMemberResponse(intent, session, callback){
    var familyMemberName = intent.slots.name.value;
    console.log("familyMemberName",familyMemberName);
    const familyMemberParams = {
        TableName: "familyMember",
        Key:{
            "name":familyMemberName
        }
    };
    var scanFamilyMember = new Promise(function(resolve,reject){
        var results = [];
        var onScan = (err, data) => {
        if (err) {
          return reject(err);
        }
        data.Items.forEach(function (Item) {
            if (Item.name == familyMemberName){
            results = results.concat(Item);
            console.log("Item",Item);
            }
        });
        // if (typeof data.LastEvaluatedKey != 'undefined') {
        //   params.ExclusiveStartKey = data.LastEvaluatedKey
        //   docClient.scan(params, onScan)
        // } else {
          return resolve(results);
        
        };
        docClient.scan(familyMemberParams, onScan);
    });

    var scanMemberSickness = function(results){
        const memberId = results[0].id;
        console.log("memberId",memberId);
        const memberSicknessInfoParams = {
            TableName: "sickInformation",
            Key:{
                "memberId":results.id
            }
        };
        var scanMemberSicknessPromise = new Promise(function(resolve,reject){
        var onScan = (err, data) => {
        if (err) {
          return reject(err);
        }
        data.Items.forEach(function (Item) {
            if (Item.memberId == memberId){
            results = results.concat(Item);
            console.log("Item",Item);
            }
        });
        // if (typeof data.LastEvaluatedKey != 'undefined') {
        //   params.ExclusiveStartKey = data.LastEvaluatedKey
        //   docClient.scan(params, onScan)
        // } else {
          return resolve(results);
        
        };
        docClient.scan(memberSicknessInfoParams, onScan);
        });
        return scanMemberSicknessPromise;
    };
    var scanSicknessInfo = function(results){
        const deseaseId = results[1].diseaseId;
        console.log("deseaseId",deseaseId);
        const memberSicknessInfoParams = {
            TableName: "Disease",
            Key:{
                "id":deseaseId
            }
        };
        var scanSicknessInfoPromise = new Promise(function(resolve,reject){
        var onScan = (err, data) => {
        if (err) {
          return reject(err);
        }
        // console.log("check if the scanSicknessInfo works",data.Items);
        data.Items.forEach(function (Item) {
            if (Item.DiseaseId == deseaseId){
            results = results.concat(Item);
            console.log("Item",Item);
            console.log("check if the Item exists",Item);
            }
        });
        // if (typeof data.LastEvaluatedKey != 'undefined') {
        //   params.ExclusiveStartKey = data.LastEvaluatedKey
        //   docClient.scan(params, onScan)
        // } else {
          return resolve(results);
        
        };
        docClient.scan(memberSicknessInfoParams, onScan);
        });
        return scanSicknessInfoPromise;
            
        
    };
    var getSportsResponse = function(results) {
            console.log("scanSicknessInfo",results);
            

            var sicknessName = " ";
            if (results.length <= 1) {
                sicknessName = "false";
                console.log("sicknessName", sicknessName);
            } else {
                sicknessName = results[2].DiseaseName;
                console.log("sicknessName", sicknessName);
                }
            var res = {
                Gerden : results[0].Gender,
                Age : results[0].Age,
                Height : results[0].Height,
                Weight : results[0].Weight,
                Sick : sicknessName
            };
            
              var memberSportsList = [];
              console.log("res",res);
                if (res.Age >= 70){
                    memberSportsList = ["rest","walk"];
                } else if (res.Sick != "false"){
                    console.log("1memberSportsList", memberSportsList);
                    if (res.Sick == "Diabetes mellitus"){
                        memberSportsList = ["running", "swimming"];
                    console.log("2memberSportsList", memberSportsList);
                    } else if (res.Sick == "cold") {
                        memberSportsList = ["rest"];
                    }
                } else if (res.Gender == "Male" && res.Weight > 90){
                    memberSportsList = ["running", "swimming"];
                } else if (res.Gender == "Female" && res.Weight > 70){
                    memberSportsList = ["running", "swimming"];
                } else {
                    memberSportsList = ["rest", "walk", "running", "swimming"];
                }
                console.log("memberSportsList", memberSportsList);
                
                var speechOutput = familyMemberName + " can ";
                console.log("speechOutput", speechOutput);
                if (memberSportsList.length > 1){
                    if (memberSportsList.length == 2){
                        speechOutput += memberSportsList[0] + " and " + memberSportsList[1];
                    } else { 
                        memberSportsList.forEach(function(item) {
                            speechOutput += item + "  ";
                            // speechOutput += " and " + memberSportsList[memberSportsList.length - 1];
                        });
                    }
                } else {
                    speechOutput += memberSportsList[0];
                } 
                    callback(session.attributes,
            buildSpeechletResponseWithoutCard(speechOutput, "", "false"));
            };

        scanFamilyMember
          .then(function(results) {
            console.log("scanFamilyMember",results);
            return scanMemberSickness(results);
          })
          .then(function(results) {
            console.log("scanMemberSickness",results);
            if (results.length <= 1){
                return new Promise(function(resolve, reject) {
                    resolve(results);
                });
            }
            else {
                console.log("scanSicknessInfo",results);
                return scanSicknessInfo(results);
            }
          })
          .then(function(res){
              getSportsResponse(res);
          })
          .catch((err) => {
            console.log("Didn't find the familyMember",err);
          });
}

function getFoodMemberResponse(intent, session, callback){
    var familyMemberName = intent.slots.name.value;
    console.log("familyMemberName",familyMemberName);
    const familyMemberParams = {
        TableName: "familyMember",
        Key:{
            "name":familyMemberName
        }
    };
    var scanFamilyMember = new Promise(function(resolve,reject){
        var results = [];
        var onScan = (err, data) => {
        if (err) {
          return reject(err);
        }
        data.Items.forEach(function (Item) {
            if (Item.name == familyMemberName){
            results = results.concat(Item);
            console.log("Item",Item);
            }
        });
        // if (typeof data.LastEvaluatedKey != 'undefined') {
        //   params.ExclusiveStartKey = data.LastEvaluatedKey
        //   docClient.scan(params, onScan)
        // } else {
          return resolve(results);
        
        };
        docClient.scan(familyMemberParams, onScan);
    });

    var scanMemberSickness = function(results){
        const memberId = results[0].id;
        console.log("memberId",memberId);
        const memberSicknessInfoParams = {
            TableName: "sickInformation",
            Key:{
                "memberId":results.id
            }
        };
        var scanMemberSicknessPromise = new Promise(function(resolve,reject){
        var onScan = (err, data) => {
        if (err) {
          return reject(err);
        }
        data.Items.forEach(function (Item) {
            if (Item.memberId == memberId){
            results = results.concat(Item);
            console.log("Item",Item);
            }
        });
        // if (typeof data.LastEvaluatedKey != 'undefined') {
        //   params.ExclusiveStartKey = data.LastEvaluatedKey
        //   docClient.scan(params, onScan)
        // } else {
          return resolve(results);
        
        };
        docClient.scan(memberSicknessInfoParams, onScan);
        });
        return scanMemberSicknessPromise;
    };
    var scanSicknessInfo = function(results){
        const deseaseId = results[1].diseaseId;
        console.log("deseaseId",deseaseId);
        const memberSicknessInfoParams = {
            TableName: "Disease",
            Key:{
                "id":deseaseId
            }
        };
        var scanSicknessInfoPromise = new Promise(function(resolve,reject){
        var onScan = (err, data) => {
        if (err) {
          return reject(err);
        }
        // console.log("check if the scanSicknessInfo works",data.Items);
        data.Items.forEach(function (Item) {
            if (Item.DiseaseId == deseaseId){
            results = results.concat(Item);
            console.log("Item",Item);
            console.log("check if the Item exists",Item);
            }
        });
        // if (typeof data.LastEvaluatedKey != 'undefined') {
        //   params.ExclusiveStartKey = data.LastEvaluatedKey
        //   docClient.scan(params, onScan)
        // } else {
          return resolve(results);
        
        };
        docClient.scan(memberSicknessInfoParams, onScan);
        });
        return scanSicknessInfoPromise;
            
        
    };
    var getFoodResponse = function(results) {
            console.log("scanSicknessInfo",results);
            

            var sicknessName = " ";
            if (results.length <= 1) {
                sicknessName = "false";
                console.log("sicknessName", sicknessName);
            } else {
                sicknessName = results[2].DiseaseName;
                console.log("sicknessName", sicknessName);
                }
            var res = {
                Gerden : results[0].Gender,
                Age : results[0].Age,
                Height : results[0].Height,
                Weight : results[0].Weight,
                Sick : sicknessName
            };
            
              var memberFoodList = [];
              console.log("res",res);
                if (res.Sick != "false"){
                    console.log("1memberSportsList", memberFoodList);
                    if (res.Sick == "Diabetes mellitus"){
                        memberFoodList = ["coogee"];
                    console.log("2memberSportsList", memberFoodList);
                    } else if (res.Sick == "cold") {
                        memberFoodList = ["fish soup", "chicken soup"];
                    }
                } else if (res.Gender == "Male" && res.Weight > 90){
                    memberFoodList = ["congee"];
                } else if (res.Gender == "Female" && res.Weight > 70){
                    memberFoodList = ["congee"];
                } else {
                    memberFoodList = ["congee", "fish soup", "chicken soup"];
                }
                console.log("memberSportsList", memberFoodList);
                
                var speechOutput = familyMemberName + " can have ";
                console.log("speechOutput", speechOutput);
                if (memberFoodList.length > 1){
                    if (memberFoodList.length == 2){
                        speechOutput += memberFoodList[0] + " and " + memberFoodList[1];
                    } else { 
                        memberFoodList.forEach(function(item) {
                            speechOutput += item + "  ";
                            // speechOutput += " and " + memberSportsList[memberSportsList.length - 1];
                        });
                    }
                } else {
                    speechOutput += memberFoodList[0];
                } 
                    callback(session.attributes,
            buildSpeechletResponseWithoutCard(speechOutput, "", "false"));
            };

        scanFamilyMember
          .then(function(results) {
            console.log("scanFamilyMember",results);
            return scanMemberSickness(results);
          })
          .then(function(results) {
            console.log("scanMemberSickness",results);
            if (results.length <= 1){
                return new Promise(function(resolve, reject) {
                    resolve(results);
                });
            }
            else {
                console.log("scanSicknessInfo",results);
                return scanSicknessInfo(results);
            }
          })
          .then(function(res){
              getFoodResponse(res);
          })
          .catch((err) => {
            console.log("Didn't find the familyMember",err);
          });
}


function getHelpResponse(intent, session, callback){
    const speechOutput = "Welcome to the help section for the famliyHealthMonitor Skill. A couple of examples of phrases that I can except are... Is Coco sick... or, what's the prevention and management of cold. Lets get started now by trying one of these.";
    
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(speechOutput, "", "false"));
}

function handleSessionEndRequest(intent, session, callback){
    const speechOutput = "Thank you for using the famliyHealthMonitor skill! We hope you enjoyed the experience.";
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(speechOutput, "", "true"));
}
function handleTestRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Hello, World!", "", "true"));
}

// ------- Helper functions to build responses -------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}