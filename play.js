/* eslint-disable semi */
"use strict"

const AXIS = 0
const WEST = 1
const USSR = 2

const FACTIONS = [
	"Axis", 
	"West", 
	"USSR"
]

const TURNORDER = [ null, 
	[AXIS,USSR,WEST], [AXIS,WEST,USSR],
	[WEST,AXIS,USSR], [WEST,USSR,AXIS],
	[USSR,WEST,AXIS], [USSR,AXIS,WEST]
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

/* GENERAL FUNCTIONS */

function faction_of_block(b){
	switch (view.block_nation[b]){
	case 0:	case 1: return 0
	case 2: case 3: case 4: return 1
	case 5: return 2
	case 6: return -1
	}
}

const ui = {
	map: document.getElementById("map"),
	prompt: document.getElementById("prompt"),
	status: document.getElementById("status"),
	header: document.querySelector("header"),
	tokens_element:document.getElementById("tokens"),
	blocks_element:document.getElementById("blocks"),
	discard: [
	//a_discard:
	//i_discard:
	],
	power_panel_list: document.getElementById("power_panel_list"),
	draw: document.getElementById("draw"),

	hand: [
		document.getElementById("Axis").querySelector(".hand_box .panel_body"),
		document.getElementById("West").querySelector(".hand_box .panel_body"),
		document.getElementById("USSR").querySelector(".hand_box .panel_body"),
	],
	tech_vault: [
		document.getElementById("Axis").querySelector(".tech_vault"),
		document.getElementById("West").querySelector(".tech_vault"),
		document.getElementById("USSR").querySelector(".tech_vault"),
	],
	dividends: [
		document.getElementById("Axis").querySelector(".dividends_box .panel_body"),
		document.getElementById("West").querySelector(".dividends_box .panel_body"),
		document.getElementById("USSR").querySelector(".dividends_box .panel_body"),
	],
	command: [
		document.getElementById("Axis").querySelector(".command_box .panel_body"),
		document.getElementById("West").querySelector(".command_box .panel_body"),
		document.getElementById("USSR").querySelector(".command_box .panel_body"),
	],
	diplomacy: [
		document.getElementById("Axis").querySelector(".diplomacy_box .panel_body"),
		document.getElementById("West").querySelector(".diplomacy_box .panel_body"),
		document.getElementById("USSR").querySelector(".diplomacy_box .panel_body"),
	],
	reserves: [
		document.getElementById("reserves_Germany"),
		document.getElementById("reserves_Italy"),
		document.getElementById("reserves_Britain"),
		document.getElementById("reserves_France"),
		document.getElementById("reserves_USA"),
		document.getElementById("reserves_USSR"),
	],
	action_register: [],
	battle_table: document.getElementById("battle_table"),
	battle_header: document.getElementById("battle_header"),
	battle_hits: document.getElementById("battle_hits"),
	attacker: document.getElementById("attacker"),
	defender: document.getElementById("defender"),
}

var query

/* ACTION REGISTRATION */
function register_action(target, action, id) {
	target.my_id = id
	target.my_action = action
	target.onmousedown = (evt) => on_click_action(evt, target)
	ui.action_register.push(target)
}

function on_click_action(evt, target) {
	if (evt.button === 0)
		if (send_action(target.my_action, target.my_id))
			evt.stopPropagation()
}

function process_actions() {
	for (let target of ui.action_register) {
		target.classList.toggle("action", is_action(target.my_action, target.my_id))
	}
}

function is_action(action, arg) {
	if (arg === undefined)
		return !!(view.actions && view.actions[action] === 1)
	return !!(view.actions && view.actions[action] && set_has(view.actions[action], arg))
}

function create_element(action, id, className) {
	let e = document.createElement("div")
	e.className = className
	register_action(e, action, id)
	return e
}

function create_piece(action, id, className) {
	let e = document.createElement("div")
	e.className = className
	register_action(e, action, id)
	//e.onmouseenter = on_focus_piece
	//e.onmouseleave = on_blur_piece
	return e
}

function create_marker(className) {
	let e = document.createElement("div")
	e.className = className
	return e
}

function make_a_deck(n){}
function make_i_deck(n){}
function make_a_discard(n){}
function make_i_discard(n){}
function make_a_card(ac){}
function make_i_card(ic){}

function on_init() {
	//blocks
	for (let i=0; i < 198; i++){
		ui.blocks_element.appendChild(create_piece("block", i, "block dead"))
	}

	//locations
	for (let i = 0; i < REGIONS.length; i++){
		let e = document.getElementById(REGIONS[i].name)
		register_action(e, "region", i)
		e.onmouseenter = () => on_focus_region(i)
		e.onmouseleave = () => on_blur_region(i)
	}
	//reserves
	for (let i = 0; i <= 41; i++){
		let e = document.getElementById("r" + i)
		register_action(e, "reserve", i)
	}
}

on_init()


/* QUERY */

function set_query(q){
	query = q
	send_query(query)
	// document.getElementById("query").innerText = q
}

function show_supply(supply) {
	const trade = query.substring(5) === "trade" 
	for (let i = 0; i < REGIONS.length; i++){
		let e = document.getElementById(REGIONS[i].name)
		e.classList.toggle("supply", supply[0].includes(i))
		e.classList.toggle("adj_supply", !trade && supply[1].includes(i))
		e.classList.toggle("TransAfrica", trade && supply[1].includes(i))
		e.classList.toggle("no_supply", !(supply[0].includes(i) || supply[1].includes(i)))
	}
}

// function show_trade(networks) {
// 	for (let i = 0; i < REGIONS.length; i++){
// 		let e = document.getElementById(REGIONS[i].name)
// 		e.classList.toggle("supply", networks[0].includes(i))
// 		e.classList.toggle("some_supply", networks[1].includes(i))
// 		e.classList.toggle("no_supply", (!supply[0].includes(i) && !supply[1].includes[i]))
// 	}
// }

function hide_supply_trade() {
	query = null
	// document.getElementById("query").innerText = ""
	for (let i = 0; i < REGIONS.length; i++){
		let e = document.getElementById(REGIONS[i].name)
		e.classList.remove("supply")
		e.classList.remove("no_supply")
		e.classList.remove("some_supply")
		e.classList.remove("TransAfrica")
		// e.classList.remove("network_ta")
		// e.classList.remove("network_none")
	}
}

function on_reply(q, params) {
	show_supply(params)
}


/* UPDATE UI */

function layout_blocks(area, blocks){
	//sort the blocks
	let w = area.width ? area.width : 3 //should be based on region
	let l = blocks.length
	for (let i = 0; i < l; i++) {
		position_block(area, i%w, i >= Math.floor(l/w) * w ? (l-1)%w + 1 : w, Math.floor(i/w), Math.ceil(l/w), ui.blocks_element.children[blocks[i]])
	}
}

function position_block(area, row, n_rows, col, n_cols, element) {
	let block_size = 45+2
	let padding = 3
	let offset = block_size + padding
	let row_size = (n_rows-1) * offset
	let col_size = (n_cols-1) * offset
	let x = REGIONS[area].x - block_size/2
	let y = REGIONS[area].y - block_size/2
	y -= col_size/2
	x -= row_size/2
	y += col * offset
	x += row * offset
	element.style.left = (x|0)+"px"
	element.style.top = (y|0)+"px"
}

function kill_block(index){
	let e = ui.blocks_element.children[index]
	if (e.style.left === "1700px" && e.style.top === "2300px") {
		e.className = "block dead"
	}
}

function update_blocks(){
	let areas = []
	for (let i = 0; i < ui.blocks_element.children.length; i++){
		let s = view.block_steps[i]
		let e = ui.blocks_element.children[i]
		if (s === undefined || s === 0) {
			if (!e.classList.contains("dead")){
				setTimeout(kill_block, 700, i)	
			}
			e.style.left = "1700px"
			e.style.top = "2300px"
			continue
		} 
		if (s === -1) {
			e.className = "block"
		}
		e.classList.remove("dead")
		e.classList.remove("NeutralFort")
		e.classList.remove("Fort")
		e.classList.toggle("moved", view.block_moved.includes(i))
		e.classList.toggle("selected", ((Array.isArray(view.selected_block) && view.selected_block.includes(i)) || view.selected_block === i))
		e.classList.add(NATIONS[view.block_nation[i]])
		if (!areas[view.block_location[i]]) areas[view.block_location[i]] = []
		areas[view.block_location[i]].push(i)
	
		//masked information
		if (s === -1) continue
		e.classList.add(TYPE[view.block_type[i]])
		e.classList.toggle("r1", s === 2)
		e.classList.toggle("r2", s === 3)
		e.classList.toggle("r3", s === 4)
	}

	for (let i = 0; i < areas.length; i++) {
		if (areas[i]) layout_blocks(i, areas[i])
	}
}

/* BATTLE */
function update_battle() {
	if (view.battle === null || (view.selected_block && typeof view.selected_block === "number"))
		ui.battle_table.classList.add("hidden")
	else {
		const r = REGIONS[view.battle]
		ui.battle_table.classList.remove("hidden")
		ui.battle_header.innerText = `Battle in ${r.name}`
		ui.battle_table.style.top = (r.y >= 350 ? r.y - 350 : r.y + 350) + "px"
		ui.battle_table.style.left = (r.x >= 312 ? r.x - 297 : 15) + "px"
		battle_button('battle_air', 'air')
		battle_button('battle_naval', 'naval')
		battle_button('battle_sub', 'sub')
		battle_button('battle_ground', 'ground')
		battle_button('battle_convoy', 'convoy')
		battle_button('battle_shootNscoot', 'shootNscoot')
		battle_button('battle_strategic_bombing', 'strategic_bombing')
		battle_button('battle_pass_attack', 'pass_attack')
		battle_button('battle_retreat', 'retreat')
		ui.battle_hits.innerHTML = ""
		for (const combo in view.hits) {
			let line = document.createElement("div")
			line.classList.add("battle_line")
			if (r.type === "sea") line.innerText = combo.replace("Ground", "Convoy")
			line.innerText = combo.replace("_", " ") + ": "
			
			for (let i = 0; i < view.hits[combo]; i++) {
				let block = document.createElement("div")
				block.classList.add("damage")
				line.appendChild(block)
			}
			ui.battle_hits.appendChild(line)
		}

		ui.attacker.innerHTML = ""
		ui.defender.innerHTML = ""
		for (let b of view.battle_blocks) {

			let block = document.createElement("div")
			block.id = `bb_${b}`
			block.className = `battle block ${NATIONS[view.block_nation[b]]} ${TYPE[view.block_type[b]]}`
			block.classList.toggle("moved", view.block_moved.includes(b))
			let s = view.block_steps[b]
			block.classList.toggle("r1", s === 2)
			block.classList.toggle("r2", s === 3)
			block.classList.toggle("r3", s === 4)
			block.classList.toggle("selected", view.selected_block === block.id)
			register_action(block, "bblock", block.id)
			let r = map_get(view.aggressed_from, b, false)
			let text = r?  
				`Aggressed from ${REGIONS[r[0]].name}` : 
				"In region at start of movement"
			block.onmouseenter = () => on_focus_bblock(text)
			block.onmouseleave = () => on_blur_bblock()

			faction_of_block(b) === view.attacker? ui.attacker.appendChild(block) : ui.defender.appendChild(block)
		}
	}
}

function battle_button(id, action) {
	let button = document.getElementById(id)
	if (view.actions && view.actions[action])
		button.classList.remove("hide")
	else
		button.classList.add("hide")
}

function update_reserves(){
	let boxes = document.getElementsByClassName('reserves_box')
	for (let box of boxes) box.classList.add("hidden");
	for (let i=0; i < view.reserves.length-1; ++i){
		if (view.reserves[i] === -1) {
			ui.reserves[Math.floor(i/7)].classList.add("hidden");
			i += 6
		} else {
			ui.reserves[Math.floor(i/7)].classList.remove("hidden");
			ui.reserves[Math.floor(i/7)].closest('.reserves_box').classList.remove("hidden");
			let e = ui.reserves[Math.floor(i/7)].children[i%7]
			e.firstElementChild.innerText = view.reserves[i]

			if (view.selected_reserve === i) {
				e.classList.add("selected")
			} else {e.classList.remove("selected")}
		}
	}
}

function update_cards() {
	//draw
	let v
	let act = ui.draw.children[0]
	let inv = ui.draw.children[1]
	act.innerHTML = "";
	inv.innerHTML = "";
	for (let i = 0; i < view.draw[0].length; i++){
		let e = document.createElement("div")
		e.className = view.draw[0][i] === -1 ? "card hidden" : `card a number_${view.draw[0][i]}`
		act.appendChild(e)
	}
	for (let i = 0; i < view.draw[1].length; i++){
		let e = document.createElement("div")
		e.className = view.draw[1][i] === -1 ? "card hidden" : `card i number_${view.draw[1][i]}`
		inv.appendChild(e)
	}

	//hand
	//198 blocks, 136 regions, 42 reseve, === 376 (-1 ofc)
	for (let i = ui.action_register.length-1; i > 375; i--){
		if(ui.action_register[i].classList.contains("card") || ui.action_register[i].classList.contains("card_button")) ui.action_register.splice(i,1)
	}
	
	for (let i = 0; i <= 2; i++){
		act = ui.hand[i].children[0]
		inv = ui.hand[i].children[1]
		act.innerHTML = "";
		inv.innerHTML = "";
		for (let j = 0; j < view.hand[i][0].length; j++){
			let e = document.createElement("div")
			v = view.hand[i][0][j]
			if (v === -1) {e.className = "card hidden"; act.appendChild(e)}
			else {
				e.className = `card a number_${v}`;
				act.appendChild(e)
				register_action(e, "action_card", v)
				let card = ACARDS[v]
				let tnb = (card.left !== undefined || card.right !== undefined)
				let child = document.createElement('div')
				child.className = tnb ? "card_button top" : "card_button special"
				if (Math.abs(view.selected_Acard) === v) e.classList.add("selected")
				e.appendChild(child)
				register_action(child, tnb? "influence" : "influence_special", v)
				if (tnb) {
					child = document.createElement('div')
					child.className = "card_button bottom"
					e.appendChild(child)
					register_action(child, "influence", v*-1)			
				}
			}
		}
		
		let spy_actions = ["Mole","Agent","Sabotage","Spy Ring","Code Break","Double Agent","Coup","Spy Ring",]

		for (let j = 0; j < view.hand[i][1].length; j++){
			let e = document.createElement("div")
			v = view.hand[i][1][j]

			if (v === -1) {e.className = "card hidden"; act.appendChild(e)} //we append it to act to hide # of what type of card
			else {
				e.className = `card i number_${v}`;
				inv.appendChild(e)
				register_action(e, "investment_card", v)
				let card = ICARDS[v]
				let tnb = (card.left !== undefined || card.right !== undefined)
				let spy = (card.special && spy_actions.indexOf(card.special) !== -1)
				let child = document.createElement('div')
				child.className = tnb ? "card_button top" : "card_button special"
				if ((view.selected_Icard && Array.isArray(view.selected_Icard) && view.selected_Icard.findIndex(x => Math.abs(x) === v) !== -1) || 
					Math.abs(view.selected_Icard) === v) e.classList.add("selected")
				e.appendChild(child)
				register_action(child, spy? "intelligence" : "technology", v)
				if (tnb) {
					child = document.createElement('div')
					child.className = "card_button bottom"
					e.appendChild(child)
					register_action(child, "technology", v*-1)
				}
			}
		}
	}
	//tech vault
	for (let i = 0; i < 3; i++){
		const tech_vault = ui.tech_vault[i]
		let shell
		tech_vault.innerHTML = ""

		v = view.tech[i]
		for (let j = 0; j < v.length; j++) {
			let e = document.createElement("div")
			shell = document.createElement("div")
			shell.classList.add("vault_shell")
			e.className = `card i number_${Math.abs(v[j])}`
			if (v[j] <= 0) e.classList.add("flip")
			tech_vault.appendChild(shell)
			shell.appendChild(e)
		}
		v = view.vault[i]
		for (let j = 0; j < v.length; j++) {
			let e = document.createElement("div")
			if (v[j] === 0) {
				e.className = "card hidden"
			} else {
				e.className = `card i number_${Math.abs(v[j])}`
				if (v[j] <= 0) e.classList.add("flip")
			}
			register_action(e, "investment_card", v[j])
			if (j%2 === 0) {
				e.style.marginBottom = "-280px"
				shell = document.createElement("div")
				shell.classList.add("vault_shell")
				shell.appendChild(e)
			} else {
				shell.appendChild(e)
				tech_vault.appendChild(shell)
			}
		}
	}
	
	//diplomacy
	for (let i = 0; i < 3; i++){
		const dip = ui.diplomacy[i]
		v = view.diplomacy[i]
		dip.innerHTML = ""
		for (let j = 0; j < v.length; j++) {
			let e = document.createElement("div")
			e.className = `card a number_${Math.abs(v[j])}`
			if (v[j] <= 0) e.classList.add("flip")
			dip.appendChild(e)
		}
	}

	//command
	for (let i = 0; i < 3; i++){
		const cc = ui.command[i]
		v = view.command_card[i]
		cc.innerHTML = ""
		if (v !== null) {
			v = typeof v === "number" ? [v] : v //to not break older versions
			for (let card of v) {
				let e = document.createElement("div")
				if (card === 0) e.className = "card hidden";
				else if (card >= 0) e.className = `card a number_${card}`
				else e.className = `card i number_${Math.abs(card)}`;
				let w = document.createElement("div")
				w.classList.add("wrapper")
				w.appendChild(e)
				cc.appendChild(w)
			}
		}
	}
}

function update_tokens(){
	let e
	
	//influence
	let inf = document.getElementById("Influence")
	inf.innerHTML = ""
	for (let i=0; i < view.influence.length; i++){
		if (view.influence[i] !== -1) {
			e = document.createElement("div")
			let val = view.influence[i]
			e.className = `token ${FACTIONS[Math.floor(val/10)]} ${val%10 === 0 ? "control" : "influence"}`
			if (val%10 === 0) val += 1
			let x = COUNTRIES[i]["x"] - (val%10)*6
			let y = COUNTRIES[i]["y"] - (val%10)*8
			for (let i=0; i < val%10; i++){
				let clone = e.cloneNode(false)
				clone.style.left = x+"px"
				clone.style.top = y+"px"
				inf.appendChild(clone)
				x += 12
				y += 16
			}
		}
	}
	
	//blockade
	let bkd = document.getElementById("Blockade")
	bkd.innerHTML = ""
	for (let i=0; i < view.blockade.length; i++){
		e = document.createElement("div")
		e.className = "token blockade"
		e.style.left = REGIONS[view.blockade[i]]["x"] + "px"
		e.style.top = REGIONS[view.blockade[i]]["y"] - 20  + "px"
		bkd.appendChild(e)
	}
	for (let i=0; i < view.blockade_med.length; i++){
		e = document.createElement("div")
		e.className = "token blockade_med"
		e.style.left = REGIONS[view.blockade_med[i]]["x"] + "px"
		e.style.top = REGIONS[view.blockade_med[i]]["y"] - 20  + "px"
		bkd.appendChild(e)
	}

	//dividends
	for (let i=0; i <= 2; i++){
		for (let j=0; j < view.dividend[i].length; j++) {
			if (ui.dividends[i].children.length <= j) {
				e = document.createElement("div")
				let v = view.dividend[i][j]
				e.className = v === -1? "token peace" : `token peace_${v}`
				ui.dividends[i].appendChild(e)
			}
		}
	}
	//USA
	if (view.usa) document.getElementById("usa_reminder").className = "token sat"

	//year
	document.getElementById("year").style.top = YEAR[view.turn] + "px"

	//phase
	e = document.getElementById("phase")
	let loc = PHASES[view.phase]
	e.style.top = loc["y"] + "px"
	e.style.left = loc["x"] + "px"

	//relationship
	for (let i=0; i <= 2; i++){
		let r1 = (i+1)%3
		let r2 = (i+2)%3
		if (i === 1) {r1 = 0; r2 = 2}
		if (view.relationship[i].length !== 0) {

			let t1 
			switch (view.relationship[i][0]){
			case -1: t1 = "dow"; break
			case 0: t1 = 0; break
			case 1: t1 = "hide"; break
			}
			let t2
			switch (view.relationship[i][1]){
			case -1: t2 = "dow"; break
			case 0: t2 = 0; break
			case 1: t2 = "hide"; break
			}
			if (t1) document.getElementById(`${FACTIONS[i]}_${FACTIONS[r1]}`).classList.add(t1)
			else document.getElementById(`${FACTIONS[i]}_${FACTIONS[r1]}`).classList.remove('dow', 'hide')
			if (t2) document.getElementById(`${FACTIONS[i]}_${FACTIONS[r2]}`).classList.add(t2)
			else document.getElementById(`${FACTIONS[i]}_${FACTIONS[r2]}`).classList.remove('dow', 'hide')
		} else { 
			document.getElementById(`${FACTIONS[i]}_${FACTIONS[r1]}`).classList.remove('dow', 'hide')
			document.getElementById(`${FACTIONS[i]}_${FACTIONS[r2]}`).classList.remove('dow', 'hide')
		}
	}

	let table //for picking the right displaying res ind pop and count
	function switch_table (faction) {
		switch (faction){
		case 0: table = AXIS_TABLE; break
		case 1: table = WEST_TABLE; break
		case 2: table = USSR_TABLE; break
		}
	}

	//count
	let count = document.getElementById("count")
	let count_xy
	let count_owner_changed = false
	if (view.count) {
		if (!count.classList.contains(FACTIONS[view.count_owner])) count_owner_changed = true
		count.className = `token control ${FACTIONS[view.count_owner]}`
	} else {
		count.className = "token hide"
	}

	//pop ind res count
	for (let i = 0; i <= 2; i++){
		switch_table(i)
		let ic = 0 //include count
		if (view.count && i === view.count_owner) {
			ic = 1
			count_xy = table[view.count]
		}
		let val = [view.pop[i], view.ind[i], view.res[i], view.pop[i] - view.bpop[i], view.res[i] - view.bres[i]]
		if (val[0] > 26) val[0] = 26
		if (val[1] > 26) val[1] = 26
		if (val[2] > 26) val[2] = 26
		if (val[3] > 26) val[3] = 26; if (val[3] === val[0]) val[3] = "none"
		if (val[4] > 26) val[4] = 26; if (val[4] === val[2]) val[4] = "none"
		if (ic) val.push(view.count)

		let pop = document.getElementById(`${FACTIONS[i]}_pop`); let pop_xy = table[val[0]]
		let ind = document.getElementById(`${FACTIONS[i]}_ind`); let ind_xy = table[val[1]]
		let res = document.getElementById(`${FACTIONS[i]}_res`); let res_xy = table[val[2]]
		let bpop = document.getElementById(`${FACTIONS[i]}_pop_unblockaded`); let bpop_xy = table[val[3]]
		let bres = document.getElementById(`${FACTIONS[i]}_res_unblockaded`); let bres_xy = table[val[4]]
		res.classList.toggle("pc", view.relationship[i].length === 0)
		bpop.classList.toggle("hide", val[3] === "none")
		bres.classList.toggle("hide", val[4] === "none")

		//offset
		let groups = []
		let grouped = new Set();
		for (let i = 0; i < val.length; i++){
			if (grouped.has(i)) continue;
			let group = [i]
			grouped.add(i)
			for (let j = i+1; j < val.length; j++) {
				if (val[i] === val[j]) {
					group.push(j)
					grouped.add(j)
				}
			}
			if (group.length > 1) groups.push(group)
		}

		let o = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],] //offset

		for (let i = 0; i < groups.length; i++) {
			for (let j = 0; j < groups[i].length; j++) {
				o[groups[i][j]][0] -= (12 * (groups[i].length-1)) - (24*j)
				o[groups[i][j]][1] -= (10 * (groups[i].length-1)) - (20*j)
			}
		}

		pop.style.left = pop_xy["x"]+o[0][0]+"px"
		pop.style.top = pop_xy["y"]+o[0][1]+"px"
		ind.style.left = ind_xy["x"]+o[1][0]+"px"
		ind.style.top = ind_xy["y"]+o[1][1]+"px"
		res.style.left = res_xy["x"]+o[2][0]+"px"
		res.style.top = res_xy["y"]+o[2][1]+"px"

		bpop.style.left = bpop_xy["x"]+o[3][0]+"px"
		bpop.style.top = bpop_xy["y"]+o[3][1]+"px"
		bres.style.left = bres_xy["x"]+o[4][0]+"px"
		bres.style.top = bres_xy["y"]+o[4][1]+"px"

		if (ic) {
			if (count_owner_changed) count.style.transition = 'none'
			count.style.left = count_xy["x"]+o[5][0]+"px";
			count.style.top = count_xy["y"]+o[5][1]+"px";
			if (count_owner_changed) {
				count.offsetHeight;
				count.style.transition = ''
			}
		}
	}

	//sub hiding
	let sh = document.getElementById("sub_hiding")
	sh.innerText = ""
	for (let sub of view.sub_hiding) {
		let block = document.getElementById("blocks").children[sub]
		e = document.createElement("div")
		e.className = "token escaped"
		e.style.left = block.style.left
		e.style.top = block.style.top
		sh.appendChild(e)
	}
}

function update_initiative() {
	for (let i = 1; i <= 6; i++){
		document.getElementById(`Initiative_${i}`).classList.remove("highlight")
	}
	document.getElementById(`Initiative_${view.turn_order}`).classList.add("highlight")
}

function update_turn_order_display() {
	if (view.turn_order_roles) {
		let roles_div = document.getElementById("roles")
		if (roles_div) {
			let role_elements = []
			for (let faction_index of view.turn_order_roles) {
				let faction_name = FACTIONS[faction_index]
				//faction_name = faction_name
				let role_id = "role_" + faction_name
				let role_element = document.getElementById(role_id)
				if (role_element) {
					role_elements.push(role_element)
				}
			}
			roles_div.innerHTML = ""
			for (let element of role_elements) {
				roles_div.appendChild(element)
			}
		}
	}
}

function update_hand_count(){
	for (let i = 0; i < 3; i++) {
		const e = document.getElementById(`role_${FACTIONS[i]}`).querySelector(".role_stat")
		const count = view.hand[i][0].length + view.hand[i][1].length
		e.textContent = count + " cards"
	}
}

function hoist_faction() {
	if (view.player !== "Axis" && view.player !== "West" && view.player !== "USSR" ) return
	let ppl = document.getElementById("power_panel_list")
	ppl.insertBefore(document.getElementById(`${view.player}`), document.getElementById("Axis"))
}

var log_box_axis = 0
var log_box_west = 0
var log_box_ussr = 0
var log_box_battle = 0
var log_box_vp = 0
var country = ""

function on_log(text, ix) { //copied from POG
	let p = document.createElement("div")

	// Reset group box counter (when log is rewound)
	if (ix < log_box_axis) log_box_axis = 0
	if (ix < log_box_west) log_box_west = 0
	if (ix < log_box_ussr) log_box_ussr = 0
	if (ix < log_box_vp) log_box_vp = 0
	if (ix < log_box_battle) log_box_battle = 0

	if (text.startsWith(">")) {
		text = text.substring(1)
		p.classList.add("i")
	}

	if (text.startsWith("*")) {
		text = text.substring(1)
		p.classList.add("bold")
	}

	if (text.startsWith("!")) {
		text = "\u2757 " + text.substring(1)
	}

	else if (text.startsWith("#Axis")) {
		text = text.substring(6)
		p.classList.add("h4")
		log_box_axis = ix
	}

	else if (text.startsWith("#West")) {
		text = text.substring(6)
		p.classList.add("h4")
		log_box_west = ix
	}

	else if (text.startsWith("#USSR")) {
		text = text.substring(6)
		p.classList.add("h4")
		log_box_ussr = ix
	}

	else if (text.startsWith("#vp")){
		text = text.substring(4)
		p.classList.add("h4")
		log_box_vp = ix
	}

	else if (text.startsWith("#Spring")) {
		text = text.substring(8)
		p.classList.add("h2", "Spring")
	}

	else if (text.startsWith("#Summer")) {
		text = text.substring(8)
		p.classList.add("h2", "Summer")
	}

	else if (text.startsWith("#Fall")) {
		text = text.substring(6)
		p.classList.add("h2", "Fall")
	}

	else if (text.startsWith("#Winter")) {
		text = text.substring(8)
		p.classList.add("h2", "Winter")
	}

	else if (text.startsWith("#B")) {
		let r = text.match(/r(\d+)/)
		r = parseInt(r[1])
		country = REGIONS[r].type === "sea" ? "sea" : COUNTRIES.findIndex(x => x.name === REGIONS[r].country)
		text = text.substring(3)
		p.classList.add("h4")
		log_box_battle = ix
	}

	else if (text.startsWith(".h1")) {
		text = text.substring(4)
		p.classList.add('h1')
	}

	else if (text.startsWith(".h2")) {
		text = text.substring(4)
		if (text === 'Axis')
			p.classList.add('h2 axis')
		else if (text === 'West')
			p.classList.add('h2 west')
		else if (text === 'USSR')
			p.classList.add('h2 ussr')
		else
			p.classList.add('h2')
	}

	else if (text.startsWith(".h3axis")) {
		text = text.substring(8)
		p.classList.add("h3")
		p.classList.add("axis")
	}
	else if (text.startsWith(".h3west")) {
		text = text.substring(8)
		p.classList.add("h3")
		p.classList.add("west")
	}
	else if (text.startsWith(".h3ussr")) {
		text = text.substring(8)
		p.classList.add("h3")
		p.classList.add("ussr")
	}
	else if (text.startsWith(".h3")) {
		text = text.substring(4)
		p.classList.add("h3")
	}

	else if (text === "") {
		log_box_axis = 0
		log_box_west = 0
		log_box_ussr = 0
		log_box_battle = 0
		log_box_vp = 0
	}

	if (log_box_axis)
		p.classList.add("group", "axis")
	if (log_box_west)
		p.classList.add("group", "west")
	if (log_box_ussr)
		p.classList.add("group", "ussr")
	if (log_box_battle) {
		p.classList.add("group")
		if (p.classList.contains("h4")) {
			if (country === "sea") {p.style = "background-color: rgba(181, 220, 236)"}
			else p.style = `background-color: ${COUNTRIES[country].color1}`
		}
		else {
			if (country === "sea") {p.style = "background-color: rgba(181, 220, 236, 0.5)"}
			else p.style = `background-color: ${COUNTRIES[country].color2}`
		} 
	}
	if (log_box_vp)
		p.classList.add("group", "vp")		

	p.innerHTML = escape_text(text)
	return p
}

function escape_text(text) {
	text = text.replace(/---/g, "\u2014")
	text = text.replace(/--/g, "\u2013")
	text = text.replace(/-( ?[\d])/g, "\u2212$1")
	text = text.replace(/->/g, "\u2192")
	text = text.replace(/&/g, "&amp;")
	text = text.replace(/</g, "&lt;")
	text = text.replace(/>/g, "&gt;")
	text = text.replace(/!!/g, '<span style="color: red;">\u2192</span>')

	text = text.replace(/r(\d+)/g, sub_region_name)
	text = text.replace(/c(\d+)/g, sub_country_name)
	//text = text.replace(/p(\d+)/g, sub_piece_name_reduced)
	//text = text.replace(/P(\d+)/g, sub_piece_name)
	text = text.replace(/A(\d+)/g, sub_a_card_name)
	text = text.replace(/I(\d+)/g, sub_i_card_name)
	text = text.replace(/\b[BW]\d\b/g, sub_icon)
	//text = text.replace(/\+\d VP/g, match => `<span class="cpvp">${match}</span>`)
	//text = text.replace(/[-−]\d VP/g, match => `<span class="apvp">${match}</span>`)
	return text
}

function sub_region_name(match, p1) {
    let s = p1 | 0
    let n = REGIONS[s].name
    return `<span class="spacetip" onmouseenter="on_focus_region_tip(${s})" onmouseleave="on_blur_region_tip(${s})" onclick="on_click_region_tip(${s})">${n}</span>`
}

function sub_country_name(match, p1) {
    let s = p1 | 0
    let n = COUNTRIES[s].name
    return `<span class="spacetip" onmouseenter="on_focus_country_tip(${s})" onmouseleave="on_blur_country_tip(${s})" onclick="on_click_country_tip(${s})">${n}</span>`
}

//Needs work
function sub_a_card_name(match, p1) {
    let c = p1 | 0
    let card = ACARDS[c]
    if (card) {
        return `<span class="cardtip" onmouseenter="on_focus_card_tip('a', ${c})" onmouseleave="on_blur_card_tip()" onclick="on_click_card_tip(${c})">A#${c}</span>`
    } else {
        return `Unknown Card`
    }
}

function sub_i_card_name(match, p1) {
    let c = p1 | 0
    let card = ICARDS[c]
    if (card) {
        return `<span class="cardtip" onmouseenter="on_focus_card_tip('i', ${c})" onmouseleave="on_blur_card_tip()" onclick="on_click_card_tip(${c})">I#${c}</span>`
    } else {
        return `Unknown Card`
    }
}

// //Needs work
// function sub_piece_name(match, p1) {
//     let p = p1 | 0
//     let piece = pieces[p]
//     if (piece) {
//         return `<span class="piecetip ${piece.faction + "-unit"}" onmouseenter="on_focus_piece_tip(${p})" onmouseleave="on_blur_piece_tip(${p})" onclick="on_click_piece_tip(${p})">${piece.name}</span>`
//     } else {
//         return `Unknown Piece`
//     }
// }

// //Needs work
// function sub_piece_name_reduced(match, p1) {
//     let p = p1 | 0
//     let piece = pieces[p]
//     if (piece) {
//         return `<span class="piecetip ${piece.faction + "-unit"}" onmouseenter="on_focus_piece_tip(${p})" onmouseleave="on_blur_piece_tip(${p})" onclick="on_click_piece_tip(${p})">(${piece.name})</span>`
//     } else {
//         return `Unknown Piece`
//     }
// }

const ICONS_SVG = {
    B1: '<span class="die hit d1"></span>',
    B2: '<span class="die hit d2"></span>',
    B3: '<span class="die hit d3"></span>',
    B4: '<span class="die hit d4"></span>',
    B5: '<span class="die hit d5"></span>',
    B6: '<span class="die hit d6"></span>',
    W1: '<span class="die d1"></span>',
    W2: '<span class="die d2"></span>',
    W3: '<span class="die d3"></span>',
    W4: '<span class="die d4"></span>',
    W5: '<span class="die d5"></span>',
    W6: '<span class="die d6"></span>',
}

function sub_icon(match) {
    return ICONS_SVG[match]
}

// === Focus and Blur === //
function on_focus_country_tip(i) {
	if (COUNTRIES[i].name === "USSR") document.getElementById("USSRC").classList.add("tip")
	else document.getElementById(COUNTRIES[i].name).classList.add("tip")
}
function on_blur_country_tip(i) {
	if (COUNTRIES[i].name === "USSR") document.getElementById("USSRC").classList.add("tip")
	else document.getElementById(COUNTRIES[i].name).classList.remove("tip")
}
function on_click_country_tip(i) {
	if (COUNTRIES[i].name === "USSR") document.getElementById("USSRC").classList.add("tip")
	else scroll_into_view(document.getElementById(COUNTRIES[i].name))
}

function on_focus_region_tip(i) {
	document.getElementById(REGIONS[i].name).classList.add("tip")
}
function on_blur_region_tip(i) {
	document.getElementById(REGIONS[i].name).classList.remove("tip")
}
function on_click_region_tip(i) {
	scroll_into_view(document.getElementById(REGIONS[i].name))
}

function on_focus_card_tip(type, c) {
	let e = document.getElementById("tooltip")
	e.classList = ""
	e.classList.add("card", type, `number_${c}`)
}
function on_blur_card_tip() {
	let e = document.getElementById("tooltip")
	e.classList = ""
	e.classList.add("hide")
}
function on_click_card_tip() {}

function on_focus_piece_tip() {}
function on_blur_piece_tip() {}
function on_click_piece_tip() {}

function on_focus_bblock(text) {
	document.getElementById("status").textContent = text
}
function on_blur_bblock() {
	document.getElementById("status").textContent = ""
}

function on_focus_region(r) {
	let text = REGIONS[r].name
	document.getElementById("status").textContent = text
}
function on_blur_region(evt) {
	document.getElementById("status").textContent = ""
}

function action_menu_item(action) {
	let menu = document.getElementById(action + "_menu")
	if (view.actions && action in view.actions) {
		menu.classList.toggle("hide", false)
		menu.classList.toggle("disabled", view.actions[action] === 0)
		return 1
	} else {
		menu.classList.toggle("hide", true)
		return 0
	}
}

function action_menu(menu, action_list) {
	let x = 0
	for (let action of action_list)
		x |= action_menu_item(action)
	menu.classList.toggle("hide", !x)
}

function update_action_menu(){
	action_menu(document.getElementById("negotiate_menu"), [
		"remove_blocks",
		"remove_influence",
		"ping",
	])
}

function on_update(){
	action_button("draw", "Draw")
	action_button("pass", "Pass")
	action_button("next", "Next")
	action_button("configure_autopass", "Configure Autopass")
	
	action_button("draw_action_card", "Draw Action Card")
	action_button("draw_investment_card", "Draw Investment Card")

	action_button("build_INDustry", "Build Industry")

	action_button("end_setup", "End setup")
	action_button("end_production", "End Production")
	confirm_action_button("end_production_confirm", "End Production", 
		"You still have production to spend! \nAre you sure you want to end production?")

	action_button("confirm", "Confirm")
	confirm_action_button("confirm_investment", "Confirm",
		"An investment card used during the command phase is a wasted bluff! \nAre you sure?")
	confirm_action_button("confirm_season", "Confirm",
		"Cards with the wrong season only count for emergency movement! \nAre you sure?")

	action_button("end_turn", "End turn")
	action_button("end_movement", "End movement")
	action_button("end_choose_battle", "End battles")
	confirm_action_button("end_movement_confirm", "End movement", 
		"You still have left over comand points! \nAre you sure you want to end movement?"
	)
	action_button("declare_war", "Declare War")
	action_button("partition", "Declare Partition")
	action_button("intervention", "Declare Intervension")
	action_button("axis", "Axis")
	action_button("west", "West")
	action_button("ussr", "USSR")
	action_button("any", "Any country")
	action_button("neutral", "Neutral")
	action_button("disable_autopass", "Disable Autopass")

	confirm_action_button("confirm_axis", "Axis", "You do not have surprise against this target! \nThis block will be slated to attack after they attack. \nAre you sure you want to attack them?")
	confirm_action_button("confirm_west", "West", "You do not have surprise against this target! \nThis block will be slated to attack after they attack. \nAre you sure you want to attack them?")
	confirm_action_button("confirm_ussr", "USSR", "You do not have surprise against this target! \nThis block will be slated to attack after they attack. \nAre you sure you want to attack them?")

	action_button("start_combat", "Start combat")
	action_button("end_combat", "End combat")

	action_button("request_damage", "Request damage resolution")

	action_button("done", "Done")
	action_button("create", "Create")
	action_button("clear", "Clear")
	action_button("resume", "Resume")
	action_button("undo", "Undo")
	action_button("reveal", "Reveal")
	action_button("vault", "Place in Vault")
 
	action_button("repudiate", "Repudiate!")
	action_button("support", "Support!")
	action_button("peace", "Peace")
	action_button("war", "War!")
	
	action_button("mark_all", 'Mark All Blockades')

	action_button("reveal_vault", 'Reveal tech from vault')
	action_button("escape", "Sub Escape!")
	action_button("no_valid_retreats", "No valid retreat location")

	action_button("handsize", "Handsize")
	action_button("influences", "Influence")

	for (let v = 20; v >= 0; --v) //axis start with 14 cards, and have 11 industry at start, so theoretic high card count is 25, but that should basically never happen.
		action_button_with_argument("value", v, v)

	update_blocks()
	update_reserves()
	update_cards()
	update_tokens()
	update_initiative()
	update_battle()

	hoist_faction()
	update_hand_count()
	process_actions()
	update_turn_order_display()
	update_action_menu()
	update_favicon()
	if (query) send_query(query)
}

function update_favicon() {
	if (view.player) {
		const e = document.getElementById("favicon")
		if (view.player === "Axis") e.href = "tokens/control_axis.jpeg"
		if (view.player === "West") e.href = "tokens/control_west.jpeg"
		if (view.player === "USSR") e.href = "tokens/control_ussr.jpeg"
	}
}

function toggle_pieces() {
	// Cycle between showing everything, only pieces, and nothing.
	let hidden_blocks = ui.blocks_element.classList.contains("hide")
	let hidden_tokens = ui.tokens_element.classList.contains("hide")
	if (hidden_blocks && hidden_tokens) {
		ui.blocks_element.classList.remove("hide")
		ui.tokens_element.classList.remove("hide")
	} else if (hidden_blocks) {
		ui.tokens_element.classList.add("hide")
	} else {
		ui.blocks_element.classList.add("hide")
	}
}

function toggle_shift() {
	document.body.classList.toggle("shift")
}


//this only works with MAPS, as in key/value pairs.
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

function binarySearch(arr, key) {
	let a = 0, b = arr.length - 1;
	while (a <= b) {
		let m = (a + b) >> 1;
		if (arr[m] < key) a = m + 1;
		else if (arr[m] > key) b = m - 1;
		else return true;
	}
	return false;
}

/* COMMON LIBRARY */

function array_insert(array, index, item) {
	for (let i = array.length; i > index; --i)
		array[i] = array[i - 1]
	array[index] = item
}

function set_has(set, item) {
	if (set === item) return true
	if (set === undefined) return false
	if (set === null) return false
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

function set_add_all(set, other) {
	for (let item of other)
		set_add(set, item)
}
