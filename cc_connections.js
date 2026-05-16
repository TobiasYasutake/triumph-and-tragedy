const {REGIONS} = require("./cc_data")

const CONNECTIONS = {
    'Samarkand': ['Wakhan', 'm', 'Tashkent', 'p', /*'Afghanistan', '?', 'Turkmenistan', '?'*/],
    'Tashkent': ['Samarkand', 'p', 'Balkhash', 'p', /*'Kazakhstan', '?', 'Turkmenistan', '?'*/],
    'Balkhash': ['Tashkent', 'p', 'Novosibirsk', 'p', 'Sinkiang', 'm', /*'Kazakhstan', '?', 'Western Siberia', '?'*/],
    'Novosibirsk': ['Sinkiang', 'i', 'Balkhash', 'p', 'Krasnoyarsk', 'p' /*'Western Siberia', '?'*/],
    'Krasnoyarsk': ['Novosibirsk', 'p', 'Irkutsk', 'f'],
    'Irkutsk': ['Krasnoyarsk', 'f', 'Chita', 'b'],
    'Chita': ['Irkutsk', 'b', 'Never', 'p', 'Hailar', 'r', 'Mongolia', 'm'],
    'Never': ['Chita', 'p', 'Amur', 'f', 'Harbin', 'r', 'Hailar', 'r'],
    'Amur': ['Never', 'f', 'Vladivostok', 'r', 'Harbin', 'r', 'Sea of Okhotsk', 'c'],
    'Vladivostok': ['Amur', 'r', 'Sea of Okhotsk', 'c', 'Sakhalin', 's', 'Sea of Japan', 'c', 'Harbin', 'm'],
    'Kamchatka': ['Bering Sea', 'c', 'Kuriles', 's', 'Sea of Okhotsk', 'c', ],
    'Sakhalin': ['Vladivostok', 's', 'Sea of Okhotsk', 's', 'Hokkaido', 's', 'Sea of Japan', 's',],

    'Hailar': ['Chita', 'r', 'Never', 'r', 'Harbin', 'p', 'Mukden', 'p', 'Jehol', 'p', 'Mongolia', 'd'],
    'Harbin': ['Hailar', 'p', 'Never', 'r', 'Amur', 'r', 'Vladivostok', 'm', 'Sea of Japan', 'c', 'Korea', 'm', 'Mukden', 'p',],
    'Korea': ['Harbin', 'm', 'Sea of Japan', 'c', 'Yellow Sea', 'c', 'Mukden', 'p',],
    'Mukden': ['Korea', 'p', 'Yellow Sea', 'c', 'Jehol', 'p', 'Hailar', 'p', 'Harbin', 'p'],
    'Jehol': ['Mukden', 'p', 'Yellow Sea', 'c', 'Peiping', 'p', 'Inner Mongolia', 'p', 'Mongolia', 'd', 'Hailar', 'p'],

    'Mongolia': ['Chita', 'm', 'Hailar', 'd', 'Jehol', 'd', 'Inner Mongolia', 'd'],
    'Inner Mongolia': ['Mongolia', 'd', 'Jehol', 'p', 'Peiping', 'm', 'Shansi', 'p', 'Sian', 'r', 'Kansu', 'd'],
    'Peiping': ['Yellow Sea', 'c', 'Tsingtao', 'r', 'Shansi', 'm', 'Inner Mongolia', 'm', 'Jehol', 'p'],
    'Tsingtao': ['Peiping', 'r', 'Yellow Sea', 'c', 'Suchow', 'p', 'Shansi', 'r',],
    'Shansi': ['Inner Mongolia', 'p', 'Peiping', 'm', 'Tsingtao', 'r', 'Suchow', 'r', 'Wuhan', 'r', 'Sian', 'r', ],
    'Sian': ['Kansu', 'r', 'Inner Mongolia', 'r', 'Shansi', 'r', 'Wuhan', 'm', 'Chungking', 'm'],
    'Kansu': ['Sinkiang', 'd', 'Inner Mongolia', 'd', 'Sian', 'r', 'Chungking', 'm'],
    'Sinkiang': ['Balkhash', 'm', 'Novosibirsk', 'i', 'Kansu', 'd'],
    'Chungking': ['Kansu', 'm', 'Sian', 'm', 'Wuhan', 'm', 'Changsha', 'm', 'Kwangsi', 'm', 'Yunnan', 'm'],
    'Changsha': ['Fukien', 'p', 'Canton', 'p', 'Kwangsi', 'm', 'Chungking', 'm', 'Wuhan', 'r'],
    'Yunnan': ['Chungking', 'm', 'Kwangsi', 'm', 'Hanoi', 'm', 'Burma', 'm',],
    'Kwangsi': ['Changsha', 'm', 'Canton', 'm', 'Hainan', 's', 'Gulf of Tonkin', 'c', 'Hanoi', 'm', 'Yunnan', 'm', 'Chungking', 'm'],
    'Canton': ['Changsha', 'p', 'Fukien', 'm', 'South China Sea', 'c', 'Hong Kong', 's', 'Hainan', 's', 'Kwangsi', 'm', ],
    'Hainan': ['Kwangsi', 's', 'Canton', 's', 'South China Sea', 's', 'Gulf of Tonkin', 's'],
    'Hong Kong': ['Canton', 's', 'South China Sea', 's',],
    'Wuhan': ['Changsha', 'r', 'Chungking', 'm', 'Sian', 'm', 'Shansi', 'r', 'Suchow', 'p', 'Nanking', 'r', 'Fukien', 'r'],
    'Suchow': ['Nanking', 'r', 'Wuhan', 'p', 'Shansi', 'r', 'Tsingtao', 'p', 'Yellow Sea', 'c', 'East China Sea', 'c', ],
    'Nanking': ['Fukien', 'p', 'Wuhan', 'r', 'Suchow', 'r', 'East China Sea', 'c',],
    'Fukien': ['Canton', 'm', 'Changsha', 'p', 'Wuhan', 'r', 'Nanking', 'p', 'East China Sea', 'c', 'South China Sea', 'c',],

    'Formosa': ['East China Sea', 'c', 'Marianas Sea', 'c', 'South China Sea', 'c',],

    'Wakhan': ['Punjab', 'm', 'Samarkand', 'm', /*'Afghanistan', '?'*/],

    'Punjab': ['New Delhi', 'p', 'Wakhan', 'm', /*'Delhi', '?', 'Karachi', '?', 'Afghanistan', '?',*/],
    'New Delhi': ['Punjab', 'p', 'Dacca', 'r', 'Calcutta', 'r', /*'Delhi', '?'*/],
    'Dacca': ['New Delhi', 'r', 'Burma', 'm', 'Bay of Bengal', 'c', 'Calcutta', 'r',],
    'Burma': ['Dacca', 'm', 'Yunnan', 'm', 'Hanoi', 'i', 'Bangkok', 'm', 'Andaman Sea', 'c', 'Bay of Bengal', 'c', ],
    'Calcutta': ['New Delhi', 'r', 'Dacca', 'r', 'Bay of Bengal', 'c', 'Orissa', 'p', /*'Delhi', '?'*/],
    'Orissa': ['Calcutta', 'p', 'Bay of Bengal', 'c', 'Ceylon', 's', /*'Delhi', '?', 'Bombay', '?'*/],
    'Ceylon': ['Orissa', 's', 'Bay of Bengal', 's', /*'Bombay', 's', 'East India Ocean', 's'*/],

    'Hanoi': ['Yunnan', 'm', 'Kwangsi', 'm', 'Gulf of Tonkin', 'c', 'Saigon', 'm', 'Bangkok', 'i', 'Burma', 'i',],
    'Saigon': ['Hanoi', 'm', 'Gulf of Tonkin', 'c', 'Gulf of Siam', 'c', 'Bangkok', 'p',],
    'Bangkok': ['Burma', 'm', 'Hanoi', 'i', 'Saigon', 'p', 'Gulf of Siam', 'c', 'Kra', 'm', 'Andaman Sea', 'i', ],
    'Kra': ['Bangkok', 'm', 'Gulf of Siam', 'c', 'Malacca', 'm', 'Andaman Sea', 'i', ],
    'Malacca': ['Kra', 'm', 'Gulf of Siam', 'c', 'Singapore', 's', 'Andaman Sea', 'i',],
    'Singapore': ['Malacca', 's', 'Gulf of Siam', 's', 'Java Sea', 's', 'Sumatra', 's', 'Andaman Sea', 's', ],
    'Sarawak': ['Balikpapan', 'm', 'Gulf of Siam', 'c', 'Sulu Sea', 'c', 'Celebes Sea', 'c'],
    'Sumatra': ['Singapore', 's', 'Java Sea', 'i', 'Batavia', 's', 'Wharton Sea', 'c', 'Southeast Indian Ocean', 'c', 'Andaman Sea', 'c', ],
    'Batavia': ['Java Sea', 's', 'Java', 's', 'Wharton Sea', 's', 'Sumatra', 's',],
    'Java': ['Java Sea', 'c', 'Lesser Sundas Timor', 's', 'Timor Sea', 'c', 'Wharton Sea', 'c', 'Batavia', 's',],
    'Lesser Sundas Timor': ['Java Sea', 's', 'Timor Sea', 's', 'Java', 's',],
    'Balikpapan': ['Sarawak', 'm', 'Celebes Sea', 'c', 'Java Sea', 'c', 'Gulf of Siam', 'c',],
    'Celebes': ['Celebes Sea', 'c', 'Arafura Sea', 'c', 'Java Sea', 'c',],
    'Hollandia': ['Papua', 'm', 'Arafura Sea', 'c', 'Celebes Sea', 'c', 'Bismarck Sea', 'c', ],

    'Manila': ['Visayans Leyte', 's', 'Sulu Sea', 'c', 'South China Sea', 'c', 'Philippine Sea', 'c',],
    'Visayans Leyte': ['Manila', 's', 'Philippine Sea', 's', 'Mindinao', 's', 'Sulu Sea', 's',],
    'Mindinao': ['Visayans Leyte', 's', 'Philippine Sea', 'c', 'Celebes Sea', 'c', 'Sulu Sea', 'c',],

    'West Australia': ['South Australia', 'd', 'South Australian Ocean', 'c', 'Wharton Sea', 'c', 'Timor Sea', 'c',],
    'South Australia': ['West Australia', 'd', 'Sydney', 'd', 'South Australian Ocean', 'c',],
    'Sydney': ['South Australia', 'd', 'Queensland', 'm', 'Tasman Sea', 'c', 'Tasmania', 's', 'South Australian Ocean', 'c',],
    'Tasmania': ['Sydney', 's', 'Tasman Sea', 's', 'Southwest Pacific Ocean', 's', 'South Australian Ocean', 's', ],
    'Queensland': ['Coral Sea', 'c', 'Tasman Sea', 'c', 'Sydney', 'm', ],
    'New Zealand': ['Tasman Sea', 'c', 'Fiji Sea', 'c', 'Southwest Pacific Ocean', 'c', ],
    'Papua': ['Hollandia', 'm', 'Bismarck Sea', 'c', 'Rabaul', 's', 'Coral Sea', 'c', 'Arafura Sea', 'c', ],

    'Kyushu': ['Osaka', 's', 'Kyushu Sea', 's', 'East China Sea', 's', 'Yellow Sea', 's', 'Sea of Japan', 's', ],
    'Osaka': ['Kyushu', 's', 'Sea of Japan', 'c', 'Tokyo', 'p', 'Kyushu Sea', 'c', ],
    'Tokyo': ['Osaka', 'p', 'Sea of Japan', 'c', 'Hokkaido', 's', 'Northwest Pacific Ocean', 'c', 'Kyushu Sea', 'c', ],
    'Hokkaido': ['Sakhalin', 's', 'Sea of Okhotsk', 's', 'Kuriles', 's', 'Northwest Pacific Ocean', 's', 'Tokyo', 's', 'Sea of Japan', 's', ],
    
    'Anchorage': ['Bering Sea', 'c', 'Skeena', 'm', 'Gulf of Alaska', 'c', 'Aleutians', 's', ],
    'Skeena': ['Vancouver', 'm', 'Gulf of Alaska', 'c', 'Anchorage', 'm', ],
    'Vancouver': ['Prairies', 'm', 'Great Basin', 'm', 'Seattle', 'm', 'Northeast Pacific Ocean', 'c', 'Gulf of Alaska', 'c', 'Skeena', 'm', ],
    'Prairies': ['Great Basin', 'm', 'Vancouver', 'm', 'Chicago', 'p', /* 'Canada', '?' */],
    'Seattle': ['Vancouver', 'm', 'Great Basin', 'm', 'Los Angeles', 'm', 'Northeast Pacific Ocean', 'c', ],
    'Great Basin': ['Vancouver', 'm', 'Prairies', 'm', 'Chicago', 'm', 'Houston', 'p', 'Los Angeles', 'm', 'Seattle', 'm', ],
    'Chicago': ['Houston', 'p', 'Great Basin', 'm', 'Prairies', 'p', /* 'New York', '?', 'Washington', '?' */],
    'Houston': ['Gulf of Mexico', 'c', 'Mexico City', 'd', 'Los Angeles', 'd', 'Great Basin', 'p', 'Chicago', 'p', /* 'Washington', '?', */ ],
    'Los Angeles': ['Seattle', 'm', 'Great Basin', 'm', 'Houston', 'd', 'Mexico City', 'd', 'Cabrillo Ocean', 'c', 'Northeast Pacific Ocean', 'c', ],
    'Mexico City': ['Los Angeles', 'd', 'Houston', 'd', 'Gulf of Mexico', 'c', 'Panama', 's', 'Acapulco', 'm', ],
    'Acapulco': ['Mexico City', 'm', 'Panama', 's', 'Gulf of Panama', 'c', 'Gulf of California', 'c', ],
    'Panama': ['Gulf of Mexico', 's', 'Gulf of Panama', 's', 'Acapulco', 's', 'Mexico City', 's', ],

    'Kuriles': ['Kamchatka', 's', 'Northwest Pacific Ocean', 's', 'Hokkaido', 's', 'Sea of Okhotsk', 's', ],
    'Attu & Kiska': ['Bering Sea', 's', 'Aleutians', 's', 'North Pacific Ocean', 's', 'Northwest Pacific Ocean', 's', ],
    'Aleutians': ['Attu & Kiska', 's', 'Bering Sea', 's', 'Anchorage', 's', 'Gulf of Alaska', 's', 'North Pacific Ocean', 's'],
    'Okinawa': ['East China Sea', 's', 'Kyushu Sea', 's', 'Marianas Sea', 's', ],
    'Iwo Jima': ['Kyushu Sea', 's', 'Caroline Sea', 's', 'Marianas Sea', 's', ],
    'Saipan': ['Caroline Sea', 's', 'Philippine Sea', 's', 'Marianas Sea', 's', ],
    'Guam': ['Philippine Sea', 's', 'Caroline Sea', 's', 'Bismarck Sea', 's', ],
    'Peleliu': ['Philippine Sea', 's', 'Bismarck Sea', 's', 'Celebes Sea', 's', ],
    'Truk': ['Caroline Sea', 's', 'Melanesian Sea', 's', 'Bismarck Sea', 's', ],
    'Kwajalein': ['Caroline Sea', 's', 'Central Pacific Ocean', 's', 'Melanesian Sea', 's', ],
    'Wake': ['Caroline Sea', 's', 'North Central Pacific Ocean', 's', 'Central Pacific Ocean', 's', ],
    'Johnston Atoll': ['North Central Pacific Ocean', 's', 'Hawaiian Sea', 's', 'Central Pacific Ocean', 's', ],
    'Midway': ['North Pacific Ocean', 's', 'Hawaiian Sea', 's', 'North Central Pacific Ocean', 's', ],
    'Hawaii': ['Hawaiian Sea', 's', 'Palmyra Sea', 's', 'Central Pacific Ocean', 's', ],
    'Palmyra': ['Central Pacific Ocean', 's', 'Palmyra Sea', 's', 'South Central Pacific Ocean', 's', ],
    'Tarawa': ['Central Pacific Ocean', 's', 'South Central Pacific Ocean', 's', 'Melanesian Sea', 's', ],
    'Ellice Is': ['Melanesian Sea', 's', 'South Central Pacific Ocean', 's', 'Santa Cruz Sea', 's', ],
    'Christmas': ['Palmyra Sea', 's', 'East Central Pacific Ocean', 's', 'South Central Pacific Ocean', 's', ],
    'Samoa': ['South Central Pacific Ocean', 's', 'Polynesian Sea', 's', 'Santa Cruz Sea', 's', ],
    'Rabaul': ['Papua', 's', 'Melanesian Sea', 's', 'Bismarck Sea', 's', 'Coral Sea', 's',],
    'Guadalcanal': ['Melanesian Sea', 's', 'Santa Cruz Sea', 's', 'Coral Sea', 's', ],
    'Noumea': ['Coral Sea', 's', 'Santa Cruz Sea', 's', 'Tasman Sea', 's', ],
    'Fiji': ['Santa Cruz Sea', 's', 'Polynesian Sea', 's', 'Fiji Sea', 's', ],
    'Cook Is': ['Polynesian Sea', 's', 'Southeast Pacific Ocean', 's', 'Fiji Sea', 's', ],
    'Bora Bora': ['East Central Pacific Ocean', 's', 'East Pacific Ocean', 's', 'Polynesian Sea', 's', ],
    'Tahiti': ['Polynesian Sea', 's', 'East Pacific Ocean', 's', 'Southeast Pacific Ocean', 's', ],


    'Bering Sea': ['Kamchatka', 'c', 'Anchorage', 'c', 'Aleutians', 's', 'Attu & Kiska', 's', 'Northwest Pacific Ocean', 'w', ],
    'Gulf of Alaska': ['Anchorage', 'c', 'Skeena', 'c', 'Vancouver', 'c', 'Northeast Pacific Ocean', 'w', 'North Pacific Ocean', 'w', 'Aleutians', 's', ],
    'Northeast Pacific Ocean': ['Vancouver', 'c', 'Seattle', 'c', 'Los Angeles', 'c', 'Cabrillo Ocean', 'w', 'Hawaiian Sea', 'w', 'North Pacific Ocean', 'w', 'Gulf of Alaska', 'w'],
    'North Pacific Ocean': ['Gulf of Alaska', 'w', 'Northeast Pacific Ocean', 'w', 'Hawaiian Sea', 'w', 'Midway', 's', 'North Central Pacific Ocean', 'w', 'Northwest Pacific Ocean', 'w', 'Attu & Kiska', 's', 'Aleutians', 's'],
    'Northwest Pacific Ocean': ['North Pacific Ocean', 'w', 'North Central Pacific Ocean', 'w', 'Kyushu Sea', 'w', 'Tokyo', 'c', 'Hokkaido', 's', 'Kuriles', 's', 'Bering Sea', 'w', 'Attu & Kiska', 's'],
    'Sea of Okhotsk': ['Kamchatka', 'c', 'Kuriles', 's', 'Hokkaido', 's', 'Sakhalin', 's', 'Vladivostok', 'c', 'Amur', 'c', ],
    'Sea of Japan': ['Vladivostok', 'c', 'Sakhalin', 's', 'Hokkaido', 's', 'Tokyo', 'c', 'Osaka', 'c', 'Kyushu', 's', 'Yellow Sea', 'w', 'Korea', 'c', 'Harbin', 'c'],
    'Yellow Sea': ['Sea of Japan', 'w', 'Kyushu', 's', 'East China Sea', 'w', 'Suchow', 'c', 'Tsingtao', 'c', 'Peiping', 'c', 'Jehol', 'c', 'Mukden', 'c', 'Korea', 'c', ],
    'East China Sea': ['Yellow Sea', 'w', 'Kyushu', 's', 'Kyushu Sea', 'w', 'Okinawa', 's', 'Marianas Sea', 'w', 'Formosa', 'c', 'South China Sea', 'w', 'Fukien', 'c', 'Nanking', 'c', 'Suchow', 'c', ],
    'Kyushu Sea': ['Kyushu', 's', 'Osaka', 'c', 'Tokyo', 'c', 'Northwest Pacific Ocean', 'w', 'North Central Pacific Ocean', 'w', 'Caroline Sea', 'w', 'Iwo Jima', 's', 'Marianas Sea', 'w', 'Okinawa', 's', 'East China Sea', 'w', ],
    'North Central Pacific Ocean': ['Northwest Pacific Ocean', 'w', 'North Pacific Ocean', 'w', 'Midway', 's', 'Hawaiian Sea', 'w', 'Johnston Atoll', 's', 'Central Pacific Ocean', 'w', 'Wake', 's', 'Caroline Sea', 'w', 'Kyushu Sea', 'w', ],
    'Hawaiian Sea': ['North Pacific Ocean', 'w', 'Northeast Pacific Ocean', 'w', 'Cabrillo Ocean', 'w', 'Palmyra Sea', 'w', 'Hawaii', 's', 'Central Pacific Ocean', 'w', 'Johnston Atoll', 's', 'North Central Pacific Ocean', 'w', 'Midway', 's', ],
    'Palmyra Sea': ['Hawaii', 's', 'Hawaiian Sea', 'w', 'Cabrillo Ocean', 'w', 'Gulf of California', 'w', 'East Central Pacific Ocean', 'w', 'Christmas', 's', 'South Central Pacific Ocean', 'w', 'Palmyra', 's', 'Central Pacific Ocean', 'w', ],
    'Cabrillo Ocean': ['Los Angeles', 'c', 'Gulf of California', 'w', 'Palmyra Sea', 'w', 'Hawaiian Sea', 'w', 'Northeast Pacific Ocean', 'w', ],
    'Gulf of California': ['Acapulco', 'c', 'Gulf of Panama', 'w', 'East Central Pacific Ocean', 'w', 'Palmyra Sea', 'w', 'Cabrillo Ocean', 'w', ],
    'Gulf of Panama': ['Acapulco', 'c', 'Panama', 's', 'East Pacific Ocean', 'w', 'East Central Pacific Ocean', 'w', 'Gulf of California', 'w', ],
    'East Pacific Ocean': ['Bora Bora', 's', 'East Central Pacific Ocean', 'w', 'Gulf of Panama', 'w', 'Southeast Pacific Ocean', 'w', 'Tahiti', 's', 'Polynesian Sea', 'w'],
    'Gulf of Mexico': ['Panama', 's', 'Mexico City', 'c', 'Houston', 'c', /*'North Atlantic Ocean', 'w', */],
    'South China Sea': ['East China Sea', 'w', 'Formosa', 'c', 'Marianas Sea', 'w', 'Philippine Sea', 'w', 'Manila', 'c', 'Sulu Sea', 'w', 'Gulf of Tonkin', 'w', 'Hainan', 's', 'Canton', 'c', 'Hong Kong', 's', 'Fukien', 'c',],
    'Philippine Sea': ['South China Sea', 'w', 'Marianas Sea', 'w', 'Saipan', 's', 'Caroline Sea', 'w', 'Guam', 's', 'Bismarck Sea', 'w', 'Peleliu', 's', 'Celebes Sea', 'w', 'Mindinao', 'c', 'Visayans Leyte', 's', 'Manila', 'c',],
    'Marianas Sea': ['Okinawa', 's', 'Kyushu Sea', 'w', 'Iwo Jima', 's', 'Caroline Sea', 'w', 'Saipan', 's', 'Philippine Sea', 'w', 'South China Sea', 'w', 'Formosa', 'c', 'East China Sea', 'w'],
    'Caroline Sea': ['Kyushu Sea', 'w', 'North Central Pacific Ocean', 'w', 'Wake', 's', 'Central Pacific Ocean', 'w', 'Kwajalein', 's', 'Melanesian Sea', 'w', 'Truk', 's', 'Bismarck Sea', 'w', 'Guam', 's', 'Philippine Sea', 'w', 'Saipan', 's', 'Marianas Sea', 'w', 'Iwo Jima', 's', ],
    'Central Pacific Ocean': ['North Central Pacific Ocean', 'w', 'Hawaiian Sea', 'w', 'Palmyra Sea', 'w', 'South Central Pacific Ocean', 'w', 'Melanesian Sea', 'w', 'Caroline Sea', 'w', 'Wake', 's', 'Johnston Atoll', 's', 'Hawaii', 's', 'Palmyra', 's', 'Tarawa', 's', 'Kwajalein', 's',],
    'South Central Pacific Ocean': ['Central Pacific Ocean', 'w', 'Palmyra Sea', 'w', 'East Central Pacific Ocean', 'w', 'Polynesian Sea', 'w', 'Santa Cruz Sea', 'w', 'Melanesian Sea', 'w', 'Palmyra', 's', 'Christmas', 's', 'Samoa', 's', 'Ellice Is', 's', 'Tarawa', 's',],
    'East Central Pacific Ocean': ['Palmyra Sea', 'w', 'Gulf of California', 'w', 'Gulf of Panama', 'w', 'East Pacific Ocean', 'w', 'Polynesian Sea', 'w', 'South Central Pacific Ocean', 'w', 'Christmas', 's', 'Bora Bora', 's', ],
    'Polynesian Sea': ['South Central Pacific Ocean', 'w', 'East Central Pacific Ocean', 'w', 'East Pacific Ocean', 'w', 'Southeast Pacific Ocean', 'w', 'Fiji Sea', 'w', 'Santa Cruz Sea', 'w', 'Bora Bora', 's', 'Tahiti', 's', 'Cook Is', 's', 'Fiji', 's', 'Samoa', 's',],
    'Southeast Pacific Ocean': ['Drake Passage', 'w', 'South Pacific Ocean', 'w', 'Fiji Sea', 'w', 'Cook Is', 's', 'Polynesian Sea', 'w', 'Tahiti', 's', 'East Pacific Ocean', 'w',],
    'Drake Passage': ['South Pacific Ocean', 'w', 'Southeast Pacific Ocean', 'w', /* 'South Atlantic Ocean', 'w', */],
    'South Pacific Ocean': ['Drake Passage', 'w', 'Southeast Pacific Ocean', 'w', 'Fiji Sea', 'w', 'Southwest Pacific Ocean', 'w', ],
    'Southwest Pacific Ocean': ['South Pacific Ocean', 'w', 'Fiji Sea', 'w', 'New Zealand', 'c', 'Tasman Sea', 'w', 'Tasmania', 's', ],
    'Tasman Sea': ['Southwest Pacific Ocean', 'w', 'New Zealand', 'c', 'Fiji Sea', 'w', 'Santa Cruz Sea', 'w', 'Noumea', 's', 'Coral Sea', 'w', 'Queensland', 'c', 'Sydney', 'c', 'Tasmania', 's', ],
    'Coral Sea': ['Arafura Sea', 'w', 'Papua', 'c', 'Rabaul', 's', 'Melanesian Sea', 'w', 'Guadalcanal', 's', 'Santa Cruz Sea', 'w', 'Noumea', 's', 'Tasman Sea', 'w', 'Queensland', 'c',],
    'Fiji Sea': ['Tasman Sea', 'w', 'Santa Cruz Sea', 'w', 'Fiji', 's', 'Polynesian Sea', 'w', 'Cook Is', 's', 'Southeast Pacific Ocean', 'w', 'South Pacific Ocean', 'w', 'Southwest Pacific Ocean', 'w', 'New Zealand', 'c',],
    'Santa Cruz Sea': ['Tasman Sea', 'w', 'Coral Sea', 'w', 'Melanesian Sea', 'w', 'South Central Pacific Ocean', 'w', 'Polynesian Sea', 'w', 'Fiji Sea', 'w', 'Noumea', 's', 'Guadalcanal', 's', 'Ellice Is', 's', 'Samoa', 's', 'Fiji', 's',],
    'Melanesian Sea': ['Central Pacific Ocean', 'w', 'South Central Pacific Ocean', 'w', 'Santa Cruz Sea', 'w', 'Coral Sea', 'w', 'Bismarck Sea', 'w', 'Caroline Sea', 'w', 'Truk', 's', 'Kwajalein', 's', 'Tarawa', 's', 'Ellice Is', 's', 'Guadalcanal', 's', 'Rabaul', 's',],
    'Bismarck Sea': ['Celebes Sea', 'w', 'Philippine Sea', 'w', 'Caroline Sea', 'w', 'Melanesian Sea', 'w', 'Peleliu', 's', 'Guam', 's', 'Truk', 's', 'Rabaul', 's', 'Papua', 'c', 'Hollandia', 'c',],
    'Celebes Sea': ['Mindinao', 'c', 'Philippine Sea', 'w', 'Peleliu', 's', 'Bismarck Sea', 'w', 'Hollandia', 'c', 'Arafura Sea', 'w', 'Celebes', 'c', 'Java Sea', 'w', 'Balikpapan', 'c', 'Sarawak', 'c', 'Sulu Sea', 'w'],
    'Arafura Sea': ['Timor Sea', 'w', 'Java Sea', 'w', 'Celebes', 'c', 'Celebes Sea', 'w', 'Hollandia', 'c', 'Papua', 'c', 'Coral Sea', 'w', ],
    'Timor Sea': ['West Australia', 'c', 'Wharton Sea', 'w', 'Java', 'c', 'Lesser Sundas Timor', 's', 'Java Sea', 'w', 'Arafura Sea', 'w',],
    'Java Sea': ['Balikpapan', 'c', 'Celebes Sea', 'w', 'Celebes', 'c', 'Arafura Sea', 'w', 'Timor Sea', 'w', 'Lesser Sundas Timor', 's', 'Java', 'c', 'Batavia', 's', 'Sumatra', 'i', 'Singapore', 's', 'Gulf of Siam', 'w',],
    'Sulu Sea': ['Manila', 'c', 'Visayans Leyte', 's', 'Mindinao', 'c', 'Celebes Sea', 'w', 'Sarawak', 'c', 'Gulf of Siam', 'w', 'Gulf of Tonkin', 'w', 'South China Sea', 'w',],
    'Gulf of Tonkin': ['South China Sea', 'w', 'Sulu Sea', 'w', 'Gulf of Siam', 'w', 'Saigon', 'c', 'Hanoi', 'c', 'Kwangsi', 'c', 'Hainan', 's'],
    'Gulf of Siam': ['Gulf of Tonkin', 'w', 'Sulu Sea', 'w', 'Sarawak', 'c', 'Balikpapan', 'c', 'Java Sea', 'w', 'Singapore', 's', 'Malacca', 'c', 'Kra', 'c', 'Bangkok', 'c', 'Saigon', 'c'],
    'Wharton Sea': ['Timor Sea', 'w', 'West Australia', 'c', 'South Australian Ocean', 'w', 'South Indian Ocean', 'w', 'Southeast Indian Ocean', 'w', 'Sumatra', 'c', 'Batavia', 's', 'Java', 'c',],
    'South Australian Ocean': ['South Indian Ocean', 'w', 'Wharton Sea', 'w', 'West Australia', 'c', 'South Australia', 'c', 'Sydney', 'c', 'Tasmania', 's',],
    'South Indian Ocean': ['Southeast Indian Ocean', 'w', 'Wharton Sea', 'w', 'South Australian Ocean', 'w', /* 'East Indian Ocean', 'w', */],
    'Southeast Indian Ocean': ['Bay of Bengal', 'w', 'Andaman Sea', 'w', 'Sumatra', 'c', 'Wharton Sea', 'w', 'South Indian Ocean', 'w', /* 'East Indian Ocean', 'w', */],
    'Andaman Sea': ['Southeast Indian Ocean', 'w', 'Bay of Bengal', 'w', 'Burma', 'c', 'Bangkok', 'i', 'Kra', 'i', 'Malacca', 'i', 'Singapore', 's', 'Sumatra', 'c',],
    'Bay of Bengal': ['Southeast Indian Ocean', 'w', 'Andaman Sea', 'w', 'Burma', 'c', 'Dacca', 'c', 'Calcutta', 'c', 'Orissa', 'c', 'Ceylon', 's', /* 'East Indian Ocean', 'w', */],
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
            console.log(name + " Threw an error: " + error)
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
            if (REGIONS.findIndex(r => r.name === CONNECTIONS[name][i]) === -1) {
                console.log("couldn't find " + name)}
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