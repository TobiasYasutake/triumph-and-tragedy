/* TODO
Other check phases?
Remove blocks in negotiation

QA testing:
3 way combat
USA entry
Retreats after supply check seems hoaky
*/

"use strict"

const { REGIONS, COLONIES, COUNTRIES, BORDERS, BORDER_TYPES } = require("./data")
const { ACARDS, ICARDS, SCIENCE } = require("./card")

const AXIS = 0
const WEST = 1
const USSR = 2

const TURNORDER = [ null, 
	[AXIS,USSR,WEST], [AXIS,WEST,USSR],
	[WEST,AXIS,USSR], [WEST,USSR,AXIS],
	[USSR,WEST,AXIS], [USSR,AXIS,WEST]
]

const FACTIONS = [
	"Axis", 
	"West", 
	"USSR"
]

const CAPITALS = [
	"Berlin", 
	"London", 
	"Moscow"
]

const SUPPLY_POINTS = [
	["Berlin", "Ruhr", "Rome"], 
	["London", "Paris", "Delhi", "Washington"], 
	["Moscow", "Leningrad", "Baku"]
]

const GREATPOWERS = [
	"Germany",
	"Britain",
	"USSR"
]

const MAJORPOWERS = [
	"Italy",
	"France",
	"USA",
]

const NATIONS = [
	GREATPOWERS[0],
	MAJORPOWERS[0],
	GREATPOWERS[1],
	MAJORPOWERS[1],
	MAJORPOWERS[2],
	GREATPOWERS[2],
	"NeutralFort"
]

const TYPE = [
	"Fort",
	"Air",
	"Carrier", 
	"Sub",
	"Fleet",
	"Tank",
	"Infantry",
]

const HANDSIZE = [7,8,6]

const FIREPOWER = [ //A N G S
	[2,3,4,3],
	[3,1,1,1],
	[2,2,1,2],
	[0,1,0,1],
	[1,3,1,2],
	[0,0,2,0],
	[1,1,3,0],
]

const CLASS = [ //A N G S
	2, 0, 1, 3, 1, 2, 2,
]

const CLASSNAME = [
	'Air',
	'Naval',
	'Ground',
	'Sub',
	'Convoys'
]

exports.scenarios = [
	"Full game",
	"Short game"
]

exports.roles = [
	"Axis",
	"West",
	"USSR"
]

//PHASE LOGIC
function end_setup(){
	log(`${game.active} has finished setup.`)
	if (game.activeNum < 2) {
		game.state = "setup"
		set_active(game.activeNum += 1)
	} else {
		log('Setup finished. Starting game.')
		log_br()
		determine_control(0)
		new_year()	
	}
}

function new_year(){
	game.phase = "new year"
	++game.turn
	if (game.turn <= 10) log('.h1 Turn ' + game.turn)
	check_blockades_still_in_effect()
	update_production()
	if (game.turn >= 11) {victory_check_hegemony(); return}
	log_br()
	victory_check()
	reshuffle(0)
	reshuffle(1)
	for (let p = 0; p <= 2; ++p){
		if (game.peace_eligible[p] === 1){
			let draw = random_bigint(game.peace_dividend_bag.length)
			game.peace_dividend[p].push(game.peace_dividend_bag[draw])
			array_remove(game.peace_dividend_bag, draw)
			log(`${FACTIONS[p]} drew a peace dividend.`)
		}
		if (game.relationship[p].length === 0 && !battling_neutrals(p)) game.peace_eligible[p] = 1
	}
	const roll = roll_d6()
	game.turn_order = TURNORDER[roll]
	log_br()
	log(`A ${roll} was rolled for initiative.`)
	
	if (game.turn >= 6 && game.turn <= 9 && game.influence[4] !== 10) {
		influence_country(4, 1)
		if (game.influence[4] === 13) usa_satellite()
	}
	game.usa_reinforcements = +1

	game.phase = 'production'
	log(".h2 Production Phase")
	set_active(game.turn_order[0])
	determine_control(game.activeNum)
	//log_br()
	log(`.h3 ${game.active} begins production`)
	game.count = determine_production(game.activeNum)

	if (game.activeNum === 1 && game.usa_satellite && game.usa_reinforcements > 0 && game.usa_reinforcements < 4) {
		game.state = 'production_usa'
		game.usa_reinforcements_types = [1,3,5,6]
	} else 
		game.state = 'production'

}

function end_production(){
	clear_undo()
	if (game.draw[0].length !== 0 || game.draw[1].length !== 0){
		if (game.draw[0].length !== 0) log(`Drew ${game.draw[0].length} action cards`)
		if (game.draw[1].length !== 0) log(`Drew ${game.draw[1].length} investment cards`)
		draw()
		game.state = "draw_production"
	} else {
		game.block_moved = []
		if (is_last_in_turn_order()) {
			set_next()
			log_br() 
			log(".h2 Government Phase")
			log(`${FACTIONS[game.activeNum]} begins play`)
			game.phase = "government"
			game.state = "government"
			game.factory_increase = [0,0,0]
			game.blockade = []
			game.blockade_transafrica = []
			game.blockaded_pop = [0,0,0]
			game.blockaded_res = [0,0,0]
		} else {
			set_next()
			determine_control(game.activeNum)
			log_br()
			log(`.h3 ${game.active} begins production`)
			game.count = determine_production(game.activeNum)

			if (game.activeNum === 1 && game.usa_satellite && game.usa_reinforcements > 0 && game.usa_reinforcements < 4) {
				game.state = 'production_usa'
				game.usa_reinforcements_types = [1,3,5,6]
			} else 
				game.state = 'production'
		}
	}
}

function handsize_check(){
	for (let i = 0; i < 3; i++) {
		let hand = game.hand[game.turn_order[i]]
		if (hand[0].length + hand[1].length + (game.vault[game.turn_order[i]].length/2) > HANDSIZE[game.turn_order[i]]) {
			clear_undo()
			set_active(game.turn_order[i])
			game.state = "government_discard"
			log(`${game.active} has too many cards in hand and must discard`)
			return
		}
	}
	resolve_diplomacy()
}

function resolve_diplomacy(){
	log_br()
	log("Resolving diplomacy:")
	log_br()
	for (let i = 0; i < 3; i++){ //add influence
		log(`${FACTIONS[i]} influence:`)
		for (let j = game.diplomacy[i].length -1; j >= 0; j--){
			let card = ACARDS[Math.abs(game.diplomacy[i][j])]
			let country = game.diplomacy[i][j] > 0? COUNTRIES.findIndex(c => c.name === card.left) : COUNTRIES.findIndex(c => c.name === card.right)
			influence_country(country, i)
			game.discard[0].push(Math.abs(game.diplomacy[i].splice(j,1)[0]))
			log(COUNTRIES[country].name)
		}
		log_br()
	}
	for (let i = 0; i < game.influence.length; i++){ //gain control
		if (game.influence[i]%10 >= 3) {
			if (COUNTRIES[i].name === "USA"){
				if (Math.abs(game.influence[i]/10) !== 1) {
					game.influence[i] = (Math.abs(game.influence[i]/10) + 3)
				} else usa_satellite()
			} else {
				game.influence[i] -= game.influence[i]%10
				log(`The ${FACTIONS[game.influence[i]/10]} have gained control of ${COUNTRIES[i].name}.`)
				game.gained_control[game.influence[i]/10].push(i)
			}
		}
	}
	update_production()
	check_gained_control()
}

function check_gained_control() {
	clear_undo()
	if (game.gained_control[0].length === 0 && game.gained_control[1].length === 0 && game.gained_control[2].length === 0 ) {
		if (game.phase === "government") next_season()
		else {set_active(game.turn_order_command[0]); end_movement_phase()}
	} else {
		game.state = "gain_control"
		for (let i = 0; i < 3; i++){
			if (game.gained_control[game.turn_order[i]].length !== 0) {
				set_active(game.turn_order[i])
				return
			}
		}
	}
}

function next_season(skip_supply){ //Spring Summer blockade Fall Winter
	if (!skip_supply) process_supply()
	if (game.must_retreat && game.must_retreat.length > 0) {
		set_next_retreat()
	}
	else {
		set_active(game.turn_order[0])
		log_br()
		switch (game.phase){
		case "government": game.phase = "Spring"; game.state = "command"; log(".h2 Spring"); break
		case "Spring": game.phase = "Summer"; game.state = "command"; log(".h2 Summer"); break
		case "Summer": start_blockades(); break
		case "blockade": game.phase = "Fall"; game.state = "command"; log(".h2 Fall"); break
		case "Fall": game.phase = "Winter"; set_active(2); game.state = "command"; log(".h2 Winter"); break
		case "Winter": new_year()
		}
	}
}

function start_player_turns(){
	determine_turn_order_command()
	if (game.turn_order_command.length === 0) {
		log("Everyone has passed.")
		next_season()
	}
	else if (game.state !== "choose_initiative") {
		next_player_turn()
	}
}

function end_movement_phase(){
	set_active(game.turn_order_command[0])
	//VoN draw:
	if (game.draw[0].length > 0) {
		game.state = "draw_von"
		draw()
		//Needs work: some sort of function to reshuffle cards and reduce draw if there isn't enough action cards
		set_next()
		return
	}
	//resolve battle (look for game.battle for land, and required combat for sea/required)
	//can also have a battle where escaped sub! need to add that in
	let battles = false
	game.block_moved = []
	game.border_count = []
	for (let i = 0; i < game.battle.length; i+=2) {
		if (game.battle[i+1].includes(game.activeNum)) {
			battles = true; break
		} 
	}
	if (battles || Object.keys(game.battle_groups).length !== 0){
		determine_control(game.activeNum)
		determine_raids()
		game.state = "choose_battle"
	} else set_next_movement()
}

function end_battle_phase() {
	determine_control(game.activeNum)
	conquest_influence()
	set_next_movement()
}

function determine_raids(){
	//for all land battles, needs to determine if a battle is a raid, and then saves it to game.battle_raids
	checkbattles: for (let i = 0; i < game.battle.length; i+=2) {
		const r = game.battle[i]
		const d =  game.battle[i+1][0]
		for (let j = 0; j < game.block_location.length; j++) {
			if (game.block_location[j] === r && faction_of_block(j) !== d && !is_ans(j)) continue checkbattles
		}
		set_add(game.battle_raid, r)
	}
}

// TURN ORDER
function set_active(f) {
	if (game.activeNum !== f) clear_undo()
	game.activeNum = f
	game.active = FACTIONS[f]
}

function three_consecutive_passes(){
	if (game.pass_count === 3) {
		game.pass_count = 0
		return true
	}
	return false
}

function is_last_in_turn_order(){
	return game.activeNum === game.turn_order[2]
}

function determine_turn_order_command(){
	let order = []
	for (let i = 0; i <= 2; ++i){
		if (game.command_card[i]) {
			if (game.command_card[i] > 0) {
				log(`${FACTIONS[i]} played action card ${game.command_card[i]}.`)
				order.push({
					"faction": i, 
					"initiative": ACARDS[game.command_card[i]].initiative, 
					"season": ACARDS[game.command_card[i]].season
				})
			} else
			{
				log(`${FACTIONS[i]} played investment card ${game.command_card[i]*-1} as a bluff!`)
				game.discard[1].push(game.command_card[i]*-1)
				game.command_card[i] = null
			}
		}
	}
	order.sort((a, b) => {
		if (a.initiative > b.initiative) return 1
		if (a.initiative < b.initiative) return -1
		set_add(game.tied_turn_order, a.faction)
		set_add(game.tied_turn_order, b.faction)
		if (a.season === game.phase) {set_active(a.faction); game.state = "choose_initiative"}
		else if (b.season === game.phase) {set_active(b.faction); game.state = "choose_initiative"}
		//what happens when both are out of season? Answer: two emergency commands, and it doesn't matter
		return 0
	})
	if (game.tied_turn_order.length !== 0 && game.state !== "choose_initiative") game.tied_turn_order = []
	order.forEach(a => {
		if (set_has(game.tied_turn_order, a.faction)) game.turn_order_command.push(null)
		else game.turn_order_command.push(a.faction)}
	)	
}

function set_next(){
	clear_undo()
	let index = game.turn_order.indexOf(game.activeNum)
	set_active(game.turn_order[(index + 1)%3])
}

function set_next_command(){
	set_next()
	if (three_consecutive_passes()){
		start_player_turns()
	} else if (game.command_card[game.activeNum] || game.phase === "Winter"){
		game.pass_count += 1
		set_next_command()
	}
}

function set_next_battle(){
	clear_undo()
	//based on the participating blocks, the attacker, the defender(s), tech, surprise, and blocks moved, figure out who's turn it is
	//in a three way, the attacker determines initiative ties. Screw that. It happens in turn order.
	
	if (check_end_battle()) {post_battle_teardown(); return}
	
	let unused_blocks = game.active_battle_blocks.filter(x => !(set_has(game.block_moved, x)))
	if (unused_blocks.length === 0) {
		if (REGIONS[game.active_battle].type === 'sea') {
			game.block_moved = []
			determine_retreats(game.active_battle, false) //shoooould only catch airplanes that took an action
			set_next_retreat()
		}
		else post_battle_teardown()
	}
	else {
		let type = lowest_type(unused_blocks)
		let fs = factions_with_type(unused_blocks, type)
		fs.sort((a, b) => { //+1 if defender, +2 if ff
			let aNum = 0 + (game.attacker !== a) + (has_ff(a, type) ? 2 : 0)
			let bNum = 0 + (game.attacker !== b) + (has_ff(b, type) ? 2 : 0)
			return bNum - aNum
		})
		if (fs[0] === -1) {
			neutral_firing_solution()
		} else {
			game.state = 'battle'
			set_active(fs[0])
		}
	}
}

function set_next_movement(){
	game.discard[0].push(game.command_card[game.activeNum])
	game.command_card[game.activeNum] = null
	game.turn_order_command.shift()
	game.surprise = []
	game.block_moved = []
	game.battle_groups = {}
	game.border_count = []
	game.aggressed_from = []
	game.aggression_met = []
	game.battle_required = []
	game.battle_fought = []
	game.battle_raid = []
	game.invasion_blocks = []
	game.raid_retreat_blocks = []
	game.cannot_von = []
	next_player_turn()
}

function next_player_turn(){
	clear_undo()
	if (game.turn_order_command.length === 0) {
		next_season()
	} else {
		set_active(game.turn_order_command[0])
		log_br()
		log(`${game.active} has started movement`)
		let card = ACARDS[game.command_card[game.activeNum]]
		if (card.season === game.phase || game.phase === "Winter") {
			game.count = card.value
			game.emergency = 0
			game.cannot_von = []
			if (game.activeNum !== 0 && game.usa_satellite === 0) game.cannot_von = [4] //no violating America (unless Axis)
		} else {
			game.activeNum === 0? game.count = 4 : game.count = 2
			log("emergency movement")
			game.emergency = 1
		}
		determine_control(game.activeNum)

		//create sub-hunting battle groups
		for (let i = 0; i < game.block_location.length; i++) {
			let r = game.block_location[i]; if (r === null) continue
			if (REGIONS[r].type !== 'sea' || faction_of_block(i) !== game.activeNum || !contains_hiding_enemy_sub(r, game.activeNum)) break
			if (game.battle_groups[r]) game.battle_groups[r].push(i)
			else game.battle_groups[r] = [i]
		}
		game.state = "movement"
	}
}

//USA
function usa_violation(){
	log(`The Axis have violated the USA! They are poking the Eagle! They know not what they do!`)
	usa_satellite()
	game.usa_reinforcements = 1
	set_add(game.gained_control[1], 4)
	game.usa_reinforcements_types = [1,3,5,6]
}

function usa_satellite(){
	game.usa_satellite = 1
	game.influence[4] = 10
	const w = REGIONS.findIndex(x => x.name === "Washington")
	const ny = REGIONS.findIndex(x => x.name === "New York")
	game.control[w] = 1
	game.control[ny] = 1
	let index = create_cadre(28 , w)
	game.block_steps[index] = 4
	index = create_cadre(28 , ny)
	game.block_steps[index] = 2
	log(`The West have gained control of The USA. The Arsenal of Democracy is complete.`)
}

//END OF GAME AND VICTORY POINTS

function minus_war_vps(faction){
	let result = 0
	if (game.relationship[faction].length !== 0) {
		if (game.relationship[faction][0] === -1) result -= 1
		if (game.relationship[faction][1] === -1) result -= 1
	}
	return result
}

function victory_check(){// if someone has 25 vps (remember to count hidden vps and atomic bombs in vault)
	const vps = captured_capitals()
	const public_points = []
	for (let i = 0; i < 3; i++) {
		vps[i] *= 2 //capitals are worth 2 points
		vps[i] += determine_production(i)
		vps[i] -= minus_war_vps(i)
		public_points[i] = vps[i]
		for (let div of game.peace_dividend[i])
			vps[i] += div
		vps[i] += game.atomic[i].length
		if (vps[i] >= 25) {goto_game_over(FACTIONS[i], `The ${FACTIONS[i]} have ${vps[i]} victory points and have won an Economic Victory!`); return}
	}

	for (let i = 0; i < 3; i++) {
		log(`The ${FACTIONS[i]} have ${public_points[i]} public victory points and ${game.peace_dividend[i].length} dividend tokens`)
	}
}

function victory_check_atomic(f, b){
	return game.atomic[f].length === 4 && game.block_type[b] === 1 && is_rival_capital(game.block_location[b], f)
}

function victory_check_hegemony(){
	log ("the war is over: whoever has the most points wins")
	const vps = captured_capitals()
	for (let i = 0; i < 3; i++) {
		vps[i] *= 2 //capitals are worth 2 points
		vps[i] += determine_production(i, true)
		vps[i] -= minus_war_vps(i)
		for (let div of game.peace_dividend[i])
			vps[i] += div
		vps[i] += game.atomic[i].length
		log (`The ${FACTIONS[i]} have ${vps[i]} victory points`)
	}
	const highest = Math.max(...vps)
	let factions_with_highest = 0
	for (let i = 0; i < 3; i++) {
		if (vps[i] === highest) factions_with_highest += 1
	}
	if (factions_with_highest === 1) {
		const winner = vps.indexOf(highest)
		goto_game_over(FACTIONS[winner], `The ${FACTIONS[winner]} have achieved Economic Hegemony!`)
	} else if (factions_with_highest === 2) {
		const loser = vps.findIndex(x => x !== highest)
		const w1 = FACTIONS[(loser+1)%3]
		const w2 = FACTIONS[(loser+2)%3]
		goto_game_over(`${w1} ${w2} tie`, `The ${w1} and ${w2} both tie for victory!`)
	} else if (factions_with_highest === 3) {
		goto_game_over('Three way tie', `The game ends in a three way tie!`)
	} else throw new Error('error in victory_check_hegemony()')
}

//CARD AND DICE FUNCTIONS
function reshuffle(type){ //0 or 1
	game.deck[type].push(...game.discard[type])
	game.discard[type] = []
	shuffle_bigint(game.deck[type])
}

function make_deck(){
	let cards = []
	for (let i = 1; i<=55; i++){
		cards.push(i)
	}
	shuffle_bigint(cards)
	return cards
}

function draw(){
	for (let i = 0; i < game.draw[0].length; i++){
		if (game.draw[0][i] === -1){
			game.draw[0][i] = game.deck[0].pop()
		}
	}
	for (let i = 0; i < game.draw[1].length; i++){
		if (game.draw[1][i] === -1){
			game.draw[1][i] = game.deck[1].pop()
		}
	}
}

function roll_d6() {
	return random_bigint(6) + 1
}

//BLOCK CHECK
function is_ans(b) {//block
	switch (game.block_type[b]) {
	case 0: return 0
	case 1: case 2: case 3: case 4: return 1
	case 5: case 6: return 0
	}
}
function is_inf_or_tank(b) {//not a fort
	if(game.block_type[b] === 5 || game.block_type[b] === 6) return 1
	return 0
}

function has_blocks_anywhere(f){
	for (let i = 0; i < game.block_nation.length; i++){
		if (faction_of_block(i) === f) return true
	}
	return false
}
function forts_everywhere(nation){
	if (MAJORPOWERS.includes(nation)){
		let c = [nation]
		c.push(...COLONIES[nation])
		for (let r = 0; r < REGIONS.length; r++){
			if (REGIONS[r].type === "sea") continue
			if (is_fort_in_region(r)) continue
			if (!set_has(c, REGIONS[r].country)) continue
			if (who_controls_region(r) !== faction_of_power(nation)) continue
			return false
		}
		return true
	} else {
		//great power and check every region OTHER than the Minor nation/colonies
		let n = faction_of_power(nation)
		let cs = faction_major_powers(n)
		for (let c = cs.length-1; c >= 0; c--){
			cs.push(...COLONIES[cs[c]])
		}
		for (let r = 0; r < REGIONS.length; r++){
			if (REGIONS[r].type === "sea") continue
			if (is_fort_in_region(r)) continue
			if (cs.indexOf(REGIONS[r].country) !== -1) continue
			if (who_controls_region(r) !== n) continue
			return false
		}
		return true
	}
}
function is_fort_in_region(region){
	for (let i = 0; i < game.block_location.length; i++){
		if (game.block_location[i] === region && game.block_type[i] === 0) return true
	}
	return false
}
function is_max_steps(b){
	let n = game.block_nation[b]
	if (n === 0 || n === 2 || n === 4 ) return game.block_steps[b] === 4
	return game.block_steps[b] === 3
}
function highest_step(blocks){
	if (blocks.length === 0) return -1
	let hf = 0 //highest found
	const list = []
	for (const block of blocks) hf = hf < game.block_steps[block] ? game.block_steps[block] : hf
	for (const block of blocks) if (game.block_steps[block] === hf) list.push(block)
	return hf
}
function number_of_blocks_in_region(region, block) {
	let block_number = 0
	for (let i = 0; i < game.block_location.length; i++){
		if (game.block_location[i] === region &&
			(!block || block !== i) //for the ANS empty check, should not count itself
		) ++block_number
	}
	return block_number
}
function factions_in_region(region) {
	let factions = []
	for (let i = 0; i < 3; i++) {
		if (contains_faction(region, i)) factions.push(i)
	}
	return factions
}
function factions_in_group(blocks){
	let factions = []
	for (const block of blocks) {
		set_add(factions, faction_of_block(block))
	}
	return factions
}
function factions_with_type(blocks, type){
	let factions = []
	for (const block of blocks) {
		if (game.block_type[block] === type) {
			set_add(factions, faction_of_block(block))
		}
	}
	return factions
}

function contains_type(blocks, type){
	for (let b of blocks) if (game.block_type[b] === type) return true
	return false
}
function lowest_type(blocks){
	if (blocks.length === 0) return -1
	let lf = 7 //lowest found
	for (const block of blocks) lf = lf > game.block_type[block] ? game.block_type[block] : lf
	return lf
}

function contains_rival_blocks(r, f) { //enemy is used if you need to be enemies with the block to 'count'
	for (let i = 0; i < game.block_location.length; i++) {
		if (game.block_location[i] === r && !hiding_sub(i)){
			const fob = faction_of_block(i)
			if (fob === f) continue
			if (fob !== -1) return true
			//we are dealing with a minor block. Return true UNLESS the minor aggressor is enemies with the faction
			const ma = game.minor_aggressor[COUNTRIES.findIndex(x => x.name === REGIONS[r].country)]
			if (!are_enemies(f, ma)) return true
		}
	}

	//can become armed minor?
	if (REGIONS[r].country && (REGIONS[r].pop !== 0 || REGIONS[r].town) && 
		is_neutral(REGIONS[r].country) &&
		!is_armed_minor(REGIONS[r].country)) return true
	return false
}

function contains_enemy_blocks(r, f) { //enemy is used if you need to be enemies with the block to 'count'
	for (let i = 0; i < game.block_location.length; i++) {
		if (game.block_location[i] === r && !hiding_sub(i)){
			const fob = faction_of_block(i)
			if (fob === f) continue
			if (fob !== -1){//this function is used for retreats, so all neutral blocks are 'enemies.' you need to end your MOVE in the MOVEMENT phase for intervention
				//const ma = game.minor_aggressor[COUNTRIES.findIndex(x => x.name === REGIONS[r].country)]
				//if (!are_enemies(f, ma)) 
				return true}
			else if (are_enemies(f, fob)) return true
		}
	}

	//can become armed minor?
	if (REGIONS[r].country && (REGIONS[r].pop !== 0 || REGIONS[r].town) && 
		is_neutral(REGIONS[r].country) &&
		!is_armed_minor(REGIONS[r].country)) return true
	return false
}

function contains_faction(r, f) {
	for (let i = 0; i < game.block_location.length; i++) {
		if (game.block_location[i] === r && faction_of_block(i) === f) return true
	}
	return false
}
function hiding_sub(b){
	if (game.block_type[b] !== 3) return false
	for (let i = 0; i < game.sub_hiding.length; i++) if (game.sub_hiding[i] === b) return true
	return false
}
function contains_hiding_enemy_sub(r, f) { //only checks for escaped subs
	for (let block of game.sub_hiding) {
		if (game.block_location[block] === r && are_enemies(faction_of_block(block), f)) return true
	}
	return false
}
function coexisting_blocks(r) { //returns if more than one FACTION is in the same region
	let faction
	for (let i = 0; i < game.block_location.length; i++) {
		if (game.block_location[i] === r) {
			let f = faction_of_block(i)
			if (faction === undefined) faction = f
			else if (faction !== f) return true
		}
	}
	
	//can become armed minor?
	if (REGIONS[r].country && (REGIONS[r].pop !== 0 || REGIONS[r].town) && 
		is_neutral(REGIONS[r].country) &&
		!is_armed_minor(REGIONS[r].country)) return true
	return false
}
function reserve_empty(reserve){
	return game.reserves[reserve] === 0
}
function faction_of_block(b){
	if (b === null) return false
	switch (game.block_nation[b]){
	case -1: case 6: return -1
	case 0: case 1: return 0
	case 2: case 3: case 4: return 1
	case 5: return 2
	default: return false
	}
}

function battling_neutrals(f) {
	for (let battle of game.battle) {
		if (battle[0] === -1 && battle.includes(f)) return true
	}
	return false
}

//BLOCK MANIPULATION
function block_reduce(b) { //returns true if the block died
	if (game.block_steps[b] > 0) {
		game.block_steps[b] -= 1
		if (game.block_steps[b] === 0) {remove_block(b); return true}
		return false
	}
}
function reserve_reduce(reserve){
	game.reserves[reserve] -= 1
}
function reserve_add(b){
	game.reserves[(game.block_nation[b]*7) + (game.block_type[b])] += 1
}
function create_cadre(reserve, r){
	let index = game.block_steps.indexOf(0) //find first dead block
	let r
	if(index === -1){
		game.block_nation.push(Math.floor(reserve/7))
		game.block_location.push(r)
		game.block_steps.push(1)
		game.block_type.push(reserve%7)
		r = game.block_location.length -1
	}else{
		game.block_nation[index] = Math.floor(reserve/7)
		game.block_location[index] = r
		game.block_steps[index] = 1
		game.block_type[index] = reserve%7
		r = index
	}
	reserve_reduce(reserve)
	return r
}
function convert_neutral_fort(b, reserve){
	if (game.block_nation[b] !== 6) throw new Error('Trying to convert a non-neutral block!')
	game.reserves[35] += 1
	reserve_reduce(reserve)
	game.block_nation[b] = Math.floor(reserve/7)
	game.block_type[b] = reserve&7
	//if supplanting a neutral fort, the new owner becomes the 'oldest' in the region
	let r = game.block_location[b]
	let battle = map_get(game.battle, r, undefined)
	if (battle && battle[0] === -1) {
		array_remove_item(map_get(game.battle, game.block_location[b]), game.activeNum)
		battle[0] = game.activeNum
		if (battle.length === 1) map_remove(game.battle, r)
		else map_set(game.battle, r, battle)
	}
}

function remove_block(b){
	reserve_add(b)
	const r = game.block_location[b]
	game.block_nation[b] = null
	game.block_location[b] = null
	game.block_steps[b] = 0
	game.block_type[b] = null
	set_delete(game.active_battle_blocks, b)
	set_delete(game.block_moved, b)
	//array_remove_item(game.may_retreat, block)
	//array_remove_item(game.must_retreat, block)
	set_delete(game.sub_hiding, b)
	set_delete(game.invasion_blocks, b)
	set_delete(game.raid_retreat_blocks, b)
	for (const group in game.battle_groups) {
		array_remove_item(game.battle_groups[group], b)
	}
	update_battle(r)
}

// BORDER CHECK 
function border_type(r1, r2) {
	return BORDER_TYPES[r1][BORDERS[r1].indexOf(r2)]
}
function border_limit(r1, r2) {
	switch (border_type(r1, r2)){
	case 'p': return 3
	case 'f': 
	case 'r': return 2
	case 's': 
	case 'm': 
	case 'c': return 1
	case 'w': return 100
	}
}
function get_border_id(r1, r2){
	return (r1 < r2) ? r1*1000+r2 : r2*1000+r1
}
function shares_sea(r1, r2) {
	const seas = []
	for (let b of BORDERS[r1]) if (REGIONS[b].type === 'sea') seas.push(b)
	for (let b of BORDERS[r2]) if (seas.indexOf(b) !== -1) return true
	return false
}
function is_coastal_region(r){
	if (REGIONS[r].type === "sea") return false
	for (let bt of BORDER_TYPES[r]){
		if (bt === "c" || bt === "s") return true
	}
	return false
}

//TRADE AND PRODUCTION
function update_production() {
	let pop = [0,0,0]
	let res = [0,0,0]
	let bpop = [0,0,0]
	let bres = [0,0,0]
	for (let i = 0; i < REGIONS.length; i++) {
		let r = REGIONS[i]
		if (r.type === 'sea' || (r.pop === 0 && r.res === 0)) continue
		let owner = trade_partner(i)
		if (owner === -1) continue
		pop[owner] += r.pop
		res[owner] += r.res
		if (game.blockade.indexOf(i) !== -1){
			bpop[owner] += r.pop
			bres[owner] += r.res
		}
		if (game.blockade_transafrica.indexOf(i) !== -1){
			bres[owner] += r.res
			if (r.tres) bres[owner] -= r.tres
		}
	}
	game.pop = pop
	game.res = res
	game.blockaded_pop = bpop
	game.blockaded_res = bres
}

function get_trade_network(f, trans_african){
	const cap = REGIONS.findIndex(x => x.name === CAPITALS[f])
	if (game.control[cap] !== f) return []
	let network = [cap]
	let checked = []

	function check_space(space, type) {
		set_add(checked, space)
		for (let adj of BORDERS[space]) {
			if (set_has(checked, adj)) continue
			if (type === 'sea' && !trans_african && ((adj === 133 && space === 134) || (adj === 134 && space === 133))) continue
			let b = border_type(space, adj)
			if (
				(type === 'land' && (b === 'c' || b === 'w' || (b === 's' && REGIONS[adj].type === 'sea'))) || 
				(type === 'sea' && (b === 'p' || b === 'm' || b === 'f' || b === 'r' ))) continue
			set_add(checked, adj)
			if (contains_hiding_enemy_sub[adj, f]) continue
			if (game.control[adj] === f || game.control[adj] === 3 || game.control[adj] === -1 || 
				(REGIONS[adj].type === 'strait' && !are_enemies(f, game.control[adj]))) {
				set_add(network, adj)
				if (type === 'land' || REGIONS[adj].type !== 'land') check_space(adj, type)
			}
		}
	}

	//find all spaces you can get to via land first
	check_space(cap, 'land')
	let landnw = object_copy(network)
	//add in sea route
	checked = []
	for (let space of landnw) check_space(space, 'sea')
	landnw = object_copy(network) //save the network and refresh
	checked = []
	network = [cap]

	check_space(cap, 'sea') //sea route first
	let seanw = object_copy(network)
	//add in land route
	checked = []
	for (let space of seanw) check_space(space, 'land')

	return set_union(landnw, network)
}

function trade_partner(r){
	let owner = game.control[r]
	if (owner === -1) owner = Math.floor(game.influence[COUNTRIES.findIndex(x => x.name === REGIONS[r].country)]/10)
	if (REGIONS[r].country === 'USA' && owner !== 1) owner = -1
	return owner
}

function check_blockades_still_in_effect (){
	if (game.blockade.length === 0 && game.blockade_transafrica === 0) {
		//log("No blockades on the board."); return
	}
	for (let f = 0; f < 3; f++){
		determine_control(f)
		const network = get_trade_network(f, false)
		const ta_network = get_trade_network(f, true)
		for (let i = game.blockade_transafrica.length -1; i >= 0; i--) {
			if (trade_partner(game.blockade_transafrica[i]) !== f) continue
			if (set_has(ta_network, game.blockade_transafrica[i])) {
				log(`${REGIONS[game.blockade_transafrica[i]].name} is no longer blockaded.`)
				array_remove_item(game.blockade_transafrica, game.blockade_transafrica[i])
			}
		}
		for (let i = game.blockade.length -1; i >= 0; i--) {
			if (trade_partner(game.blockade[i]) !== f) continue
			if (set_has(network, game.blockade[i])) {
				log(`${REGIONS[game.blockade[i]].name} is no longer blockaded.`)
				array_remove_item(game.blockade, game.blockade[i])
			} else if (set_has(ta_network, game.blockade[i])) {
				log(`${REGIONS[game.blockade[i]].name} has downgraded to just a MED blockade.`)
				game.blockade_transafrica.push(game.blockade[i])
				array_remove_item(game.blockade, game.blockade_transafrica[i])
			}
		}
	}
}

//BLOCKADES
function determine_blockades(){
	let blockade_possible = []
	let blockade_transafrica_possible = []
	for (let i = 0; i < 3; i++){
		if (game.relationship[i].length === 0) continue
		determine_control(i)
		let network = get_trade_network(i, false)
		let network_ta = get_trade_network(i, true)
		for (let j = 0; j < REGIONS.length; j++) {
			let r = REGIONS[j]
			if (r.type === 'sea' || (r.pop === 0 && r.res === 0) || trade_partner(j) !== i || set_has(network, j) ||
				(r.res === 0 && set_has(network_ta, j))) continue
			set_has(network_ta, j)? blockade_transafrica_possible.push(j) : blockade_possible.push(j)
		}
	}
	game.blockade_possible = blockade_possible
	game.blockade_transafrica_possible = blockade_transafrica_possible
}

function start_blockades(){
	game.phase = "blockade"
	if (game.relationship[0].length === 0 && game.relationship[1].length === 0) {//no one is at war
		log_br()
		log("No one is at war. Skipping blockades.")
		next_season()
	} else {
		log_br()
		log("Blockade:")
		determine_blockades()
		let bp = game.blockade_possible
		let btp = game.blockade_transafrica_possible 
		if (bp.length === 0 && btp.length === 0) {
			log('No blockades possible.')
			next_season()
		} else {
			game.state = 'blockade'
			set_active(game.turn_order[2])
			next_blockades(true)
		}
	}
}

function next_blockades(start) {
	if (!start && is_last_in_turn_order()){
		const p = game.blockaded_pop; const r = game.blockaded_res
		let message = ""
		if (p[0]) message += `Axis have ${p[0]} blockaded pop, `; if (r[0]) message += `Axis have ${p[0]} blockaded res, `
		if (p[1]) message += `West have ${p[1]} blockaded pop, `; if (r[1]) message += `West have ${p[1]} blockaded res, `
		if (p[2]) message += `USSR have ${p[2]} blockaded pop, `; if (r[2]) message += `USSR have ${p[2]} blockaded res, `
		if (message !== "") {
			log(`Blockade report: ${message}.`)
		}
		next_season()
		return
	}
	set_next()
	if (!enemy_blockades_possible(game.activeNum)){
		next_blockades()
	}
}

function enemy_blockades_possible(f){
	const list = []
	list.push(...game.blockade_possible)
	list.push(...game.blockade_transafrica_possible)
	for (let r of list) {
		const tp = trade_partner(r)
		if (are_enemies(tp, f)) return true
	}
	return false
}

//SUPPLY
function adjacent_to_supply(supply, b) {
	const r = game.block_location[b]
	if (r === null) return false
	if (set_has(supply, r)) return true
	for (const adj of BORDERS[r]) {
		if (set_has(supply, adj)) return true
	}
	return false 
}

function process_supply(){
	const axis_supply = game.relationship[0].length === 0? false : check_supply(0)
	const west_supply = game.relationship[1].length === 0? false : check_supply(1)
	const ussr_supply = game.relationship[2].length === 0? false : check_supply(2)
	if (!axis_supply && !west_supply && !ussr_supply) return
	const s = [axis_supply, west_supply, ussr_supply]
	for (let i = 0; i < game.block_location.length; i++){
		const f = faction_of_block(i)
		const r = game.block_location[i]
		if (s[f] && is_inf_or_tank(i) && !adjacent_to_supply(s[f], i) && 
			(game.phase !== 'Winter' || (REGIONS[r].country && REGIONS[r].country === 'USSR'))) //only units inside Russia during winter
		{
			log(`${FACTIONS[f]} block in ${REGIONS[r].name} out of supply`)
			block_reduce(i)
			const ngs = no_ground_support(r, f)
			if (ngs) set_add(game.must_retreat, ...ngs)
		}
	}
}

function no_ground_support(r, f) { //this is only used after the supply check: ground support for battles uses different logic
	const ans = []
	for (let i = 0; i < game.block_location.length; i++) {
		if (game.block_lcation[i] === r && faction_of_block(i) === f) {
			if (is_ans(i)) set_add(ans, i)
			else return false
		}
	}
	return ans
}

function check_supply(f) {
	let is = [] //in supply
	let checked = []
	for (let sp of SUPPLY_POINTS[f]) {
		sp = REGIONS.findIndex(x => x.name === sp)
		if (game.control[sp] === f) set_add(is, sp)
	}
	let queue = object_copy(is)
	while (queue.length > 0){
		let space = queue.shift()
		set_add(checked, space)
		for (let adj of BORDERS[space]) {
			if (set_has(checked, adj)) continue
			if (game.control[adj] === f || game.control[adj] === 3 || 
				(REGIONS[adj].type === "strait" && !are_enemies(f, game.control[adj]))){
				set_add(is, adj)
				queue.push(adj)
			}
		}
	}
	return is
}

//RETREATS AND REBASES
function retreat_locations(r, b) {
	const spaces = []
	const f = faction_of_block(b)
	const os = map_get(game.aggressed_from, b, [false])[0] //original space

	const battles = game.battle_fought
	for (let i = 0; i < game.battle.length; i+=2) set_add(battles, game.battle[i])
	for (let r of game.battle_raid) set_delete(battles, r)

	const rss = [] //restricted spaces
	if (f !== game.attacker) {
		map_for_each(game.aggressed_from, (key, value) => {
			if (value[1] === r)	set_add(rss, value[0])
		})
	}

	for (const space of BORDERS[r]) {
		const c = game.control[space]
		const bt =  border_type(space, r)
		if (
			(c === f || c === 3) && //a: Enemy, Rival, or Neutral areas (Open Seas OK)
			!(set_has(battles, space)) && //b: Areas that contained Battles (other than Raids) that Player Turn [Raids do not block Retreats]
			!(set_has(rss, space)) && //c: [Defenders only] Areas from which the Enemy Engaged them that Player Turn
			(os === space || os === false) && //d: [Attackers only] Any area other than the one from which they Engaged into the Battle, if they Engaged that Turn
			(is_ans(b) || (//e: [Ground units only] Sea Areas, unless they are Friendly-occupied. Also: border limits
				c !== 3 && 
				border_limit(space, r) >= map_get(game.border_count, get_border_id(space, r ), 0) -
				(REGIONS[space].type === 'sea' && has_tech(f, 'LSTs'))//-1 from the count for invasions
			)) && 
			(!is_ans(b) || game.block_type[b] === 1 || (bt === 'w' || bt === 'c' || bt === 's' || shares_sea(space, r)))//f: [NS only] Costal lines
		) spaces.push(space)
	}

	return spaces
}

function rebase_locations(r, b, retreat) {
	const net = [r]
	const air = game.block_type[b] === 1
	const sub = game.block_type[b] === 3
	const f = faction_of_block(b)

	const distance = (game.block_type[b] === 2 || game.block_type[b] === 4 || (game.block_type[b] === 1 && has_tech(f, 'Heavy Bombers'))) ? 3 : 2

	const os = map_get(game.aggressed_from, b, false)[0] //original space

	const battles = game.battle_fought //planes may fly through battles, so long as they aren't 'retreating'
	for (let i = 0; i < game.battle.length; i+=2) set_add(battles, game.battle[i])
	for (let r of game.battle_raid) set_delete(battles, r) //raids don't block retreats

	const rss = [] //restricted spaces from aggressed into
	if (f !== game.attacker && retreat) {
		map_for_each(game.aggressed_from, (key, value) => {
			if (value[1] === r)	set_add(rss, value[0])
		})
	}

	const queue = [{space: r, movement: distance}]

	while (queue.length > 0) {
		const {space, movement} = queue.shift()
		for (let s of BORDERS[space]){
			const type = REGIONS[s].type
			const cost = type === 'sea' && REGIONS[s].ocean === 1? 2:1
			const remaining = movement - cost
			const c = type !== 'sea'? COUNTRIES.findIndex(x => x.name === REGIONS[s].country) : false
			const battle = set_has(battles, s)
			const bt = border_type(space, s)
			if (remaining < 0) continue
			if (!set_has(net, s) &&
				!(set_has(rss, s)) && !(battle && retreat) &&
				(space !== r || !retreat || f !== game.attacker || os === false || s === os) && //if you are retreating, the first step must be the original space
 				((air || sub || !contains_enemy_blocks(s, f, true)) ||(c && is_neutral(c) && !is_armed_minor(c) && type === 'strait')) && //cannot move through enemy blocks
				(!c || !is_neutral(c) || is_armed_minor(c) || type === 'strait') && //cannot move through neutral unless armed or strait
 				(air || bt === 'w' || bt === 'c' || bt === 's' || shares_sea(space, s))
 			) {
 				set_add(net, s)
 				if ((air || type !== 'land') && remaining !== 0)
					queue.push({space: s, movement: remaining})
			}
		}
	}

	for (let i = net.length -1; i >= 0; i--) {
		if (net[i] === r || game.control[net[i]] !== f || REGIONS[net[i]].type === 'sea')
			set_delete(net, net[i])
	}
	
	return net
}

//INFLUENCE CHECK
function is_neutral(country) {
	const c = typeof country === 'string'? COUNTRIES.findIndex(x => x.name === country) : country
	country = typeof country === 'string'? country : COUNTRIES[c].name
	if (game.influence[c]%10 === 0 || country === "Germany" || country === "Britain" || country === "USSR" ||
	   (!set_has(game.defeated_major_powers, 1) && (country === "Italy" || country === COLONIES["Italy"][0])) ||
	   (!set_has(game.defeated_major_powers, 3) && (country === "France" || COLONIES["France"].includes(country))) ||
	   (country === "USA" && game.usa_satellite) ||
	   (COLONIES["Britain"].includes(country))) return false
	return true
}

function is_armed_minor(country) {
	const c = COUNTRIES.findIndex(x => x.name === country)
	return set_has(game.armed_minors, c)
}

function has_rival_influence(c, f) {
	let inf = game.influence[COUNTRIES.findIndex(x => x.name === c)]
	return inf !== -1 && Math.floor(inf/10) !== f && inf%10 !== 0
}

function has_influence_anywhere(f) {
	for (let i = 0; i < game.influence.length; i++) {
		let inf = game.influence[i]
		if (inf !== -1 && Math.floor(inf/10) === f && inf%10 !== 0) return true
	}
	return false
}

//INFLUENCE MANIUPLATION
function influence_country(c, f) {
	if (game.influence[c] === -1) game.influence[c] = (f*10)+1
	else if (Math.floor(game.influence[c]/10) === f) {
		if (game.influence[c]%10 !== 9) game.influence[c] += 1
	}
	else if (game.influence[c]%10 === 1) game.influence[c] = -1
	else game.influence[c] -= 1
}

function conquest_influence(){
	const italian_colonies = [] 
	const british_colonies = []
	const french_colonies = []
	COLONIES["Italy"].forEach(x => set_add(italian_colonies, COUNTRIES.findIndex(y => y.name === x)))
	COLONIES["France"].forEach(x => set_add(french_colonies, COUNTRIES.findIndex(y => y.name === x)))
	COLONIES["Britain"].forEach(x => set_add(british_colonies, COUNTRIES.findIndex(y => y.name === x)))
	
	for (let c = 0; c < COUNTRIES.length; c++) {
		const r = REGIONS.findIndex(x => x.name === COUNTRIES[c].capital)
		const f = game.control[r]
		if (f === -1 || game.influence[c] === f*10 || map_has(game.battle, r)) continue
		let natural_control = 0
		if ((f === 0 && (c === 0 || (!set_has(game.defeated_major_powers, 1) && (c === 1 || set_has(italian_colonies, c))))) ||
			(f === 1 && (c === 2 || set_has(british_colonies, c) || 
				(!set_has(game.defeated_major_powers, 3) && (c === 3 || set_has(french_colonies, c))) || 
				(!set_has(game.defeated_major_powers, 4) && c === 4))) ||
			(f === 2 && c === 5)) natural_control = 1

		game.influence[c] = natural_control? -1 : f*10
		if (!natural_control){
			if (set_has(game.armed_minors, c)) defeat_minor(c)
			else if (c === 1 || c === 3 || c === 4) defeat_major(c)
		}
	}

	update_production()
}

function arm_minor(country, f) {
	if (country === 'USA') {usa_violation(); return}
	if (f === 3) log(`${country} becomes neutral, and is arming for colonial independence!`)
	else log(`${country} is arming to fight the ${FACTIONS[f]}!`)
	let c = COUNTRIES.findIndex(x => x.name === country)
	//remove influence, unless at 2 and OTHER faction attacked
	if (game.influence[c]%10 === 2 && Math.floor(game.influence[c]/10) !== f){
		game.influence[c] -=2
		log(`${country} is a protectorate of the ${FACTIONS[game.influence[c]/10]}. They will gain control of the country.`)
		set_add(game.gained_control[game.influence[c]/10], c)
		set_add(game.aggression_met, game.influence[c]/10)
	} else {game.influence[c] = -1; set_add(game.armed_minors, c)}
	//create cadres
	let maxpop = 0
	for (let i = 0; i < REGIONS.length; i++) {
		if (REGIONS[i].country && REGIONS[i].country === country) {
			let pop = REGIONS[i].pop*2 + (REGIONS[i].town ? 1 : 0)
			if (pop > maxpop) maxpop = pop
			if (pop > 0) game.block_steps[create_cadre(42, i)] = pop
		}
	}
	//mark who is the aggressor
	game.minor_aggressor[c] = f
	if (f !== 3) { //this doesn't happen for revolting minor colonies
		set_add(game.surprise, c)
		game.peace_eligible[f] = 0
		for (let i = 0; i < maxpop; i++){
			game.draw[0].push(-1)
		}
	}
}

function defeat_minor(c) {
	log(`${COUNTRIES[c].name} has been defeated.`)
	set_delete(game.armed_minors, c)
	for (let i = 0; i < game.block_location.length; i++) {
		if (game.block_nation[i] === 6 && REGIONS[game.block_location[i]].country === c) remove_block[i]
	}
}

function defeat_major(c) {
	if (set_has(game.defeated_major_powers, c)) return
	const name = COUNTRIES[c].name
	const n = NATIONS.findIndex(x => x === name)
	log(`${name} has been defeated.`)
	for (let i = 0; i < game.block_location.length; i++) {
		if (game.block_nation[i] === n) remove_block(i)
	}
	set_add(game.defeated_major_powers, c)
	for (let colony of COLONIES[name]) {
		const c = COUNTRIES.findIndex(x => x.name === colony)
		const r = REGIONS.findIndex(x => x.name === COUNTRIES[c].capital)
		if (number_of_blocks_in_region(r) === 0) {
			arm_minor(COUNTRIES[c].name, 3) //if 'aggressor' is 3, then no interventions will be possible.
			game.control[r] = -1
		} else {
			log(`${colony} is controlled by the ${FACTIONS[game.control[r]]}.`)
			game.influence[c] = game.control[r]*10
		}
	}
}

//TECH CHECK
function invented_techs(f){
	let techs = []
	for (let i = 0; i < game.tech[f].length; i++) {
		set_add(techs, game.tech[f][i] > 0? ICARDS[game.tech[f][i]].left : ICARDS[Math.abs(game.tech[f][i])].right) 
	}
	return techs
}

function techs_from_science(card){
	if (!card.special) throw new Error("Card without special property handed in to techs_from_special()")
	let ts = [] //techs
	if (card.special.includes("Science") && (Number(card.special.substring(2,4))-35) <= game.turn) {
		ts.push(...SCIENCE[card.special])
	}
	return ts
}

function industrial_espionage(){ //retuns all inveted techs
	let techs = []
	for (let i = 0; i < 3; i++){
		set_add_all(techs, invented_techs(i))
	}
	return techs
}

function techs_on_card(c){
	let card = ICARDS[c]
	let techs = [] //techs
	if (card.left){
		if (card.left === "Industrial Espionage") set_add_all(techs, industrial_espionage())
		else techs.push(card.left)
	} 
	if (card.right){
		if (card.right === "Industrial Espionage") set_add_all(techs, industrial_espionage())
		else set_add (techs, card.right)
	} 
	if (card.special) techs.push(...techs_from_science(card))
	return techs
}

function card_has_tech_printed(c, tech){
	let card = ICARDS[Math.abs(c)]
	if (card.left && card.left === tech) return true
	if (card.right && card.right === tech) return true
	return false
}

function pair_has_tech_printed(c1, c2, tech){
	if (card_has_tech_printed(c1, tech) && card_has_tech_printed(c2, tech)) return true
	return false
}

function has_tech(faction, tech){
	for (let val of game.tech[faction]){
		let t = val > 0? ICARDS[val].left : ICARDS[Math.abs(val)].right
		if (t === tech) return true
	}
	return false
}

function has_vault(f) {
	return game.vault[f].length >= 1
}

function techs_in_vault(f){
	const techs = []
	for (let c of game.vault[f]) {
		if (c < 0) set_add(techs, ICARDS[Math.abs(c)].right)
		else if (ICARDS[c].left) set_add(techs, ICARDS[c].left)
	}
	return techs
}

function can_reveal_vault(f) {
	if (has_vault(f) && factions_in_group(game.active_battle_blocks).includes(f)) return true
	return false
}

function how_many_other_factions_can_reveal(f){
	let count = 0
	for (let i = 0; i < 3; i++) {
		if (i !== f && can_reveal_vault(i) && (i === game.attacker || i === game.defender || game.defender === 3)) count++
	}
	return count
}

function find_tech(card1, card2){
	let tech
	if (card1.left && card1.left !== "Industrial Espionage" && game.selected[0] > 0) tech = card1.left
	else if (card1.right && card1.right !== "Industrial Espionage" && game.selected[0] < 0) tech = card1.right
	else if (card2.left && card2.left !== "Industrial Espionage" && game.selected[1] > 0) tech = card2.left
	else if (card2.right && card2.right !== "Industrial Espionage" && game.selected[1] < 0) tech = card2.right
	return tech
}
//TECH MANIPULATION

//FACTION CHECK
function faction_major_powers(f){
	let result = []
	switch (f) {
	case 0: if(!set_has(game.defeated_major_powers, MAJORPOWERS[0])) result.push(MAJORPOWERS[0]); break 
	case 1: 
		if(!set_has(game.defeated_major_powers, MAJORPOWERS[1])) result.push(MAJORPOWERS[1])
		if(game.usa_satellite === 1 && !set_has(game.defeated_major_powers, MAJORPOWERS[2])) result.push(MAJORPOWERS[2])
	}
	return result
}

function faction_of_power(nation){
	if (typeof nation === "string") nation = NATIONS.indexOf(nation)
	switch (nation){
	case 0:	case 1: return 0
	case 2: case 3: case 4: return 1
	case 5: return 2
	case 6: return -1
	}
}

function are_enemies(f1, f2, r){
	if (f1 === -1 || f2 === -1)	{
		if (r === undefined) return false
		let c = COUNTRIES.findIndex(x => x.name === REGIONS[r].country)
		if (f1 === -1) return game.minor_aggressor[c] === f2
		if (f2 === -1) return game.minor_aggressor[c] === f1
	}
	if (f1 === f2 || //you are not your own enemy
		f1 === 3 || f2 === 3 || //you are not enemies at sea with rivals
		!game.relationship[f1].length === 0 || //are either factions at peace?
		!game.relationship[f2].length === 0) return false
	if (f1 === 0 || f2 === 0) {//one of the parties is the Axis
		if (f1 === 1 || f2 === 1){//axis west
			return game.relationship[0][0]? true : false
		} else {//axis ussr
			return game.relationship[0][1]? true : false
		}
	} else {//west ussr
		return game.relationship[1][1]? true : false
	}
}

function is_rival_capital(r, f) {
	let caps = object_copy(CAPITALS)
	array_remove(caps, f)
	for (let c of caps) {
		if (c === REGIONS[r].name) return true
	}
	return false
}

function captured_capitals(){
	const rival_capitals_owned = [0,0,0]
	for (let i = 0; i < REGIONS.length; i++){
		const f = game.control[i]
		const n = REGIONS[i].name
		if (f === 0 && (SUPPLY_POINTS[1].includes(n) || SUPPLY_POINTS[2].includes(n)))
			rival_capitals_owned[0] += 1
		if (f === 1 && (SUPPLY_POINTS[0].includes(n) || SUPPLY_POINTS[2].includes(n)))
			rival_capitals_owned[1] += 1
		if (f === 2 && (SUPPLY_POINTS[0].includes(n) || SUPPLY_POINTS[1].includes(n)))
			rival_capitals_owned[2] += 1
	}
	return rival_capitals_owned
}

function determine_control(f){
	for (let i = 0; i < REGIONS.length; i++){
		let original_control = game.control[i]
		game.control[i] = who_controls_region(i, f)
		if (game.control[i] !== original_control && set_has(game.blockade, i)) set_delete(game.blockade, i)
		if (game.control[i] !== original_control && set_has(game.blockade_transafrica, i)) set_delete(game.blockade_transafrica, i)
	}
	let capitals = captured_capitals()
	for (let i = 0; i < 3; i++) {
		if (capitals[i] >= 2) {
			goto_game_over(i, `The ${FACTIONS[i]} have won a Military Victory!`)
			break
		}
	}
}

function who_controls_region(r, f){ //control of a location: 
	if (map_has(game.battle, r)) return map_get(game.battle, r)[0] //The first to own blocks in a contested area.
	//If it isn't contested, who has a block there that isn't a hiding sub? From the perspective of the activeNum, rival boats don't count
	for (let i = 0; i < game.block_location.length; i++){ 
		if (game.block_location[i] === r) {
			let fob = faction_of_block(i)
			if (REGIONS[r].type === "sea" && f === undefined) throw new Error("A faction is a required param for any check that could include a sea")
			if (REGIONS[r].type === "sea" && (f !== fob && !are_enemies(f, fob)) || hiding_sub(i)) continue
			return fob
		}
	}
	//if no blocks, and is a sea, everyone wins! Communism!
	if (REGIONS[r].type === "sea") return 3

	const country = REGIONS[r].country
	const c = COUNTRIES.findIndex(country => country.name === country)
	//if no blocks and great country, faction is the owner
	if (country === "Germany") return 0
	if (country === "Britain") return 1
	if (country === "USSR") return 2
	//who has influence there?
	if (game.influence[c]%10 === 0) return game.influence[c]/10
	//if no blocks and no influence, might be a major power or colony (besides USA)?
	if (!set_has(game.defeated_major_powers, 1) && (country === "Italy" || country === COLONIES["Italy"][0])) return 0
	if (!set_has(game.defeated_major_powers, 3) && (country === "France" || COLONIES["France"].includes(country))) return 1
	if (game.usa_satellite && !set_has(game.defeated_major_powers, 4) && country === "USA") return 1
	if (COLONIES["Britain"].includes(country)) return 1
	return -1
} 

//BATTLE CHECK
function can_retreat(b) {
	if (game.block_type[b] === 0) return false
	const r = game.block_location[b]
	if (is_ans(b)) {
		if (rebase_locations(r, b, true).length > 0) return true
	}
	if (game.block_type[b] !== 1) {
		if (retreat_locations(r, b).length > 0) return true
	}
	return false
}
function can_hit_air(b, e) {
	if (!contains_type(e, 1)) return false
	switch (game.block_type[b]) {
	case 0: case 1: case 2: case 4: return true
	case 6: return REGIONS[game.active_battle].type !== 'sea'
	case 3: case 5: return false
	}
}
function can_hit_naval(b, e) {
	if (!contains_type(e, 2) && !contains_type(e, 4)) return false
	switch (game.block_type[b]) {
	case 0: case 1: case 2: case 3: case 4: return true
	case 6: return REGIONS[game.active_battle].type !== 'sea'
	case 5: return false
	}
}
function can_hit_sub(b, e) {
	if (!contains_type(e, 3)) return false
	switch (game.block_type[b]) {
	case 0: case 1: case 2: case 4: return true
	case 5: case 6: return false
	}
}
function can_hit_ground(b, e) {
	return (REGIONS[game.active_battle].type !== 'sea' && game.block_type[b] !== 3 &&
		(contains_type(e, 0) || contains_type(e, 5) || contains_type(e, 6)))
}
function can_hit_convoy(b, e) {
	return (REGIONS[game.active_battle].type === 'sea' && game.block_type[b] !== 5 && game.block_type[b] !== 6 &&
		(contains_type(e, 5) || contains_type(e, 6)))
}

function can_hit_industry(b, r) {
	const f = faction_of_block(b)
	r = r ?? game.block_location[b]
	return (game.block_type[b] === 1 && 
		is_rival_capital(r, f) && 
		has_tech(f, 'Precision Bombsight'))
}

function filter_local_enemy(f){
	const f_is_a = f === game.attacker
	const local_enemy = game.active_battle_blocks.filter(x => {
		const e = faction_of_block(x)
		return e !== f && (
			(f_is_a && (game.defender === -1 || game.defender === e || game.defender === 3)) || 
			(!f_is_a && game.attacker === e)
		)})
	return local_enemy
}

function check_end_battle() {
	const fs = factions_in_group(game.active_battle_blocks)
	if (fs.length <= 1) {
		for (let b of game.active_battle_blocks) {
			if (can_hit_industry(b)) return false
		}
	} else {
		for (let f of fs) {
			if (f === game.attacker) return false
		}
	}
	return true
}

function three_way(r) {
	for (let i = 0; i < 3; i++){
		if (!contains_faction(r, i)) return false
	}
	if (!are_enemies(game.activeNum, game.activeNum +1 %3) || !are_enemies(game.activeNum, game.activeNum +2 %3)) return false
	return true
}

function has_ff(f, type) { //this as written will have problems in a three way battle
	if (f === game.attacker) {
		let factions = factions_in_region(game.active_battle)
		for (let faction of factions) if (faction !== f && game.surprise[faction]) return true
	}
	switch (type) {
	case 0: return false
	case 1: return has_tech(f, "Jets")
	case 2: 
	case 3: return false
	case 4: return has_tech(f, "Naval Radar")
	case 5: return has_tech(f, "Heavy Tanks")
	case 6: return has_tech(f, "Rocket Artillery")
	}
}

//BATTLE MANIPULATION

function neutral_firing_solution() {
	for (let i = 0; i < game.block_location.length; i++){
		if (game.block_nation[i] === 6 && game.block_location[i] === game.active_battle && !set_has(game.block_moved, i)) {
			log(`${REGIONS[game.active_battle].name}'s neutral fort is attacking the invaders:`)
			const e = filter_local_enemy(-1)
			let target
			if (can_hit_ground(i, e)) target = 2
			else if (can_hit_naval(i, e)) target = 1
			else if (can_hit_air(i, e)) target = 0
			else target = 3
			process_attack(i, target)
			break
		}
	}
}

function process_attack(b, c, s) {//block, class, shootnscoot
	log(`${NATIONS[game.block_nation[b]]} ${TYPE[game.block_type[b]]} attacks ${CLASSNAME[c]}`)
	const convoy = c === 4? c = 1 : 0 //both c and convoy should be 1 for a convoy attack
	const adr = game.block_type[b] === 1 && c === 0 && has_tech(game.activeNum, "AirDefense Radar")? 1 : 0
	const sonar = game.block_type[b] === 4 && c === 3 && has_tech(game.activeNum, "Sonar")? 1 : 0
	if (s) game.shootNscoot = b
	set_add(game.block_moved, b)
	game.hits = fire(game.block_steps[b]*(1+adr), s? 1 : FIREPOWER[game.block_type[b]][c]+sonar)
	if (game.hits > 0) {
		game.hit_class = convoy? 2 : c
		if (faction_of_block(b) !== -1 && game.defender === -1) {
			log('The Neutral fort takes the damage')
			let block = game.active_battle_blocks.find(x => game.block_nation[x] === 6)
			do {
				let dead = block_reduce(block)
				if (dead) {
					game.hits = 0
				} else game.hits -= 1
			} while (game.hits > 0)
			set_next_battle()
		} else {
			game.state = "damage" 
			//Needs work, this will break in a 3way
			set_active(faction_of_block(b) === game.attacker? game.defender : game.attacker)
			
		}
	} else if (s) {
		game.state = "retreat"
		game.selected = b
	} else (
		set_next_battle()
	)
}

function process_attack_industry(b) {
	log(`${NATIONS[game.block_nation[b]]} air bombs industry`)
	set_add(game.block_moved, b)
	let hits = fire(game.block_steps[b], 1)
	if (hits > 0) {
		log(`${hits} damage to industry!`)
		let victim = CAPITALS.indexOf(REGIONS[game.block_location[b]].name)
		if (victim === -1) throw new Error("Cannot find the capital to bomb!")
		else game.ind[victim] -= hits
	}
	set_next_battle()
}

function fire(steps, value) {
	const rolls = []
	let hits = 0
	for (let i = 0; i < steps; i++) {
		const r = roll_d6()
		rolls.push(r)
		if (r <= value) hits ++
	}
	log(`Rolled ${rolls}, scoring ${hits} ${hits === 1? 'hit' : 'hits'}`)
	return hits
}

function pre_battle_setup(r){
	game.active_battle = r
	game.attacker = game.activeNum
	//if 3way then he needs to choose
	if (game.defender === null || game.defender === undefined){
		if (three_way(r)) {
			game.state = 'choose_defender'
			return
		}
		for (let i = 0; i < game.block_location.length; i++) {
			if (game.block_location[i] === r && are_enemies(game.attacker, faction_of_block(i), r)) {
				game.defender = faction_of_block(i); break
			}
		}
		game.defender = game.defender ?? game.control[r] //used in the case of an empty capital and bombing.
	}
	
	//add in attacker
	if (REGIONS[r].type === 'sea') {
		if (game.active_battle_blocks.length === 0) { //if it isn't 0, we've been here before.
			let BGcount = 0
			let last_group
			for (let bg in game.battle_groups) {
				if (bg%1000 === r) {BGcount++; last_group = bg}
			}
			if (BGcount === 0) throw new Error("No battle groups found!?!")
			if (BGcount > 1) {
				game.state = "add_battle_group"
				return
			} 
			else {
				game.active_battle_blocks.push(...game.battle_groups[last_group])
				delete game.battle_groups[last_group]
			}
		}
	} else {
		for (let i = 0; i < game.block_location.length; i++) {
			if (game.block_location[i] === r && faction_of_block(i) === game.attacker) {
				game.active_battle_blocks.push(i)
				if (set_has(game.invasion_blocks, i)) set_add(game.block_moved, i)
			}
		}
	}

	//add in defender
	for (let i = 0; i < game.block_location.length; i++) {
		if (game.block_location[i] === r && !set_has(game.raid_retreat_blocks, i) &&
			((game.defender === 3 && faction_of_block(i) !== game.attacker) || 
			faction_of_block(i) === game.defender)) game.active_battle_blocks.push(i)
	}

	game.active_battle_blocks.sort((a, b) => {if (a > b) return 1; if (b > a) return -1; throw new Error('multiple copies in the same active battle block') })

	const index = game.turn_order.indexOf(game.activeNum)
	const f1 = game.turn_order[(index + 1)%3]
	const f2 = game.turn_order[(index + 2)%3]

	game.active_battle = r

	if (can_reveal_vault(game.attacker)) {
		game.state = "vault_reveal_battle"
	} else if (can_reveal_vault(f1)) {
		clear_undo()
		game.state = "vault_reveal_battle"
		set_active(f1)
	} else if (can_reveal_vault(f2)) {
		clear_undo()
		game.state = "vault_reveal_battle"
		set_active(f2)
	} else start_battle()
}

function start_battle(){
	game.state = "battle"
	set_next_battle()
}

function new_sea_combat_round() {
	if (can_add_battlegroup(game.active_battle)) game.state = "add_battle_group"
	else set_next_battle()
}

function can_add_battlegroup(r) {
	for (let bg in game.battle_groups) {
		if (bg%1000 === r) return true
	}
	return false
}

function post_battle_teardown() {
	if (REGIONS[game.active_battle].type === 'sea') {
		const fs = factions_in_region(game.active_battle)
		game.battle_winner = set_has(fs, game.attacker)? game.attacker : game.defender
	}
	determine_retreats(game.active_battle, true)
	game.defender = null //who the attacker is is important for retreating
	game.active_battle_blocks = []
	game.block_moved = []
	set_next_retreat()
}

function end_battle(){
	clear_undo()
	update_battle(game.active_battle)
	game.active_battle = null
	set_active(game.attacker)
	game.battle_winner = null
	game.attacker = null
	game.may_retreat = null
	game.must_retreat = null
	game.state = 'choose_battle'
}

function determine_retreats(r, finished){
	game.must_retreat = []
	game.may_retreat = []

	if (REGIONS[r].type === 'sea') {
		//battle end, all active ANS (except escaped subs)
		for (let i = 0; i < game.block_location.length; i++) {
			if (game.block_location[i] === r && !game.sub_hiding[i]) {
				if (game.block_type[i] === 1 && game.active_battle_blocks.includes(i)) game.must_retreat.push(i)
				else if (!finished && game.block_type[i] === 3 ) game.may_retreat.push(i)
				else if (finished && is_ans(i) && game.battle_winner === 3 || faction_of_block(i) === game.battle_winner) game.may_retreat.push(i)
			}
		}
	} else {
		if (!finished) throw new Error("This land combat isn't finished and retreats are being determined")
		const ground_support = []
		for (let i = 0; i < game.block_location.length; i++) {
			if (game.block_location[i] === r && !is_ans(i)) set_add(ground_support, faction_of_block(i))
		}
		for (let i = 0; i < game.block_location.length; i++) {
			if (game.block_location[i] === r && is_ans(i)) {
				let f = faction_of_block(i)
				if (!set_has(ground_support, f)) game.must_retreat.push(i) 
				else if (f === game.attacker) game.may_retreat.push(i)
			}
		}
	}
}

function set_next_retreat(){
	const group = object_copy(game.must_retreat)
	group.push(...game.may_retreat)
	const fs = factions_in_group(group)
	if (fs.length === 0) {//either start another sea combat round or end the battle
		if (game.defender === null) 
			if (game.attacker === null) next_season(true)  //if attacker and defender are null then this is during the supply check phase
			else end_battle()
		else new_sea_combat_round()
		return
	}
	fs.sort((a, b) => {
		if (a === game.active) return -1
		if (b === game.active) return 1
		return game.turn_order.indexOf(a) - game.turn_order.indexOf(b)
	}
	)
	game.state = 'choose_retreat'
	set_active(fs[0])
}

// STATES

let states = {}
var game
var view

//SETUP
states.setup = {
	inactive: "Setup Cadres",
	prompt(){
		view.prompt = "Place starting Cadres"
		let i
		let finish

		switch (game.activeNum) {
		case AXIS: i = 0; finish = 13; break
		case WEST: i = 14; finish = 27; break
		case USSR: i = 35; finish = 41; break
		}
		let all_regions_full = 1
		checkReserves: for (i; i <= finish; ++i){
			if (reserve_empty(i)) continue
			let nation = NATIONS[Math.floor(i/7)]
			let type = TYPE[i%7]
			for (let [index, region] of REGIONS.entries()){
				if (region.type === "sea" || region.pop === 0) continue
				if (region.country !== nation 
					&& !COLONIES[nation].includes(region.country)) continue
				let pop = game.activeNum === 0? region.pop * 2 : region.pop
				if (region.name === 'London') pop += 1
				if (pop <= number_of_blocks_in_region(index)) continue
				if (type === "Fort" && is_fort_in_region(index)) continue
				if ((type === "Fleet" || type === "Sub"|| type === "Carrier") && !is_coastal_region(index)) continue
				all_regions_full = 0
				gen_action_reserve(i)
				continue checkReserves
			}
		}
		if (all_regions_full) {
			view.actions.end_setup = 1
			game.selected = null
		}

		if (game.selected !== null) {
			let nation = NATIONS[Math.floor(game.selected/7)]
			let type = TYPE[game.selected%7]
	
			for (let [index, region] of REGIONS.entries()) {
				if (region.type === "sea" || region.pop === 0) continue
				if (region.country !== nation 
					&& !COLONIES[nation].includes(region.country)) continue
				let pop = game.activeNum === 0? region.pop * 2 : region.pop
				if (region.name === 'London') pop += 1
				if (pop > number_of_blocks_in_region(index)) {
					if (type === "Fort" && is_fort_in_region(index)) continue
					if ((type === "Fleet" || type === "Sub" || type === "Carrier") 
						&& !is_coastal_region(index)) continue
					gen_action_region(index)
				}
			}
		}
		if (!view.actions.reserve || (view.actions.reserve && !set_has(view.actions.reserve, game.selected))) {
			game.selected = null
			view.selected = null
		}

	},

	reserve(r) {
		game.selected === r ? game.selected = null : game.selected = r
	},

	region(area){
		push_undo()
		create_cadre(game.selected, area)
		if (game.reserves[game.selected] === 0) game.selected = null 
	},

	end_setup(){
		clear_undo()
		let c = HANDSIZE[game.activeNum]
		if (game.activeNum === 0) c *= 2
		for (let i = 0; i < c; i++) game.draw[0].push(-1)
		draw()
		game.state = "draw_setup"
	}

}

// PRODUCTION
function determine_production(faction, end_of_game){
	const war = game.relationship[faction].length !== 0
	if (war && game.control[REGIONS.findIndex(x => x.name === CAPITALS[faction])] !== faction) {game.count = 0; return}
	let r = war ? game.res[faction] - game.blockaded_res[faction] : 25  //aka not the limiter
	let i = game.ind[faction]
	let p = game.pop[faction] - game.blockaded_pop[faction]

	if(end_of_game){
		r += game.blockaded_res[faction]
		p += game.blockaded_pop[faction]
	}

	return Math.min(r,i,p) //R.I.P.
}

function is_engaged(b) {
	const r = game.block_location[b]
	for (let i = 0; i < game.battle.length; i += 2) {
		if (game.battles[i] === r) return true
	}
	return false
}

states.production = {
	inactive: "Production",
	prompt(){
		view.prompt = "Spend Production"
		game.count !== 0 ? view.actions.end_production_confirm = 1 : view.actions.end_production = 1
		view.actions.draw_action_card = game.count > 0? 1:0//logic if the deck is empty?
		view.actions.draw_investment_card = game.count > 0? 1:0//logic if the deck is empty?
		if (game.count > 0) {
			const supply = check_supply(game.activeNum)

			for (let i = 0; i < game.block_location.length; ++i) {
				if (!is_max_steps(i)
					&& faction_of_block(i) === game.activeNum
					&& REGIONS[game.block_location[i]].type !== "sea"
					&& !set_has(game.block_moved, i)
					&& !is_engaged(i)
					&& (game.block_type[i] === 0 || adjacent_to_supply(supply, i))
				) gen_action_block(i)
			}

			let i
			let finish
	
			switch (game.activeNum) {
			case AXIS: i = 0; finish = 13; break
			case WEST: i = 14; finish = game.usa_satellite? 34 : 27; break
			case USSR: i = 35; finish = 41; break
			}
			
			for (i; i <= finish; ++i){
				if (reserve_empty(i)) continue
				if (set_has(game.defeated_major_powers, NATIONS[Math.floor(i/7)])) continue
				if (i%7 === 0 && forts_everywhere(NATIONS[Math.floor(i/7)])) continue
				//if no coastal home costal regions
				gen_action_reserve(i)
			}

			if (game.selected !== null) {
				let nation = NATIONS[Math.floor(game.selected/7)]
				let type = TYPE[game.selected%7]
				let greatpower = GREATPOWERS.includes(nation)
				
				for (let [index, region] of REGIONS.entries()) {
					
					if (region.type === "sea") continue
					if (type !== "Fort" && region.country !== nation) continue
					if (who_controls_region(index) !== game.activeNum) continue
					if (type === "Fort") {
						if (is_fort_in_region(index)) continue
						if (greatpower) {
							let ics = faction_major_powers(game.activeNum) //ineligible countries
							for (let i = ics.length -1; i >= 0; --i) {
								ics.push(...COLONIES[ics[i]])
							}
							if (ics.indexOf(region.country) !== -1) continue
						} else {
							if (region.country !== nation && !COLONIES[nation].includes(region.country)) continue
						}
						gen_action_region(index)
						continue
					}
					if ((type === "Fleet" || type === "Sub" || type === "Carrier") && !is_coastal_region(index)) continue
					gen_action_region(index)
				}
			}
		}
		if (!view.actions.reserve || (view.actions.reserve && !set_has(view.actions.reserve, game.selected))) {
			game.selected = null
			view.selected = null
		}
	},
	draw_action_card(){
		push_undo()
		game.draw[0].push(-1)
		game.count -= 1
		if (game.count === 0){ game.selected = null; view.selected = null}
	},
	draw_investment_card(){
		push_undo()
		game.draw[1].push(-1)
		game.count -= 1
		if (game.count === 0){ game.selected = null; view.selected = null}
	},
	block(b){
		push_undo()
		log(`Step increased in ${REGIONS[game.block_location[b]].name}`)
		game.block_steps[b] += 1
		set_add(game.block_moved, b)
		game.count -= 1
		if (game.count === 0){ game.selected = null; view.selected = null}
	},
	reserve(r){
		game.selected === r ? game.selected = null : game.selected = r
	},
	region(area){
		push_undo()
		log(`Cadre placed in ${REGIONS[area].name}`)
		set_add(game.block_moved, create_cadre(game.selected, area))
		game.count -= 1
		if (game.count === 0){
			game.selected = null
			view.selected = null
		}
	},
	end_production(){
		clear_undo()
		end_production()
	},
	end_production_confirm(){
		clear_undo()
		end_production()
	}
}

states.production_usa = {
	inactive: "Production",
	prompt(){
		let message = ""
		for (let type of game.usa_reinforcements_types){
			message += ` ${TYPE[type]}`
			gen_action_reserve(type+28)
		}
		if (message === "") {
			message = "finished."
			view.actions.done = 1
		} else { 
			message += "."
			view.actions.done = 0
		}
		view.prompt = "Place free USA blocks:" + message
		if (game.selected) {
			gen_action_region(REGIONS.findIndex(x => x.name === "Washington"))
			gen_action_region(REGIONS.findIndex(x => x.name === "New York"))
		} 
	},
	reserve(r){game.selected === r ? game.selected = null : game.selected = r},
	region(r){		
		push_undo()
		log(`USA reinforcement placed in ${REGIONS[r].name}`)
		const block = create_cadre(game.selected, r)
		set_delete(game.usa_reinforcements_types, game.block_type[block])
		game.block_steps[block] = game.usa_reinforcements
		game.selected = null
	},
	done(){
		push_undo()
		game.state = 'production'
	}
}

// GOVERNMENT
function check_matching_diplomacy(ic, faction){
	//look through the diplomacy of the other two factions for a match. if you find one, return the first match.
	const card = ACARDS[Math.abs(ic)]
	if (card.special) throw new Error("Invalid: special action cards should never check for a maching diplomacy card")
	const country = ic >= 0? card.left : card.right
	for (let f = 1; f < 3; f++){
		for (let i = 0; i < game.diplomacy[(faction+f)%3].length; i++) {
			let value = game.diplomacy[(faction+f)%3][i]
			let match_card = ACARDS[Math.abs(value)]
			let match_country = value >= 0? match_card.left : match_card.right
			if (country === match_country) return [(faction+f)%3, value]
		}
	}
	return false
}

function special_countries(wild, faction) {
	let cs = [] //countries
	switch (wild) {
	case "Brothers in Arms": 
		switch (faction){
		case 0: cs = ["Austria", "Hungary", "Bulgaria"]; break
		case 1: cs = ["USA", "Low Countries", "Rumania"]; break
		case 2: cs = ["Spain", "Czechoslovakia"]; break
		}; break
	case "Ethnic Ties":
		switch (faction){
		case 0: cs = ["Austria", "Sweden", "Norway"]; break
		case 1: cs = ["USA", "Norway", "Low Countries", "Rumania"]; break
		case 2: cs = ["Yugoslavia", "Poland", "Bulgaria"]; break
		}; break
	case "Birds of a Feather":
		switch (faction){
		case 0: cs = ["Poland", "Spain", "Bulgaria", "Baltic States"]; break
		case 1: cs = ["USA", "Low Countries", "Denmark", "Czechoslovakia"]; break
		case 2: cs = ["Spain"]; break
		}; break
	case "Birds of a Feather ":
		switch (faction){
		case 0: cs = ["Portugal", "Spain", "Yugoslavia", "Latin America"]; break
		case 1: cs = ["USA", "Low Countries", "Denmark", "Sweden"]; break
		case 2: cs = ["Spain"]; break
		}; break
	case "Ties That Bind":
		switch (faction){
		case 0: cs = ["Austria", "Hungary", "Bulgaria"]; break
		case 1: cs = ["USA", "Low Countries", "Czechoslovakia"]; break
		case 2: cs = ["Spain", "Yugoslavia"]; break
		}; break
	case "Versailles":
		switch (faction){
		case 0: cs = ["Austria", "Hungary", "Turkey"]; break
		case 1: cs = ["Poland", "Czechoslovakia", "Yugoslavia"]; break
		case 2: cs = ["Yugoslavia"]; break
		}; break
	case "Isolationism": {
		cs = ["USA", "Low Countries", "Spain", "Sweden", "Poland", "Turkey"]
		for (let i = cs.length-1; i >= 0; i--) {
			if (!has_rival_influence(cs[i], faction)) array_remove(cs, i)
		}
	} break
	case "Fear & Loathing": {
		let list = [
			["Low Countries", "Czechoslovakia", "Poland", "Yugoslavia", "Norway", "Rumania", "USA",],
			["Austria", "Hungary", "Bulgaria", "Turkey", "Latin America", "Persia"],
			[ "Poland", "Rumania", "Turkey", "Finland", "Sweden", "Baltic States", "USA"]
		]
		for (let i = 0; i <= 2; i++) {
			if (i === faction) continue
			for (const country of list[i]) {
				let c = COUNTRIES.findIndex(x => x.name === country)
				if (Math.floor(game.influence[c]/10) === i && game.influence[c]%10 !== 0) set_add(cs, country)
			}
		}
	} break

	case "Intimidation": { //Add any country next to controlled territory
		let control = []
		for (let i = 0; i < REGIONS.length; i++) {
			if (REGIONS[i].tpye !== 'sea' && who_controls_region(i, game.activeNum) === game.activeNum) control.push(i)
		}
		for (let a of control) {
			for (let b of BORDERS[a]) {
				if (REGIONS[b].country && is_neutral(REGIONS[b].country)) set_add(cs, REGIONS[b].country)
			}
		}
		set_delete(cs, "USA")
	} break	

	case "Guarantee": { //Add any country next to rival controlled territory
		let control = []
		for (let i = 0; i < REGIONS.length; i++) {
			if (REGIONS[i].type === 'sea') continue
			let f = who_controls_region(i)
			if (f !== game.activeNum && f !== -1) control.push(i)
		}
		for (let a of control) {
			for (let b of BORDERS[a]) {
				if (REGIONS[b].country && is_neutral(REGIONS[b].country)) set_add(cs, REGIONS[b].country)
			}
		} 
		set_delete(cs, "USA")
	} break

		//Add/remove any country; factory -1
	case "Foreign Aid": if (game.ind[faction] > 0) for (let i = 0; i < COUNTRIES.length; i++) cs.push(COUNTRIES[i].name) 
		break
	}
	return cs
}

function generate_ineligible_countries(){ //for diplomacy
	//auto include greats, majors (except USA), colonies, and armed minors AND ALBANIA?
	let ics = ["Germany", "Italy", "Britain", "France", "USSR", "Libya", /*"Canada",*/ "Gibraltar", "India", "Malta", "Middle East", "French North Africa", "Syria", "Albania",] //the Albania question
	for (let i = 0; i < game.influence.length; i++) {
		if (game.influence[i]%10 === 0) {
			set_add(ics, COUNTRIES[i].name)
		}
	}
	//armed minors
	for (let i = 0; i < game.block_nation.length; i++){
		if (game.block_nation[i] === 6) { //any blocks at all imply an armed minor, because taking the capital *should* remove all neutral forts
			set_add(ics, REGIONS[game.block_location[i]].country) //this *shouldn't* throw an error because a neutral block will never be at sea.
		}
	}
	return ics
}

function factory_cost(faction){
	let cost = faction+5
	let victim = 0
	if (game.relationship[faction]){
		if (game.relationship[faction][0] === 1) victim++
		if (game.relationship[faction][1] === 1) victim++
	}
	if (faction === 2) victim*2
	if (faction === 1 && game.usa_satellite) cost--
	return cost - victim
}

function can_make_factory(cards, faction){
	if (game.factory_increase[faction] >= 2) return false
	let factories = 0
	let cost = factory_cost(faction)
	for (let i=0; i < cards.length; i++){
		factories += ICARDS[cards[i]].value
		if (factories >= cost) return true
	}
	return false
}

function generate_ineligible_techs(faction){
	let its = []
	let techs = game.tech[faction]
	let vaults = game.vault[faction]
	for (let i = 0; i < techs.length; i++) {
		const card = ICARDS[Math.abs(techs[i])]
		if (card.special) continue
		set_add(its, techs[i] > 0? card.left : card.right)
	}
	for (let i = 0; i < vaults.length; i++) {
		const card = ICARDS[Math.abs(vaults[i])]
		if (card.special) continue
		set_add(its, vaults[i] > 0? card.left : card.right)
	}
	let ar = game.atomic[faction] //atomic research
	if (!set_has(its, "Atomic Research 3") || (ar[2] && ar[2] === game.turn)) set_add(its, "Atomic Research 4")
	if (!set_has(its, "Atomic Research 2") || (ar[1] && ar[1] === game.turn)) set_add(its, "Atomic Research 3")
	if (!set_has(its, "Atomic Research 1") || (ar[0] && ar[0] === game.turn)) set_add(its, "Atomic Research 2")
	return its
}

states.government = {
	inactive: "take a government action",
	prompt(){
		const p = game.activeNum
		view.prompt = "Perform an action or pass"
		view.actions.pass = 1
		if (game.selected && Array.isArray(game.selected) && can_make_factory(game.selected, p)){
			view.actions.build_factory = 1
		}
		if (can_make_factory(game.hand[p][1], p)){
			for (let card of game.hand[p][1]) {
				gen_action_industry(card)
			}
		}
		const spy_actions = ["Mole","Agent","Sabotage","Spy Ring","Code Break","Coup"] //and Double Agent

		const ics = generate_ineligible_countries()
		const ahand = game.hand[p][0]
		for (let i = 0; i < ahand.length; i++){
			const card = ACARDS[ahand[i]]
			if (card.left && !set_has(ics, card.left)) gen_action_influence(ahand[i])
			if (card.right && !set_has(ics, card.right)) gen_action_influence((ahand[i])*-1)
			if (card.special) {
				let s_c = special_countries(card.special, p)
				for (let j = 0; j < s_c.length; j++) {
					if (!set_has(ics, s_c[j])) {
						gen_action_influence_special(ahand[i]); break
					}
				}
			}
		}
		const ets = {} //eligible techs
		const its = generate_ineligible_techs(game.activeNum)
		const ihand = game.hand[p][1]
		//first find all techs that are eligible
		for (let i = 0; i < ihand.length; i++) {
			const ts = techs_on_card(ihand[i])
			for (let j = 0; j < ts.length; j++) {
				if (set_has(its, ts[j])) continue
				if (ets[ts[j]]){
					ets[ts[j]].multi = true; ets[ts[j]].printed = (ets[ts[j]].printed || card_has_tech_printed(ihand[i], j))
				} else {
					ets[ts[j]] = {multi: false, printed: card_has_tech_printed(ihand[i], j)}
				}
			}
		}
		//then find all innercards that reference eligible techs
		for (let i = 0; i < ihand.length; i++) {
			const card = ICARDS[ihand[i]]
			if (card.special){
				if (spy_actions.includes(card.special)) {
					gen_action_intelligence(ihand[i]); continue
				}
				const list = techs_from_science(card)
				for (let j = 0; j < list.length; j++){
					if(ets[list[j]] && ets[list[j]].multi && ets[list[j]].printed){
						gen_action_technology(ihand[i]); break
					}
				}	
			}else{
				const l = card.left
				const r = card.right
				if (l === industrial_espionage) {
					const list = industrial_espionage()
					for (let j = 0; j < list.length; j++){
						if(ets[list[j]] && ets[list[j]].multi && ets[list[j]].printed){
							gen_action_technology(ihand[i]); break
						}
					}
				} else if (ets[l] && ets[l].multi) gen_action_technology(ihand[i])
				if (r === industrial_espionage) {
					const list = industrial_espionage()
					for (let j = 0; j < list.length; j++){
						if(ets[list[j]] && ets[list[j]].multi && ets[list[j]].printed){
							gen_action_technology(ihand[i]*-1); break
						}
					}
				} else if (ets[r] && ets[r].multi) gen_action_technology(ihand[i]*-1)
			}
		}
	},
	influence(ic){	//ic stands for inner card
		log(`${game.active} influence ${ic > 0 ? ACARDS[ic].left : ACARDS[Math.abs(ic)].right}`)
		game.pass_count = 0
		array_remove_item(game.hand[game.activeNum][0], Math.abs(ic))
		let match = check_matching_diplomacy(ic, game.activeNum)
		if (match) {
			let f = match[0]
			let card = match[1]
			log(`The card (#${Math.abs(ic)}) cancels the ${FACTIONS[f]}'s card (#${Math.abs(card)})`)
			game.discard[0].push(Math.abs(ic))
			game.discard[0].push(Math.abs(card))
			array_remove_item(game.diplomacy[f], card)
			
		} else {
			game.diplomacy[game.activeNum].push(ic)
		}
		set_next()
	},
	influence_special(ic){
		push_undo()
		game.selected = ic
		game.state = "government_wildcard"
	},
	technology(ic){
		push_undo()
		game.selected = ic
		game.state = "government_second_tech"
	},
	intelligence(ic){
		push_undo()
		game.selected = ic
		game.state = "intelligence_choose_target"
	},
	industry_card(c){
		if (!game.selected || !Array.isArray(game.selected)) game.selected = [c] 
		else if (game.selected.includes(c)) {
			array_remove_item(game.selected, c)
			if (game.selected.length === 0) game.selected = null
		} else game.selected.push(c)
	},
	build_factory(){
		game.pass_count = 0
		game.discard[1].push(...game.selected)
		let cards = ""
		for (let card of game.selected) {
			array_remove_item(game.hand[game.activeNum][1], card)
			cards += `(#${Math.abs(card)}) `
		}
		game.ind[game.activeNum] += 1
		game.factory_increase[game.activeNum] += 1
		log(`${game.active} has built a factory using the following cards: ${cards}`)
		game.selected = null
		set_next()
	},
	pass(){
		game.selected = null
		log(`${game.active} passed`)
		game.pass_count += 1
		if (three_consecutive_passes()) {
			handsize_check()
		} else {
			set_next()
		}
	},	
}

function viable_target (f, c){
	switch (c) {
	case "Mole": return game.vault[f].length > 0
	case "Agent": return has_blocks_anywhere(f)
	case "Sabotage": return game.ind[f] > 0
	case "Spy Ring":
	case "Code Break": return (game.hand[f][0].length > 0 || game.hand[f][1].length > 0)
	case "Coup": return has_influence_anywhere(f)
	}
}

function discarded_double_agent() {
	for (let card of game.discard[1]) {
		if (ICARDS[card].special && ICARDS[card].special === "Double Agent") return true
	}
	return false
}

function resolve_target(faction) {
	push_undo()
	log(`The ${game.active} targeted the ${FACTIONS[faction]} with ${ICARDS[game.selected].special}`)
	game.espionage = game.activeNum
	game.target = faction
	if (discarded_double_agent()){
		resolve_espionage()
	} else {
		clear_undo()
		game.state = "double_agent"
		set_active(faction)
	}
}

states.intelligence_choose_target = {
	inactive: "take a government action",
	prompt(){
		const a = ICARDS[game.selected].special
		view.prompt = `Who do you wish to target with ${a}?`
		if (game.activeNum !== 0) view.actions.axis = viable_target(0, a)? 1:0
		if (game.activeNum !== 1) view.actions.west = viable_target(1, a)? 1:0
		if (game.activeNum !== 2) view.actions.ussr = viable_target(2, a)? 1:0
	},
	axis(){resolve_target(0)},
	west(){resolve_target(1)},
	ussr(){resolve_target(2)}
// Mole:
// Inspect a Rival's Secret Vault. Pair this card with any Tech in your hand that matches a Tech found there to Achieve that Tech (show Rival). If not, discard
//immediately jump to active player showing the target player's vault. Can invent a tech
}

function has_double_agent(faction){
	const ihand = game.hand[faction][1]
	for (let i = 0; i < ihand.length; i++) {
		if (ICARDS[ihand[i]].special && ICARDS[ihand[i]].special === 'Double Agent') return true
	}
	return false
}

function faction_of_selected_intel(){
	for (let i = 0; i < 3; i++) {
		const ihand = game.hand[i][1]
		for (let card of ihand) {
			if (card === game.selected) return i
		}
	}
}

function state_from_special(s){
	switch (s) {
	case "Mole": return "mole"
	case "Agent": return "agent"
	case "Sabotage": return "sabotage"
	case "Spy Ring": return "spy_ring"
	case "Code Break": return "code_break"
	case "Coup": return "coup"
	}
}
function cleanup_intel(){
	set_active(faction_of_selected_intel(game.selected))
	array_remove_item(game.hand[game.activeNum][1], game.selected)
	game.discard[1].push(game.selected)
	game.selected = null
	game.pass_count = 0
	game.state = "government"
	set_next()
}

function  resolve_espionage(){
	switch (ICARDS[game.selected].special){
	case 'Spy Ring': game.draw = spy_ring_steal(game.target); set_active(game.target); break
	case 'Sabotage': game.ind[game.target] -= 1; log("They lose one industry"); cleanup_intel(); return
	case 'Mole':
	case 'Agent':
	case 'Coup':
	case 'Code Break': set_active(game.espionage); break
		
	}
	game.state = state_from_special(ICARDS[game.selected].special)
}

states.double_agent = {
	inactive: `potentially reverse with double agent`,
	prompt(){
		const da = has_double_agent(game.activeNum)
		view.prompt = da? `Reverse ${ICARDS[game.selected].special} with double agent?` : "No double agent, must pass"
		view.actions.pass = 1
		if (da) {
			const ihand = game.hand[game.activeNum][1]
			for (let i = 0; i < ihand.length; i++) {
				if (ICARDS[ihand[i]].special && ICARDS[ihand[i]].special === 'Double Agent') gen_action_intelligence(ihand[i])
			}
		}
	},
	pass(){
		clear_undo()
		resolve_espionage()
	},
	intelligence(ic){
		clear_undo()
		log("Double Agent reversal!")
		game.discard[1].push(ic)
		array_remove_item(game.hand[game.activeNum][1], ic)
		game.target = game.espionage
		game.espionage = game.activeNum
		resolve_espionage()
	}
}

function spy_ring_steal(f){
	const draw = [[],[]]
	const hand = game.hand[f]
	let rand = random_bigint(hand[0].length + hand[1].length)
	if (rand < hand[0].length) 
		draw[0].push(hand[0].splice(rand,1)[0])
	else 
		draw[1].push(hand[1].splice(rand-hand[0].length,1)[0])
	return draw
}

states.spy_ring = {
	inactive: "resolve Spy Ring",
	prompt(){
		view.prompt = "Card stolen by Spy Ring."
		if (game.activeNum === game.espionage) view.actions.draw = 1
		if (game.activeNum === game.target) view.actions.done = 1
		view.draw = game.draw
		//done is to acknowledge and pass turn, draw is to draw. Then figure out who played the card originally, clean up cards and hand, and pass turn.
	},
	done(){
		clear_undo()
		set_active(game.espionage)
	},
	draw(){
		game.hand[game.activeNum][0].push(... game.draw[0])
		game.draw[0] = []
		game.hand[game.activeNum][1].push(... game.draw[1])
		game.draw[1] = []
		cleanup_intel()
	}
}

states.mole = {
	inactive: "resolve Mole",
	prompt(){
		view.prompt = "View target's vault. May invent a tech using a card from the vault (and Mole)."
		view.actions.done = 1
		view.vault[game.target] = game.vault[game.target]
		const techs = techs_in_vault(game.target)
		const its = generate_ineligible_techs(game.activeNum)
		const ihand = game.hand[game.activeNum][1]
		for (let i = 0; i < ihand.length; i++){
			const card = ICARDS[ihand[i]]
			if (card.left && set_has(techs, card.left) && !set_has(its, card.left)) gen_action_technology(ihand[i])
			if (card.right && set_has(techs, card.right) && !set_has(its, card.right)) gen_action_technology(ihand[i]*-1)
		}
	},
	done(){cleanup_intel()},
	technology(ic){
		push_undo()
		game.state = "government_invent_mole"
		game.selected = [ic, 31] //31 is the mole. rewriting the selected card.
	}
}

states.government_invent_mole = {
	inactive: "resolve Mole",
	prompt(){
		let tech = find_tech(ICARDS[Math.abs(game.selected[0])], ICARDS[31])
		view.prompt = `Inventing ${tech}: Discard the mole or place inside your vault.`
		view.vault[game.target] = game.vault[game.target]
		game.vault[game.activeNum].length >= HANDSIZE[game.activeNum]*2 ? view.actions.vault = 0 : view.actions.vault = 1
		gen_action_industry(31)
	},
	industry_card(c){ //discard card
		clear_undo()
		let original_faction
		for (let i = 0; i < 3; i++){
			for (let j = 0; j < game.hand[i][1].length; j++){
				if (game.hand[i][1][j] === 31) original_faction = i
			}
		}
		let tc = game.selected[0] //tech card
		let side = tc > 0 ? 1 : -1		
		let tech = tc > 0 ? ICARDS[tc].left : ICARDS[Math.abs(tc)].right
		let f = game.activeNum
		if (tech.includes("Atomic")) game.atomic[f].push(game.turn)
		log(`${game.active} has invented ${tech}`)
		game.tech[f].push(game.hand[f][1].splice(game.hand[f][1].indexOf(Math.abs(tc)), 1)[0]*side)
		array_remove_item(game.hand[original_faction][1], c)
		game.discard[1].push(c)
		game.selected = null
		game.espionage = null
		game.target = null
		game.pass_count = 0
		game.state = "government"
		set_active(original_faction)
		set_next()
	},
	vault(){
		clear_undo()
		let tech = find_tech(ICARDS[Math.abs(game.selected[0])], ICARDS[31])
		let f = game.activeNum
		let original_faction
		for (let i = 0; i < 3; i++){
			for (let j = 0; j < game.hand[i][1].length; j++){
				if (game.hand[i][1][j] === 31) original_faction = i
			}
		}
		if (tech.includes("Atomic")) game.atomic[f].push(game.turn)
		log(`${game.active} has placed a technology in their secret vault`)
		game.vault[f].push(...game.selected)
		array_remove_item(game.hand[f][1], Math.abs(game.selected[0]))
		array_remove_item(game.hand[original_faction][1], 31)
		game.state = "acknowledge_mole"
		set_active(game.target)
		game.selected = original_faction //used to remember who should be next in turn order
	}
}

states.acknowledge_mole = {
	inactive: "resolve Mole",
	prompt(){
		const vault = game.vault[game.espionage]
		const card = vault[vault.length-2]
		const tech = card > 0? ICARDS[card].left : ICARDS[card].right
		view.prompt = `The ${FACTIONS[game.espionage]} has invented ${tech} and placed it in their vault.` 
		view.actions.done = 1
		view.vault[game.espionage][vault.length-2] = vault[vault.length-2]
		view.vault[game.espionage][vault.length-1] = vault[vault.length-1]
	},
	done(){
		set_active(game.selected)
		game.state = "government"
		game.selected = null
		game.espionage = null
		game.target = null
		game.pass_count = 0
		set_next()
	}
}

states.agent = {
	inactive: "resolve Agent",
	prompt(){
		view.prompt = `View all blocks of the ${FACTIONS[game.target]} in one region`
		if (game.view_region) view.actions.done = 1
		else for (let i = 0; i < REGIONS.length; i++) {
			if (contains_faction(i, game.target)) gen_action_region(i)
		}
	},
	region(r) { //Needs work figure out the logic to have this be in the replay file?
		game.view_region = r
	},
	done(){
		game.view_region = null
		cleanup_intel()
	}
}

states.code_break = {
	inactive: "resolve Code Break",
	prompt(){
		view.prompt = "View target's cards"
		view.actions.done = 1
		view.hand[game.target] = game.hand[game.target]		
	},
	done(){
		log(`The ${game.active} viewed the ${FACTIONS[game.target]}'s hand`)
		cleanup_intel()
	}
}
states.coup = {
	inactive: "resolve Coup",
	prompt(){
		view.prompt = "Choose a country to Coup"
		view.actions.pass = 1
		for (let i = 0; i < REGIONS.length; i++) {
			if (REGIONS[i].type === 'sea') continue
			const c = COUNTRIES.findIndex(x => x.name === REGIONS[i].country)
			const v = game.influence[c]
			if (v !== -1 && Math.floor(v/10) === game.target && v%10 !== 0) gen_action_region(i)
		}
	},
	region(r){
		const c = COUNTRIES.findIndex(x => x.name === REGIONS[r].country)
		game.influence[c] = -1
		log(`The ${game.active} performed a coup in ${REGIONS[r].country}`)
		cleanup_intel()
	},
	pass(){
		log(`The ${game.active} decided to not coup!`)
		cleanup_intel()
	}
}

states.government_wildcard = {
	inactive: "take a government action",
	prompt(){
		view.prompt = "Select country to apply Wild Card"
		let ics = generate_ineligible_countries()
		let card = ACARDS[game.selected]
		let s_c = special_countries(card.special, game.activeNum)
		for (let i = 0; i < REGIONS.length; i++) {
			if (REGIONS[i].country && s_c.indexOf(REGIONS[i].country) !== -1 && !set_has(ics, REGIONS[i].country)){
				gen_action_region(i)
			}
		}
	},
	region(r){
		let c = COUNTRIES.findIndex(c => c.name === (REGIONS[r].country))  
		influence_country(c, game.activeNum)
		update_production()

		let s = ACARDS[game.selected].special
		log(`${game.active} uses ${s} to affect ${COUNTRIES[c].name}`)
		if (s === "Foreign Aid") {
			game.ind[game.activeNum] -= 1
			log("They lose one industry")
		}

		game.discard[0].push(game.hand[game.activeNum][0].splice(game.hand[game.activeNum][0].indexOf(game.selected), 1)[0])
		game.selected = null
		game.pass_count = 0
		game.state = "government"
		set_next()
	},
}

states.government_second_tech = {
	inactive: "take a government action",
	prompt(){
		view.prompt = "Select a matching tech"
		view.actions.undo = 1
		let tech
		let card = ICARDS[Math.abs(game.selected)]
		if (card.left && game.selected > 0) tech = card.left
		else if (card.right && game.selected < 0) tech = card.right
		else tech = techs_from_science(card)
		if (tech === "Industrial Espionage") tech = industrial_espionage()

		let ihand = game.hand[game.activeNum][1]
		if (Array.isArray(tech)){ //as the first card is special, the second card cannot be special
			let its = generate_ineligible_techs(game.activeNum)
			for (let i = 0; i < ihand.length; i++){
				if (ihand[i] === Math.abs(game.selected)) continue 
				let card = ICARDS[ihand[i]]
				let l = card.left
				let r = card.right
				if (l && !set_has(its, l) && tech.indexOf(l) !== -1) gen_action_technology(ihand[i])
				if (r && !set_has(its, r) && tech.indexOf(r) !== -1) gen_action_technology((ihand[i])*-1)
			}
		} else {
			for (let i = 0; i < ihand.length; i++){
				if (ihand[i] === Math.abs(game.selected)) continue 
				let card = ICARDS[ihand[i]]
				let l = card.left
				let r = card.right
				let s = card.special
				if (l && (l === tech || (l === "Industrial Espionage" && set_has(industrial_espionage(), tech)))) gen_action_technology(ihand[i])
				if (r && (r === tech || (r === "Industrial Espionage" && set_has(industrial_espionage(), tech)))) gen_action_technology((ihand[i])*-1)
				if (s && set_has(techs_from_science(card), tech)) gen_action_technology((ihand[i]))
			}
		}
	},
	technology(ic){
		push_undo()
		game.state = "government_invent"
		game.selected = [game.selected, ic]
	}
}

states.government_invent = {
	inactive: "take a government action",
	prompt(){
		let tech = find_tech(ICARDS[Math.abs(game.selected[0])], ICARDS[Math.abs(game.selected[1])])
		view.prompt = `Inventing ${tech}: Discard one of the cards or place inside your vault.`
		game.vault[game.activeNum].length >= HANDSIZE[game.activeNum]*2 ? view.actions.vault = 0 : view.actions.vault = 1
		let hand = game.hand[game.activeNum][1]
		let pair = pair_has_tech_printed(game.selected[0], game.selected[1], tech)
		for (let i = 0; i < hand.length; i++){
			if ((hand[i] === Math.abs(game.selected[0]) || hand[i] === Math.abs(game.selected[1]))
				&& (pair || !card_has_tech_printed(hand[i], tech))) gen_action_industry(hand[i])
		}
	},
	industry_card(c){ //discard card
		clear_undo()
		let tc = c === Math.abs(game.selected[0])? game.selected[1] : game.selected[0] //tech card
		let side = tc > 0 ? 1 : -1		
		let tech = tc > 0 ? ICARDS[tc].left : ICARDS[Math.abs(tc)].right
		let f = game.activeNum
		if (tech.includes("Atomic")) game.atomic[f].push(game.turn)
		log(`${game.active} has invented ${tech}`)
		game.tech[f].push(game.hand[f][1].splice(game.hand[f][1].indexOf(Math.abs(tc)), 1)[0]*side)
		game.discard[1].push(game.hand[f][1].splice(game.hand[f][1].indexOf(c), 1)[0])
		game.selected = null
		game.pass_count = 0
		game.state = "government"
		set_next()
	},
	vault(){
		let tech = find_tech(ICARDS[Math.abs(game.selected[0])], ICARDS[Math.abs(game.selected[1])])
		let f = game.activeNum
		clear_undo()
		if (tech.includes("Atomic")) game.atomic[f].push(game.turn)
		log(`${game.active} has placed a technology in their secret vault`)
		game.vault[f].push(...game.selected)
		array_remove_item(game.hand[f][1], Math.abs(game.selected[0]))
		array_remove_item(game.hand[f][1], Math.abs(game.selected[1]))
		game.selected = null
		game.pass_count = 0
		game.state = "government"
		set_next()
	}
}


states.government_discard = {
	inactive: "discard cards down to hand limit",
	prompt(){
		let hand = game.hand[game.activeNum]
		view.prompt = "Discard until at hand size"
		view.actions.done = hand[0].length + hand[1].length + (game.vault[game.activeNum].length/2) <= HANDSIZE[game.activeNum]? 1 : 0
		if (view.actions.done === 0) {
			for (let card of hand[0]){
				gen_action_action(card)
			}
			for (let card of hand[1]){
				gen_action_industry(card)
			}
		}
	},
	action_card(c) {
		push_undo()
		let hand = game.hand[game.activeNum]
		game.discard[0].push(hand[0].splice(hand[0].indexOf(c), 1)[0])
		log(`Discarded Action card (#${c})`)
	},
	industry_card(c) {
		push_undo()
		let hand = game.hand[game.activeNum]
		game.discard[1].push(hand[1].splice(hand[1].indexOf(c), 1)[0])
		log(`Discarded Investment card (#${c})`)
	},
	done() {
		clear_undo()
		handsize_check()
	}
}

// DRAW
states.draw_setup = {
	inactive: "Setup",
	prompt(){
		view.prompt = "Draw Cards"
		view.actions.draw = 1
		view.draw = game.draw
	},
	draw(){
		game.hand[game.activeNum][0].push(... game.draw[0])
		game.draw = [[],[]]
 		end_setup()
	}
}

states.draw_production = {
	inactive: "Production",
	prompt(){
		view.prompt = "Draw Cards"
		view.actions.draw = 1
		view.draw = game.draw
	},
	draw(){
		game.hand[game.activeNum][0].push(... game.draw[0])
		game.draw[0] = []
		game.hand[game.activeNum][1].push(... game.draw[1])
		game.draw[1] = []
		end_production()
	}
}

states.draw_von = {
	inactive: "Drawing from Violation of Neutrality",
	prompt(){
		view.prompt = `${FACTIONS[game.turn_order_command[0]]} declared VoN, draw cards in outrage`
		 view.actions.draw = 1
		view.draw = game.draw
	},
	draw(){
		//some sort of function that reshuffles if needed
		const cards = game.draw[0].length
		game.hand[game.activeNum][0].push(... game.draw[0])
		game.draw[0] = []
		
		if( game.turn_order[(game.turn_order.indexOf(game.activeNum) + 1)%3] === game.turn_order_command[0])
			end_movement_phase()
		else {
			for (let i = 0; i < cards; i++)game.draw[0].push(-1)
			draw()
			set_next()
		}
	}
}

//COMMAND
states.command = {
	inactive: "play a Command card",
	prompt(){
		view.prompt = `${game.phase}: Play a card for Command or pass.`
		if (game.command_card[game.activeNum]){
			view.actions.pass = 0
			if (game.command_card[game.activeNum] < 0 ) 
				view.actions.confirm_investment = 1
			else if (game.phase !== 'Winter' && ACARDS[game.command_card[game.activeNum]].season !== game.phase)
				view.actions.confirm_season = 1
			else view.actions.confirm = 1
		}
		else {
			view.actions.pass = 1
			view.actions.confirm = 0
			let hand = game.hand[game.activeNum]
			for (let card of hand[0]){
				gen_action_action(card)
			}
			for (let card of hand[1]) {
				gen_action_industry(card)
			}
		}
	},
	action_card(c){
		push_undo()
		log(`${game.active} played a Command card`)
		game.command_card[game.activeNum] = c
		array_remove_item(game.hand[game.activeNum][0], c)
	},
	industry_card(c){
		push_undo()
		log(`${game.active} played a Command card`)
		game.command_card[game.activeNum] = c*-1
		array_remove_item(game.hand[game.activeNum][1], c)
	},
	pass(){
		log(`${game.active} passed`)
		game.pass_count += 1
		set_next_command()
	},
	confirm(){
		game.pass_count = 0
		set_next_command()
	},
	confirm_confirm_investment(){
		game.pass_count = 0
		set_next_command()
	},
	confirm_season(){
		game.pass_count = 0
		set_next_command()
	}
}

//MOVEMENT
function unit_movement(b, f){
	switch (game.block_type[b]) {
	case 0: return 0
	case 1: return 2 + has_tech(f, "Heavy Bombers")// air
	case 2: return 3// carrier
	case 3: return 2// sub
	case 4: return 3// fleet
	case 5: if (REGIONS[game.block_location[b]].type === "sea" )return 2
		return 3// Tank
	case 6: if (REGIONS[game.block_location[b]].type === "sea" )return 2
		return 2 + has_tech(f, "Motorized Infantry")// Infantry
	}
}

function unit_move_type(b) {//block
	switch (game.block_type[b]) {
	case 0: return 0
	case 1: return 'air'
	case 2: case 3: case 4: return "sea"
	case 5: case 6: return REGIONS[game.block_location[b]].type === "sea" ? "sea" : undefined
	}
}

function strategic_possible(b) {
	//not if disengaging
	if (game.block_type[b] === 1 && REGIONS[game.block_location[b]].type === 'sea' ||
		contains_hiding_enemy_sub(game.block_location[b])
	) return 0 //not air at sea, not if enemy sub hiding in location
	return 1
}

function aggression_possible(b){
	//not if disengaging
	if ((ACARDS[game.command_card[game.activeNum]].season !== game.phase && game.phase !== 'Winter') || //not with emergency command
		(game.block_type[b] === 1 && REGIONS[game.block_location[b]].type === 'sea')) //not air at sea
		return 0
	return 1
}

function ans_illegal(r, b){
	const f = faction_of_block(b)
	if ((are_enemies(f, game.control[r]) || (REGIONS[r].country && is_neutral(REGIONS[r].country))) && //enemy/neurtral and not occupied?
		number_of_blocks_in_region(r, b) === 0 && !contains_rival_blocks(r, f) && !can_hit_industry(b, r)//both checks are needed in case of a neutral 
	) return true
	return false
}

function first_block_in(b, r){
	const f = faction_of_block(b)
	for (let i = 0; i < game.block_location.length; i++) {
		if (i !== b && game.block_location[i] === r && faction_of_block(i) === f)
			return false
	}
	return true
}

function legal_end_space(b, m, r){
	const ans = is_ans(b)
	const area = REGIONS[r]
	const c = area.country ? COUNTRIES.findIndex(x => x.name === area.country) : false
	if ( m.moves > m.max_moves*2 || 
		(m.strategic_move && !m.strategic_possible) ||
		(m.aggression && !m.aggression_possible) ||
		(m.move_type && m.move_type === 'sea' && area.type === 'land' && 
			REGIONS[m.previous_space].type === 'land' && !shares_sea(m.previous_space, r)) ||
		(m.move_type && m.move_type === 'land' && area.type === 'sea') ||
		(m.land_combat && !ans && 
			border_limit(m.previous_space, r) <= map_get(game.border_count, get_border_id(m.previous_space, r ), 0) -
			(REGIONS[m.previous_space].type === 'sea' && has_tech(game.activeNum, 'LSTs'))) || //-1 from the count for invasions
		(area.country && is_neutral(area.country) && (
			//(area.country === 'USA' && game.activeNum !== 0 && !are_enemies(0, 1)) ||
			(c && set_has(game.cannot_von, c)) ||
			(game.influence[c]%10 === 2 && (Math.floor(game.influence[c])/10 === game.activeNum || are_enemies(game.activeNum, Math.floor(game.influence[c]/10)))))) ||
		(m.sea_combat && !ans) ||
		(ans && ans_illegal(r, b)) ||
		(game.block_type[b] === 1 && (game.control[r] !== game.activeNum || area.type === 'sea') && (m.strategic_move || REGIONS[m.origin_space].type === 'sea')) ||
		(game.block_type[b] === 1 && area.type === 'sea' && REGIONS[m.origin_space].type === 'sea') ||
		(game.phase === "Winter" && c !== 5) //5 === ussr
	) return false
	return true
}

function update_mvmt(b, m, r){
	const area = REGIONS[r]
	const rb = contains_rival_blocks(r, game.activeNum)
	const bt = can_hit_industry(b, r) //bombing target
	const c = area.country ? COUNTRIES.findIndex(x => x.name === area.country) : false
	m.moves += area.ocean ? 2 : 1
	m.previous_space = game.block_location[b]
	if (!m.move_type) {
		if (area.type === 'sea') {m.move_type = 'sea'; m.max_moves = 2}
		else if (area.type === 'land') m.move_type = 'land'
		if (REGIONS[m.previous_space].type === 'strait' && game.control[m.previous_space] !== game.activeNum && !are_enemies(game.activeNum, game.control[m.previous_space], m.previous_space)) {m.move_type = 'sea'; m.max_moves = 2}
	} 
	m.aggression = (game.control[r] === game.activeNum || game.control[r] === 3) ? 0 : 1
	if (m.moves > m.max_moves) m.strategic_move = 1
	if ((game.control[r] !== game.activeNum && game.control[r] !== 3) || 
		contains_hiding_enemy_sub(r, game.activeNum)) m.strategic_possible = 0
	if (area.type === 'strait' && game.activeNum !== game.control[r] && !is_neutral(area.country) && 
		!are_enemies(game.activeNum, game.control[r], r)) m.aggression_possible = 0
	if ((m.moves >= m.max_moves && m.strategic_possible === 0) || (m.moves >= m.max_moves*2) || //out of moves
		(m.move_type && m.move_type === 'sea' && area.type === 'land') ||
		(m.move_type && m.move_type === 'land' && area.type === 'sea') ||
		(c && area.type !== 'strait' && set_has(game.cannot_von, c)) || //must stop and illegal stop if.
		(game.phase === "Winter" && c !== 5) || //5 === ussr
		(rb && (game.block_type[b] !== 1 && game.block_type[b] !== 3) && //rival pieces && not plane, sub
		((area.type !== 'strait' && area.type !== 'sea') || are_enemies(game.activeNum, game.control[r]) || 
		(area.country && is_armed_minor(area.country))))) m.must_stop = 1
	if ((rb || bt) && m.aggression) area.type === 'sea' ? m.sea_combat = 1 : m.land_combat = 1
	else {m.sea_combat = 0; m.land_combat = 0}
}

function update_battle(r){
	//battle is needed to determine who is in control of a region, and to remember that the region is contested
	//pieces can move in, or out, there can be more than one faction
	//except when at sea, there will always be conflict between all factions
	//Battlegroups could be made via a sub, but if they aren't made via a sub then battles are required.
	
	if (REGIONS[r].type === 'sea') return //pretty sure that sea battles are completely covered by battlegroups 
	const cxb = coexisting_blocks(r)
	let battle = map_has(game.battle, r)
	if (battle) { //a+w+u+n can go up only through movement, and go down via battle and retreat. Because update battle is checked after every movement, it can only go up by one
		let battle = map_get(game.battle, r)
		const a = contains_faction(r, 0)
		const w = contains_faction(r, 1)
		const u = contains_faction(r, 2)
		const n = contains_faction(r, -1)
		if (a+w+u+n === battle.length) return
		switch (a+w+u+n) {
		case 0: 
		case 1: map_remove(game.battle, r); return //contested information no longer needed
		case 2: //gone from 3 to 2
			if (!a) array_remove_item(battle, 0) 
			if (!w) array_remove_item(battle, 1)
			if (!u) array_remove_item(battle, 2)
			if (!n) array_remove_item(battle, -1); break
		case 3: //gone from 2 to 3, and thus the active is the latest
			battle.push(game.activeNum); break
		case 4: throw new Error('A battle should never have 4 factions, neutrals should have converted!')
		}
		map_set(game.battle, r, battle)
	}
	else if (cxb) {
		map_set(game.battle, r, [game.control[r], game.activeNum])
	}
}

function end_block_move(b){
	const r = game.block_location[b]
	const p = game.mvmt.previous_space
	const o = game.mvmt.origin_space
	log(`Moved from ${REGIONS[o].name} to ${REGIONS[r].name}.`)
	if (REGIONS[r].name === 'Ottawa' && !game.usa_satellite && game.activeNum === 0) usa_violation()
	if (victory_check_atomic(game.activeNum, b)) {
		goto_game_over(game.active, `The ${game.active} have successfully deployed an atomic bomb and achieved an Atomic Victory!`); return
	}
	set_delete(game.sub_hiding, b)

	if (game.mvmt.sea_combat || contains_hiding_enemy_sub(r)) {
		const opr = o*1000000 + p*1000 +r //battle groups
		if (game.battle_groups[opr]) game.battle_groups[opr].push(b)
		else game.battle_groups[opr] = [b]
		if (game.mvmt.sea_combat) set_add(game.battle_required, r)
	}
	if (game.mvmt.land_combat) {
		update_battle(r)
		if (game.block_type[b] !== 1){
			const border_id = get_border_id(r, p)
			map_set(game.border_count, border_id, map_get(game.border_count, border_id, 0) + is_inf_or_tank(b))
			if (REGIONS[p].type === "sea" && is_inf_or_tank(b)) set_add(game.invasion_blocks, b)
		}
	}
	if (game.mvmt.aggression === 1) {
		map_set(game.aggressed_from, b, [p, r])
		if (first_block_in(b, r) && (contains_rival_blocks(r, game.activeNum) || can_hit_industry(b))) set_add(game.battle_required, r)
		if (can_hit_industry(b) && !map_has(game.battle, r)) map_set(game.battle, r, [game.control[r], game.activeNum]) //for bombing specifically, make it a battle so you don't conquere with air
		if (game.block_type[b] !== 1 && !contains_enemy_blocks(r, game.activeNum) && set_has(game.battle_required, r)) {set_delete(game.battle_required, r); map_remove(game.battle, r)} //for bombing specifically, remove 
		if (game.control[r] !== -1) set_add(game.aggression_met, game.control[r])
		else {
			set_add(game.aggression_met, COUNTRIES.findIndex(c => c.name === REGIONS[r].country))
			if (!is_armed_minor(REGIONS[r].country)) arm_minor(REGIONS[r].country, game.activeNum)
		}
	}

	game.selected = null
	game.mvmt = {}
	game.count -= 1
	set_add(game.block_moved, b)
	game.state = "movement"
}

states.movement = {
	inactive: "move units.",
	prompt(){
		view.prompt = `Move units: ${game.count} moves left.`
		let rel = game.relationship[game.activeNum]
		if (game.block_moved.length === 0 && (rel.length === 0 || !rel[0] || !rel[1])) view.actions.declare_war = 1
		if (game.count === 0) view.actions.end_movement = set_contains(game.aggression_met, game.surprise) ? 1 : 0
		else {
			view.actions.end_movement_confirm = set_contains(game.aggression_met, game.surprise) ? 1 : 0
			for (let i = 0; i < game.block_nation.length; i++) {
				if (game.block_type[i] === 0) continue
				if (set_has(game.block_moved, i)) continue
				if (faction_of_block(i) !== game.activeNum) continue
				let r = game.block_location[i]
				if (REGIONS[r].type === 'sea' && game.control[r] !== 3 && 
					is_inf_or_tank(i) && map_has(game.battle, r)) continue //Convoys cannot disengage at sea, should only happen if you declare war
				gen_action_block(i)
			}
		}
	},
	block(b){
		push_undo()
		game.selected = b
		game.mvmt = {
			moves: 0,
			max_moves: unit_movement(b, game.activeNum),
			move_type: unit_move_type(b),
			aggression: 0,
			strategic_move: 0,
			origin_space: game.block_location[b], //used for battle groups
			previous_space: game.block_location[b],
			must_stop: 0,
			land_combat: 0,
			sea_combat: 0,
		}
		if (game.control[game.block_location[b]] !== 3 && coexisting_blocks(game.block_location[b])) {
			game.mvmt.disengage = 1
			game.mvmt.strategic_possible = 0
			game.mvmt.aggression_possible = 0
		} else {
			game.mvmt.disengage = 0
			game.mvmt.strategic_possible = strategic_possible(b)
			game.mvmt.aggression_possible = aggression_possible(b)
		}
		game.state = "movement_move"
	},
	declare_war(){
		push_undo()
		game.state = "declare_war"
	},
	end_movement(){
		check_gained_control()
	},
	end_movement_confirm(){
		game.count = 0
		check_gained_control()
	}
}

states.movement_move = {
	inactive: "move units.",
	prompt(){
		view.prompt = `Move units: ${game.count} moves left.`
		const spaces = BORDERS[game.block_location[game.selected]]
		if (legal_end_space(game.selected, game.mvmt, game.block_location[game.selected])) gen_action_block(game.selected) 
		else view.prompt = "This unit cannot end its move here."
		for(let r of spaces) {
			if (game.control[r] !== game.activeNum && game.control[r] !== 3 && game.control[r] !== -1 && 
			!are_enemies(game.activeNum, game.control[r]) && REGIONS[r].type !== 'strait') continue
			let new_mvmt = object_copy(game.mvmt)
			update_mvmt(game.selected, new_mvmt, r)
			if (!new_mvmt.must_stop || legal_end_space(game.selected, new_mvmt, r)) gen_action_region(r)
		}
	},
	region(r){
		update_mvmt(game.selected, game.mvmt, r)
		game.block_location[game.selected] = r
		if (game.mvmt.previous_space === game.mvmt.origin_space){
			if (game.battle_groups[game.mvmt.origin_space]) {
				array_remove_item(game.battle_groups[game.mvmt.origin_space], game.selected)
				if (game.battle_groups[game.mvmt.origin_space].length === 0) delete game.battle_groups[game.mvmt.origin_space]
			}
			if (game.mvmt.disengage === 1){
				update_battle(game.mvmt.origin_space)
				if (!contains_faction(game.mvmt.origin_space, game.activeNum)) set_delete(game.battle_required, game.mvmt.origin_space)
				if (is_inf_or_tank(game.selected)) {
					let border_id = get_border_id(r, game.mvmt.previous_space)
					map_set(game.border_count, border_id, map_get(game.border_count, border_id, 0)+1)
				}
			}
		}	
		const c = REGIONS[r].country
		const am = is_armed_minor(c)
		if (c && am && are_enemies(game.activeNum, game.minor_aggressor[COUNTRIES.findIndex(x => x.name === c)])) 
			set_add(game.gained_control[game.activeNum], COUNTRIES.findIndex(x => x.name === c))
		if (c && !am && REGIONS[r].type !== 'strait' && is_neutral(c)) arm_minor(c, game.activeNum)
		if (REGIONS[game.mvmt.previous_space].type === 'strait' && is_neutral(REGIONS[game.mvmt.previous_space].country)) {
			set_add(game.cannot_von, COUNTRIES.findIndex(x => x.name === REGIONS[game.mvmt.previous_space].country)) 
		}
		if (game.mvmt.must_stop) end_block_move(game.selected)
	},
	block(b){
		if(game.mvmt.moves !== 0){
			end_block_move(b)
		} else pop_undo()
	}
}

// COMBAT
states.choose_battle = {
	inactive: "choose battles.",
	prompt(){
		view.prompt = "Choose where to battle next."
		view.actions.end_choose_battle = game.battle_required.length === 0 ? 1 : 0
		const emergency = ACARDS[game.command_card[game.activeNum]].season !== game.phase && game.phase !== 'Winter'
		const winter = game.phase === 'Winter'
		let battle_posible = false
		if (emergency) {
			view.prompt = "No battles possible: emergency move."
		}
		else {
			for (let i = 0; i < REGIONS.length; i++) {
				if (winter && (REGIONS[i].type === 'sea' || REGIONS[i].country !== 'USSR')) continue
				if (set_has(game.battle_fought, i)) continue
				if (REGIONS[i].type === 'sea') {
					for (let bg in game.battle_groups) {
						if (bg%1000 === i) {
							gen_action_region(i)
							battle_posible = true
							break
						}
					}
				} else if (map_has(game.battle, i)){
					gen_action_region(i)
					battle_posible = true
				}
			}
			if (!battle_posible) view.prompt = "No more battles possible."
		}

		
	},
	region(r){
		set_delete(game.battle_required, r)
		set_add(game.battle_fought, r)
		pre_battle_setup(r)
	},
	end_choose_battle(){
		end_battle_phase()
	}
}

states.choose_defender = {
	inactive: "choose battles.",
	prompt(){
		view.prompt = "Determine defender."
		switch(game.activeNum){
		case 0: view.actions.west = 1; view.actions.ussr = 1; break
		case 1: view.actions.axis = 1; view.actions.ussr = 1; break
		case 2: view.actions.axis = 1; view.actions.west = 1; break
		}
		view.actions.both = 1
	},
	axis(){game.defender = 0; pre_battle_setup(game.active_battle)},
	west(){game.defender = 1; pre_battle_setup(game.active_battle)},
	ussr(){game.defender = 2; pre_battle_setup(game.active_battle)},
	both(){game.defender = 3; pre_battle_setup(game.active_battle)},
}

states.add_battle_group = {
	inactive: "choose battles.",
	prompt(){
		view.prompt = "Add a battle group."
		view.actions.done = game.selected? 1 : 0
		if (game.selected === null) {
			for (let group in game.battle_groups) {
				for (let block of game.battle_groups[group]) {
					if (faction_of_block(block) === game.activeNum) gen_action_block(block)
				}
			}
		}
	},
	block(b){
		push_undo()
		game.selected = b
		game.block_moved = game.battle_groups[find_battle_group(b)]
	},
	done(){
		clear_undo()
		add_battle_group(game.selected)
		game.selected = null
		game.block_moved = []
		if (factions_in_group(game.active_battle_blocks).length === 1) pre_battle_setup(game.active_battle)
		else {
			game.state = 'battle'
			set_next_battle()
		}
	}
}


function find_battle_group(b) {
	for (let bg in game.battle_groups) {
		for (let block of game.battle_groups[bg]) {
			if (block === b) return bg
		}
	}
}

function add_battle_group(b){
	let bg = find_battle_group(b)
	game.active_battle_blocks.push(...game.battle_groups[bg])
	delete game.battle_groups[bg]
}

states.battle = {
	inactive: "battle!",
	prompt(){
		view.prompt = "Attack or retreat!"
		const unused_blocks = game.active_battle_blocks.filter(x => !(set_has(game.block_moved, x)) && faction_of_block(x) === game.activeNum)
		const type = lowest_type(unused_blocks)
		const blocks = unused_blocks.filter(x => game.block_type[x] === type)
		const e = filter_local_enemy(game.activeNum)
		for (let b of blocks){
			if (can_retreat(b)) gen_action_retreat(b)
			if (can_hit_air(b, e)) gen_action_air(b)
			if (can_hit_naval(b, e)) gen_action_naval(b)
			if (can_hit_sub(b, e)) gen_action_sub(b)
			if (can_hit_ground(b, e)) gen_action_ground(b)
			if (can_hit_convoy(b, e)) gen_action_convoy(b)
			if (can_retreat(b) && can_hit_naval(b, e) && type === 2) gen_action_shootNscoot(b)
			if (can_hit_industry(b)) gen_action_strategic_bombing(b)
			gen_action_pass(b) //theoretically there is no pass, but we will just have pass
		}
	}, //Air Naval Ground Sub
	retreat(b){push_undo(); game.selected = b; game.state = "retreat"},
	air(b){process_attack(b, 0)},
	naval(b){process_attack(b, 1)},
	shootNscoot(b){process_attack(b, 1, 1)},
	ground(b){process_attack(b, 2)},
	sub(b){process_attack(b, 3)},
	convoy(b){process_attack(b, 4)},
	strategic_bombing(b){process_attack_industry(b)}, // needs work
	pass_attack(b){set_add(game.block_moved, b), set_next_battle()},
}

states.damage = {
	inactive: "battle!",
	prompt() {
		view.prompt = "Assign damage."
		const targets = game.active_battle_blocks.filter(x => faction_of_block(x) === game.activeNum && 
			CLASS[game.block_type[x]] === game.hit_class)
		const high = highest_step(targets)
		const options = targets.filter(x => game.block_steps[x] === high) 
		for (let option of options) {
			gen_action_bblock("bb_" + option)
		}
	},
	bblock(b) {
		b = parseInt(b.replace("bb_", ""))
		block_reduce(b)
		if ((game.block_type[b] === 2) || (is_inf_or_tank(b) && REGIONS[game.block_location[b]].type === 'sea')) 
			block_reduce(b)
		game.hits -= 1
		const targets = game.active_battle_blocks.filter(x => faction_of_block(x) === game.activeNum && 
			CLASS[game.block_type[x]] === game.hit_class)
		if (game.hits === 0 || targets.length === 0) {
			if (game.shootNscoot === false) set_next_battle()
			else {
				clear_undo()
				game.state = "retreat" 
				game.selected = game.shootNscoot 
				set_active(faction_of_block(game.selected))
			}
		}
	}
}

/*Upon Battle resolution (i.e., after a Land 
Combat Round or a fully resolved Sea 
Battle), Active ANS units in that area may
ReBase (exception: Escaped Subs may 
not ReBase). */

states.choose_retreat = {
	inactive: "retreat or rebase.",
	prompt(){
		//if game.defender === null then this was end of combat
		//if game.must === null then this is an action, and this state shouldn't be possible
		//if neither then this is a sub escape/airplain at the end of a sea battle forced rebase
		if (game.defender === null) 
			view.prompt = "Choose which blocks to retreat or rebase."
		else if (game.must_retreat === null)
			throw new Error("should never choose retreat from an action")
		else
			view.prompt = "You must rebase active airplains and may escape with active submarines."

		const must = game.must_retreat.filter(x => faction_of_block(x) === game.activeNum)
		const may = game.may_retreat.filter(x => faction_of_block(x) === game.activeNum)
		const blocks = set_union(may, must)

		view.actions.done = must.length === 0? 1 : 0
		if (blocks.length === 0) view.prompt = "No more retreats possible"
		for (const block of blocks) {
			gen_action_block(block)
		}
	},
	block(b) {
		push_undo()
		if (game.defender !== null && game.must_retreat !== null && game.block_type[b] === 3) {
			set_delete(game.may_retreat, b)
			set_delete(game.active_battle_blocks, b)
			set_add(game.sub_hiding, b)
		} else {
			game.selected = b
			game.state = "retreat"
		}
	},
	done() {
		const may = game.may_retreat.filter(x => faction_of_block(x) === game.activeNum)
		for (const block of may) {
			array_remove_item(game.may_retreat, block)
		}
		set_next_retreat()
	}
}

states.retreat = {
	//if game.defender === null then this was end of combat
	//if game.must === null then this is an action
	//if neither then this is a sub escape/airplain at the end of a sea battle forced rebase
	inactive: "retreat or rebase.",
	prompt(){
		view.prompt = "Retreat block."
		const block = game.selected
		const region = game.block_location[block]
		const retreat = (game.must_retreat === null || (game.defender === null && set_has(game.must_retreat, block)))

		let cannot_retreat = true
		if (is_ans(block)) {//rebase
			const regions = rebase_locations(region, block, retreat) 
			for (const r of regions) {gen_action_region(r); cannot_retreat = false}
		}
		if (game.block_type[block] !== 1 && retreat) {//retreat
			const regions = retreat_locations(region, block)
			for (const r of regions) {gen_action_region(r); cannot_retreat = false}
		}

		if (cannot_retreat) {
			if (game.must_retreat === null) throw new Error("this block cannot retreat yet picked retreat as an action!")
			if (set_has(game.must_retreat, block)) {
				view.prompt = "Nowhere for this block to move to: it must die."
				view.actions.no_valid_retreats = 1
			}
			if (set_has(game.may_retreat, block)) {
				view.prompt = "Nowhere for this block to move to."
			}
		}
	},
	region(r){
		if (game.must_retreat !== null) push_undo
		const b = game.selected
		const previous_space = game.block_location[b]
		game.block_location[b] = r
		set_delete(game.active_battle_blocks, b)
		
		if (is_ans(b)) {
			set_delete(game.sub_hiding, b)
			if (game.may_retreat !== null) {
				set_delete(game.may_retreat, b)
				set_delete(game.must_retreat, b)
			}
		}			
		else {
			let border_id = get_border_id(r, previous_space)
			map_set(game.border_count, border_id, map_get(game.border_count, border_id, 0)+1)
		}
				
		game.selected = null
		game.shootNscoot = false

		if (game.must_retreat !== null) game.state = 'choose_retreat'
		else set_next_battle()
	},
	no_valid_retreats(){
		push_undo()
		log("Block had no valid rebase options and was destroyed")
		remove_block(game.selected)
		game.state = 'choose_retreat'
	}
}

//MISC
states.blockade = { //Craig said that blockades should just be an acknowledgement, and that blockades aren't optional. 
	inactive: "Blockade Phase",
	prompt(){
		view.prompt = "Mark Blockades."
		view.actions.mark_all = 1
		//view.actions.pass = 1
		//Needs work
		//determine which regions could be blockades
	},
	// region(r){
	// 	const tp = trade_partner(r)
		
	// 	if (game.blockade_possible.includes(r)) {
	// 		array_remove_item(game.blockade_possible, r)
	// 		set_add(game.blockade, r)
	// 		game.blockaded_pop[tp] += REGIONS[r].pop
	// 		game.blockaded_res[tp] += REGIONS[r].res
	// 	}
	// 	else if (game.blockade_transafrica_possible.includes(r)){
	// 		array_remove_item(game.blockade_transafrica_possible, r)
	// 		set_add(game.blockade_transafrica, r)
	// 		game.blockaded_res[tp] += REGIONS[r].res
	// 	}
	// 	else throw new Error ('')
	// },
	mark_all(){
		for (let i = game.blockade_possible.length -1; i >= 0; i--) {
			let tp = trade_partner(game.blockade_possible[i])
			if (tp !== game.activeNum) {
				let r = game.blockade_possible[i]
				set_add(game.blockade, game.blockade_possible.splice(i, 1)[0])
				game.blockaded_pop[tp] += REGIONS[r].pop
				game.blockaded_res[tp] += REGIONS[r].res
			}
		}
		for (let i = game.blockade_transafrica_possible.length -1; i >= 0; i--) {
			let tp = trade_partner(game.blockade_transafrica_possible[i])
			if (tp !== game.activeNum) {
				let r = game.blockade_transafrica_possible[i]
				set_add(game.blockade_transafrica, game.blockade_transafrica_possible.splice(i, 1)[0])
				game.blockaded_res[tp] += REGIONS[r].res - (REGIONS[r].tres ?? 0)
				
			}
		}
		next_blockades(false)
	},
	// pass(){
	// 	next_blockades(false)
	// }
}

states.vault_reveal = {
	inactive() {
		let inactive = states[game.previous_state]?.inactive || game.state
		if (typeof inactive === "function")
			return inactive()
		else
			return `Waiting for ${game.active} to ${inactive}`
	},
	prompt(){
		view.prompt = "Revealing a tech. Please click on the card you wish to DISCARD of your revealing pair."
		view.actions.done = 1
		const v = game.vault[game.activeNum]
		for (let i = 0; i < v.length; i += 2) { //if the pair card has a printed tech, you can discard this card
			const card1 = ICARDS[Math.abs(v[i])]
			const card2 = ICARDS[Math.abs(v[i+1])]
			if ((v[i+1] > 0 && card2.left && card2.left !== "Industrial Espionage") ||
				(v[i+1] < 0 && card2.right && card2.right !== "Industrial Espionage")) gen_action_industry(v[i])
			if ((v[i] > 0 && card1.left && card1.left !== "Industrial Espionage") ||
				(v[i] < 0 && card1.right && card1.right !== "Industrial Espionage")) gen_action_industry(v[i+1])
		}
	},
	industry_card(c){ //discard card
		push_undo()
		const f = game.activeNum
		const index = game.vault[f].indexOf(c)

		let tc = game.vault[f][index + (index%2 === 0? 1:-1)] //tech card
		let tech = tc > 0 ? ICARDS[tc].left : ICARDS[Math.abs(tc)].right
		
		log(`${game.active} has revealed ${tech}`)
		game.discard[1].push(Math.abs(game.vault[f].splice(index, 1)))
		game.tech[f].push(game.vault[f].splice(index%2 === 0? index : index-1, 1)[0])
	},
	done(){
		game.state = game.previous_state
		game.previous_state = null
	}
}

states.vault_reveal_battle = {
	inactive: "reveal vault tech",
	prompt(){
		view.prompt = "You may reveal a tech. Please click on the card you wish to DISCARD of your revealing pair."
		game.pass_count >= how_many_other_factions_can_reveal(game.activeNum)? view.actions.start_combat = 1 : view.actions.pass = 1
		const v = game.vault[game.activeNum]
		for (let i = 0; i < v.length; i += 2) { //if the pair card has a printed tech, you can discard this card
			const card1 = ICARDS[Math.abs(v[i])]
			const card2 = ICARDS[Math.abs(v[i+1])]
			if ((v[i+1] > 0 && card2.left && card2.left !== "Industrial Espionage") ||
				(v[i+1] < 0 && card2.right && card2.right !== "Industrial Espionage")) gen_action_industry(v[i])
			if ((v[i] > 0 && card1.left && card1.left !== "Industrial Espionage") ||
				(v[i] < 0 && card1.right && card1.right !== "Industrial Espionage")) gen_action_industry(v[i+1])
		}
	},
	industry_card(c){ //discard card
		push_undo()
		const f = game.activeNum
		const index = game.vault[f].indexOf(c)

		let tc = game.vault[f][index + (index%2 === 0? 1:-1)] //tech card
		let tech = tc > 0 ? ICARDS[tc].left : ICARDS[Math.abs(tc)].right
		
		log(`${game.active} has revealed ${tech}`)
		game.discard[1].push(Math.abs(game.vault[f].splice(index, 1)))
		game.tech[f].push(game.vault[f].splice(index%2 === 0? index : index-1, 1))
		game.pass_count = 0
	},
	pass(){
		clear_undo()
		game.pass_count += 1
		const index = game.turn_order.indexOf(game.activeNum)
		const f1 = game.turn_order[(index + 1)%3]
		const f2 = game.turn_order[(index + 2)%3]
		if (can_reveal_vault(f1)) set_active(f1)
		else if (can_reveal_vault(f2)) set_active(f2)
		else throw new Error("tried to pass but no one to pass to")
	},
	start_combat(){
		clear_undo()
		game.pass_count = 0
		start_battle()
	}
}

states.choose_initiative = {//used in the rare case where two initiative cards are played of the same value.
	inactive: "choosing initiative",
	prompt(){
		view.prompt = `Some command cards are tied for initiative. Choose the order in which they should act.`
		if (set_has(game.tied_turn_order, 0)) view.actions.axis = 1
		if (set_has(game.tied_turn_order, 1)) view.actions.west = 1
		if (set_has(game.tied_turn_order, 2)) view.actions.ussr = 1
		if (game.tied_turn_order.length === 0)view.actions.done = 1
	},
	axis(){
		push_undo()
		set_delete(game.tied_turn_order, 0)
		let index = game.turn_order_command.findIndex(x => x === null)
		game.turn_order_command[index] = 0
	},
	west(){
		push_undo()
		set_delete(game.tied_turn_order, 1)
		let index = game.turn_order_command.findIndex(x => x === null)
		game.turn_order_command[index] = 1
	},
	ussr(){
		push_undo()
		set_delete(game.tied_turn_order, 2)
		let index = game.turn_order_command.findIndex(x => x === null)
		game.turn_order_command[index] = 2
	},
	done(){
		let message = ''
		for (let f of game.turn_order_command) {
			message += " " + FACTIONS[f] 
		}
		log('Turn order is: ' + message)
		next_player_turn()
	}

}

states.gain_control = {
	inactive: "gain control of neutral countries",
	prompt(){
		let cs = []
		for (let i = 0; i < game.gained_control[game.activeNum].length; i++){
			cs.push(COUNTRIES[game.gained_control[game.activeNum][i]].name)
		}
		let message = cs[0]
		if (cs.length > 1){
			for (let i = 1; i < cs.length; i++) {
				if (i === cs.length-1) message += ` and ${cs[i]}`
				else message += `, ${cs[i]}`
			}
		}
		view.prompt = `Gain control of ${message}.`

		let i
		let finish
		switch (game.activeNum) {
		case AXIS: i = 0; finish = 6; break
		case WEST: i = 14; finish = 20; break
		case USSR: i = 35; finish = 41; break
		}
		
		for (i; i <= finish; ++i){
			if (reserve_empty(i)) continue
			//Would be nice but not needed if no coastal home costal regions
			gen_action_reserve(i)
		}
		if (game.activeNum === WEST && game.usa_reinforcements_types ) {
			for (let type of game.usa_reinforcements_types) {
				gen_action_reserve(type + 28)
			}
		}
		
		if (game.selected && game.phase === "government") {
			let type = TYPE[game.selected%7]
			for (let [index, region] of REGIONS.entries()) {
				if (region.type === "sea") continue
				if (cs.indexOf(region.country) === -1) continue
				if (region.pop === 0 && !(region.town)) continue
				if (game.block_location.indexOf(index) !== -1) continue
				if ((type === "Fleet" || type === "Sub" || type === "Carrier") && !is_coastal_region(index)) continue
				gen_action_region(index)
			}
		}
		if (game.selected && game.phase !== "government") {
			for (let i = 0; i < game.block_location.length; i++) {
				if (game.block_nation[i] === 6 && cs.indexOf(REGIONS[game.block_location[i]].country) !== -1) 
					gen_action_block(i)
			}
			if (game.selected > 28 && game.selected < 35) {
				gen_action_region(REGIONS.findIndex(x => x.name === 'Washington'))
				gen_action_region(REGIONS.findIndex(x => x.name === 'New York'))
			}
		}
		if (!view.actions.reserve || (view.actions.reserve && !set_has(view.actions.reserve, game.selected))) {
			game.selected = null
			view.selected = null
		}
	},
	reserve(r){
		game.selected === r ? game.selected = null : game.selected = r
	},
	block(b){
		push_undo()
		convert_neutral_fort(b, game.selected)
		let country = REGIONS[game.block_location[b]].country
		let country_done = true //if none of the regions in a country have a neutral, remove it! 
		for (let i = 0; i < game.block_location.length; i++) {
			if (game.block_nation[i] === 6 && REGIONS[game.block_location[i]].country === country) 
				country_done = false
		}
		if (country_done) {
			array_remove_item(game.gained_control[game.activeNum], COUNTRIES.findIndex(c => country === c.name))
		}
		if (game.gained_control[game.activeNum].length === 0){
			game.selected = null
			check_gained_control()
		}
	},
	region(area){
		push_undo()
		let r = REGIONS[area]
		let country_done = true //if all the regions in a country have a block, remove it!
		create_cadre(game.selected, area)
		if (r.country === 'USA'){ //this should only fire on a US violation
			game.selected = null
			set_delete(game.usa_reinforcements_types, game.selected - 28)
		} else {
			let str = r.pop * 2
			if (r.town) str += 1
			if (str > 1) game.block_steps[game.block_location.indexOf(area)] = str
			if (game.reserves[game.selected] === 0) game.selected = null
			
			let region
			for (let i = 0; i < REGIONS.length; i++){
				region = REGIONS[i]
				if (region.type !== "sea" && region.country === r.country && 
					(region.pop !== 0 || region.town) && game.block_location.indexOf(i) === -1) {
					country_done = false; break
				}
			}
			if (country_done){
				array_remove_item(game.gained_control[game.activeNum], COUNTRIES.findIndex(c => r.country === c.name))
			}
		}

		if (game.gained_control[game.activeNum].length === 0) {
			game.selected = null
			check_gained_control()
		}
	}
}

function sea_battle_check(f1, f2){ //when war is declared, there needs to be combat at sea or disengagement
	for (let i = 0; i < REGIONS.length; i++) {
		if (REGIONS[i].type !== 'sea') continue
		let attackers = []
		let defender = 0
		for (let j = 0; j < game.block_location.length; j++) {
			if (game.block_location[j] === i) {
				if (faction_of_block(j) === f1) attackers.push(j) 
				if (faction_of_block(j) === f2) defender = 1
			}
		}
		if (attackers.length > 0 && defender) {
			set_add(game.battle_required, i)
			game.battle_groups[i] = attackers
		}
	}
}

states.declare_war = {
	inactive: "movement",
	prompt(){
		view.prompt = "Who do you wish to declare war on?"
		let aw = are_enemies(0,1)
		let au = are_enemies(0,2)
		let wu = are_enemies(1,2)
		switch(game.activeNum){
		case 0: if (!aw) view.actions.west = 1; if (!au) view.actions.ussr = 1; break
		case 1: if (!aw) view.actions.axis = 1; if (!wu) view.actions.ussr = 1; break
		case 2: if (!au) view.actions.axis = 1; if (!wu) view.actions.west = 1; break
		}
	},
	axis(){
		push_undo()
		game.peace_eligible[game.activeNum] = 0
		game.peace_eligible[0] = 0
		set_add(game.surprise, 0)
		if (game.activeNum === 1){
			if (game.relationship[1].length === 0) game.relationship[1] = [-1,0]
			else game.relationship[1][0] = -1
			if (game.relationship[0].length === 0) game.relationship[0] = [ 1,0]
			else game.relationship[0][0] = 1
		} else {
			if (game.relationship[2].length === 0) game.relationship[2] = [-1,0]
			else game.relationship[2][0] = -1
			if (game.relationship[0].length === 0) game.relationship[0] = [ 0,1]
			else game.relationship[0][1] = 1
		}
		sea_battle_check(game.activeNum, 0)
		determine_control(game.activeNum)
		game.state = "movement"
	},
	west(){
		push_undo()
		game.peace_eligible[game.activeNum] = 0
		game.peace_eligible[1] = 0
		set_add(game.surprise, 1)
		if (game.activeNum === 0){
			if (game.relationship[0].length === 0) game.relationship[0] = [-1,0]
			else game.relationship[0][0] = -1
			if (game.relationship[1].length === 0) game.relationship[1] = [ 1,0]
			else game.relationship[1][0] = 1
		} else {
			if (game.relationship[2].length === 0) game.relationship[2] = [0,-1]
			else game.relationship[2][1] = -1
			if (game.relationship[1].length === 0) game.relationship[1] = [0, 1]
			else game.relationship[1][1] = 1
		}
		sea_battle_check(game.activeNum, 1)
		determine_control(game.activeNum)
		game.state = "movement"
	},
	ussr(){
		push_undo()
		set_add(game.surprise, 2)
		game.peace_eligible[game.activeNum] = 0
		game.peace_eligible[2] = 0
		if (game.activeNum === 0){
			if (game.relationship[0].length === 0) game.relationship[0] = [0,-1]
			else game.relationship[0][1] = -1
			if (game.relationship[2].length === 0) game.relationship[2] = [ 1,0]
			else game.relationship[2][0] = 1
		} else {
			if (game.relationship[1].length === 0) game.relationship[1] = [0,-1]
			else game.relationship[1][1] = -1
			if (game.relationship[2].length === 0) game.relationship[2] = [ 0,1]
			else game.relationship[2][1] = 1
		}
		sea_battle_check(game.activeNum, 2)
		determine_control(game.activeNum)
		game.state = "movement"
	}
}


exports.setup = function (seed, scenario, options) {
	game = {
		seed: seed,
		undo: [],
		log: [],

		state: "setup",
		previous_state: null, //used with tech reveal to remember where the game was at
		active: "Axis",
		activeNum: 0,
		selected: null,
		turn: 0,
		phase: "new_year",
		turn_order: TURNORDER[2],
		turn_order_command: [],
		tied_turn_order: [],
		pass_count: 0,
		count: 0, //both production count and movement count

		pop: [11, 12, 12],
		res: [6 , 11, 11],
		ind: [12, 7 , 9 ],
		blockaded_pop: [0, 0, 0],
		blockaded_res: [0, 0, 0],
		factory_increase: [0,0,0],

		//BLOCK PUBLIC
		block_nation: [],
		block_location: [], 

		//BLOCK PRIVATE
		block_type: [],
		block_steps: [],

		//BLOCK OTHER
		block_moved: [],
		sub_hiding: [], //set of hiding subs
		invasion_blocks: [],  //set of invading blocks
		raid_retreat_blocks: [], //like invasion blocks, but ineligible for getting shot
		must_retreat: null,
		may_retreat: null,
		battle_groups: {},
		active_battle_blocks: [], 
		aggressed_from: [], //a map, using a block as a key, and [previous space, current space] as value

		reserves: [8, 8, 2, 8, 6, 8, 16, 2, 3, 1, 2, 4, 2, 6, 6, 4, 2, 3, 6, 3, 6, 3, 3, 1, 1, 4, 2, 6, 2, 4, 1, 1, 4, 4, 4, 6, 6, 2, 2, 4, 8, 16, 8], //only 8 neutral forts?

		deck: [[],[]],
		discard: [[],[]],
		draw: [[],[]], //used to show what cards are being drawn before being added to the hand
    	hand:  [//the first is going to be action cards, and the second is going to be investment cards
			[[],[]],
			[[],[]],
			[[],[]],
		],
		tech: [[], [], []], //negative numbers to show a card is flipped
		vault: [[], [], []], //two card pairs
		atomic: [[], [], []], //first element is turn a1 was discovered, second a2, etc
		diplomacy: [[], [], []], //the value of the card, -1 if flipped.
		control: [],
		gained_control: [[], [], []], //countries gained control of during diplomacy
		
		peace_eligible: [1, 1, 1], 
		peace_dividend: [[], [], []], //first element is eligibility, other elements are the chits?
		peace_dividend_bag: [ //4 2s, 12 1s, 16 0s
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2
		],

		relationship: [[], [], []], //null == full peace, 0 == peace, -1 == declared war, 1 == war declared on 
		command_card: [null, null, null],

		blockade: [],
		blockade_transafrica: [], //make sure to have the tr set exclusive to the regular blockade set
		blockade_possible: [], //used so the calc only happens once. ENEMIES of a power can confirm the blockade
		blockade_transafrica_possible: [],

		active_battle: null,
		
		attacker: null,
		defender: null, //if null, then no battle appears on the UI, also if 3 then fighting both opponents
		battle_winner: null, //only used to figure out who can retreat in a sea battle
		battle: [], //used to figure out who the owner is, and in the rare rare case of 3 way 
		//only used for land combat, because sea combat will be resolved that turn.
		shootNscoot: false, //used to figure out if the current attack is a shootNscoot
		battle_fought: [], //a list of battles fought
		battle_required: [], //used to make sure battles happen in new regions
		battle_raid: [], //used to mark certain spaces as okay to retreat to
		border_count: [],
		surprise: [], //used both for battle surprise, and to mark that war has been declared
		aggression_met: [], //used to meet declaring war
		cannot_von: [], //used to make sure that you cannot attack a neutral (USA, or if you moved through their strait)

		influence: [], 	//-1 for neutral, 0 for axis control, 1-9 for axis points, 10 for west control, 11-19 for points, 20 for ussr control
		//this means that /10 gets the faction, and %10 gets the point total (with 0 being control)
		minor_aggressor: [], //a sparse array used to record who attacked what minor, based on the COUNTRY index
		armed_minors: [], //this is needed in the rare case that a fort is killed by non-ground units!

		defeated_major_powers: [], //major powers are Italy, France, and USA 
		usa_satellite: 0,
		usa_reinforcements: -6
	}
	game.scenario = scenario
	game.deck[0] = make_deck()
	game.deck[1] = make_deck()

	create_cadre(
		(NATIONS.indexOf("France")*7) + TYPE.indexOf("Fort"), 
		REGIONS.findIndex(x => x.name === 'Lorraine'))
	game.block_steps[0] = 3

	create_cadre(
		(NATIONS.indexOf("Britain")*7) + TYPE.indexOf("Fleet"), 
		REGIONS.findIndex(x => x.name === 'London'))
	game.block_steps[1] = 4

	create_cadre(
		(NATIONS.indexOf("Britain")*7) + TYPE.indexOf("Fort"), 
		REGIONS.findIndex(x => x.name === 'Gibraltar'))

	create_cadre(
		(NATIONS.indexOf("Britain")*7) + TYPE.indexOf("Infantry"), 
		REGIONS.findIndex(x => x.name === 'Karachi'))

	for (let i = 0; i < COUNTRIES.length; i++){
		game.influence[i] = -1
	}
	
	//scenario === "Short game" ? log("Starting year: 1936") : log("Starting year: 1939")
	return game
}

// VIEW
function mask_blocks(player) {
	for (let i = 0; i < game.block_location.length; ++i){
		let revealed = false 
		let r = game.block_location[i]
		let f = faction_of_block(i) 
		if (game.block_steps[i] === 0 || game.block_nation[i] === 6 || f === player || //the block is dead, neutral, or yours,
			set_has(game.active_battle_blocks, i) || //the block is in the current battle,
			(map_has(game.battle, r) && REGIONS[r].type !== 'sea' && game.control[r] !== f && //if the block is the invader in a contested region...
				((game.state !== 'movement' || game.state !== 'movement_move' || (
					game.previous_state && (game.previous_state !== 'movement' || game.previous_state !== 'movement_move')
				)) || !set_has(game.block_moved, i)) //...except if it became that way during this very movement phase.
			) || 
			(game.view_region && r === game.view_region && player === game.espionage && f === game.target) //if the region is being spied on, and you targeted it
		) revealed = true
		view.block_steps.push(revealed ? game.block_steps[i] : -1)
		view.block_type.push(revealed ? game.block_type[i] : -1)
	}
}

function mask_draw(player) {
	const draw = object_copy(game.draw)
	if (player !== game.activeNum) {
		for (let i = 0; i < draw[0].length; i++){
			draw[0][i] = -1
		}
		for (let i = 0; i < draw[1].length; i++){
			draw[1][i] = -1
		}
	}
	return draw
}
function mask_hand(player) {
	const hand = object_copy(game.hand)
	for (let p = 0; p <= 2; p++){
		if (player !== p) {
			for (let i = 0; i < hand[p][0].length; i++){
				hand[p][0][i] = -1
			}
			for (let i = 0; i < hand[p][1].length; i++){
				hand[p][1][i] = -1
			}
		}
	}
	return hand
}
function mask_command_card(player){
	const cards = object_copy(game.command_card)
	if (game.state === "command" || game.previous_state === "command") {
		for (let p = 0; p <= 2; p++){
			if (player !== p && cards[p]) cards[p] = 0
		}
	}
	return cards
}
function mask_vault(player) {
	const vlt = object_copy(game.vault)
	for (let p = 0; p <= 2; p++){
		if (player !== p) {
			for (let i = 0; i < vlt[p].length; i++){
				vlt[p][i] = 0
			}
		}
	}
	return vlt
}
function mask_dividends(player) {
	const div = object_copy(game.peace_dividend)
	for (let p = 0; p <= 2; p++){
		if (player !== p) {
			for (let i = 0; i < div[p].length; i++){
				div[p][i] = -1
			}
		}
	}
	return div
}

function mask_reserves(player) {
	let n
	switch (player) {
	case 0: n = [0] 
		if(!set_has(game.defeated_major_powers, 1)) n.push(1); break
	case 1: n = [2] 
		if(!set_has(game.defeated_major_powers, 3)) n.push(3)
		if(game.usa_satellite === 1 && !set_has(game.defeated_major_powers, 4)) n.push(4); break
	case 2: n = [5]; break
	}
	let r = object_copy(game.reserves)
	for(let i = 0; i < r.length; i++) {
		if (!n.includes(Math.floor(i/7))) r[i] = -1
	}
	return r
}

function findTurnOrderIndex(arr) {
	return TURNORDER.findIndex(item => 
		Array.isArray(item) &&
    	item.length === arr.length &&
    	item.every((val, idx) => val === arr[idx])
	)
}

exports.view = function (state, player) {
	game = state
	let playerNum = FACTIONS.indexOf(player)
	view = {
		player: player,
		active: game.active,
		activeNum: game.activeNum,
		prompt: null,
		actions: null,
		log: game.log,
		selected: game.selected,
		count: game.count,
		turn_order: findTurnOrderIndex(game.turn_order),

		// PLAYER INFORMATION
		draw: mask_draw(playerNum),
		tech: game.tech,
		vault: mask_vault(playerNum),
		dividend: mask_dividends(playerNum),
		hand: mask_hand(playerNum),
		reserves: mask_reserves(playerNum),
		diplomacy: game.diplomacy,
		command_card: mask_command_card(playerNum),

		block_nation: game.block_nation,
		block_location: game.block_location,
		block_steps: [],
		block_type: [],
		block_moved: game.block_moved,
		
		// TOKENS
		turn: game.turn,
		phase: game.phase,
		relationship: game.relationship,
	    influence: game.influence,
		sub_hiding: game.sub_hiding,
		usa: game.usa_satellite,
		pop: game.pop,
		bpop: game.blockaded_pop,
		res: game.res,
		bres: game.blockaded_res,
		ind: game.ind,
		blockade: game.blockade,
		blockade_med: game.blockade_transafrica,

		// BATTLE INFO
		attacker: game.attacker,
		battle: game.active_battle,
		battle_blocks: game.active_battle_blocks,
		battle_required: game.battle_required,
	}
	if (game.defender === null) view.battle = null
	mask_blocks(playerNum)

	if (game.state === "game_over") { //Needs work reveal all information: blocks, vault, dividends, 
		view.prompt = game.victory
		view.vault = game.vault
		view.hand = game.hand
		view.dividend = game.peace_dividend
		view.command_card = game.command_card
		view.block_type = game.block_type
		view.block_steps = game.block_steps
	} else if (game.activeNum !== null && game.activeNum !== playerNum) {
		let inactive = states[game.state].inactive || game.state
		if (typeof inactive === "function")
			view.prompt = inactive()
		else
			view.prompt = `Waiting for ${game.active} to ${inactive}.`
	} else {
		view.actions = {}
		if (states[game.state]){
			states[game.state].prompt()
			if (has_vault(game.activeNum) && game.state !== "vault_reveal" && game.state !== "vault_reveal_battle" && game.state !== "double_agent") {
				view.actions.reveal_vault = 1
			}
		}
		else
			view.prompt = "Unknown state: " + game.state
		if (view.actions.undo === undefined) {
			if (game.undo && game.undo.length > 0)
				view.actions.undo = 1
			else
				view.actions.undo = 0
		}
	}

	return view
}


/* COMMON FRAMEWORK */

function goto_game_over(result, victory) {
	log("# The End")
	game.active = "None"
	game.activeNum = -1
	game.state = "game_over"
	game.result = result
	game.victory = victory
	log(".summary")
	log(game.victory)
	return true
}

exports.action = function (state, _player, action, arg) {
	game = state
	let S = states[game.state]
	if (S && action in S) {
		S[action](arg)
	} else {
		if (action === "undo" && game.undo && game.undo.length > 0)
			pop_undo()
		else if (action === "reveal_vault"){
			game.previous_state = game.state
			game.state = "vault_reveal"
		}
		else
			throw new Error("Invalid action: " + action)
	}
	return game
}

// GENERATE ACTIONS

function gen_action(action, argument) {
	if (view.actions[action] === undefined)
		view.actions[action] = [ argument ]
	else
		set_add(view.actions[action], argument)
}

function gen_action_block(b) {
	gen_action("block", b)
}
function gen_action_bblock(b) {
	gen_action("bblock", b)
}
function gen_action_region(s) {
	gen_action("region", s)
}
function gen_action_reserve(r) {
	gen_action("reserve", r)
}
function gen_action_action(c) {
	gen_action("action_card", c)
}
function gen_action_industry(c) {
	gen_action("industry_card", c)
}
function gen_action_technology(c) {
	gen_action("technology", c)
}
function gen_action_intelligence(c) {
	gen_action("intelligence", c)
}
function gen_action_influence_special(c) {
	gen_action("influence_special", c)
}
function gen_action_influence(c) {
	gen_action("influence", c)
}

//battle actions

function gen_action_retreat(c) {
	gen_action("retreat", c)
}function gen_action_air(c) {
	gen_action("air", c)
}function gen_action_naval(c) {
	gen_action("naval", c)
}function gen_action_sub(c) {
	gen_action("sub", c)
}function gen_action_ground(c) {
	gen_action("ground", c)
}function gen_action_convoy(c) {
	gen_action("convoy", c)
}function gen_action_shootNscoot(c) {
	gen_action("shootNscoot", c)
}function gen_action_pass(c) {
	gen_action("pass_attack", c)
}function gen_action_strategic_bombing(c) {
	gen_action("strategic_bombing", c)
}

function log(msg) {
	game.log.push(msg)
}

function log_br() {
	if (game.log.length > 0 && game.log[game.log.length - 1] !== "")
		game.log.push("")
}


/* COMMON LIBRARY */

function clear_undo() {
	game.undo.length = 0
}

function push_undo() {
	if (game.undo) {
		let copy = {}
		for (let k in game) {
			let v = game[k]
			if (k === "undo")
				continue
			else if (k === "log")
				v = v.length
			else if (typeof v === "object" && v !== null)
				v = object_copy(v)
			copy[k] = v
		}
		game.undo.push(copy)
	}
}

function pop_undo() {
	if (game.undo) {
		let save_log = game.log
		let save_undo = game.undo
		game = save_undo.pop()
		save_log.length = game.log
		game.log = save_log
		game.undo = save_undo
	}
}

function random_bigint(range) {
	// Largest MLCG that will fit its state in a double.
	// Uses BigInt for arithmetic, so is an order of magnitude slower.
	// https://www.ams.org/journals/mcom/1999-68-225/S0025-5718-99-00996-5/S0025-5718-99-00996-5.pdf
	// m = 2**53 - 111
	return (game.seed = Number(BigInt(game.seed) * 5667072534355537n % 9007199254740881n)) % range
}

function shuffle_bigint(list) {
	// Fisher-Yates shuffle
	for (let i = list.length - 1; i > 0; --i) {
		let j = random_bigint(i + 1)
		let tmp = list[j]
		list[j] = list[i]
		list[i] = tmp
	}
}

// Fast deep copy for objects without cycles
function object_copy(original) {
	if (Array.isArray(original)) {
		let n = original.length
		let copy = new Array(n)
		for (let i = 0; i < n; ++i) {
			let v = original[i]
			if (typeof v === "object" && v !== null)
				copy[i] = object_copy(v)
			else
				copy[i] = v
		}
		return copy
	} else {
		let copy = {}
		for (let i in original) {
			let v = original[i]
			if (typeof v === "object" && v !== null)
				copy[i] = object_copy(v)
			else
				copy[i] = v
		}
		return copy
	}
}

// Array remove and insert (faster than splice)

function array_remove(array, index) {
	let n = array.length
	for (let i = index + 1; i < n; ++i)
		array[i - 1] = array[i]
	array.length = n - 1
}

function array_remove_item(array, item) {
	let n = array.length
	for (let i = 0; i < n; ++i)
		if (array[i] === item)
			return array_remove(array, i)
}

function array_insert(array, index, item) {
	for (let i = array.length; i > index; --i)
		array[i] = array[i - 1]
	array[index] = item
}

function array_remove_pair(array, index) {
	let n = array.length
	for (let i = index + 2; i < n; ++i)
		array[i - 2] = array[i]
	array.length = n - 2
}

function array_insert_pair(array, index, key, value) {
	for (let i = array.length; i > index; i -= 2) {
		array[i] = array[i-2]
		array[i+1] = array[i-1]
	}
	array[index] = key
	array[index+1] = value
}

// Set as plain sorted array

function set_clear(set) {
	set.length = 0
}

function set_has(set, item) {
	let a = 0
	let b = set.length - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = set[m]
		if (item < x)
			b = m - 1
		else if (item > x)
			a = m + 1
		else
			return true
	}
	return false
}

function set_add(set, item) {
	let a = 0
	let b = set.length - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = set[m]
		if (item < x)
			b = m - 1
		else if (item > x)
			a = m + 1
		else
			return
	}
	array_insert(set, a, item)
}

function set_delete(set, item) {
	let a = 0
	let b = set.length - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = set[m]
		if (item < x)
			b = m - 1
		else if (item > x)
			a = m + 1
		else {
			array_remove(set, m)
			return
		}
	}
}

function set_add_all(set, other) {
	for (let item of other)
		set_add(set, item)
}

function set_union(one, two) {
	let set = []
	for (let item of one)
		set_add(set, item)
	for (let item of two)
		set_add(set, item)
	return set
}

function set_intersect(one, two) {
	let set = []
	for (let item of one)
		if (set_has(two, item))
			set_add(set, item)
	return set
}

function set_contains(superset, subset) {
	for (let item of subset)
		if (!set_has(superset, item)) return false
	return true
}

// Map as plain sorted array of key/value pairs

function map_has(map, key) {
	let a = 0
	let b = (map.length >> 1) - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = map[m<<1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else
			return true
	}
	return false
}

function map_get(map, key, missing) {
	let a = 0
	let b = (map.length >> 1) - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = map[m<<1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else
			return map[(m<<1)+1]
	}
	return missing
}

function map_set(map, key, value) {
	let a = 0
	let b = (map.length >> 1) - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = map[m<<1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else {
			map[(m<<1)+1] = value
			return
		}
	}
	array_insert_pair(map, a<<1, key, value)
}

function map_remove(map, key) {
	let a = 0
	let b = (map.length >> 1) - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = map[m<<1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else{
			for (x += 2; x < map.length; ++x)
				map[x-2] = map[x]
			map.length = map.length - 2
			return true
		}
	}
	return false
}

function map_for_each(map, f) {
	for (let i = 0; i < map.length; i += 2)
		f(map[i], map[i+1])
}