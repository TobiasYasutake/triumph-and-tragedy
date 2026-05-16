"use strict"

const ACARDS = [
    null,
    {
		"deck": "Action",
		"number": 1,
        "special": "Nationalism",
        "partisans": ["Nanking", "Harbin"],
        "season": "Spring",
        "initiative": "A",
        "value": 4
	},
    {
		"deck": "Action",
		"number": 2,
        "left": "Sinkiang",
        "right": "Peiping",
        "season": "Spring",
        "initiative": "B",
        "value": 4
	},
    {
		"deck": "Action",
		"number": 3,
        "special": "Intimidation",
        "partisans": ["Suchow", "Jehol"],
        "season": "Spring",
        "initiative": "C",
        "value": 4
	},
    {
		"deck": "Action",
		"number": 4,
        "left": "Canton",
        "right": "Changsha",
        "season": "Spring",
        "initiative": "D",
        "value": 5
	},
    {
		"deck": "Action",
		"number": 5,
        "left": "Thailand",
        "right": "Yunnan",
        "season": "Spring",
        "initiative": "E",
        "value": 5
	},
    {
		"deck": "Action",
		"number": 6,
        "left": "Tsingtao",
        "right": "Chungking",
        "season": "Spring",
        "initiative": "F",
        "value": 5
	},
    {
		"deck": "Action",
		"number": 7,
        "special": "Nationalism",
        "partisans": ["Wuhan", "Sian"],
        "season": "Spring",
        "initiative": "G",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 8,
        "left": "Inner Mongolia",
        "right": "Shansi",
        "season": "Spring",
        "initiative": "H",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 9,
        "special": "Birds of a Feather (A)",
        "partisans": ["Wuhan", "Jehol"],
        "initiative": "I",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 10,
        "left": "Yunnan",
        "right": "Kwangsi",
        "season": "Spring",
        "initiative": "J",
        "value": 5
	},
    {
		"deck": "Action",
		"number": 11,
        "left": "Canton",
        "right": "Thailand",
        "season": "Spring",
        "initiative": "K",
        "value": 5
	},
    {
		"deck": "Action",
		"number": 12,
        "left": "Chungking",
        "right": "Dutch East Indies",
        "season": "Spring",
        "initiative": "L",
        "value": 5
	},
    {
		"deck": "Action",
		"number": 13,
        "left": "Kwangsi",
        "right": "Shansi",
        "season": "Spring",
        "initiative": "M",
        "value": 4
	},
    {
		"deck": "Action",
		"number": 14,
        "special": "Bribery",
        "partisans": ["Nanking", "Mukden"],
        "season": "Spring",
        "initiative": "N",
        "value": 4
	},
    {
		"deck": "Action",
		"number": 15,
        "left": "British Empire",
        "right": "Canton",
        "season": "Spring",
        "initiative": "P",
        "value": 4
	},
    {
		"deck": "Action",
		"number": 16,
        "left": "Dutch East Indies",
        "right": "Peiping",
        "season": "Summer",
        "initiative": "A",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 17,
        "left": "Mongolia",
        "right": "Tsingtao",
        "season": "Summer",
        "initiative": "B",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 18,
        "special": "Intimidation",
        "partisans": ["Suchow", "Sian"],
        "season": "Summer",
        "initiative": "C",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 19,
        "left": "Sinkiang",
        "right": "Tsingtao",
        "season": "Summer",
        "initiative": "D",
        "value": 7
	},
    {
		"deck": "Action",
		"number": 20,
        "left": "Vietnam",
        "right": "Inner Mongolia",
        "season": "Summer",
        "initiative": "E",
        "value": 7
	},
    {
		"deck": "Action",
		"number": 21,
        "left": "Thailand",
        "right": "Tsingtao",
        "season": "Summer",
        "initiative": "F",
        "value": 7
	},
    {
		"deck": "Action",
		"number": 22,
        "left": "Shansi",
        "right": "Changsha",
        "season": "Summer",
        "initiative": "G",
        "value": 8
	},
    {
		"deck": "Action",
		"number": 23,
        "special": "Ties That Bind",
        "partisans": ["Wuhan", "Fukien"],
        "season": "Summer",
        "initiative": "H",
        "value": 8
	},
    {
		"deck": "Action",
		"number": 24,
        "left": "Inner Mongolia",
        "right": "Shansi",
        "season": "Summer",
        "initiative": "I",
        "value": 8
	},
    {
		"deck": "Action",
		"number": 25,
        "left": "Vietnam",
        "right": "Inner Mongolia",
        "season": "Summer",
        "initiative": "J",
        "value": 9
	},
    {
		"deck": "Action",
		"number": 26,
        "left": "Thailand",
        "right": "Vietnam",
        "season": "Summer",
        "initiative": "K",
        "value": 9
	},
    {
		"deck": "Action",
		"number": 27,
        "left": "Peiping",
        "right": "Vietnam",
        "season": "Summer",
        "initiative": "L",
        "value": 9
	},
    {
		"deck": "Action",
		"number": 28,
        "special": "Brids of a Feather (B)",
        "partisans": ["Sian", "Suchow"],
        "season": "Summer",
        "initiative": "M",
        "value": 10
	},
    {
		"deck": "Action",
		"number": 29,
        "left": "Peiping",
        "right": "Canton",
        "season": "Summer",
        "initiative": "N",
        "value": 10
	},
    {
		"deck": "Action",
		"number": 30,
        "left": "Kansu",
        "right": "Shansi",
        "season": "Summer",
        "initiative": "P",
        "value": 10
	},
    {
		"deck": "Action",
		"number": 31,
        "left": "Mongolia",
        "right": "Shansi",
        "season": "Summer",
        "initiative": "Q",
        "value": 9
	},
    {
		"deck": "Action",
		"number": 32,
        "left": "Kansu",
        "right": "Tsingtao",
        "season": "Summer",
        "initiative": "R",
        "value": 9
	},
    {
		"deck": "Action",
		"number": 33,
        "special": "Intimidation",
        "partisans": ["Fukien", "Mukden"],
        "season": "Summer",
        "initiative": "S",
        "value": 9
	},
    {
		"deck": "Action",
		"number": 34,
        "left": "Canton",
        "right": "Kansu",
        "season": "Summer",
        "initiative": "T",
        "value": 8
	},
    {
		"deck": "Action",
		"number": 35,
		"left": "Shansi",
        "right": "Chungking",
        "season": "Summer",
        "initiative": "U",
        "value": 8
	},
    {
		"deck": "Action",
		"number": 36,
        "special": "Birds of a Feather (B)",
        "partisans": ["Sian", "Harbin"],
        "season": "Summer",
        "initiative": "V",
        "value": 8
	},
    {
		"deck": "Action",
		"number": 37,
        "left": "Inner Mongolia",
        "right": "Kwangsi",
        "season": "Summer",
        "initiative": "W",
        "value": 7
	},
    {
		"deck": "Action",
		"number": 38,
        "special": "Birds of a Feather (A)",
        "partisans": ["Fukien", "Korea"],
        "season": "Summer",
        "initiative": "X",
        "value": 7
	},
    {
		"deck": "Action",
		"number": 39,
        "left": "Canton",
        "right": "Sinkiang",
        "season": "Summer",
        "initiative": "Y",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 40,
        "special": "Brothers in Arms",
        "partisans": ["Fukien", "Jehol"],
        "season": "Summer",
        "initiative": "Z",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 41,
        "left": "Dutch East Indies",
        "right": "Chungking",
        "season": "Fall",
        "initiative": "A",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 42,
        "left": "Peiping",
        "right": "Thailand",
        "season": "Fall",
        "initiative": "B",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 43,
        "special": "Nationalism",
        "partisans": ["Wuhan", "Harbin"],
        "season": "Fall",
        "initiative": "C",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 44,
        "left": "Changsha",
        "right": "Tsingtao",
        "season": "Fall",
        "initiative": "D",
        "value": 7
	},
    {
		"deck": "Action",
		"number": 45,
        "left": "Mongolia",
        "right": "British Empire",
        "season": "Fall",
        "initiative": "E",
        "value": 7
	},
    {
		"deck": "Action",
		"number": 46,
        "left": "British Empire",
        "right": "Changsha",
        "season": "Fall",
        "initiative": "F",
        "value": 7
	},
    {
		"deck": "Action",
		"number": 47,
        "special": "Birds of a Feather (A)",
        "partisans": ["Nanking", "Korea"],
        "season": "Fall",
        "initiative": "G",
        "value": 8
	},
    {
		"deck": "Action",
		"number": 48,
        "left": "Inner Mongolia",
        "right": "Peiping",
        "season": "Fall",
        "initiative": "H",
        "value": 8
	},
    {
		"deck": "Action",
		"number": 49,
        "left": "Changsha",
        "right": "Yunnan",
        "season": "Fall",
        "initiative": "I",
        "value": 8
	},
    {
		"deck": "Action",
		"number": 50,
        "left": "Tsingtao",
        "right": "Kwangsi",
        "season": "Fall",
        "initiative": "J",
        "value": 7
	},
    {
		"deck": "Action",
		"number": 51,
        "left": "Mongolia",
        "right": "Inner Mongolia",
        "season": "Fall",
        "initiative": "K",
        "value": 7
	},
    {
		"deck": "Action",
		"number": 52,
        "left": "Changsha",
        "right": "Canton",
        "season": "Fall",
        "initiative": "L",
        "value": 7
	},
    {
		"deck": "Action",
		"number": 53,
        "special": "Brothers in Arms",
        "partisans": ["Sian", "Jehol"],
        "season": "Fall",
        "initiative": "M",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 54,
        "special": "Birds of a Feather (B)",
        "partisans": ["Sian", "Mukden"],
        "season": "Fall",
        "initiative": "N",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 55,
        "special": "Ties That Bind",
        "partisans": ["Fukien", "Suchow"],
        "season": "Fall",
        "initiative": "P",
        "value": 6
	}
]


const ICARDS = [
    null,
    {
		"deck": "Investment",
		"number": 1,
        "left": "AirDefense Radar",
        "right": "Incendiaries",
        "red": "Land Reform",
        "value": 2
	},
    {
		"deck": "Investment",
		"number": 2,
        "left": "Auto Cannon AA",
        "right": "Incendiaries",
        "red": "Guerrilla Warfare",
        "value": 2
	},
    {
		"deck": "Investment",
		"number": 3,
        "special": "1938 Science", 
        "red": "Land Reform",
        "value": 1
	},
    {
		"deck": "Investment",
		"number": 4,
        "left": "Sonar",
        "right": "Auto Cannon AA",
        "red": "Land Reform",
        "value": 1
	},
    {
		"deck": "Investment",
		"number": 5,
        "left": "Auto Cannon AA",
        "right": "Sonar",
        "red": "Land Reform",
        "value": 1
	},
    {
		"deck": "Investment",
		"number": 6,
        "left": "Naval Radar",
        "right": "Incendiaries",
        "red": "Guerrilla Warfare",
        "value": 2
	},
    {
		"deck": "Investment",
		"number": 7,
        "left": "Sonar",
        "right": "Auto Cannon AA",
        "red": "Land Reform",
        "value": 1
	},
    {
		"deck": "Investment",
		"number": 8,
        "left": "Heavy Bombers",
        "right": "Improved Torpedoes",
        "red": "Propaganda",
        "value": 3
	},
    {
        "deck": "Investment",
		"number": 9,
        "left": "Incendiaries",
        "right": "Auto Cannon AA",
        "red": "Land Reform",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 10,
        "left": "Improved Torpedoes",
        "right": "Incendiaries",
        "red": "Guerrilla Warfare",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 11,
        "left": "Auto Cannon AA",
        "right": "Dive Bombing",
        "red": "Propaganda",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 12,
        "left": "Heavy Bombers",
        "right": "Improved Torpedoes",
        "red": "Guerrilla Warfare",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 13,
        "left": "Atomic Research 1",
        "right": "Auto Cannon AA",
        "red": "Propaganda",
        "value": 4
    },
    {
        "deck": "Investment",
		"number": 14,
        "special": "1938 Science",
        "red": "Guerrilla Warfare",
        "value": 1
    },
    {
        "deck": "Investment",
		"number": 15,
        "left": "Auto Cannon AA",
        "right": "Dive Bombing",
        "red": "Guerrilla Warfare",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 16,
        "left": "AmphTraks",
        "right": "Atomic Research 3",
        "red": "Propaganda",
        "value": 4
    },
    {
        "deck": "Investment",
		"number": 17,
        "left": "Jets",
        "right": "Atomic Research 4",
        "red": "Propaganda",
        "value": 4
    },
    {
        "deck": "Investment",
		"number": 18,
        "left": "Industrial Espionage",
        "right": "AirDefense Radar",
        "red": "Guerrilla Warfare",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 19,
        "special": "1940 Science",
        "red": "Land Reform",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 20,
		"special": "1944 Science",
        "red": "Propaganda",
        "value": 4
    },
    {
        "deck": "Investment",
		"number": 21,
		"left": "Improved Torpedoes",
        "right": "AirDefense Radar",
        "red": "Land Reform",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 22,
		"left": "Dive Bombing",
        "right": "Atomic Research 2",
        "red": "Guerrilla Warfare",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 23,
        "left": "Heavy Bombers",
        "right": "Atomic Research 1",
        "red": "Propaganda",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 24,
		"special": "1942 Science",
        "red": "Guerrilla Warfare",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 25,
        "left": "Naval Radar",
        "right": "AmphTraks",
        "red": "Land Reform",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 26,
        "left": "Improved Torpedoes",
        "right": "Industrial Espionage",
        "red": "Guerrilla Warfare",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 27,
        "left": "AmphTraks",
        "right": "Atomic Research 2",
        "red": "Land Reform",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 28,
        "left": "Industrial Espionage",
        "right": "Atomic Research 1",
        "red": "Guerrilla Warfare",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 29,
        "left": "Heavy Bombers",
        "right": "Incendiaries",
        "red": "Land Reform",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 30,
        "left": "AmphTraks",
        "right": "Dive Bombing",
        "red": "Guerrilla Warfare",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 31,
		"special": "Mole",
        "red": "Land Reform",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 32,
		"special": "Agent",
        "red": "Guerrilla Warfare",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 33,
		"special": "Blackmail",
        "red": "Propaganda",
        "value": 4
    },
    {
        "deck": "Investment",
		"number": 34,
		"special": "Spy Ring",
        "red": "Guerrilla Warfare",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 35,
        "special": "Code Break",
        "red": "Land Reform",
        "value": 1
    },
    {
        "deck": "Investment",
		"number": 36,
		"special": "Double Agent",
        "red": "Guerrilla Warfare",
        "value": 4
    },
    {
        "deck": "Investment",
		"number": 37,
		"special": "Agent",
        "red": "Land Reform",
        "value": 1
    },
    {
        "deck": "Investment",
		"number": 38,
		"special": "Coup",
        "red": "Guerrilla Warfare",
        "value": 4
    },
    {
        "deck": "Investment",
		"number": 39,
		"special": "Spy Ring",
        "red": "Propaganda",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 40,
		"special": "Code Break",
        "red": "Land Reform",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 41,
        "left": "AirDefense Radar",
        "right": "Naval Radar",
        "red": "Land Reform",
        "value": 1
    },
    {
        "deck": "Investment",
		"number": 42,
        "left": "Sonar",
        "right": "Atomic Research 1",
        "red": "Land Reform",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 43,
        "left": "Naval Radar",
        "right": "Jets",
        "red": "Propaganda",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 44,
        "left": "Improved Torpedoes",
		"right": "Dive Bombing",
        "red": "Land Reform",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 45,
        "left": "Naval Radar",
        "right": "Sonar",
        "red": "Land Reform",
        "value": 1
    },
    {
        "deck": "Investment",
		"number": 46,
        "left": "AirDefense Radar",
        "right": "Atomic Research 2",
        "red": "Guerrilla Warfare",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 47,
        "left": "Sonar",
        "right": "Naval Radar",
        "red": "Land Reform",
        "value": 1
    },
    {
        "deck": "Investment",
		"number": 48,
        "left": "Heavy Bombers",
        "right": "Sonar",
        "red": "Land Reform",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 49,
        "left": "Naval Radar",
        "right": "AirDefense Radar",
        "red": "Land Reform",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 50,
        "left": "Naval Radar",
        "right": "Sonar",
        "red": "Guerrilla Warfare",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 51,
        "left": "AmphTraks",
        "right": "Dive Bombing",
        "red": "Propaganda",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 52,
        "left": "AirDefense Radar",
		"right": "Industrial Espionage",
        "red": "Land Reform",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 53,
        "left": "Dive Bombing",
        "right": "Atomic Research 3",
        "red": "Land Reform",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 54,
        "left": "AmphTraks",
        "right": "Heavy Bombers",
        "red": "Guerrilla Warfare",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 55,
        "left": "Jets",
        "right": "Atomic Research 4",
        "red": "Propaganda",
        "value": 4
    }
]

const SCIENCE = {
    "1938 Science": ["AirDefense Radar", "Atomic Research 1", "Incendiaries", "Auto Cannon AA", "Naval Radar", "Sonar"],
    "1940 Science": ["AirDefense Radar", "Atomic Research 2", "Incendiaries", "Auto Cannon AA", "Naval Radar", "Dive Bombing"], 
    "1942 Science": ["AirDefense Radar", "Atomic Research 3", "Heavy Bombers", "Naval Radar", "Dive Bombing", "Improved Torpedoes", "Sonar", "AmphTraks"], 
    "1944 Science": ["Atomic Research 3", "Atomic Research 4", "Auto Cannon AA", "Heavy Bombers", "Jets", "Dive Bombing", "Improved Torpedoes", "AmphTraks"],
}

if (typeof module !== 'undefined') {
    module.exports = {ACARDS, ICARDS, SCIENCE}
}

