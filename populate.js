const mongoose = require('mongoose');
require('./db.js');

const Questions = mongoose.model('Questions');

/* Fields for a new question */
const newQuestionName = "findlength";
const newQuestionLanguages = ["java"];
const newQuestionCategories = ["fundamentals", "arrays"];
const newQuestionDifficulty = 1;
const newQuestionStarterCode = "public class Main{\
    \n\n\tpublic static void main(String[] args) {\
    \n\t\tint[] array = new int[]{1, 2, 3};\
    \n\t\tSystem.out.println(array.length == findlength(array));\
    \n\t}\
    \n\n\tpublic static int findlength(int[] array) {\
    \n\t\t // Your code here \
    \n\t\t return 0; \
    \n\t}\
    \n\n}";
const newQuestionDescription = "Given an array, return the length of the array."

const questionFields = {
    name: newQuestionName,
    supportedLanguages: newQuestionLanguages,
    category: newQuestionCategories,
    difficulty: newQuestionDifficulty,
    starterCode: newQuestionStarterCode,
    description: newQuestionDescription
};

/* Insert new question */ 
const newQuestion = new Questions(questionFields);
newQuestion.save((err, savedQuestion) => {
    if (err) {}
    else {
        console.log("Successful Save");
    }
});

/* Fields for a new question */
const newQuestionName2 = "addtwo";
const newQuestionLanguages2 = ["java"];
const newQuestionCategories2 = ["fundamentals"];
const newQuestionDifficulty2 = 1;
const newQuestionStarterCode2 = "public class Main{\n\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println();\n\t}\n\n}";
const newQuestionDescription2 = "Given two numbers, return their sum."

const questionFields2 = {
    name: newQuestionName2,
    supportedLanguages: newQuestionLanguages2,
    category: newQuestionCategories2,
    difficulty: newQuestionDifficulty2,
    starterCode: newQuestionStarterCode2,
    description: newQuestionDescription2
};

/* Insert new question */ 
const newQuestion2 = new Questions(questionFields2);
newQuestion2.save((err, savedQuestion) => {
    if (err) {}
    else {
        console.log("Successful Save");
    }
});