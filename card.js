"use strict"

const ACARDS = [
    null,
    {
		"deck": "Action",
		"number": 1,
        "left": "Spain",
        "right": "Yugoslavia",
        "season": "Spring",
        "initiative": "A",
        "value": 4
	},
    {
		"deck": "Action",
		"number": 2,
        "special": "Fear & Loathing",
        "season": "Spring",
        "initiative": "B",
        "value": 4
	},
    {
		"deck": "Action",
		"number": 3,
        "left": "Latin America",
        "right": "USA",
        "season": "Spring",
        "initiative": "C",
        "value": 4
	},
    {
		"deck": "Action",
		"number": 4,
        "left": "Greece",
        "right": "Portugal",
        "season": "Spring",
        "initiative": "D",
        "value": 5
	},
    {
		"deck": "Action",
		"number": 5,
        "left": "Austria",
        "right": "Czechoslovakia",
        "season": "Spring",
        "initiative": "E",
        "value": 5
	},
    {
		"deck": "Action",
		"number": 6,
        "left": "Spain",
        "right": "Rumania",
        "season": "Spring",
        "initiative": "F",
        "value": 5
	},
    {
		"deck": "Action",
		"number": 7,
        "left": "Yugoslavia",
        "right": "Hungary",
        "season": "Spring",
        "initiative": "G",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 8,
        "left": "Poland",
        "right": "Austria",
        "season": "Spring",
        "initiative": "H",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 9,
		"special": "Ethnic Ties",
        "season": "Spring",
        "initiative": "I",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 10,
        "left": "Rumania",
        "right": "Bulgaria",
        "season": "Spring",
        "initiative": "J",
        "value": 5
	},
    {
		"deck": "Action",
		"number": 11,
        "left": "Afghanistan",
        "right": "Austria",
        "season": "Spring",
        "initiative": "K",
        "value": 5
	},
    {
		"deck": "Action",
		"number": 12,
		"special": "Birds of a Feather",
        "season": "Spring",
        "initiative": "L",
        "value": 5
	},
    {
		"deck": "Action",
		"number": 13,
        "left": "USA",
        "right": "Rumania",
        "season": "Spring",
        "initiative": "M",
        "value": 4
	},
    {
		"deck": "Action",
		"number": 14,
        "left": "Hungary",
        "right": "Portugal",
        "season": "Spring",
        "initiative": "N",
        "value": 4
	},
    {
		"deck": "Action",
		"number": 15,
		"special": "Intimidation",
        "season": "Spring",
        "initiative": "P",
        "value": 4
	},
    {
		"deck": "Action",
		"number": 16,
        "left": "Spain",
        "right": "Czechoslovakia",
        "season": "Summer",
        "initiative": "A",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 17,
		"special": "Foreign Aid",
        "season": "Summer",
        "initiative": "B",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 18,
        "left": "Poland",
        "right": "Hungary",
        "season": "Summer",
        "initiative": "C",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 19,
        "left": "USA",
        "right": "Latin America",
        "season": "Summer",
        "initiative": "D",
        "value": 7
	},
    {
		"deck": "Action",
		"number": 20,
		"special": "Ties That Bind",
        "season": "Summer",
        "initiative": "E",
        "value": 7
	},
    {
		"deck": "Action",
		"number": 21,
        "left": "Yugoslavia",
        "right": "Rumania",
        "season": "Summer",
        "initiative": "F",
        "value": 7
	},
    {
		"deck": "Action",
		"number": 22,
        "left": "Denmark",
        "right": "Low Countries",
        "season": "Summer",
        "initiative": "G",
        "value": 8
	},
    {
		"deck": "Action",
		"number": 23,
        "left": "Turkey",
        "right": "Denmark",
        "season": "Summer",
        "initiative": "H",
        "value": 8
	},
    {
		"deck": "Action",
		"number": 24,
		"special": "Versailles",
        "season": "Summer",
        "initiative": "I",
        "value": 8
	},
    {
		"deck": "Action",
		"number": 25,
        "left": "Sweden",
        "right": "USA",
        "season": "Summer",
        "initiative": "J",
        "value": 9
	},
    {
		"deck": "Action",
		"number": 26,
        "left": "Greece",
        "right": "Latin America",
        "season": "Summer",
        "initiative": "K",
        "value": 9
	},
    {
		"deck": "Action",
		"number": 27,
        "left": "Low Countries",
        "right": "Finland",
        "season": "Summer",
        "initiative": "L",
        "value": 9
	},
    {
		"deck": "Action",
		"number": 28,
        "left": "Norway",
        "right": "Yugoslavia",
        "season": "Summer",
        "initiative": "M",
        "value": 10
	},
    {
		"deck": "Action",
		"number": 29,
        "left": "Yugoslavia",
        "right": "Czechoslovakia",
        "season": "Summer",
        "initiative": "N",
        "value": 10
	},
    {
		"deck": "Action",
		"number": 30,
        "left": "Greece",
        "right": "Hungary",
        "season": "Summer",
        "initiative": "P",
        "value": 10
	},
    {
		"deck": "Action",
		"number": 31,
        "left": "USA",
        "right": "Austria",
        "season": "Summer",
        "initiative": "Q",
        "value": 9
	},
    {
		"deck": "Action",
		"number": 32,
        "left": "Bulgaria",
        "right": "Czechoslovakia",
        "season": "Summer",
        "initiative": "R",
        "value": 9
	},
    {
		"deck": "Action",
		"number": 33,
        "left": "Finland",
        "right": "Baltic States",
        "season": "Summer",
        "initiative": "S",
        "value": 9
	},
    {
		"deck": "Action",
		"number": 34,
        "left": "Yugoslavia",
        "right": "Hungary",
        "season": "Summer",
        "initiative": "T",
        "value": 8
	},
    {
		"deck": "Action",
		"number": 35,
		"special": "Isolationism",
        "season": "Summer",
        "initiative": "U",
        "value": 8
	},
    {
		"deck": "Action",
		"number": 36,
        "left": "Portugal",
        "right": "Czechoslovakia",
        "season": "Summer",
        "initiative": "V",
        "value": 8
	},
    {
		"deck": "Action",
		"number": 37,
        "left": "Austria",
        "right": "Bulgaria",
        "season": "Summer",
        "initiative": "W",
        "value": 7
	},
    {
		"deck": "Action",
		"number": 38,
        "left": "Latin America",
        "right": "Austria",
        "season": "Summer",
        "initiative": "X",
        "value": 7
	},
    {
		"deck": "Action",
		"number": 39,
        "left": "Persia",
        "right": "Rumania",
        "season": "Summer",
        "initiative": "Y",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 40,
        "left": "Poland",
        "right": "Spain",
        "season": "Summer",
        "initiative": "Z",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 41,
        "left": "Hungary",
        "right": "Afghanistan",
        "season": "Fall",
        "initiative": "A",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 42,
		"special": "Guarantee",
        "season": "Fall",
        "initiative": "B",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 43,
        "left": "Afghanistan",
        "right": "Low Countries",
        "season": "Fall",
        "initiative": "C",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 44,
		"special": "Brothers in Arms",
        "season": "Fall",
        "initiative": "D",
        "value": 7
	},
    {
		"deck": "Action",
		"number": 45,
		"special": "Birds of a Feather ",
        "season": "Fall",
        "initiative": "E",
        "value": 7
	},
    {
		"deck": "Action",
		"number": 46,
        "left": "Latin America",
        "right": "Greece",
        "season": "Fall",
        "initiative": "F",
        "value": 7
	},
    {
		"deck": "Action",
		"number": 47,
        "left": "Norway",
        "right": "Finland",
        "season": "Fall",
        "initiative": "G",
        "value": 8
	},
    {
		"deck": "Action",
		"number": 48,
		"special": "Isoationism",
        "season": "Fall",
        "initiative": "H",
        "value": 8
	},
    {
		"deck": "Action",
		"number": 49,
        "left": "Denmark",
        "right": "Low Countries",
        "season": "Fall",
        "initiative": "I",
        "value": 8
	},
    {
		"deck": "Action",
		"number": 50,
        "left": "Turkey",
        "right": "Greece",
        "season": "Fall",
        "initiative": "J",
        "value": 7
	},
    {
		"deck": "Action",
		"number": 51,
        "left": "Sweden",
        "right": "Baltic States",
        "season": "Fall",
        "initiative": "K",
        "value": 7
	},
    {
		"deck": "Action",
		"number": 52,
        "left": "Sweden",
        "right": "Norway",
        "season": "Fall",
        "initiative": "L",
        "value": 7
	},
    {
		"deck": "Action",
		"number": 53,
        "left": "Greece",
        "right": "Bulgaria",
        "season": "Fall",
        "initiative": "M",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 54,
        "left": "Czechoslovakia",
        "right": "Finland",
        "season": "Fall",
        "initiative": "N",
        "value": 6
	},
    {
		"deck": "Action",
		"number": 55,
        "left": "Turkey",
        "right": "Persia",
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
        "right": "Heavy Tanks",
        "value": 2
	},
    {
		"deck": "Investment",
		"number": 2,
        "left": "Heavy Tanks",
        "right": "Rocket Artillery",
        "value": 3
	},
    {
		"deck": "Investment",
		"number": 3,
        "special": "1938 Science", 
        "value": 1
	},
    {
		"deck": "Investment",
		"number": 4,
        "left": "Sonar",
        "right": "AirDefense Radar",
        "value": 1
	},
    {
		"deck": "Investment",
		"number": 5,
        "left": "Naval Radar",
        "right": "Sonar",
        "value": 1
	},
    {
		"deck": "Investment",
		"number": 6,
        "left": "AirDefense Radar",
        "right": "Rocket Artillery",
        "value": 3
	},
    {
		"deck": "Investment",
		"number": 7,
        "left": "Sonar",
        "right": "AirDefense Radar",
        "value": 1
	},
    {
		"deck": "Investment",
		"number": 8,
        "left": "Sonar",
        "right": "Naval Radar",
        "value": 2
	},
    {
        "deck": "Investment",
		"number": 9,
        "left": "Rocket Artillery",
        "right": "Sonar",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 10,
        "left": "Naval Radar",
        "right": "Heavy Tanks",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 11,
        "left": "LSTs",
        "right": "Motorized Infantry",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 12,
        "left": "Heavy Bombers",
        "right": "LSTs",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 13,
        "left": "Heavy Bombers",
        "right": "Jets",
        "value": 4
    },
    {
        "deck": "Investment",
		"number": 14,
        "special": "1938 Science",
        "value": 1
    },
    {
        "deck": "Investment",
		"number": 15,
        "left": "Jets",
        "right": "Motorized Infantry",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 16,
        "left": "LSTs",
        "right": "Atomic Research 3",
        "value": 4
    },
    {
        "deck": "Investment",
		"number": 17,
        "left": "Heavy Bombers",
        "right": "Atomic Research 4",
        "value": 4
    },
    {
        "deck": "Investment",
		"number": 18,
        "left": "Precision Bombsight",
        "right": "Atomic Research 1",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 19,
        "special": "1940 Science",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 20,
		"special": "1944 Science",
        "value": 4
    },
    {
        "deck": "Investment",
		"number": 21,
		"left": "Industrial Espionage",
        "right": "AirDefense Radar",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 22,
		"left": "Industrial Espionage",
        "right": "Atomic Research 2",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 23,
        "left": "Precision Bombsight",
        "right": "Atomic Research 1",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 24,
		"special": "1942 Science",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 25,
        "left": "Rocket Artillery",
        "right": "Precision Bombsight",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 26,
        "left": "Industrial Espionage",
        "right": "Precision Bombsight",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 27,
        "left": "Motorized Infantry",
        "right": "Atomic Research 2",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 28,
        "left": "Precision Bombsight",
        "right": "Atomic Research 1",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 29,
        "left": "Heavy Bombers",
        "right": "Precision Bombsight",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 30,
        "left": "LSTs",
        "right": "Motorized Infantry",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 31,
		"special": "Mole",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 32,
		"special": "Agent",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 33,
		"special": "Sabotage",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 34,
		"special": "Spy Ring",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 35,
        "special": "Code Break",
        "value": 1
    },
    {
        "deck": "Investment",
		"number": 36,
		"special": "Double Agent",
        "value": 4
    },
    {
        "deck": "Investment",
		"number": 37,
		"special": "Agent",
        "value": 1
    },
    {
        "deck": "Investment",
		"number": 38,
		"special": "Coup",
        "value": 4
    },
    {
        "deck": "Investment",
		"number": 39,
		"special": "Spy Ring",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 40,
		"special": "Code Break",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 41,
        "left": "AirDefense Radar",
        "right": "Naval Radar",
        "value": 1
    },
    {
        "deck": "Investment",
		"number": 42,
        "left": "Sonar",
        "right": "Atomic Research 1",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 43,
        "left": "Heavy Tanks",
        "right": "Jets",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 44,
        "left": "Precision Bombsight",
		"right": "Industrial Espionage",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 45,
        "left": "Naval Radar",
        "right": "Sonar",
        "value": 1
    },
    {
        "deck": "Investment",
		"number": 46,
        "left": "AirDefense Radar",
        "right": "Atomic Research 2",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 47,
        "left": "Sonar",
        "right": "Naval Radar",
        "value": 1
    },
    {
        "deck": "Investment",
		"number": 48,
        "left": "Heavy Tanks",
        "right": "Rocket Artillery",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 49,
        "left": "Heavy Tanks",
        "right": "AirDefense Radar",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 50,
        "left": "Naval Radar",
        "right": "Sonar",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 51,
        "left": "LSTs",
        "right": "Motorized Infantry",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 52,
        "left": "Heavy Bombers",
		"right": "Industrial Espionage",
        "value": 2
    },
    {
        "deck": "Investment",
		"number": 53,
        "left": "Motorized Infantry",
        "right": "Atomic Research 3",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 54,
        "left": "LSTs",
        "right": "Heavy Bombers",
        "value": 3
    },
    {
        "deck": "Investment",
		"number": 55,
        "left": "Jets",
        "right": "Atomic Research 4",
        "value": 4
    }
]

const SCIENCE = {
    "1938 Science": ["AirDefense Radar", "Atomic Research 1", "Heavy Tanks", "Motorized Infantry", "Naval Radar", "Sonar"],
    "1940 Science": ["Atomic Research 2", "Heavy Bombers", "Naval Radar", "Precision Bombsight", "Rocket Artillery", "Sonar"], 
    "1942 Science": ["AirDefense Radar", "Atomic Research 3", "Heavy Tanks", "LSTs", "Precision Bombsight", "Rocket Artillery"], 
    "1944 Science": ["Atomic Research 3", "Atomic Research 4", "Heavy Bombers", "Jets", "LSTs", "Precision Bombsight"],
}

if (typeof module !== 'undefined') {
    module.exports = {ACARDS, ICARDS, SCIENCE}
}

