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
	tech: [
		document.getElementById("Axis").querySelector(".tech"),
		document.getElementById("West").querySelector(".tech"),
		document.getElementById("USSR").querySelector(".tech"),
	],
	vault: [
		document.getElementById("Axis").querySelector(".vault"),
		document.getElementById("West").querySelector(".vault"),
		document.getElementById("USSR").querySelector(".vault"),
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
	attacker: document.getElementById("attacker"),
	defender: document.getElementById("defender"),
}


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
	ui.pieces = [
		//create_pieces() 
		//in friedrich, this just creates all the generals, 
		//but in this because the blocks are created piece meal, I need to loop through the list of existing blocks.
		//are there other pieces that need to be created?
		//is there a good reason why the pieces don't just exist on the html? clenliness?
	] 

	//blocks
	for (let i=0; i < 198; i++){
		ui.blocks_element.appendChild(create_piece("block", i, "block dead"))
	}

	//locations
	for (let i = 0; i < REGIONS.length; i++){
		let e = document.getElementById(REGIONS[i].name)
		register_action(e, "region", i)
		//need to add the onmouseenter event to make the related blocks bigger!
		//and of course the onmouseleave to blur/make the blocks regular size
	}
	//reserves
	for (let i = 0; i <= 41; i++){
		let e = document.getElementById("r" + i)
		register_action(e, "reserve", i)
	}
}

on_init()



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
		e.classList.toggle("moved", view.block_moved.includes(i))
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
	if (view.battle) {
		ui.battle_table.classList.remove("hidden")
		ui.battle_header.innerText = `Battle in ${REGIONS[view.battle].name}`
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
			register_action(block, "bblock", block.id)

			let menu = document.createElement("div")
			menu.className = 'menu'
			build_battle_button(menu, b, 'air')
			build_battle_button(menu, b, 'naval')
			build_battle_button(menu, b, 'sub')
			build_battle_button(menu, b, 'ground')
			build_battle_button(menu, b, 'convoy')
			build_battle_button(menu, b, 'shootNscoot')
			build_battle_button(menu, b, 'strategic_bombing')
			build_battle_button(menu, b, 'pass_attack')
			build_battle_button(menu, b, 'retreat')

			let set = document.createElement("div")
			set.className = "battle_set"
			set.appendChild(block)
			set.appendChild(menu)

			faction_of_block(b) === view.attacker? ui.attacker.appendChild(set) : ui.defender.appendChild(set)
		}
	} else {
		ui.battle_table.classList.add("hidden")
	}
}

function source_from_action(action) {
	switch(action) {
	case "retreat": return "/images/flying-flag.svg"
	case "air": return "/images/arrow-flights.svg"
	case "naval": return "/images/rose.svg"
	case "sub": return "/images/hasty-grave.svg"
	case "ground": return "/images/flame.svg"
	case "convoy": return "/images/cog.svg"
	case "shootNscoot": return "/images/ancient-sword.svg"
	case "strategic_bombing": return "/images/raining.svg"
	case "pass_attack": return "/images/cross-mark.svg"
	}
}

function build_battle_button(menu, block, action){
	const img = new Image()
	img.draggable = false
	img.block = block
	img.setAttribute("src", source_from_action(action))
	img.setAttribute("title", action)
	register_action(img, action, block)
	menu.appendChild(img)
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

			if ((view.prompt === "Place starting Cadres" || view.prompt === "Spend Production") && view.selected === i) {
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
				register_action(e, "industry_card", v)
				let card = ICARDS[v]
				let tnb = (card.left !== undefined || card.right !== undefined)
				let spy = (card.special && spy_actions.indexOf(card.special) !== -1)
				let child = document.createElement('div')
				child.className = tnb ? "card_button top" : "card_button special"
				if (view.prompt === "Perform an action or pass" 
					&& view.selected && Array.isArray(view.selected) 
					&& view.selected.indexOf(v) !== -1) e.classList.add("selected")
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
	//tech
	for (let i = 0; i < 3; i++){
		const tech = ui.tech[i]
		v = view.tech[i]
		tech.innerHTML = ""
		for (let j = 0; j < v.length; j++) {
			let e = document.createElement("div")
			e.className = `card i number_${Math.abs(v[j])}`
			if (v[j] <= 0) e.classList.add("flip")
			tech.appendChild(e)
		}
	}

	//vault
	for (let i = 0; i < 3; i++){
		const val = ui.vault[i]
		v = view.vault[i]
		val.innerHTML = ""
		for (let j = 0; j < v.length; j++) {
			let e = document.createElement("div")
			if (v[j] === 0) {
				e.className = "card hidden"
			} else {
				e.className = `card i number_${Math.abs(v[j])}`
				if (v[j] <= 0) e.classList.add("flip")
			}
			val.appendChild(e)
			register_action(e, "industry_card", v[j])
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
			let e = document.createElement("div")
			if (v === 0) e.className = "card hidden";
			else if (v >= 0) e.className = `card a number_${v}`
			else e.className = `card i number_${Math.abs(v)}`;
			cc.appendChild(e)
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
	if (view.count) {
		count.className = `token control ${view.active}`
	} else {
		count.className = "token hide"
	}

	//pop ind res count
	for (let i = 0; i <= 2; i++){
		switch_table(i)
		let ic = 0 //include count
		if (view.count && i === view.activeNum) {
			ic = 1
			count_xy = table[view.count]
		}
		let val = [view.pop[i] - view.bpop[i], view.ind[i], view.res[i] - view.bres[i]]
		if (ic) val.push(view.count)

		let pop = document.getElementById(`${FACTIONS[i]}_pop`); let pop_xy = table[val[0]]
		let ind = document.getElementById(`${FACTIONS[i]}_ind`); let ind_xy = table[val[1]]
		let res = document.getElementById(`${FACTIONS[i]}_res`); let res_xy = table[val[2]]
		if(view.relationship[i].length !== 0) res.classList.remove("pc")

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

		let o = [[0,0],[0,0],[0,0],[0,0],] //offset

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
		if (ic) {
			count.style.left = count_xy["x"]+o[3][0]+"px";
			count.style.top = count_xy["y"]+o[3][1]+"px";
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

function hoist_faction() {
	let ppl = document.getElementById("power_panel_list")
	ppl.insertBefore(document.getElementById(`${view.player}`), document.getElementById("Axis"))
}

function on_log(text, ix) { //copied from POG
	let p = document.createElement("div")

	// Reset group box counter (when log is rewound)
	// if (ix < log_box_ap) log_box_ap = 0
	// if (ix < log_box_cp) log_box_cp = 0

	if (text.startsWith(">")) {
		text = text.substring(1)
		p.classList.add("i")
	}

	if (text.startsWith("*")) {
		text = text.substring(1)
		p.classList.add("bold")
	}

	// if (text.startsWith("!")) {
	// 	text = "\u2757 " + text.substring(1)
	// }

	// else if (text.startsWith("#cp")) {
	// 	text = text.substring(4)
	// 	p.className = "h4"
	// 	log_box_cp = ix
	// }
	// else if (text.startsWith("#ap")) {
	// 	text = text.substring(4)
	// 	p.className = "h4"
	// 	log_box_ap = ix
	// }

	else if (text.startsWith(".h1")) {
		text = text.substring(4)
		p.className = 'h1'
	}

	else if (text.startsWith(".h2")) {
		text = text.substring(4)
		// if (text === 'AP')
		// 	p.className = 'h2 ap'
		// else if (text === 'CP')
		// 	p.className = 'h2 cp'
		// else
		p.className = 'h2'
	}

	// else if (text.startsWith(".h3cp")) {
	// 	text = text.substring(6)
	// 	p.className = "h3 cp"
	// }
	// else if (text.startsWith(".h3ap")) {
	// 	text = text.substring(6)
	// 	p.className = "h3 ap"
	// }
	else if (text.startsWith(".h3")) {
		text = text.substring(4)
		p.className = "h3"
	}

	// else if (text === "") {
	// 	log_box_ap = 0
	// 	log_box_cp = 0
	// }

	// if (log_box_ap)
	// 	p.classList.add("group", "ap")
	// if (log_box_cp)
	// 	p.classList.add("group", "cp")

	p.innerHTML = escape_text(text)
	return p
}

function escape_text(text) { //copied from POG
	// text = text.replace(/---/g, "\u2014")
	// text = text.replace(/--/g, "\u2013")
	// text = text.replace(/->/g, "\u2192")
	// text = text.replace(/-( ?[\d])/g, "\u2212$1")
	// text = text.replace(/&/g, "&amp;")
	// text = text.replace(/</g, "&lt;")
	// text = text.replace(/>/g, "&gt;")
	// text = text.replace(/s(\d+)/g, sub_space_name)
	// text = text.replace(/p(\d+)/g, sub_piece_name_reduced)
	// text = text.replace(/P(\d+)/g, sub_piece_name)
	// text = text.replace(/c(\d+)/g, sub_card_name)
	// text = text.replace(/\b[BW]\d\b/g, sub_icon)
	// text = text.replace(" 1 spaces", " 1 space")
	// text = text.replace(/\+\d VP/g, match => `<span class="cpvp">${match}</span>`)
	// text = text.replace(/[-−]\d VP/g, match => `<span class="apvp">${match}</span>`)
	return text
}


function on_update(){
	action_button("draw", "Draw Cards")
	action_button("pass", "Pass")
	action_button("next", "Next")
	action_button("done", "Done")
	action_button("draw_action_card", "Draw Action Card")
	action_button("draw_investment_card", "Draw Investment Card")

	action_button("build_factory", "Build Factory")

	action_button("end_cards", "End card draw")
	action_button("end_setup", "End setup")
	action_button("end_production", "End Production")
	confirm_action_button("end_production_confirm", "End Production", 
		"You still have production to spend! \nAre you sure you want to end production?")

	action_button("confirm", "Confirm")
	confirm_action_button("confirm_investment", "Confirm",
		"An investment card used during the command phase is a wasted bluff! \nAre you sure you want to use it?")
	confirm_action_button("confirm_season", "Confirm",
		"This card is the wrong season, you will only be able to do emergency movement! \nAre you sure you want to use it?")

	action_button("end_turn", "End turn")
	action_button("end_movement", "End movement")
	action_button("end_choose_battle", "End battles")
	confirm_action_button("end_movement_confirm", "End movement", 
		"You still have left over comand points! \nAre you sure you want to end movement?"
	)
	action_button("declare_war", "Declare War")
	action_button("axis", "Axis")
	action_button("west", "West")
	action_button("ussr", "USSR")
	action_button("both", "Both")

	action_button("start_combat", "Start combat")
	action_button("end_combat", "End combat")

	action_button("undo", "Undo")
	action_button("reveal", "Reveal")
	action_button("vault", "Place in Vault")

	action_button("mark_all", 'Mark All Blockades')

	action_button("reveal_vault", 'Reveal tech from vault')
	action_button("escape", "Sub Escape!")
	action_button("no_valid_retreats", "No valid retreat location")

	update_blocks()
	update_reserves()
	update_cards()
	update_tokens()
	update_initiative()
	update_battle()

	hoist_faction()
	process_actions()
}

function on_reply(what, response){}


/* copied from FRIEDRICH */

function toggle_pieces() {
	// Cycle between showing everything, only pieces, and nothing.
	let hidden_pieces = ui.pieces_element.classList.contains("hide")
	let hidden_markers = ui.markers_element.classList.contains("hide")
	if (hidden_pieces && hidden_markers) {
		ui.pieces_element.classList.remove("hide")
		ui.markers_element.classList.remove("hide")
	} else if (hidden_pieces) {
		ui.markers_element.classList.add("hide")
	} else {
		ui.pieces_element.classList.add("hide")
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
