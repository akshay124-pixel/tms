const statesAndCities = {
  "Andhra Pradesh": [
    "Visakhapatnam",
    "Vijayawada",
    "Guntur",
    "Tirupati",
    "Kurnool",
    "Rajahmundry",
    "Nellore",
    "Anantapur",
    "Kadapa",
    "Srikakulam",
    "Eluru",
    "Ongole",
    "Chittoor",
    "Proddatur",
    "Machilipatnam",
  ],
  "Arunachal Pradesh": [
    "Itanagar",
    "Tawang",
    "Ziro",
    "Pasighat",
    "Bomdila",
    "Naharlagun",
    "Roing",
    "Aalo",
    "Tezu",
    "Changlang",
    "Khonsa",
    "Yingkiong",
    "Daporijo",
    "Seppa",
  ],
  Assam: [
    "Guwahati",
    "Dibrugarh",
    "Jorhat",
    "Silchar",
    "Tezpur",
    "Tinsukia",
    "Nagaon",
    "Sivasagar",
    "Barpeta",
    "Goalpara",
    "Karimganj",
    "Lakhimpur",
    "Diphu",
    "Golaghat",
    "Kamrup",
  ],
  Bihar: [
    "Patna",
    "Gaya",
    "Bhagalpur",
    "Muzaffarpur",
    "Darbhanga",
    "Purnia",
    "Ara",
    "Begusarai",
    "Katihar",
    "Munger",
    "Chapra",
    "Sasaram",
    "Hajipur",
    "Bihar Sharif",
    "Sitamarhi",
  ],
  Chhattisgarh: [
    "Raipur",
    "Bilaspur",
    "Durg",
    "Korba",
    "Bhilai",
    "Rajnandgaon",
    "Jagdalpur",
    "Ambikapur",
    "Raigarh",
    "Dhamtari",
    "Kawardha",
    "Mahasamund",
    "Kondagaon",
    "Bijapur",
  ],
  Goa: [
    "Panaji",
    "Margao",
    "Vasco da Gama",
    "Mapusa",
    "Ponda",
    "Bicholim",
    "Sanguem",
    "Canacona",
    "Quepem",
    "Valpoi",
    "Sanquelim",
    "Curchorem",
  ],
  Gujarat: [
    "Ahmedabad",
    "Surat",
    "Vadodara",
    "Rajkot",
    "Bhavnagar",
    "Jamnagar",
    "Junagadh",
    "Gandhinagar",
    "Anand",
    "Morbi",
    "Nadiad",
    "Porbandar",
    "Mehsana",
    "Bharuch",
    "Navsari",
    "Surendranagar",
  ],
  Haryana: [
    "Gurugram",
    "Faridabad",
    "Panipat",
    "Ambala",
    "Hisar",
    "Rohtak",
    "Karnal",
    "Bhiwani",
    "Kaithal",
    "Kurukshetra",
    "Sonipat",
    "Jhajjar",
    "Jind",
    "Fatehabad",
    "Pehowa",
    "Pinjore",
    "Rewari",
    "Yamunanagar",
    "Sirsa",
    "Dabwali",
    "Narwana",
  ],
  "Himachal Pradesh": [
    "Shimla",
    "Dharamshala",
    "Solan",
    "Mandi",
    "Hamirpur",
    "Kullu",
    "Manali",
    "Nahan",
    "Palampur",
    "Baddi",
    "Sundarnagar",
    "Paonta Sahib",
    "Bilaspur",
    "Chamba",
    "Una",
    "Kangra",
    "Parwanoo",
    "Nalagarh",
    "Rohru",
    "Keylong",
  ],
  Jharkhand: [
    "Ranchi",
    "Jamshedpur",
    "Dhanbad",
    "Bokaro",
    "Deoghar",
    "Hazaribagh",
    "Giridih",
    "Ramgarh",
    "Chaibasa",
    "Palamu",
    "Gumla",
    "Lohardaga",
    "Dumka",
    "Chatra",
    "Pakur",
    "Jamtara",
    "Simdega",
    "Sahibganj",
    "Godda",
    "Latehar",
    "Khunti",
  ],
  Karnataka: [
    "Bengaluru",
    "Mysuru",
    "Mangaluru",
    "Hubballi",
    "Belagavi",
    "Kalaburagi",
    "Ballari",
    "Davangere",
    "Shivamogga",
    "Tumakuru",
    "Udupi",
    "Vijayapura",
    "Chikkamagaluru",
    "Hassan",
    "Mandya",
    "Raichur",
    "Bidar",
    "Bagalkot",
    "Chitradurga",
    "Kolar",
    "Gadag",
    "Yadgir",
    "Haveri",
    "Dharwad",
    "Ramanagara",
    "Chikkaballapur",
    "Kodagu",
    "Koppal",
  ],
  Kerala: [
    "Thiruvananthapuram",
    "Kochi",
    "Kozhikode",
    "Kannur",
    "Alappuzha",
    "Thrissur",
    "Kottayam",
    "Palakkad",
    "Ernakulam",
    "Malappuram",
    "Pathanamthitta",
    "Idukki",
    "Wayanad",
    "Kollam",
    "Kasaragod",
    "Punalur",
    "Varkala",
    "Changanassery",
    "Kayani",
    "Kizhakkambalam",
    "Perumbavoor",
    "Muvattupuzha",
    "Attingal",
    "Vypin",
    "North Paravur",
    "Adoor",
    "Cherthala",
    "Mattancherry",
    "Fort Kochi",
    "Munroe Island",
  ],
  "Madhya Pradesh": [
    "Bhopal",
    "Indore",
    "Gwalior",
    "Jabalpur",
    "Ujjain",
    "Sagar",
    "Ratlam",
    "Satna",
    "Dewas",
    "Murwara (Katni)",
    "Chhindwara",
    "Rewa",
    "Burhanpur",
    "Khandwa",
    "Bhind",
    "Shivpuri",
    "Vidisha",
    "Sehore",
    "Hoshangabad",
    "Itarsi",
    "Neemuch",
    "Chhatarpur",
    "Betul",
    "Mandsaur",
    "Damoh",
    "Singrauli",
    "Guna",
    "Ashok Nagar",
    "Datia",
    "Mhow",
    "Pithampur",
    "Shahdol",
    "Seoni",
    "Mandla",
    "Tikamgarh",
    "Raisen",
    "Narsinghpur",
    "Morena",
    "Barwani",
    "Rajgarh",
    "Khargone",
    "Anuppur",
    "Umaria",
    "Dindori",
    "Sheopur",
    "Alirajpur",
    "Jhabua",
    "Sidhi",
    "Harda",
    "Balaghat",
    "Agar Malwa",
  ],
  Maharashtra: [
    "Mumbai",
    "Pune",
    "Nagpur",
    "Nashik",
    "Aurangabad",
    "Solapur",
    "Kolhapur",
    "Thane",
    "Satara",
    "Latur",
    "Chandrapur",
    "Jalgaon",
    "Bhiwandi",
    "Shirdi",
    "Akola",
    "Parbhani",
    "Raigad",
    "Washim",
    "Buldhana",
    "Nanded",
    "Yavatmal",
    "Beed",
    "Amravati",
    "Kalyan",
    "Dombivli",
    "Ulhasnagar",
    "Nagothane",
    "Vasai",
    "Virar",
    "Mira-Bhayandar",
    "Dhule",
    "Sangli",
    "Wardha",
    "Ahmednagar",
    "Pandharpur",
    "Malegaon",
    "Osmanabad",
    "Gondia",
    "Baramati",
    "Jalna",
    "Hingoli",
    "Sindhudurg",
    "Ratnagiri",
    "Palghar",
    "Ambarnath",
    "Badlapur",
    "Taloja",
    "Alibaug",
    "Murbad",
    "Karjat",
    "Pen",
    "Newasa",
  ],
  Manipur: [
    "Imphal",
    "Churachandpur",
    "Thoubal",
    "Bishnupur",
    "Kakching",
    "Senapati",
    "Ukhrul",
    "Tamenglong",
    "Jiribam",
    "Moreh",
    "Noney",
    "Pherzawl",
    "Kangpokpi",
  ],
  Meghalaya: [
    "Shillong",
    "Tura",
    "Nongpoh",
    "Cherrapunjee",
    "Jowai",
    "Baghmara",
    "Williamnagar",
    "Mawkyrwat",
    "Resubelpara",
    "Mairang",
  ],
  Mizoram: [
    "Aizawl",
    "Lunglei",
    "Champhai",
    "Serchhip",
    "Kolasib",
    "Saiha",
    "Lawngtlai",
    "Mamit",
    "Hnahthial",
    "Khawzawl",
    "Saitual",
  ],
  Nagaland: [
    "Kohima",
    "Dimapur",
    "Mokokchung",
    "Tuensang",
    "Wokha",
    "Mon",
    "Zunheboto",
    "Phek",
    "Longleng",
    "Kiphire",
    "Peren",
  ],
  Odisha: [
    "Bhubaneswar",
    "Cuttack",
    "Rourkela",
    "Puri",
    "Sambalpur",
    "Berhampur",
    "Balasore",
    "Baripada",
    "Bhadrak",
    "Jeypore",
    "Angul",
    "Dhenkanal",
    "Keonjhar",
    "Kendrapara",
    "Jagatsinghpur",
    "Paradeep",
    "Bargarh",
    "Rayagada",
    "Koraput",
    "Nabarangpur",
    "Kalahandi",
    "Nuapada",
    "Phulbani",
    "Balangir",
    "Sundargarh",
  ],
  Punjab: [
    "Amritsar",
    "Mohali",
    "Ludhiana",
    "Patiala",
    "Jalandhar",
    "Gurdaspur",
    "Bathinda",
    "Ropar (Rupnagar)",
    "Kharar",
    "Khanna",
    "Zirakpur",
    "Samrala",
    "Anandpur Sahib",
    "Mansa",
    "Sirhind",
    "Ferozepur",
    "Fazilka",
    "Morinda",
    "Makatsar",
    "Bassi Pathana",
    "Sangrur",
    "Khamano",
    "Chunni Kalan",
    "Balachaur",
  ],
  Rajasthan: [
    "Jaipur",
    "Udaipur",
    "Jodhpur",
    "Kota",
    "Ajmer",
    "Bikaner",
    "Alwar",
    "Bharatpur",
    "Sikar",
    "Pali",
    "Nagaur",
    "Jhunjhunu",
    "Chittorgarh",
    "Tonk",
    "Barmer",
    "Jaisalmer",
    "Dholpur",
    "Bhilwara",
    "Hanumangarh",
    "Sawai Madhopur",
  ],
  Sikkim: [
    "Gangtok",
    "Namchi",
    "Pelling",
    "Geyzing",
    "Mangan",
    "Rangpo",
    "Jorethang",
    "Yuksom",
    "Ravangla",
    "Lachen",
    "Lachung",
  ],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
    "Erode",
    "Tirunelveli",
    "Vellore",
    "Thanjavur",
    "Tuticorin",
    "Dindigul",
    "Cuddalore",
    "Kancheepuram",
    "Nagercoil",
    "Kumbakonam",
    "Karur",
    "Sivakasi",
    "Namakkal",
    "Tiruppur",
  ],
  Telangana: [
    "Hyderabad",
    "Warangal",
    "Nizamabad",
    "Karimnagar",
    "Khammam",
    "Mahbubnagar",
    "Ramagundam",
    "Siddipet",
    "Adilabad",
    "Nalgonda",
    "Mancherial",
    "Kothagudem",
    "Zaheerabad",
    "Miryalaguda",
    "Bhongir",
    "Jagtial",
  ],
  Tripura: [
    "Agartala",
    "Udaipur",
    "Dharmanagar",
    "Kailashahar",
    "Belonia",
    "Kamalpur",
    "Ambassa",
    "Khowai",
    "Sabroom",
    "Sonamura",
    "Melaghar",
  ],
  "Uttar Pradesh": [
    "Lucknow",
    "Matbarganj",
    "Kasganj",
    "Kanpur",
    "Varanasi",
    "Agra",
    "Prayagraj (Allahabad)",
    "Ghaziabad",
    "Noida",
    "Meerut",
    "Aligarh",
    "Bareilly",
    "Moradabad",
    "Saharanpur",
    "Gorakhpur",
    "Firozabad",
    "Jhansi",
    "Muzaffarnagar",
    "Mathura-Vrindavan",
    "Budaun",
    "Rampur",
    "Shahjahanpur",
    "Farrukhabad-Fatehgarh",
    "Ayodhya",
    "Unnao",
    "Jaunpur",
    "Lakhimpur",
    "Hathras",
    "Banda",
    "Pilibhit",
    "Barabanki",
    "Khurja",
    "Gonda",
    "Mainpuri",
    "Lalitpur",
    "Sitapur",
    "Etah",
    "Deoria",
    "Ghazipur",
  ],
  Uttarakhand: [
    "Dehradun",
    "Haridwar",
    "Nainital",
    "Rishikesh",
    "Mussoorie",
    "Almora",
    "Pithoragarh",
    "Haldwani",
    "Rudrapur",
    "Bageshwar",
    "Champawat",
    "Uttarkashi",
    "Roorkee",
    "Tehri",
    "Lansdowne",
  ],
  "West Bengal": [
    "Kolkata",
    "Darjeeling",
    "Siliguri",
    "Howrah",
    "Asansol",
    "Durgapur",
    "Malda",
    "Cooch Behar",
    "Haldia",
    "Kharagpur",
    "Raiganj",
    "Bardhaman",
    "Jalpaiguri",
    "Chandannagar",
    "Kalimpong",
    "Alipurduar",
  ],
  "Andaman and Nicobar Islands": [
    "Port Blair",
    "Havelock Island",
    "Diglipur",
    "Neil Island",
    "Car Nicobar",
    "Little Andaman",
    "Long Island",
    "Mayabunder",
    "Campbell Bay",
    "Rangat",
    "Wandoor",
  ],
  Chandigarh: [
    "Sector 1",
    "Sector 2",
    "Sector 3",
    "Sector 4",
    "Sector 5",
    "Sector 6",
    "Sector 7",
    "Sector 8",
    "Sector 9",
    "Sector 10",
    "Sector 11",
    "Sector 12",
    "Sector 13", // Note: Sector 13 does not exist in Chandigarh.
    "Sector 14",
    "Sector 15",
    "Sector 16",
    "Sector 17",
    "Sector 18",
    "Sector 19",
    "Sector 20",
    "Sector 21",
    "Sector 22",
    "Sector 23",
    "Sector 24",
    "Sector 25",
    "Sector 26",
    "Sector 27",
    "Sector 28",
    "Sector 29",
    "Sector 30",
    "Sector 31",
    "Sector 32",
    "Sector 33",
    "Sector 34",
    "Sector 35",
    "Sector 36",
    "Sector 37",
    "Sector 38",
    "Sector 39",
    "Sector 40",
    "Sector 41",
    "Sector 42",
    "Sector 43",
    "Sector 44",
    "Sector 45",
    "Sector 46",
    "Sector 47",
  ],
  "Dadra and Nagar Haveli and Daman and Diu": [
    "Daman",
    "Diu",
    "Silvassa",
    "Amli",
    "Kachigam",
    "Naroli",
    "Vapi",
    "Marwad",
    "Samarvarni",
    "Kawant",
  ],
  Delhi: [
    "New Delhi",
    "Old Delhi",
    "Dwarka",
    "Rohini",
    "Karol Bagh",
    "Lajpat Nagar",
    "Saket",
    "Vasant Kunj",
    "Janakpuri",
    "Mayur Vihar",
    "Shahdara",
    "Preet Vihar",
    "Pitampura",
    "Chanakyapuri",
    "Narela",
    "Mehrauli",
    "Najafgarh",
    "Okhla",
    "Tilak Nagar",
  ],
  "Jammu and Kashmir": [
    "Srinagar",
    "Jammu",
    "Anantnag",
    "Baramulla",
    "Pulwama",
    "Kupwara",
    "Udhampur",
    "Kathua",
    "Poonch",
    "Kulgam",
    "Budgam",
    "Bandipora",
    "Ganderbal",
    "Rajouri",
    "Reasi",
    "Doda",
  ],
  Ladakh: [
    "Leh",
    "Kargil",
    "Diskit",
    "Padum",
    "Nubra",
    "Tangtse",
    "Sankoo",
    "Zanskar",
    "Nyoma",
    "Turtuk",
    "Hanle",
  ],
  Lakshadweep: [
    "Kavaratti",
    "Agatti",
    "Minicoy",
    "Amini",
    "Andrott",
    "Kalpeni",
    "Kadmat",
    "Chetlat",
    "Bitra",
    "Bangaram",
  ],
  Puducherry: [
    "Puducherry",
    "Karaikal",
    "Mahe",
    "Yanam",
    "Villianur",
    "Bahour",
    "Oulgaret",
    "Ariyankuppam",
    "Nettapakkam",
  ],
};
export default statesAndCities;
