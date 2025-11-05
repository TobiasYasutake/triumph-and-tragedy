const {REGIONS} = require("./data")

const CONNECTIONS = {
    "Munich": ["Lorraine", "r", "Amsterdam", "r", "Ruhr", "p", "Berlin", "p", "Prague", "f", "Vienna", "p"],
    "Berlin": ["Ruhr", "p", "Baltic Sea", "c", "Warsaw", "r", "Prague", "f", "Munich", "p"],
    "Ruhr": ["Munich", "p", "Amsterdam", "r", "North Sea", "c", "Copenhagen", "s", "Baltic Sea", "c", "Berlin", "p"],
    "Konigsberg": ["Baltic Sea", "c", "Riga", "p", "Vilna", "f", "Warsaw", "r"],
    "Rome": ["Milan", "m", "Venice", "m", "Taranto", "m", "Sicily", "s", "Tyrrhenian Sea", "c"],
    "Venice": ["Vienna", "m", "Croatia", "m", "Adriatic Sea", "c", "Taranto", "m", "Rome", "m", "Milan", "p"],
    "Milan": ["Marseille", "m", "Venice", "p", "Rome", "m", "Tyrrhenian Sea", "c", "Western Mediterranean", "c"],
    "Sardinia": ["Tyrrhenian Sea", "c", "Western Mediterranean", "c"],
    "Sicily": ["Tyrrhenian Sea", "s", "Rome", "s", "Taranto", "s", "Central Mediterranean", "s", "Malta", "s"],
    "Taranto": ["Adriatic Sea", "c", "Central Mediterranean", "c", "Sicily", "s", "Rome", "m", "Venice", "m"],
    "Tripoli": ["Central Mediterranean", "c", "Cyrenaica", "p", "Sfax", "m"],
    "Cyrenaica": ["Central Mediterranean", "c", "Eastern Mediterranean", "c", "Egypt", "p", "Tripoli", "p"],
    "London": ["English Channel", "c", "Irish Sea", "c", "Glasgow", "m", "North Sea", "c"],
    "Glasgow": ["Irish Sea", "c", "Norwegian Sea", "c", "North Sea", "c", "London", "m"],
    "Ottawa": ["North Atlantic Ocean", "c", "New York", "f"],
    "Gibraltar": ["Madeira Sea", "s", "Madrid", "s", "Barcelona", "s", "Western Mediterranean", "s", "Algiers", "s", "Morocco", "s"],
    "Karachi": ["Shiraz", "m", "Kabul", "m", "Delhi", "p", "Bombay", "p", "Arabian Sea", "c"],
    "Bombay": ["Arabian Sea", "c", "Karachi", "p", "Delhi", "p", "East Indian Ocean", "c"],
    "Delhi": ["East Indian Ocean", "c", "Bombay", "p", "Karachi", "p"],
    "Malta": ["Sfax", "s", "Tunisia", "s", "Tyrrhenian Sea", "s", "Sicily", "s", "Central Mediterranean", "s"],
    "Egypt": ["Cyrenaica", "p", "Eastern Mediterranean", "c", "Suez", "s"],
    "Sudan": ["Suez", "s", "Red Sea", "c"],
    "Suez": ["Egypt", "s", "Eastern Mediterranean", "s", "Jordan", "s", "Red Sea", "s", "Sudan", "s"],
    "Jordan": ["Eastern Mediterranean", "c", "Suez", "s", "Damascus", "p", "Iraq", "p"],
    "Iraq": ["Jordan", "p", "Damascus", "p", "Abadan", "p", "Persian Gulf", "c"],
    "Paris": ["Bay of Biscay", "c", "English Channel", "c", "North Sea", "c", "Amsterdam", "p", "Lorraine", "p", "Gascony", "p"],
    "Marseille": ["Gascony", "p", "Lorraine", "p", "Milan", "m", "Western Mediterranean", "c", "Barcelona", "m"],
    "Gascony": ["Bay of Biscay", "c", "Paris", "p", "Lorraine", "p", "Marseille", "p", "Barcelona", "m", "Leon", "m"],
    "Lorraine": ["Amsterdam", "f", "Munich", "r", "Marseille", "p", "Gascony", "p", "Paris", "p"],
    "Dakar": ["South Atlantic Ocean", "c", "Mid Atlantic Ocean", "c", "Morocco", "p"],
    "Morocco": ["Dakar", "p", "Mid Atlantic Ocean", "c", "Madeira Sea", "c", "Gibraltar", "s", "Algiers", "m"],
    "Algiers": ["Gibraltar", "s", "Western Mediterranean", "c", "Tunisia", "m", "Morocco", "m"],
    "Tunisia": ["Algiers", "m", "Western Mediterranean", "c", "Tyrrhenian Sea", "c", "Malta", "s", "Sfax", "m"],
    "Sfax": ["Tunisia", "m", "Malta", "s", "Central Mediterranean", "c", "Tripoli", "m"],
    "Damascus": ["Eastern Mediterranean", "c", "Adana", "p", "Iraq", "p", "Jordan", "p"],
    "Washington": ["New York", "p", "North Atlantic Ocean", "c"],
    "New York": ["North Atlantic Ocean", "c", "Washington", "p", "Ottawa", "f"],
    "Leningrad": ["Riga", "f", "Gulf of Bothnia", "c", "Helsinki", "f", "Murmansk", "f", "Archangel", "f", "Vologda", "f", "Moscow", "f", "Bryansk", "f", "Belorussia", "f"],
    "Moscow": ["Leningrad", "f", "Vologda", "f", "Gorky", "r", "Penza", "p", "Voronezh", "p", "Bryansk", "f"],
    "Urals": ["Perm", "m", "Western Siberia", "p", "Kazakhstan", "m", "Ufa", "m"],
    "Kiev": ["Bryansk", "r", "Kharkov", "r", "Odessa", "p", "Lvov", "p"],
    "Kharkov": ["Odessa", "r", "Kiev", "r", "Bryansk", "p","Voronezh", "r", "Stalingrad", "r", "Kuban", "r", "Sea of Azov", "c", "Sevastopol", "s"],
    "Stalingrad": ["Kharkov", "r", "Voronezh", "p", "Ufa", "r", "Grozny", "p", "Kuban", "p"],
    "Odessa": ["Bucharest", "r", "Lvov", "p", "Kiev", "p", "Kharkov", "r", "Sevastopol", "s", "Western Black Sea", "c"],
    "Baku": ["Northern Caspian Sea", "c", "Southern Caspian Sea", "c", "Tabriz", "m", "Georgia", "p", "Grozny", "m"],
    "Sevastopol": ["Odessa", "s", "Kharkov", "s", "Sea of Azov", "s", "Kuban", "s", "Eastern Black Sea", "s", "Western Black Sea", "s"],
    "Kuban": ["Sevastopol", "s", "Sea of Azov", "c", "Kharkov", "r", "Stalingrad", "p", "Grozny", "p", "Georgia", "m", "Eastern Black Sea", "c"],
    "Georgia": ["Eastern Black Sea", "c", "Kuban", "m", "Grozny", "m", "Baku", "p", "Tabriz", "m", "Kars", "m"],
    "Turkmenistan": ["Northern Caspian Sea", "c", "Southern Caspian Sea", "c", "Kazakhstan", "p", "Tehran", "m", "Kabul", "m"],
    "Grozny": ["Kuban", "p", "Stalingrad", "p", "Ufa", "r", "Northern Caspian Sea", "c", "Baku", "m", "Georgia", "m"],
    "Kazakhstan": ["Turkmenistan", "p", "Northern Caspian Sea", "c", "Ufa", "p", "Urals", "m", "Western Siberia", "p"],
    "Ufa": ["Perm", "p", "Urals", "m", "Kazakhstan", "p", "Northern Caspian Sea", "c", "Grozny", "r", "Stalingrad", "r", "Voronezh", "r", "Penza", "r"],
    "Western Siberia": ["Urals", "p", "Kazakhstan", "p"],
    "Voronezh": ["Bryansk", "p", "Moscow", "p", "Penza", "f", "Ufa", "r", "Stalingrad", "p", "Kharkov", "r"],
    "Bryansk": ["Belorussia", "p", "Leningrad", "f", "Moscow", "f", "Voronezh", "p", "Kharkov", "p", "Kiev", "r"],
    "Belorussia": ["Vilna", "p", "Riga", "p", "Leningrad", "f", "Bryansk", "p"],
    "Penza": ["Moscow", "p", "Gorky", "r", "Perm", "r", "Ufa", "r", "Voronezh", "f"],
    "Murmansk": ["Barents Sea", "c", "White Sea", "c", "Archangel", "f", "Leningrad", "f", "Helsinki", "f", "Petsamo", "f"],
    "Archangel": ["Murmansk", "f", "White Sea", "c", "Vologda", "f", "Leningrad", "f"],
    "Vologda": ["Archangel", "f", "Gorky", "f", "Moscow", "f", "Leningrad", "f"],
    "Gorky": ["Vologda", "f", "Perm", "f", "Penza", "r", "Moscow", "r"],
    "Perm": ["Gorky", "f", "Urals", "m", "Ufa", "p", "Penza", "r"],
    "Kabul": ["Turkmenistan", "m", "Karachi", "m", "Shiraz", "m", "Tehran", "m"],
    "Albania": ["Adriatic Sea", "c", "Croatia", "m", "Belgrade", "m", "Athens", "m", "Central Mediterranean", "c",],
    "Vienna": ["Munich", "p", "Prague", "p", "Budapest", "p", "Croatia", "m", "Venice", "m",],
    "Riga": ["Baltic Sea", "c", "Gulf of Bothnia", "c", "Leningrad", "f", "Belorussia", "p", "Vilna", "p", "Konigsberg", "p"],
    "Sofia": ["Belgrade", "m", "Bucharest", "r", "Western Black Sea", "c", "Istanbul", "s", "Athens", "m"],
    "Prague": ["Warsaw", "f", "Lvov", "m", "Budapest", "m", "Vienna", "p", "Munich", "f", "Berlin", "f",],
    "Copenhagen": ["North Sea", "s", "Oslo", "s", "Stockholm", "s", "Baltic Sea", "s", "Ruhr", "s"],
    "Iceland": ["Irminger Sea", "c", "Greenland Sea", "c", "Norwegian Sea", "c", "Irish Sea", "c"],
    "Helsinki": ["Gulf of Bothnia", "c", "Gallivare", "f", "Petsamo", "f", "Murmansk", "f", "Leningrad", "f"],
    "Petsamo": ["Gallivare", "f", "Narvik", "m", "Barents Sea", "c", "Murmansk", "f", "Helsinki", "f"],
    "Athens": ["Albania", "m", "Belgrade", "m", "Sofia", "m", "Istanbul", "s", "Aegean Sea", "c", "Central Mediterranean", "c"],
    "Crete": ["Aegean Sea", "c", "Eastern Mediterranean", "c", "Central Mediterranean", "c"],
    "Budapest": ["Vienna", "p", "Prague", "m", "Lvov", "m", "Bucharest", "m", "Belgrade", "p", "Croatia", "p"],
    "Dublin": ["Irish Sea", "c"],
    "Rio de Janeiro": ["Mid Atlantic Ocean", "c", "South Atlantic Ocean", "c"],
    "Amsterdam": ["North Sea", "c", "Ruhr", "r", "Munich", "r", "Lorraine", "f", "Paris", "p"],
    "Oslo": ["North Sea", "c", "Norwegian Sea", "c", "Nordkapp Sea", "c", "Narvik", "m", "Gallivare", "m", "Stockholm", "f", "Copenhagen", "s"],
    "Narvik": ["Nordkapp Sea", "c", "Barents Sea", "c", "Petsamo", "m", "Gallivare", "m", "Oslo", "m"],
    "Tehran": ["Southern Caspian Sea", "c", "Turkmenistan", "m", "Kabul", "m", "Shiraz", "m", "Abadan", "m", "Tabriz", "m"],
    "Tabriz": ["Georgia", "m", "Baku", "m", "Southern Caspian Sea", "c", "Tehran", "m", "Abadan", "m", "Kars", "m"],
    "Abadan": ["Tabriz", "m", "Tehran", "m", "Shiraz", "m", "Persian Gulf", "c", "Iraq", "p"],
    "Shiraz": ["Abadan", "m", "Tehran", "m", "Kabul", "m", "Karachi", "m", "Arabian Sea", "c", "Persian Gulf", "c"],
    "Warsaw": ["Berlin", "r", "Baltic Sea", "c", "Konigsberg", "r", "Vilna", "r", "Lvov", "r", "Prague", "f"],
    "Vilna": ["Warsaw", "r", "Konigsberg", "f", "Riga", "p", "Belorussia", "p", "Lvov", "p"],
    "Lvov": ["Warsaw", "r", "Vilna", "p", "Kiev", "p", "Odessa", "p", "Bucharest", "r", "Budapest", "m", "Prague", "m"],
    "Lisbon": ["Madeira Sea", "c", "Leon", "p", "Madrid", "p"],
    "Azores": ["North Atlantic Ocean", "s", "Bay of Biscay", "s", "Madeira Sea", "s", "Mid Atlantic Ocean", "s"],
    "Bucharest": ["Sofia", "r", "Belgrade", "r", "Budapest", "m", "Lvov", "r", "Odessa", "r", "Western Black Sea", "c"],
    "Madrid": ["Lisbon", "p", "Leon", "p", "Barcelona", "p", "Gibraltar", "s", "Madeira Sea", "c"],
    "Barcelona": ["Madrid", "p", "Leon", "p", "Gascony", "m", "Marseille", "m", "Western Mediterranean", "c", "Gibraltar", "s"],
    "Leon": ["Madeira Sea", "c", "Bay of Biscay", "c", "Gascony", "m", "Barcelona", "p", "Madrid", "p", "Lisbon", "p"],
    "Stockholm": ["Copenhagen", "s", "Oslo", "f", "Gallivare", "f", "Gulf of Bothnia", "c", "Baltic Sea", "c"],
    "Gallivare": ["Oslo", "m", "Narvik", "m", "Petsamo", "f", "Helsinki", "f", "Gulf of Bothnia", "c", "Stockholm", "f"],
    "Ankara": ["Istanbul", "s", "Western Black Sea", "c", "Sinope", "m", "Adana", "m", "Izmir", "m"],
    "Istanbul": ["Sofia", "s", "Western Black Sea", "s", "Ankara", "s", "Izmir", "s", "Aegean Sea", "s", "Athens", "s"],
    "Izmir": ["Aegean Sea", "c", "Istanbul", "s", "Ankara", "m", "Adana", "m", "Eastern Mediterranean", "c",],
    "Adana": ["Eastern Mediterranean", "c", "Izmir", "m", "Ankara", "m", "Sinope", "m", "Kars", "m", "Damascus", "p"],
    "Sinope": ["Ankara", "m", "Western Black Sea", "c", "Eastern Black Sea", "c", "Kars", "m", "Adana", "m"],
    "Kars": ["Eastern Black Sea", "c", "Georgia", "m", "Tabriz", "m", "Adana", "m", "Sinope", "m"],
    "Belgrade": ["Croatia", "f", "Budapest", "p", "Bucharest", "r", "Sofia", "m", "Athens", "m", "Albania", "m"],
    "Croatia": ["Venice", "m", "Vienna", "m", "Budapest", "p", "Belgrade", "f", "Albania", "m", "Adriatic Sea", "c"],
    "Irminger Sea": ["Iceland", "c", "Irish Sea", "w", "North Atlantic Ocean", "w", "Greenland Sea", "w"],
    "Greenland Sea": ["Irminger Sea", "w", "Iceland", "c", "Norwegian Sea", "w", "Nordkapp Sea", "w"],
    "Norwegian Sea": ["Nordkapp Sea", "w", "Oslo", "c", "North Sea", "w", "Glasgow", "c", "Irish Sea", "w", "Iceland", "c", "Greenland Sea", "w"],
    "Nordkapp Sea": ["Greenland Sea", "w", "Barents Sea", "w", "Narvik", "c", "Oslo", "c", "Norwegian Sea", "w"],
    "Barents Sea": ["Nordkapp Sea", "w", "White Sea", "w", "Murmansk", "c", "Petsamo", "c", "Narvik", "c"],
    "White Sea": ["Barents Sea", "w", "Archangel", "c", "Murmansk", "c"],
    "Irish Sea": ["Dublin", "c", "Iceland", "c", "Norwegian Sea", "w", "Glasgow", "c", "London", "c", "English Channel", "w", "Bay of Biscay", "w", "North Atlantic Ocean", "w", "Irminger Sea", "w"],
    "English Channel": ["London", "c", "North Sea", "w", "Paris", "c", "Bay of Biscay", "w", "Irish Sea", "w"],
    "North Sea": ["London", "c", "Glasgow", "c", "Norwegian Sea", "w", "Oslo", "c", "Copenhagen", "s", "Ruhr", "c", "Amsterdam", "c", "Paris", "c", "English Channel", "w"],
    "Baltic Sea": ["Copenhagen", "s", "Stockholm", "c", "Gulf of Bothnia", "w", "Riga", "c", "Konigsberg", "c", "Warsaw", "c", "Berlin", "c", "Ruhr", "c"],
    "Gulf of Bothnia": ["Stockholm", "c", "Gallivare", "c", "Helsinki", "c", "Leningrad", "c", "Riga", "c", "Baltic Sea", "w"],
    "Bay of Biscay": ["Irish Sea", "w", "English Channel", "w", "Paris", "c", "Gascony", "c", "Leon", "c", "Madeira Sea", "w", "Azores", "s", "North Atlantic Ocean", "w"],
    "Madeira Sea": ["Azores", "s", "Bay of Biscay", "w", "Leon", "c", "Lisbon", "c", "Madrid", "c", "Gibraltar", "s", "Morocco", "c", "Mid Atlantic Ocean", "w"],
    "Western Mediterranean": ["Gibraltar", "s", "Barcelona", "c", "Marseille", "c", "Milan", "c", "Tyrrhenian Sea", "w", "Sardinia", "c", "Tunisia", "c", "Algiers", "c"],
    "Tyrrhenian Sea": ["Western Mediterranean", "w", "Sardinia", "c", "Milan", "c", "Rome", "c", "Sicily", "s", "Malta", "s", "Tunisia", "c"],
    "Central Mediterranean": ["Malta", "s", "Sicily", "s", "Taranto", "c", "Adriatic Sea", "w", "Albania", "c", "Athens", "c", "Aegean Sea", "w", "Crete", "c", "Eastern Mediterranean", "w", "Cyrenaica", "c", "Tripoli", "c", "Sfax", "c"],
    "Aegean Sea": ["Central Mediterranean", "w", "Athens", "c", "Istanbul", "s", "Izmir", "c", "Eastern Mediterranean", "w", "Crete", "c"],
    "Eastern Mediterranean": ["Central Mediterranean", "w", "Crete", "c", "Aegean Sea", "w", "Izmir", "c", "Adana", "c", "Damascus", "c", "Jordan", "c", "Suez", "s", "Egypt", "c", "Cyrenaica", "c"],
    "Adriatic Sea": ["Venice", "c", "Croatia", "c", "Albania", "c", "Central Mediterranean", "w", "Taranto", "c"],
    "Western Black Sea": ["Sofia", "c", "Bucharest", "c", "Odessa", "c", "Sevastopol", "s", "Eastern Black Sea", "w", "Sinope", "c", "Ankara", "c", "Istanbul", "s"],
    "Eastern Black Sea": ["Western Black Sea", "w", "Sevastopol", "s", "Kuban", "c", "Georgia", "c", "Kars", "c", "Sinope", "c"],
    "Red Sea": ["Sudan", "c", "Suez", "s", "Gulf of Aden", "w"],
    "Gulf of Aden": ["Red Sea", "w", "Arabian Sea", "w", "West Indian Ocean", "w"],
    "Arabian Sea": ["Gulf of Aden", "w", "Persian Gulf", "w", "Shiraz", "c", "Karachi", "c", "Bombay", "c", "East Indian Ocean", "w", "West Indian Ocean", "w"],
    "Persian Gulf": ["Iraq", "c", "Abadan", "c", "Shiraz", "c", "Arabian Sea", "w"],
    "Northern Caspian Sea": ["Ufa", "c", "Kazakhstan", "c", "Turkmenistan", "c", "Southern Caspian Sea", "w", "Baku", "c", "Grozny", "c"],
    "Southern Caspian Sea": ["Northern Caspian Sea", "w", "Turkmenistan", "c", "Tehran", "c", "Tabriz", "c", "Baku", "c"],
    "Sea of Azov": ["Sevastopol", "s", "Kharkov", "c", "Kuban", "c"],
    "North Atlantic Ocean": ["Washington", "c", "New York", "c", "Ottawa", "c", "Irminger Sea", "w", "Irish Sea", "w", "Bay of Biscay", "w", "Azores", "s", "Mid Atlantic Ocean", "w"],
    "Mid Atlantic Ocean": ["North Atlantic Ocean", "w", "Azores", "s", "Madeira Sea", "w", "Morocco", "c", "Dakar", "c", "Rio de Janeiro", "c", "South Atlantic Ocean", "w"],
    "South Atlantic Ocean": ["Rio de Janeiro", "c", "Mid Atlantic Ocean", "w", "Dakar", "c", "West Indian Ocean", "w"],
    "West Indian Ocean": ["South Atlantic Ocean", "w", "Gulf of Aden", "w", "Arabian Sea", "w", "East Indian Ocean", "w"],
    "East Indian Ocean": ["West Indian Ocean", "w", "Arabian Sea", "w", "Bombay", "c", "Delhi", "c",],
}


//check to see if there are any typos
let problem = false
for (let name in CONNECTIONS) {
    for (let i = 0; i < CONNECTIONS[name].length -1; i += 2){
        try {
            let neighbor = CONNECTIONS[name][i]
            let border = CONNECTIONS[name][i+1]
            let neindex = CONNECTIONS[neighbor].indexOf(name)
            if (neindex === -1) {
                console.log(name + " couldn't find a neighbor")
                console.log("The neighbor was " + neighbor)
                problem = true
            }
            if (CONNECTIONS[neighbor][neindex+1] !== border) console.log ("A border was wrong with " + name + " and " + neighbor)
        } catch (error) {
            console.log(name + "Threw an error")
        }

    }
}
console.log("Problem: " + problem)

//translate
const borders = []
const border_types = []

for (let name in CONNECTIONS) {
    let border = []
    let border_type = []
    for (let i = 0; i < CONNECTIONS[name].length; i++ ){

        if (i%2 === 0){
            border.push(REGIONS.findIndex(r => r.name === CONNECTIONS[name][i]))
        } else {
            border_type.push(CONNECTIONS[name][i])
        }
    }
    borders.push(border)
    border_types.push(border_type)
}

console.log(borders)
console.log(border_types)