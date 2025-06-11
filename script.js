const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-IN';
recognition.interimResults = false;

let chatBox = null;
let eligibilityStep = 0;
const userData = {};

// Eligibility questions
const eligibilityQuestions = [
  "Please enter your annual family income in INR (e.g. 300000):",
  "Which state do you belong to?",
  "What is the highest level of education you have completed? (e.g. 10th, 12th, graduation, postgraduation)",
  "Are you a farmer? (yes/no)",
  "Are you a student? (yes/no)",
  "Are you a woman? (yes/no)",
  "Do you belong to SC/ST/OBC category? (yes/no)"
];

// Expanded schemes list with basic eligibility and info
const schemes = [
  {
    name: "Ayushman Bharat",
    eligibility: data => data.income && data.income <= 500000,
    info: "Ayushman Bharat provides ₹5 lakh/year health insurance to families below ₹5 lakh income. Visit: https://pmjay.gov.in"
  },
  {
    name: "ABHA Card",
    eligibility: data => true,
    info: "ABHA is a digital health ID for medical records. Register at: https://healthid.abdm.gov.in"
  },
  {
    name: "National Scholarship Portal",
    eligibility: data => data.student === 'yes',
    info: "NSP offers various scholarships for students. Visit: https://scholarships.gov.in"
  },
  {
    name: "PM-KISAN",
    eligibility: data => data.farmer === 'yes',
    info: "PM-KISAN provides ₹6000/year to small and marginal farmers. Register at: https://pmkisan.gov.in"
  },
  {
    name: "Jan Dhan Yojana",
    eligibility: data => true,
    info: "Zero-balance bank accounts and insurance. Details: https://pmjdy.gov.in"
  },
  {
    name: "Atal Pension Yojana",
    eligibility: data => data.income && data.income <= 1000000,
    info: "Pension scheme after age 60. Apply via banks/post offices."
  },
  {
    name: "PMAY (Housing)",
    eligibility: data => data.income && data.income <= 600000,
    info: "Housing subsidies for first-time buyers. Apply: https://pmaymis.gov.in"
  },
  {
    name: "UDYAM MSME Registration",
    eligibility: data => true,
    info: "Register your small business at: https://udyamregistration.gov.in"
  },
  {
    name: "PMEGP",
    eligibility: data => true,
    info: "Financial help for entrepreneurs. Apply at: https://www.kviconline.gov.in/pmegp/"
  },
  {
    name: "Digital India",
    eligibility: data => true,
    info: "Online services like Aadhaar, DigiLocker, UMANG app."
  },
  {
    name: "Beti Bachao Beti Padhao",
    eligibility: data => data.woman === 'yes',
    info: "Campaign to improve girl child welfare and education."
  },
  {
    name: "Stand Up India",
    eligibility: data => (data.woman === 'yes' || data.category === 'yes'),
    info: "Financial support for SC/ST and women entrepreneurs. Visit: https://standupmitra.in/"
  },
  {
    name: "Skill India",
    eligibility: data => true,
    info: "Skill development programs and training. Visit: https://skillindia.gov.in"
  },
  {
    name: "Pradhan Mantri Shram Yogi Maan-dhan",
    eligibility: data => true,
    info: "Pension scheme for unorganized workers."
  },
  {
    name: "National Food Security Act",
    eligibility: data => data.income && data.income <= 300000,
    info: "Subsidized food grains for eligible families."
  },
  {
    name: "Rashtriya Swasthya Bima Yojana (RSBY)",
    eligibility: data => data.income && data.income <= 300000,
    info: "Health insurance for below poverty line families."
  },
  {
    name: "Mid-Day Meal Scheme",
    eligibility: data => data.student === 'yes',
    info: "Free lunch to school children in government schools."
  },
  {
    name: "National Rural Employment Guarantee Act (NREGA)",
    eligibility: data => true,
    info: "Provides 100 days of wage employment to rural households."
  },
  {
    name: "Kisan Credit Card",
    eligibility: data => data.farmer === 'yes',
    info: "Easy credit for farmers. Apply through banks."
  }
];

function sendMessage() {
  const inputField = document.getElementById("userInput");
  const input = inputField.value.trim();
  if (!input) return;

  displayMessage(input, 'user');
  inputField.value = '';

  if (eligibilityStep > 0) {
    handleEligibilityInput(input.toLowerCase());
  } else {
    if (input.toLowerCase().includes("check eligibility")) {
      startEligibilityCheck();
    } else {
      setTimeout(() => displayMessage(getBotResponse(input.toLowerCase()), 'bot'), 500);
    }
  }
}

function handleKeyPress(event) {
  if (event.key === 'Enter') sendMessage();
}

function displayMessage(msg, sender) {
  if (!chatBox) chatBox = document.getElementById("chatBox");
  const msgDiv = document.createElement("div");
  msgDiv.classList.add(sender);
  msgDiv.textContent = msg;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function startDictation() {
  recognition.start();
}

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  document.getElementById("userInput").value = transcript;
  sendMessage();
};

function startEligibilityCheck() {
  eligibilityStep = 1;
  Object.keys(userData).forEach(k => delete userData[k]);
  displayMessage("Let's check your eligibility for government schemes. " + eligibilityQuestions[0], 'bot');
}

function handleEligibilityInput(input) {
  switch (eligibilityStep) {
    case 1: // Income
      const incomeNum = parseInt(input.replace(/[^0-9]/g, ''), 10);
      if (!incomeNum || incomeNum <= 0) {
        displayMessage("Please enter a valid income amount in numbers.", 'bot');
        return;
      }
      userData.income = incomeNum;
      eligibilityStep++;
      displayMessage(eligibilityQuestions[1], 'bot');
      break;

    case 2: // State
      userData.state = input;
      eligibilityStep++;
      displayMessage(eligibilityQuestions[2], 'bot');
      break;

    case 3: // Education
      userData.education = input;
      eligibilityStep++;
      displayMessage(eligibilityQuestions[3], 'bot');
      break;

    case 4: // Farmer
      if (input !== 'yes' && input !== 'no') {
        displayMessage("Please answer 'yes' or 'no'. Are you a farmer?", 'bot');
        return;
      }
      userData.farmer = input;
      eligibilityStep++;
      displayMessage(eligibilityQuestions[4], 'bot');
      break;

    case 5: // Student
      if (input !== 'yes' && input !== 'no') {
        displayMessage("Please answer 'yes' or 'no'. Are you a student?", 'bot');
        return;
      }
      userData.student = input;
      eligibilityStep++;
      displayMessage(eligibilityQuestions[5], 'bot');
      break;

    case 6: // Woman
      if (input !== 'yes' && input !== 'no') {
        displayMessage("Please answer 'yes' or 'no'. Are you a woman?", 'bot');
        return;
      }
      userData.woman = input;
      eligibilityStep++;
      displayMessage(eligibilityQuestions[6], 'bot');
      break;

    case 7: // SC/ST/OBC
      if (input !== 'yes' && input !== 'no') {
        displayMessage("Please answer 'yes' or 'no'. Do you belong to SC/ST/OBC?", 'bot');
        return;
      }
      userData.category = input;
      eligibilityStep = 0;
      recommendSchemes();
      break;
  }
}

function recommendSchemes() {
  let recommended = schemes.filter(s => s.eligibility(userData));
  if (recommended.length === 0) {
    displayMessage("Sorry, based on the info provided, no schemes were found matching your profile.", 'bot');
  } else {
    displayMessage("Based on your eligibility, here are the schemes you can apply for:", 'bot');
    recommended.forEach(scheme => {
      displayMessage(`• ${scheme.name}: ${scheme.info}`, 'bot');
    });
    displayMessage("You can ask me more about any scheme or type 'check eligibility' to restart.", 'bot');
  }
}

function getBotResponse(message) {
  // Quick answers for popular schemes
  if (message.includes("ayushman")) {
    return "Ayushman Bharat provides ₹5 lakh/year health insurance to eligible families. Visit: https://pmjay.gov.in";
  } else if (message.includes("abha")) {
    return "ABHA is a digital health ID to access medical records online. Register at: https://healthid.abdm.gov.in";
  } else if (message.includes("scholarship") || message.includes("nsp")) {
    return "The National Scholarship Portal offers various scholarships for students. Visit: https://scholarships.gov.in";
  } else if (message.includes("pm kisan")) {
    return "PM-KISAN provides ₹6000/year to small and marginal farmers in installments. Register at: https://pmkisan.gov.in";
  } else if (message.includes("jan dhan")) {
    return "Jan Dhan Yojana provides zero-balance bank accounts and insurance. Details: https://pmjdy.gov.in";
  } else if (message.includes("atal pension")) {
    return "Atal Pension Yojana gives pension after age 60. Apply via banks/post offices.";
  } else if (message.includes("udyam")) {
    return "UDYAM is MSME registration for small businesses. Register at: https://udyamregistration.gov.in";
  } else if (message.includes("pmegp")) {
    return "PMEGP offers financial help to start businesses. Apply at: https://www.kviconline.gov.in/pmegp/";
  } else if (message.includes("housing") || message.includes("pmay")) {
    return "PMAY provides subsidies on home loans for first-time buyers. Apply: https://pmaymis.gov.in";
  } else if (message.includes("digital india")) {
    return "Digital India improves online access to services like Aadhaar, DigiLocker, UMANG, and e-Gov.";
  } else if (message.includes("beti bachao")) {
    return "Beti Bachao Beti Padhao improves welfare and education of girl child.";
  } else if (message.includes("stand up india")) {
    return "Stand Up India supports SC/ST and women entrepreneurs. Visit: https://standupmitra.in/";
  } else if (message.includes("skill india")) {
    return "Skill India offers skill development and training programs. Visit: https://skillindia.gov.in";
  } else if (message.includes("shram yogi")) {
    return "Pradhan Mantri Shram Yogi Maan-dhan is pension for unorganized workers.";
  } else if (message.includes("food security")) {
    return "National Food Security Act provides subsidized food grains for eligible families.";
  } else if (message.includes("rsby")) {
    return "RSBY provides health insurance for below poverty line families.";
  } else if (message.includes("mid-day meal")) {
    return "Mid-Day Meal Scheme offers free lunch to school children in government schools.";
  } else if (message.includes("nrega")) {
    return "NREGA provides 100 days wage employment in rural areas.";
  } else if (message.includes("kisan credit card")) {
    return "Kisan Credit Card offers easy credit for farmers. Apply via banks.";
  } else if (message.includes("hello") || message.includes("hi")) {
    return "Hello! I'm GOVBOT 🤖. Type 'check eligibility' to find schemes suited to you or ask me about specific schemes.";
  } else if (message.includes("bye")) {
    return "Goodbye! Stay aware of your benefits. Come back any time.";
  } else {
    return "Sorry, I didn't understand. Try asking about Ayushman Bharat, PM-KISAN, ABHA, Scholarships, or type 'check eligibility'.";
  }
}
